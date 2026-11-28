// The TJR setups on made-up 5-minute bars. Rules: research/PREREGISTRATION.md, addendum 2026-11-28.
import test from 'node:test';
import assert from 'node:assert/strict';
import { byId, STRATEGIES } from '../server/strategies/index.js';
import { structure, biasAt, TJR_COST } from '../server/strategies/tjr.js';
import { BarStore } from '../server/bars.js';
import { etTime, addDays, MIN } from '../server/time.js';

const M5 = 5 * MIN;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);
const DAY = '2026-11-18'; // a Wednesday; New York is UTC-5 and London UTC+0

/**
 * Seven finished trading days whose daily candles are: down, up, down (closing below the swing low),
 * then four small down days, so the daily bias is down (or up when `flip` mirrors every price).
 * The test day's overnight is flat at 25850 with one dip to 25780 in Asia and a 25860 high in London.
 */
function scenario({ flip = false, crafted = {} } = {}) {
  const X = (p) => (flip ? 51700 - p : p);
  const bar = (t, o, h, l, c) => (flip ? [t / 1000, X(o), X(l), X(h), X(c), 10] : [t / 1000, o, h, l, c, 10]);
  const rows = [];
  const days = [['2026-11-09', 26000, 25950], ['2026-11-10', 25950, 25980], ['2026-11-11', 25980, 25900], ['2026-11-12', 25900, 25890], ['2026-11-13', 25890, 25880], ['2026-11-16', 25880, 25870], ['2026-11-17', 25870, 25860]];
  for (const [key, from, to] of days) {
    const start = etTime(addDays(key, key === '2026-11-09' || key === '2026-11-16' ? -1 : -1), 18), end = etTime(key, 17), n = (end - start) / M5;
    for (let i = 0; i < n; i++) { const o = from + ((to - from) * i) / n, c = from + ((to - from) * (i + 1)) / n; rows.push(bar(start + i * M5, o, Math.max(o, c) + 0.5, Math.min(o, c) - 0.5, c)); }
  }
  const start = etTime('2026-11-17', 18), end = etTime(DAY, 16) + 6 * M5;
  const special = {
    [etTime('2026-11-17', 22)]: [25850, 25851, 25780, 25785], [etTime('2026-11-17', 22) + M5]: [25785, 25851, 25782, 25850],
    [etTime(DAY, 3)]: [25850, 25860, 25849, 25850],
    [etTime(DAY, 9.5) - 2 * M5]: [25850, 25851, 25846, 25847], [etTime(DAY, 9.5) - M5]: [25847, 25851, 25847, 25850],
    ...crafted,
  };
  let px = 25850;
  for (let t = start; t < end; t += M5) {
    const s = special[t];
    if (s) { rows.push(bar(t, ...s)); px = s[3]; } else rows.push(bar(t, px, px + 1, px - 1, px));
  }
  return rows.sort((a, b) => a[0] - b[0]);
}
const O = etTime(DAY, 9.5);
/** The crafted morning: sweep of the London high, a displacement, a break, a deeper leg, a pullback, then the fall. */
const MORNING = {
  [O]: [25850, 25869, 25848, 25865],
  [O + M5]: [25865, 25866, 25846.5, 25847],
  [O + 2 * M5]: [25847, 25847.5, 25838, 25840],
  [O + 3 * M5]: [25840, 25841, 25820, 25822],
  [O + 4 * M5]: [25822, 25847.8, 25821, 25830],
  [O + 5 * M5]: [25830, 25831, 25800, 25802],
  [O + 6 * M5]: [25802, 25803, 25775, 25778],
};
function ctxOf(rows, upTo = Infinity) {
  const store = new BarStore();
  store.ingest(rows.filter(r => r[0] * 1000 <= upTo), 5);
  return store.ctx();
}
const run = (id, rows, upTo) => byId(id).evaluate(ctxOf(rows, upTo), DAY);

test('registry: eight TJR setups, two per window, marked as research and on 5-minute bars', () => {
  const t = STRATEGIES.filter(s => s.research === 'tjr');
  assert.equal(t.length, 8);
  for (const w of ['nyopen', 'nymid', 'asia', 'london']) assert.equal(t.filter(s => s.window === w).length, 2);
  assert.deepEqual(t.filter(s => !s.outside).map(s => s.id), ['tjr1_nyopen', 'tjr2_nyopen']);
  assert.ok(t.every(s => s.barMin === 5 && s.cost === TJR_COST && s.rules.length >= 4));
  assert.equal(TJR_COST, 1.5);
});

