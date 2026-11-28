// A trade still on when the market halts early for a holiday takes its time exit at the halt.
// Black Friday 2026: CME stops at 12:15 PM Chicago (18:15 UTC), well before the 16:00 ET (21:00 UTC) flat time.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BAR, MIN, etTime } from '../server/time.js';
import { manage, openTrade, flatTime, Series, makeCtx } from '../server/strategies/common.js';
import { follow } from '../server/strategies/tjr.js';
import { BarStore } from '../server/bars.js';
import { haltWithin } from '../server/holidays.js';
import { Z, flat, closedCtx } from './helpers.js';

const HALT = Z('2026-11-27T18:15');

/** Made-up 15m bars for Thanksgiving week, with nothing after the Black Friday halt. Price drifts up from noon ET. */
function halfDayBars() {
  const ov = {};
  for (let i = 0; i < 5; i++) { const c = 101 + i; ov[new Date(Z('2026-11-27T17:00') + i * BAR).toISOString().slice(0, 16)] = [c - 1, c + 0.5, c - 1.5, c]; }
  return flat('2026-11-23', '2026-11-27', ov).filter(b => b.t < HALT);
}
const longAtNoon = (ctx) => openTrade(1, ctx.s.at(Z('2026-11-27T17:00')), 90, null, 'test');

test('haltWithin finds the Black Friday halt inside the afternoon, and nothing on an ordinary day', () => {
  assert.equal(haltWithin(Z('2026-11-27T17:00'), etTime('2026-11-27', 16)), HALT);
  assert.equal(haltWithin(Z('2026-11-20T17:00'), etTime('2026-11-20', 16)), null);
  assert.equal(haltWithin(Z('2026-11-27T19:00'), Z('2026-11-27T21:00')), null); // already halted when the trade began
});

test('half-day: manage() takes the time exit at the last bar before the halt instead of staying open', () => {
  const ctx = closedCtx(halfDayBars());
  assert.equal(ctx.now, HALT);
  const t = manage(ctx, longAtNoon(ctx), etTime('2026-11-27', 16));
  assert.equal(t.status, 'time');
  assert.equal(t.exitT, Z('2026-11-27T18:00'));
  assert.equal(t.exitPx, 105);
  assert.ok(Math.abs(t.r - (4 - 1) / 11) < 1e-9);
});

test('half-day: still open before the halt, and an ordinary Friday with the same bars is untouched', () => {
  const bars = halfDayBars();
  const before = closedCtx(bars, Z('2026-11-27T17:45'));
  assert.equal(manage(before, longAtNoon(before), etTime('2026-11-27', 16)).status, 'open');

  // The same afternoon moved to 2026-11-20 (no holiday): the data stops at 18:15 UTC but the flat time is 21:00 UTC.
  const shift = Z('2026-11-27T00:00') - Z('2026-11-20T00:00');
  const ordinary = closedCtx(bars.map(b => ({ ...b, t: b.t - shift })));
  const t = manage(ordinary, openTrade(1, ordinary.s.at(Z('2026-11-20T17:00')), 90, null, 'test'), etTime('2026-11-20', 16));
  assert.equal(t.status, 'open');
  assert.equal(flatTime(ordinary, Z('2026-11-20T17:00'), etTime('2026-11-20', 16)).due, false);
});

test('half-day: a live 5-minute feed (now = the last bar\'s open) exits once the 13:10 ET bar is in', () => {
  const rows = [];
  for (let t = Z('2026-11-27T14:30'); t < HALT; t += 5 * MIN) { const up = t >= Z('2026-11-27T17:00') ? (t - Z('2026-11-27T17:00')) / (5 * MIN) * 0.25 : 0; rows.push([t / 1000, 100 + up, 100.5 + up, 99.5 + up, 100 + up, 10]); }
  const store = new BarStore();
  store.ingest(rows.filter(r => r[0] * 1000 < Z('2026-11-27T18:00')), 5);
  const mid = store.ctx();
  const trade = openTrade(1, mid.s.at(Z('2026-11-27T17:00')), 95, null, 'test');
  assert.equal(manage(mid, trade, etTime('2026-11-27', 16)).status, 'open');   // 13:00 ET: 15 minutes still to trade

  store.ingest(rows, 5);
  const end = store.ctx();
  assert.equal(end.now, Z('2026-11-27T18:10'));
  const t = manage(end, trade, etTime('2026-11-27', 16));
  assert.equal(t.status, 'time');
  assert.equal(t.exitT, Z('2026-11-27T18:10'));
  assert.equal(t.exitPx, rows.at(-1)[4]);
});

test('half-day: the TJR follow() also exits at the halt', () => {
  const bars = halfDayBars(), ctx = closedCtx(bars);
  const trade = { dir: 1, side: 'LONG', signalT: Z('2026-11-27T17:00'), entry: 101, stop: 90, risk: 11, target: 200 };
  const t = follow(ctx, trade, Z('2026-11-27T17:15'), etTime('2026-11-27', 16));
  assert.equal(t.status, 'time');
  assert.equal(t.exitPx, 105);
  const before = closedCtx(bars, Z('2026-11-27T17:45'));
  assert.equal(follow(before, trade, Z('2026-11-27T17:15'), etTime('2026-11-27', 16)).status, 'open');
});
