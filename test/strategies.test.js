import test from 'node:test';
import assert from 'node:assert/strict';
import { STRATEGIES, byId } from '../server/strategies/index.js';
import { COST_POINTS } from '../server/strategies/common.js';
import { flat, closedCtx, Z } from './helpers.js';

const run = (id, bars, key, upTo) => byId(id).evaluate(closedCtx(bars, upTo), key);
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);
// July 2026: New York is UTC-4, so 9:30 ET = 13:30Z and 18:00 ET = 22:00Z. 2026-07-01 is a Wednesday.
const D = '2026-07-01', FROM = '2026-06-10';

test('registry: fourteen fifteen-minute setups, each tied to one window', () => {
  assert.deepEqual(STRATEGIES.filter(s => !s.research).map(s => s.id), ['ny_sweep_shift', 'ny_orb15', 'nymid_noise', 'nymid_last30', 'nymid_vwap', 'asia_orb', 'asia_sweep', 'asia_fade', 'london_sweep', 'london_breakout', 'london_orb', 'ny_ib', 'ny_silver_bullet', 'nymid_vwap_bounce']);
  for (const s of STRATEGIES) assert.ok(['asia', 'london', 'nyopen', 'nymid'].includes(s.window) && s.rules.length && s.source);
  assert.equal(COST_POINTS, 1);
});

test('N1 sweep + shift: high swept, 15m close through last 3 lows gives a short, 2R target hit', () => {
  const bars = flat(FROM, D, {
    [D + 'T13:30']: [100, 103, 99.5, 102],
    [D + 'T13:45']: [102, 102.5, 95, 96],
    [D + 'T14:00']: [96, 96.5, 80, 81],
  });
  const r = run('ny_sweep_shift', bars, D);
  assert.equal(r.trade.side, 'SHORT');
  assert.equal(r.trade.entry, 96);
  assert.equal(r.trade.stop, 104);
  assert.equal(r.trade.target, 80);
  assert.equal(r.trade.status, 'target');
  near(r.trade.r, 2 - 1 / 8); // 2R less the 1 point cost on an 8 point risk
  assert.equal(r.phase, 'done');
});

test('N1: before any sweep it is watching; after a sweep it is armed with the trigger level', () => {
  const bars = flat(FROM, D, { [D + 'T13:30']: [100, 103, 99.5, 102] });
  assert.equal(run('ny_sweep_shift', bars, D, Z(D + 'T13:30')).phase, 'watching');
  const armed = run('ny_sweep_shift', bars, D, Z(D + 'T13:45'));
  assert.equal(armed.phase, 'armed');
  assert.deepEqual(armed.pending.map(p => [p.side, p.trigger, p.stop, p.target]), [['SHORT', 99, 104, 89]]);
  assert.equal(run('ny_sweep_shift', bars, D, Z(D + 'T13:00')).phase, 'waiting');
});

test('N1: stop and target inside the same bar counts as a stop', () => {
  const bars = flat(FROM, D, {
    [D + 'T13:30']: [100, 103, 99.5, 102],
    [D + 'T13:45']: [102, 102.5, 95, 96],
    [D + 'T14:00']: [96, 105, 79, 81],
  });
  const t = run('ny_sweep_shift', bars, D).trade;
  assert.equal(t.status, 'stopped');
  near(t.r, -1 - 1 / 8);
});

test('N1: no trade is flat at 12:00 ET when neither stop nor target is hit', () => {
  const bars = flat(FROM, D, {
    [D + 'T13:30']: [100, 103, 99.5, 102],
    [D + 'T13:45']: [102, 102.5, 95, 96],
    [D + 'T14:00']: [96, 98, 94, 97],
  });
  const t = run('ny_sweep_shift', bars, D).trade;
  assert.equal(t.status, 'time');
  assert.equal(t.exitPx, 100); // close of the 11:45 ET bar
  near(t.r, (96 - 100 - 1) / 8);
});

test('N2 opening range breakout: first bar up gives a long, stop at its low, 10R target, flat 16:00', () => {
  const bars = flat(FROM, D, { [D + 'T13:30']: [100, 104, 97, 103] });
  const t = run('ny_orb15', bars, D).trade;
  assert.deepEqual([t.side, t.entry, t.stop, t.target], ['LONG', 103, 97, 163]);
  assert.equal(t.status, 'time');
  near(t.r, (100 - 103 - 1) / 6);
});