test('structure: a swing needs two opposite candles, a break needs a close beyond it', () => {
  const c = (o, h, l, cl) => ({ o, h, l, c: cl });
  const st = structure([c(10, 12, 9, 11), c(11, 13, 10, 10.5), c(10.5, 14, 10, 12.9), c(12.9, 13.5, 12, 13.2)]);
  assert.equal(st[1].hi, 13);            // up then down: the higher high of the two
  assert.equal(st[2].dir, null);         // a wick through 13 that closes below it is not a break
  assert.equal(st[2].lo, 10);            // down then up: the lower low of the two
  assert.equal(st[3].dir, 1);            // a close above 13 is
});

test('daily bias: read from finished daily candles only', () => {
  const ctx = ctxOf(scenario());
  assert.equal(biasAt(ctx, O).daily, -1);
  assert.equal(biasAt(ctxOf(scenario({ flip: true })), O).daily, 1);
  assert.equal(biasAt(ctx, etTime('2026-11-11', 9.5)).daily, null); // only two finished days by then
});

test('T1: high swept, 5-minute close below the last swing low, short with the daily bias', () => {
  const r = run('tjr1_nyopen', scenario({ crafted: MORNING }));
  const t = r.trade;
  assert.equal(t.side, 'SHORT');
  assert.equal(t.entry, 25840);
  assert.equal(t.stop, 25871);                   // 2 points beyond the 25869 extreme
  assert.equal(t.target, 25780);                 // the untouched Asian low, more than 1R away
  assert.equal(t.signalT + 15 * MIN, O + 3 * M5); // known at the close of the 9:40 bar
  assert.equal(t.status, 'target');
  near(t.r, (60 - TJR_COST) / 31);
  assert.match(t.reason, /London high/);
});

test('T1: before the break it is armed with the level a close must cross', () => {
  const r = run('tjr1_nyopen', scenario({ crafted: MORNING }), O + 2 * M5); // feed has reached the 9:40 bar, still forming
  assert.equal(r.phase, 'armed');
  assert.equal(r.pending[0].trigger, 25846);
  assert.equal(r.pending[0].kind, 'close');
  assert.equal(r.pending[0].stop, 25871);
});

test('T1: the same pattern against the daily bias is not a trade', () => {
  const up = scenario({ flip: true });
  // Mirror the prices back so the morning is still a high sweep and break down, but the daily bias is now up.
  const rows = up.map(r => (r[0] * 1000 >= etTime('2026-11-17', 18) ? [r[0], 51700 - r[1], 51700 - r[3], 51700 - r[2], 51700 - r[4], 10] : r));
  const withMorning = rows.map(r => { const m = MORNING[r[0] * 1000]; return m ? [r[0], ...m, 10] : r; });
  const res = byId('tjr1_nyopen').evaluate(ctxOf(withMorning), DAY);
  assert.equal(res.trade, undefined);
  assert.equal(res.phase, 'done');
});

test('T2: waits for the pullback into the gap, in the favourable half, with the same stop', () => {
  const rows = scenario({ crafted: MORNING });
  const armed = run('tjr2_nyopen', rows, O + 4 * M5); // the 9:45 bar has closed: the move is deep enough for the zones to count
  assert.equal(armed.phase, 'armed');
  assert.equal(armed.pending[0].kind, 'limit');
  assert.equal(armed.pending[0].trigger, 25847.5);
  const early = run('tjr2_nyopen', rows, O + 3 * M5); // right after the break the zones are still in the wrong half
  assert.equal(early.phase, 'watching');
  const t = run('tjr2_nyopen', rows).trade;
  assert.equal(t.side, 'SHORT');
  assert.equal(t.entry, 25847.5);
  assert.equal(t.stop, 25871);
  assert.equal(t.target, 25780);
  assert.equal(t.status, 'target');
  near(t.r, (67.5 - TJR_COST) / 23.5);
  assert.match(t.reason, /fair value gap/);
});

test('T2: no pullback, no trade', () => {
  const noPull = { ...MORNING, [O + 4 * M5]: [25822, 25823, 25810, 25812] };
  const r = run('tjr2_nyopen', scenario({ crafted: noPull }));
  assert.equal(r.trade, undefined);
});

test('T2: a pullback that runs through the stop in the same bar is a loss, stop first', () => {
  const blow = { ...MORNING, [O + 4 * M5]: [25822, 25872, 25821, 25860] };
  const t = run('tjr2_nyopen', scenario({ crafted: blow })).trade;
  assert.equal(t.status, 'stopped');
  near(t.r, -1 - TJR_COST / 23.5);
});

test('no entry after the window: the same morning one and a half hours later does nothing for the NY open setup', () => {
  const late = Object.fromEntries(Object.entries(MORNING).map(([t, v]) => [Number(t) + 20 * M5, v])); // sweep at 11:10
  const r = run('tjr1_nyopen', scenario({ crafted: late }));
  assert.equal(r.trade, undefined);
});
