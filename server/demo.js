// Demo scenarios: made-up bars and a made-up "Passed" verdict, so every screen state can be seen and tested.
// Reached only with ?demo=<name> on the page. The page shows a banner saying it is not real.
import { BarStore } from './bars.js';
import { defaultSettings } from './guard.js';
import { loadVerdicts } from './verdicts.js';
import { rng } from '../research/stats.js';

const Z = (s) => Date.parse(s + 'Z');
const D = '2026-07-15', P = '2026-07-14'; // a Wednesday in July: Denver is UTC-6, New York UTC-4
const FIVE = 5 * 60000;

// Price path for a sweep of the London low at the NY open, then a shift up. [UTC time, price]
const BASE = [
  [P + 'T00:00', 25010], [P + 'T08:00', 25060], [P + 'T13:30', 25090], [P + 'T15:00', 25150], [P + 'T17:30', 25080], [P + 'T20:45', 25120],
  [D + 'T00:00', 25100], [D + 'T03:00', 25135], [D + 'T06:00', 25085], [D + 'T07:30', 25030], [D + 'T09:00', 25075], [D + 'T12:00', 25060], [D + 'T13:15', 25050],
  [D + 'T13:30', 25048], [D + 'T13:45', 24985], [D + 'T14:00', 24978], [D + 'T14:15', 25072],
];
const WIN = [[D + 'T14:40', 25110], [D + 'T15:05', 25190], [D + 'T15:25', 25300], [D + 'T16:00', 25280]];
const LOSS = [[D + 'T14:30', 25040], [D + 'T14:50', 24940], [D + 'T16:00', 24960]];

function makeBars(points, upTo, mirror) {
  const pts = points.map(([t, p]) => [Z(t), p]), rand = rng(7), rows = [];
  const at = (t) => { for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const [t0, p0] = pts[i - 1], [t1, p1] = pts[i]; return p0 + ((p1 - p0) * (t - t0)) / (t1 - t0); } return pts.at(-1)[1]; };
  const q = (x) => Math.round(x * 4) / 4;
  let prev = pts[0][1];
  for (let t = pts[0][0]; t < upTo; t += FIVE) {
    const hr = new Date(t).getUTCHours();
    if (hr === 21) continue; // daily maintenance break
    const o = prev, c = q(at(Math.min(t + FIVE, upTo)) + (rand() - 0.5) * 6);
    const h = q(Math.max(o, c) + rand() * 5), l = q(Math.min(o, c) - rand() * 5);
    const f = (x) => (mirror ? 50000 - x : x);
    rows.push(mirror ? [t / 1000, f(o), f(l), f(h), f(c), 900 + Math.round(rand() * 600)] : [t / 1000, o, h, l, c, 900 + Math.round(rand() * 600)]);
    prev = c;
  }
  return rows;
}

const SPEC = {
  closed:    { now: D + 'T12:00', path: BASE },                      // 6:00 AM Denver, between London and NY
  standdown: { now: D + 'T14:20', path: [...BASE, ...WIN], real: true }, // real verdicts: nothing passed
  watching:  { now: D + 'T13:36', path: BASE },
  armed:     { now: D + 'T13:51', path: BASE },
  long:      { now: D + 'T14:21', path: [...BASE, ...WIN] },
  short:     { now: D + 'T14:21', path: [...BASE, ...WIN], mirror: true },
  won:       { now: D + 'T15:41', path: [...BASE, ...WIN] },
  lost:      { now: D + 'T15:06', path: [...BASE, ...LOSS] },
  blocked:   { now: D + 'T14:21', path: [...BASE, ...WIN], trades: [['T13:05', -350]] },
  locked:    { now: D + 'T14:21', path: [...BASE, ...WIN], trades: [['T08:10', -240], ['T08:55', -180]] },
  stale:     { now: D + 'T14:21', path: [...BASE, ...WIN], stale: true },
};
export const SCENARIOS = Object.keys(SPEC);

export function demoInput(name) {
  const sp = SPEC[name] || SPEC.closed, now = Z(sp.now);
  const store = new BarStore();
  store.ingest(makeBars(sp.path, now, sp.mirror), 5);
  const verdicts = loadVerdicts();
  if (!sp.real) verdicts.setups = verdicts.setups.map(s => (s.id === 'ny_sweep_shift' ? { ...s, label: 'Passed', demo: true } : s));
  const history = [['2026-07-09T15:10', 410], ['2026-07-10T14:40', -235], ['2026-07-13T15:30', 180], ['2026-07-14T14:50', 320]];
  const trades = [...history.map(([t, pnl]) => [Z(t), pnl]), ...(sp.trades || []).map(([t, pnl]) => [Z(D + t), pnl])]
    .map(([ts, pnl], i) => ({ id: 'demo' + i, kind: 'trade', ts, pnl, side: pnl > 0 ? 'LONG' : 'SHORT', contracts: 1, setup: 'Demo', note: '' }));
  return { now, store, feed: { symbol: 'CME_MINI_DL:MNQ1!', lastPost: sp.stale ? now - 4 * 60000 : now - 1500 }, settings: defaultSettings(), journal: { trades }, verdicts, demo: true };
}
