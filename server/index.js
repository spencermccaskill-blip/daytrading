// The Desk: one local server. Reads bars posted by the TradingView bridge extension, keeps the
// journal and settings in data/*.json, and serves the page. It never places an order.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { BarStore } from './bars.js';
import { buildState } from './desk.js';
import { loadVerdicts } from './verdicts.js';
import { computeGuard, checkTrade, defaultSettings, PLANS } from './guard.js';
import { demoInput, demoNews, SCENARIOS } from './demo.js';
import { WINDOWS } from './sessions.js';
import { fetchYahoo, YAHOO_SYMBOL } from './yahoo.js';
import { createNews, newsState } from './news.js';
import { replaySignals, tally } from './replay.js';
import { etKey, addDays } from './time.js';

const BRIDGE_QUIET = 180000; // the chart tab has been silent this long: fetch prices ourselves

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
/** Reads a saved file. A missing file is normal (first run). A file that exists but cannot be read is a problem to report, never to paper over. */
function readSaved(file) {
  if (!fs.existsSync(file)) return { value: null, bad: false };
  try { return { value: JSON.parse(fs.readFileSync(file, 'utf8')), bad: false }; } catch { return { value: null, bad: true }; }
}
const num = (v) => (v === '' || v == null ? NaN : Number(v));

/** Settings on disk merged over the defaults, so a new field never breaks an old file. */
function mergeSettings(saved) {
  const d = defaultSettings(), s = saved || {};
  return { account: { ...d.account, ...(s.account || {}), dll: { ...d.account.dll, ...(s.account?.dll || {}) } }, personal: { ...d.personal, ...(s.personal || {}) }, instrument: d.instrument, feed: { auto: s.feed?.auto !== false } };
}