test('N2: a stop closer than 5 points is skipped, a flat first bar is no trade', () => {
  assert.equal(run('ny_orb15', flat(FROM, D, { [D + 'T13:30']: [100, 104, 99, 103] }), D).trade, undefined);
  assert.equal(run('ny_orb15', flat(FROM, D), D).trade, undefined);
});

test('M1 noise-area breakout: 12:00 close above the band is a long; leaves when a half-hour close falls back under', () => {
  const bars = flat(FROM, D, { [D + 'T15:45']: [100, 103.5, 99.5, 103], [D + 'T16:15']: [103, 103, 99.2, 99.5] });
  const t = run('nymid_noise', bars, D).trade;
  assert.deepEqual([t.side, t.entry, t.stop, t.target], ['LONG', 103, 97, null]);
  assert.equal(t.status, 'rule');
  assert.equal(t.exitPx, 99.5);
  near(t.r, (99.5 - 103 - 1) / 6);
});

test('M1: needs 10 earlier days of history', () => {
  const bars = flat('2026-06-25', D, { [D + 'T15:45']: [100, 103.5, 99.5, 103] });
  const r = run('nymid_noise', bars, D);
  assert.equal(r.trade, undefined);
  assert.equal(r.phase, 'no-data');
});

test('M2 last half hour: up on the day at 15:30 is a long held to 16:00', () => {
  const bars = flat(FROM, D, { [D + 'T19:15']: [100, 102.5, 99.5, 102], [D + 'T19:45']: [102, 105.5, 101.5, 105] });
  const t = run('nymid_last30', bars, D).trade;
  assert.deepEqual([t.side, t.entry, t.stop], ['LONG', 102, 98]);
  assert.equal(t.status, 'time');
  near(t.r, (105 - 102 - 1) / 4);
});

test('M3 VWAP trend: above VWAP at 12:00 is a long; hard stop 3 ATR', () => {
  const bars = flat(FROM, D, { [D + 'T15:45']: [100, 103.5, 99.5, 103], [D + 'T16:00']: [103, 104, 102, 103], [D + 'T16:15']: [103, 104, 102, 103], [D + 'T16:30']: [103, 103, 96.5, 99] });
  const t = run('nymid_vwap', bars, D).trade;
  assert.deepEqual([t.side, t.entry, t.stop], ['LONG', 103, 97]);
  assert.equal(t.status, 'stopped');
  near(t.r, -1 - 1 / 6);
});

test('M3: leaves on a 15m close back through VWAP', () => {
  const bars = flat(FROM, D, { [D + 'T15:45']: [100, 103.5, 99.5, 103], [D + 'T16:00']: [103, 104, 102, 103], [D + 'T16:15']: [103, 104, 102, 103], [D + 'T16:30']: [103, 103, 98, 99] });
  const t = run('nymid_vwap', bars, D).trade;
  assert.equal(t.status, 'rule');
  assert.equal(t.exitPx, 99);
});

test('A1 evening range breakout: close above the 18:00-18:30 range, stop under it, 2R', () => {
  const bars = flat(FROM, '2026-07-02', { [D + 'T22:30']: [100, 103.5, 99.5, 103], [D + 'T22:45']: [103, 114, 102, 113] });
  const t = run('asia_orb', bars, D).trade;
  assert.deepEqual([t.side, t.entry, t.stop, t.target], ['LONG', 103, 98, 113]);
  assert.equal(t.status, 'target');
  near(t.r, 2 - 1 / 5);
});

test('A2 evening sweep + shift: day high swept after 18:00, then a close through the last 3 lows', () => {
  const bars = flat(FROM, '2026-07-02', { [D + 'T22:00']: [100, 103, 99, 100], [D + 'T22:45']: [100, 100.5, 95, 96] });
  const r = run('asia_sweep', bars, D);
  assert.deepEqual([r.trade.side, r.trade.entry, r.trade.stop, r.trade.target], ['SHORT', 96, 104, 80]);
  assert.equal(run('asia_sweep', bars, D, Z(D + 'T22:30')).phase, 'armed');
});

