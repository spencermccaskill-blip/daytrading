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
import { demoInput, SCENARIOS } from './demo.js';
import { WINDOWS } from './sessions.js';

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
  return { account: { ...d.account, ...(s.account || {}), dll: { ...d.account.dll, ...(s.account?.dll || {}) } }, personal: { ...d.personal, ...(s.personal || {}) }, instrument: d.instrument };
}

export function createApp({ dataDir = path.join(root, 'data'), clock = () => Date.now() } = {}) {
  fs.mkdirSync(dataDir, { recursive: true });
  const FILES = { settings: path.join(dataDir, 'settings.json'), bars: path.join(dataDir, 'bars.json'), journal: path.join(dataDir, 'journal.json') };
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
  const feed = { symbol: null, lastPost: 0, lastChange: 0, lastSig: '', error: null };
  let verdicts = loadVerdicts();

  const app = express();
  app.use(express.json({ limit: '8mb' }));

  // The bridge extension posts the chart's bars here every couple of seconds.
  app.post('/api/bars', (req, res) => {
    const { symbol, resolution, bars } = req.body || {};
    const resMin = Number(resolution);
    if (!Array.isArray(bars)) return res.status(400).json({ error: 'Expected a bars array.' });
    const sym = String(symbol || '');
    if (feed.symbol && sym !== feed.symbol) store.clear(); // another contract: its prices must not mix into the levels
    feed.lastPost = clock(); feed.symbol = sym;
    if (!(resMin >= 1 && resMin <= 15 && 15 % resMin === 0)) feed.error = `Set the TradingView chart to 5 minutes (it is on "${resolution}").`;
    else if (!/NQ/i.test(feed.symbol)) feed.error = `The chart shows ${feed.symbol || 'another symbol'}. Switch it to MNQ1!.`;
    else {
      feed.error = null; store.ingest(bars, resMin, clock());
      const last = store.last(), sig = last ? [last.t, last.o, last.h, last.l, last.c, last.v].join() : '';
      if (sig !== feed.lastSig) { feed.lastSig = sig; feed.lastChange = clock(); } // the chart is moving
    }
    res.json({ ok: !feed.error, error: feed.error });
  });

  app.get('/api/state', (req, res) => {
    const demo = req.query.demo;
    if (demo) return SCENARIOS.includes(demo) ? res.json(buildState(demoInput(demo))) : res.status(404).json({ error: `Unknown demo. Try one of: ${SCENARIOS.join(', ')}.` });
    res.json(buildState({ now: clock(), store, feed, settings, journal, verdicts, problem: problem() }));
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
    for (const [k, label] of [['riskPerTrade', 'Risk per trade'], ['dailyStop', 'Daily stop']]) if (p[k] != null) { const v = num(p[k]); if (!(v > 0)) return res.status(400).json({ error: `${label} must be a dollar amount above zero.` }); next.personal[k] = v; }
    if (p.maxLossesPerDay != null) { const v = num(p.maxLossesPerDay); if (!(Number.isInteger(v) && v >= 1)) return res.status(400).json({ error: 'Losses per day must be a whole number, 1 or more.' }); next.personal.maxLossesPerDay = v; }
    Object.assign(settings, next); save('settings', settings);
    res.json({ settings, plans: PLANS });
  });

  // Manual journal: Spencer types in what Tradovate shows. This is what feeds the guard.
  app.get('/api/journal', (_req, res) => res.json({ trades: [...journal.trades].sort((x, y) => y.ts - x.ts), guard: computeGuard(settings, journal, clock()) }));
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
  return { app, persistBars, store, journal, settings };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const PORT = Number(process.env.PORT) || 3000;
  const { app, persistBars } = createApp();
  setInterval(persistBars, 60000).unref();
  app.listen(PORT, () => {
    console.log(`The Desk is running at http://localhost:${PORT}`);
    console.log('Keep this window open. Open your TradingView chart (MNQ1!, 5 minutes) in your browser with the bridge extension on.');
  });
}