export function createApp({ dataDir = path.join(root, 'data'), clock = () => Date.now(), fetchImpl = fetch } = {}) {
  fs.mkdirSync(dataDir, { recursive: true });
  const FILES = { settings: path.join(dataDir, 'settings.json'), bars: path.join(dataDir, 'bars.json'), journal: path.join(dataDir, 'journal.json'), signals: path.join(dataDir, 'signals.json') };
  // Write to a side file first, then swap it in, so a crash mid-save cannot leave half a journal.
  const save = (name, value) => { const tmp = FILES[name] + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(value, null, name === 'bars' ? 0 : 2)); fs.renameSync(tmp, FILES[name]); };

  const s0 = readSaved(FILES.settings), j0 = readSaved(FILES.journal);
  const settings = mergeSettings(s0.value);
  const journal = { trades: Array.isArray(j0.value?.trades) ? j0.value.trades : [] };
  const bad = { journal: j0.bad, settings: s0.bad };
  const problem = () => (bad.journal ? 'The journal file (data folder, journal.json) could not be read (it may be damaged).' : bad.settings ? 'The settings file (data folder, settings.json) could not be read (it may be damaged).' : null);
  const refuse = (res) => res.status(409).json({ error: `${problem()} Nothing was saved, so the file is not overwritten. Fix or move the file, then restart The Desk.` });
  const store = new BarStore();
  store.load(readSaved(FILES.bars).value);
  const feed = { symbol: null, source: null, lastPost: 0, lastBridge: 0, lastChange: 0, lastSig: '', error: null, fetchError: null, nextTry: 0 };
  const noteChange = () => { const last = store.last(), sig = last ? [last.t, last.o, last.h, last.l, last.c, last.v].join() : ''; if (sig !== feed.lastSig) { feed.lastSig = sig; feed.lastChange = clock(); } };

  // ── Replay log: suggested trades, kept in data/signals.json once finished so they outlive the bars ──
  const saved = readSaved(FILES.signals).value;
  const done = new Map(Object.entries(saved?.signals || {}));
  const log = { open: [], sig: null, full: false };
  function refreshLog() {
    const sig = `${store.lastRawT}|${feed.lastSig}|${store.raw.size}`;
    if (sig === log.sig) return;
    log.sig = sig;
    // The first pass replays everything on hand; after that only the last two days can still change.
    const rows = replaySignals(store.ctx(), verdicts, log.full ? { fromKey: addDays(etKey(clock()), -2) } : {});
    log.full = store.raw.size > 0;
    let changed = false;
    for (const r of rows) if (r.status !== 'open') { const old = done.get(r.id); if (!old || old.exitT !== r.exitT || old.status !== r.status) { done.set(r.id, r); changed = true; } }
    log.open = rows.filter(r => r.status === 'open' && !done.has(r.id));
    if (changed) { try { save('signals', { signals: Object.fromEntries(done) }); } catch { /* try again on the next change */ } }
  }
  const allSignals = () => { refreshLog(); return [...log.open, ...done.values()].sort((a, b) => b.signalT - a.signalT); };
  const sizeFor = (s) => Math.min(Math.floor(settings.personal.riskPerTrade / (s.stopPoints * settings.instrument.pointValue)), computeGuard(settings, journal, clock()).maxContracts);
  const dollars = (s, contracts) => Math.round(contracts * settings.instrument.pointValue * s.dir * (s.exitPx - s.entry) * 100) / 100;
  /** One-click entries that were still open: fill in the result once the rule exit has happened. */
  function settle() {
    if (bad.journal) return;
    const pending = journal.trades.filter(t => t.open && t.signalId);
    if (!pending.length) return;
    const byId2 = new Map(allSignals().map(s => [s.id, s])); let changed = false;
    for (const t of pending) {
      const s = byId2.get(t.signalId);
      if (!s || s.status === 'open') continue;
      Object.assign(t, { open: false, auto: true, pnl: dollars(s, t.contracts), exit: s.exitPx, ts: s.exitT, outcome: s.status }); changed = true;
    }
    if (changed) save('journal', journal);
  }

  // No chart tab feeding us? Fetch delayed MNQ bars ourselves. An open chart tab always wins.
  async function pollPrices() {
    const now = clock();
    if (!settings.feed.auto || now - feed.lastBridge < BRIDGE_QUIET || now < feed.nextTry) return;
    const first = feed.source !== 'yahoo';
    const got = await fetchYahoo(first ? '1mo' : '1d', fetchImpl);
    if (clock() - feed.lastBridge < BRIDGE_QUIET) return; // the chart came back while we were fetching
    if (got.error) { feed.fetchError = got.error; feed.nextTry = clock() + 45000; return; }
    if (feed.symbol !== YAHOO_SYMBOL) { store.clear(); log.full = false; } // never mix two sources in the levels
    Object.assign(feed, { symbol: YAHOO_SYMBOL, source: 'yahoo', lastPost: clock(), error: null, fetchError: null });
    store.ingest(got.rows, 5, clock()); noteChange();
  }
  let verdicts = loadVerdicts();
  const news = createNews(fetchImpl);
  const newsNow = () => newsState({ now: clock(), ctx: store.ctx(), ...news.data });

  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // The bridge extension posts the chart's bars here every couple of seconds.
  app.post('/api/bars', (req, res) => {
    const { symbol, resolution, bars } = req.body || {};
    const resMin = Number(resolution);
    if (!Array.isArray(bars)) return res.status(400).json({ error: 'Expected a bars array.' });
    const sym = String(symbol || '');
    if (feed.symbol && sym !== feed.symbol) { store.clear(); log.full = false; } // another contract: its prices must not mix into the levels
    feed.lastPost = feed.lastBridge = clock(); feed.symbol = sym; feed.source = 'chart'; feed.fetchError = null;
    if (!(resMin >= 1 && resMin <= 15 && 15 % resMin === 0)) feed.error = `Set the TradingView chart to 5 minutes (it is on "${resolution}").`;
    else if (!/NQ/i.test(feed.symbol)) feed.error = `The chart shows ${feed.symbol || 'another symbol'}. Switch it to MNQ1!.`;
    else {
      feed.error = null; store.ingest(bars, resMin, clock());
      noteChange(); // the chart is moving
    }
    res.json({ ok: !feed.error, error: feed.error });
  });

  app.get('/api/state', (req, res) => {
    const demo = req.query.demo;
    if (demo) return SCENARIOS.includes(demo) ? res.json(buildState({ ...demoInput(demo), news: newsState({ now: demoInput(demo).now, ctx: demoInput(demo).store.ctx(), ...demoNews(demoInput(demo).now) }) })) : res.status(404).json({ error: `Unknown demo. Try one of: ${SCENARIOS.join(', ')}.` });
    settle();
    res.json(buildState({ now: clock(), store, feed, settings, journal, verdicts, problem: problem(), news: newsNow() }));
  });

  // Scheduled releases, headlines and what price did around them.
  app.get('/api/news', (req, res) => {
    if (req.query.demo) return res.json(newsState({ now: demoInput(req.query.demo).now, ctx: demoInput(req.query.demo).store.ctx(), ...demoNews(demoInput(req.query.demo).now) }));
    res.json(newsNow());
  });

  // Rules per session, checklist and backtest results for the Playbook tab.
  app.get('/api/playbook', (_req, res) => { verdicts = loadVerdicts(); res.json({ ...verdicts, windows: WINDOWS.map(w => ({ id: w.id, name: w.name })) }); });

  app.get('/api/settings', (_req, res) => res.json({ settings, plans: PLANS }));
  app.post('/api/settings', (req, res) => {
    if (bad.settings) return refuse(res);
    const b = req.body || {}, a = b.account || {}, p = b.personal || {};
    const next = structuredClone(settings);
    if (a.plan != null) {
      if (!Object.hasOwn(PLANS, a.plan)) return res.status(400).json({ error: 'Plan must be Flex, Pro, Direct or Daily.' });
      const pl = PLANS[a.plan];
      Object.assign(next.account, { plan: a.plan, trailing: pl.trailing, dll: { ...pl.dll }, scaling: pl.scaling, maxMicros: pl.maxMicros, consistencyPct: pl.consistencyPct });
    }
    const money = [['startBalance', 'Starting balance'], ['maxLossLimit', 'Max loss limit'], ['lockBalance', 'Lock balance'], ['lockTrigger', 'Lock trigger'], ['maxMicros', 'Max micros']];
    for (const [k, label] of money) if (a[k] != null) { const v = num(a[k]); if (!(v > 0)) return res.status(400).json({ error: `${label} must be a number above zero.` }); next.account[k] = v; }
    if (a.trailing != null) { if (!['eod', 'intraday'].includes(a.trailing)) return res.status(400).json({ error: 'Trailing must be end of day or intraday.' }); next.account.trailing = a.trailing; }
    if (a.dll != null) {
      if (a.dll.on != null) next.account.dll.on = !!a.dll.on;
      if (a.dll.amount != null) { const v = num(a.dll.amount); if (!(v > 0)) return res.status(400).json({ error: 'Daily loss limit must be a number above zero.' }); next.account.dll.amount = v; }
    }
    if (a.useScaling != null) next.account.scaling = a.useScaling ? PLANS.flex.scaling : null;
    if (a.consistencyPct !== undefined) { const v = a.consistencyPct === null || a.consistencyPct === '' ? null : num(a.consistencyPct); if (v !== null && !(v > 0 && v <= 100)) return res.status(400).json({ error: 'Consistency must be a percent from 1 to 100, or empty for none.' }); next.account.consistencyPct = v; }
    if (a.payoutRequested != null) next.account.payoutRequested = !!a.payoutRequested;
    if (a.cycleStart !== undefined) next.account.cycleStart = /^\d{4}-\d{2}-\d{2}$/.test(a.cycleStart || '') ? a.cycleStart : null;
    if (b.feed?.auto != null) next.feed.auto = !!b.feed.auto;
    for (const [k, label] of [['riskPerTrade', 'Risk per trade'], ['dailyStop', 'Daily stop']]) if (p[k] != null) { const v = num(p[k]); if (!(v > 0)) return res.status(400).json({ error: `${label} must be a dollar amount above zero.` }); next.personal[k] = v; }
    if (p.maxLossesPerDay != null) { const v = num(p.maxLossesPerDay); if (!(Number.isInteger(v) && v >= 1)) return res.status(400).json({ error: 'Losses per day must be a whole number, 1 or more.' }); next.personal.maxLossesPerDay = v; }
    Object.assign(settings, next); save('settings', settings);
    res.json({ settings, plans: PLANS });
  });

  // Manual journal: Spencer types in what Tradovate shows. This is what feeds the guard.
  app.get('/api/journal', (_req, res) => { settle(); res.json({ trades: [...journal.trades].sort((x, y) => y.ts - x.ts), guard: computeGuard(settings, journal, clock()) }); });

  // The replay log: every suggested trade, with the size it would have had and whether it is in the journal.
  app.get('/api/log', (_req, res) => {
    settle();
    const taken = new Set(journal.trades.map(t => t.signalId).filter(Boolean)), all = allSignals();
    res.json({ signals: all.slice(0, 400).map(s => { const contracts = sizeFor(s); return { ...s, contracts, dollars: s.status === 'open' || contracts < 1 ? null : dollars(s, contracts), taken: taken.has(s.id) }; }), tally: tally(all), total: all.length, since: all.length ? all.at(-1).signalT : null });
  });

  // One click: "I took this". The size is the one the desk suggested; the result is filled in at the rule exit.
  app.post('/api/journal/take', (req, res) => {
    if (bad.journal) return refuse(res);
    const s = allSignals().find(x => x.id === req.body?.id);
    if (!s) return res.status(404).json({ error: 'That suggested trade is no longer in the log.' });
    if (journal.trades.some(t => t.signalId === s.id)) return res.status(409).json({ error: 'That trade is already in your journal.' });
    const contracts = sizeFor(s);
    if (contracts < 1) return res.status(400).json({ error: `The stop is ${s.stopPoints.toFixed(1)} points, too wide for one contract at your risk. Log it by hand if you took it anyway.` });
    const live = s.status === 'open';
    const row = { id: crypto.randomUUID(), kind: 'trade', ts: live ? clock() : s.exitT, pnl: live ? null : dollars(s, contracts), open: live, auto: !live, signalId: s.id, side: s.side, contracts, entry: s.entry, stop: s.stop, target: s.target, exit: live ? null : s.exitPx, outcome: live ? null : s.status, setup: s.name, followedRules: true, note: '' };
    journal.trades.push(row); save('journal', journal);
    res.json({ trade: row, guard: computeGuard(settings, journal, clock()) });
  });
  // Correct a result (the real fill was different) or close an open entry by hand.
  app.patch('/api/journal/:id', (req, res) => {
    if (bad.journal) return refuse(res);
    const t = journal.trades.find(x => x.id === req.params.id), pnl = num(req.body?.pnl);
    if (!t) return res.status(404).json({ error: 'That entry is already gone.' });
    if (!Number.isFinite(pnl)) return res.status(400).json({ error: 'Enter the profit or loss in dollars, like 180 or -240.' });
    if (t.open) t.ts = clock();
    Object.assign(t, { pnl, open: false, auto: false }); save('journal', journal);
    res.json({ trade: t, guard: computeGuard(settings, journal, clock()) });
  });
  app.post('/api/journal', (req, res) => {
    if (bad.journal) return refuse(res);
    const b = req.body || {}, pnl = num(b.pnl);
    if (!Number.isFinite(pnl)) return res.status(400).json({ error: 'Enter the profit or loss in dollars, like 180 or -240.' });
    const ts = b.ts == null ? clock() : b.ts;
    if (typeof ts !== 'number' || !Number.isFinite(ts) || ts < Date.UTC(2020, 0, 1)) return res.status(400).json({ error: 'That trade time could not be read.' });
    if (ts > clock() + 60000) return res.status(400).json({ error: 'The trade time cannot be in the future.' });
    const kind = b.kind === 'adjustment' ? 'adjustment' : 'trade';
    const opt = (v) => (Number.isFinite(num(v)) ? num(v) : null);
    const row = { id: crypto.randomUUID(), kind, ts, pnl, side: ['LONG', 'SHORT'].includes(b.side) ? b.side : null, contracts: opt(b.contracts), entry: opt(b.entry), exit: opt(b.exit), setup: String(b.setup || '').slice(0, 60), followedRules: b.followedRules == null ? null : !!b.followedRules, note: String(b.note || '').slice(0, 300) };
    journal.trades.push(row); save('journal', journal);
    res.json({ trade: row, guard: computeGuard(settings, journal, clock()) });
  });
  app.delete('/api/journal/:id', (req, res) => {
    if (bad.journal) return refuse(res);
    const i = journal.trades.findIndex(t => t.id === req.params.id);
    if (i < 0) return res.status(404).json({ error: 'That entry is already gone.' });
    journal.trades.splice(i, 1); save('journal', journal);
    res.json({ ok: true, guard: computeGuard(settings, journal, clock()) });
  });

  // PASS or BLOCK for a trade idea typed in by hand.
  app.post('/api/check', (req, res) => {
    const entry = num(req.body?.entry), stop = num(req.body?.stop);
    if (!Number.isFinite(entry) || !Number.isFinite(stop)) return res.status(400).json({ error: 'Enter both the entry and the stop price.' });
    const stopPoints = Math.abs(entry - stop), check = checkTrade(computeGuard(settings, journal, clock()), settings, { stopPoints });
    const dir = Math.sign(entry - stop);
    res.json({ ...check, stopPoints, side: dir > 0 ? 'LONG' : 'SHORT', target2R: dir ? entry + dir * 2 * stopPoints : null });
  });

  app.use('/fonts/outfit', express.static(path.join(root, 'node_modules', '@fontsource', 'outfit')));
  app.use('/fonts/plex', express.static(path.join(root, 'node_modules', '@fontsource', 'ibm-plex-mono')));
  app.use(express.static(path.join(root, 'public')));

  const persistBars = () => { try { store.prune(); save('bars', store.toJSON()); } catch { /* disk hiccup: try again next minute */ } };
  return { app, persistBars, pollPrices, news, store, journal, settings };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.PORT) || 3000;
  const { app, persistBars, pollPrices, news } = createApp();
  news.refreshCalendar(); news.refreshHeadlines();
  setInterval(news.refreshCalendar, 30 * 60000).unref(); setInterval(news.refreshHeadlines, 3 * 60000).unref();
  setInterval(persistBars, 60000).unref();
  pollPrices(); setInterval(pollPrices, 15000).unref();
  app.listen(PORT, () => {
    console.log(`The Desk is running at http://localhost:${PORT}`);
    console.log('Keep this window open. Prices are fetched automatically (about 10 minutes delayed). An open TradingView chart with the bridge extension is used instead when there is one.');
  });
}