test('a trade whose exit is not known yet stays open and has no result', () => {
  const bars = flat(FROM, D, { [D + 'T13:30']: [100, 103, 99.5, 102], [D + 'T13:45']: [102, 102.5, 95, 96] });
  const r = run('ny_sweep_shift', bars, D, Z(D + 'T14:15'));
  assert.equal(r.phase, 'in-trade');
  assert.equal(r.trade.status, 'open');
  assert.equal(r.trade.r, null);
});

// ── Popular setups added 2026-11-20 (July: London is UTC+1, so 08:00 London = 07:00Z) ──
const sig = (t) => t && [t.side, t.entry, t.stop, t.target];

test('A3 evening range fade: a poke above the first-hour range that closes back inside is a short to the far side', () => {
  const bars = flat(FROM, '2026-07-02', { [D + 'T22:00']: [100, 110, 90, 100], [D + 'T23:00']: [100, 116, 99, 104] });
  assert.deepEqual(sig(run('asia_fade', bars, D).trade), ['SHORT', 104, 117, 90]);
  const small = flat(FROM, '2026-07-02', { [D + 'T23:00']: [100, 107, 99.5, 100.5] }); // far side is under 1R away
  assert.equal(run('asia_fade', small, D).trade, undefined);
});

test('L1 London sweep + reclaim: Asian high swept, close back inside is a short', () => {
  const bars = flat(FROM, D, { [D + 'T07:00']: [100, 105, 99.5, 102], [D + 'T07:15']: [102, 102.5, 99.6, 100] });
  assert.deepEqual(sig(run('london_sweep', bars, D).trade), ['SHORT', 100, 106, 88]);
  assert.equal(run('london_sweep', bars, D, Z(D + 'T07:15')).phase, 'armed');
});

test('L2 London breakout: close above the Asian range, stop at its middle', () => {
  const bars = flat(FROM, D, { [D + 'T07:15']: [100, 106.5, 99.5, 106] });
  assert.deepEqual(sig(run('london_breakout', bars, D).trade), ['LONG', 106, 100, 118]);
});

test('L3 London opening range: close above the first 30 minutes', () => {
  const bars = flat(FROM, D, { [D + 'T07:30']: [100, 105.5, 99.5, 105] });
  assert.deepEqual(sig(run('london_orb', bars, D).trade), ['LONG', 105, 98, 119]);
  assert.equal(run('london_orb', bars, D, Z(D + 'T07:30')).phase, 'armed');
});

test('N3 initial balance breakout: stop at the middle, target half the range beyond the edge', () => {
  const bars = flat(FROM, D, { [D + 'T13:30']: [100, 110, 90, 100], [D + 'T14:30']: [100, 113.5, 99.5, 113] });
  assert.deepEqual(sig(run('ny_ib', bars, D).trade), ['LONG', 113, 100, 120]);
});

test('N4 Silver Bullet: low swept, then a fair value gap up that completes by 11:00 ET', () => {
  const bars = flat(FROM, D, { [D + 'T13:30']: [100, 100.5, 95, 96], [D + 'T13:45']: [96, 104, 95.5, 103], [D + 'T14:00']: [103, 110, 101.5, 109] });
  assert.deepEqual(sig(run('ny_silver_bullet', bars, D).trade), ['LONG', 109, 94, 139]);
  const late = flat(FROM, D, { [D + 'T13:30']: [100, 100.5, 95, 96], [D + 'T14:45']: [96, 104, 95.5, 103], [D + 'T15:00']: [103, 110, 101.5, 109] });
  assert.equal(run('ny_silver_bullet', late, D).trade, undefined); // gap completes after 11:00 ET
});

test('M4 VWAP bounce: three closes above VWAP, then a touch that closes back above', () => {
  const up = [105, 106, 104.5, 105.5];
  const bars = flat(FROM, D, { [D + 'T15:15']: up, [D + 'T15:30']: up, [D + 'T15:45']: up, [D + 'T16:00']: [105.5, 106, 100, 104] });
  assert.deepEqual(sig(run('nymid_vwap_bounce', bars, D).trade), ['LONG', 104, 99, 114]);
});
