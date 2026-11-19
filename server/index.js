import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BarStore, snapshot } from './engine.js';
import { feeds, refreshCalendar, refreshNews } from './feeds.js';
import { BACKTEST } from './backtest.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PORT = Number(process.env.PORT) || 3000;
const DATA = path.join(root, 'data');
const SETTINGS_FILE = path.join(DATA, 'settings.json');
const BARS_FILE = path.join(DATA, 'bars.json');
fs.mkdirSync(DATA, { recursive: true });

const readJSON = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const settings = { riskBudget: 250, instrument: 'MNQ', ...readJSON(SETTINGS_FILE, {}) };
const pointValue = () => (settings.instrument === 'NQ' ? 20 : 2);

const store = new BarStore();
store.load(readJSON(BARS_FILE, null));
const feed = { symbol: null, lastPost: 0, error: null };

const app = express();
app.use(express.json({ limit: '5mb' }));

// Let the Sweep Quest site (hosted on Higgsfield) read this laptop's data in your browser.
const ALLOWED_ORIGINS = [/^https:\/\/sweep-quest\.[a-z0-9.-]+$/, /^http:\/\/localhost(:\d+)?$/];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.some(r => r.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Quest journal: one entry per trading day, kept in data/journal.json on this laptop.
const JOURNAL_FILE = path.join(DATA, 'journal.json');
const journal = readJSON(JOURNAL_FILE, { days: {}, checks: {} });
const XP = { levels: 10, calendar: 10, wait: 15, size: 15, twoR: 15, flat: 10 };
function progress() {
  const days = Object.entries(journal.days).sort(([a], [b]) => a.localeCompare(b));
  let xp = 0; for (const [, d] of days) xp += (d.checks || []).reduce((a, k) => a + (XP[k] || 0), 0) + (d.followed ? 25 : 0);
  let streak = 0; for (let i = days.length - 1; i >= 0 && days[i][1].followed; i--) streak++;
  const level = Math.floor(xp / 200) + 1;
  return { xp, level, levelXp: xp % 200, levelSize: 200, streak, recent: days.slice(-14).map(([date, d]) => ({ date, followed: !!d.followed, r: d.r ?? null, took: !!d.took })) };
}
app.get('/api/journal', (_req, res) => res.json({ ...progress(), today: journal.days[new Date().toISOString().slice(0, 10)] || null, xpTable: XP }));
app.post('/api/journal', (req, res) => {
  const { date, checks, followed, took, r, note } = req.body || {};
  const k = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : new Date().toISOString().slice(0, 10);
  const prev = journal.days[k] || {};
  const day = { ...prev };
  if (Array.isArray(checks)) day.checks = checks.filter(c => c in XP);
  if (followed != null) day.followed = !!followed;
  if (took != null) day.took = !!took;
  if (r !== undefined) { const v = r === null || r === '' ? null : Number(r); if (v !== null && !Number.isFinite(v)) return res.status(400).json({ error: 'Result must be a number of R, like 2 or -1.' }); day.r = v; }
  if (typeof note === 'string') day.note = note.slice(0, 500);
  journal.days[k] = day;
  fs.writeFileSync(JOURNAL_FILE, JSON.stringify(journal, null, 2));
  res.json({ ...progress(), today: day });
});

// The Chrome extension posts the chart's bars here every few seconds.
app.post('/api/bars', (req, res) => {
  const { symbol, resolution, bars } = req.body || {};
  const resMin = Number(resolution);
  if (!Array.isArray(bars)) return res.status(400).json({ error: 'Expected a bars array.' });
  if (!(resMin >= 1 && resMin <= 15 && 15 % resMin === 0)) {
    feed.error = `Set the TradingView chart to 1, 3, 5 or 15 minutes (it is on "${resolution}").`;
    feed.lastPost = Date.now();
    return res.json({ ok: false, error: feed.error });
  }
  if (!/NQ/i.test(String(symbol))) feed.error = `The chart shows ${symbol}. Switch it to NQ1! or MNQ1!.`;
  else feed.error = null;
  if (!feed.error) store.ingest(bars, resMin);
  feed.symbol = symbol; feed.lastPost = Date.now();
  res.json({ ok: !feed.error });
});

app.get('/api/state', (_req, res) => {
  const snap = snapshot(store, { riskBudget: settings.riskBudget, pointValue: pointValue() });
  res.json({
    now: Date.now(), feed: { ...feed, lastBarT: store.lastRawT, resMin: store.resMin },
    settings, snap, backtest: BACKTEST,
    calendar: feeds.calendar.filter(e => e.t > Date.now() - 12 * 36e5).slice(0, 25),
    news: feeds.news.slice(0, 25), feedErrors: feeds.errors,
  });
});

app.post('/api/settings', (req, res) => {
  const { riskBudget, instrument } = req.body || {};
  if (riskBudget != null) {
    const v = Number(riskBudget);
    if (!(v > 0 && v <= 100000)) return res.status(400).json({ error: 'Risk per trade must be a positive dollar amount.' });
    settings.riskBudget = v;
  }
  if (instrument != null) {
    if (!['MNQ', 'NQ'].includes(instrument)) return res.status(400).json({ error: 'Instrument must be MNQ or NQ.' });
    settings.instrument = instrument;
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  res.json(settings);
});

app.use(express.static(path.join(root, 'public')));

// Save bars every minute so a restart keeps today's levels.
setInterval(() => { try { fs.writeFileSync(BARS_FILE, JSON.stringify(store.toJSON())); } catch {} }, 60000).unref();
refreshCalendar(); refreshNews();
setInterval(refreshCalendar, 30 * 60000).unref();
setInterval(refreshNews, 5 * 60000).unref();

app.listen(PORT, () => {
  console.log(`NQ Desk running at http://localhost:${PORT}`);
  console.log('Open your TradingView chart on NQ1! or MNQ1! (1, 5 or 15 min) with the NQ Desk Bridge extension on.');
});
