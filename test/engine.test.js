import test from 'node:test';
import assert from 'node:assert/strict';
import { BarStore, etOffset, etTime, levels, nyModel, londonModel } from '../server/engine.js';

const M = 60000;
// Build a 5-minute day: flat at 100 except where overrides set {t: [o,h,l,c]}.
function day(dateKey, overrides = {}) {
  const rows = [];
  const start = Date.parse(dateKey + 'T00:00Z');
  for (let t = start; t < start + 21 * 60 * M; t += 5 * M) {
    const o = overrides[t] || [100, 101, 99, 100];
    rows.push([t / 1000, ...o, 10]);
  }
  return rows;
}

test('daylight saving offset', () => {
  assert.equal(etOffset(Date.parse('2026-07-01T12:00Z')), -4);
  assert.equal(etOffset(Date.parse('2026-12-01T12:00Z')), -5);
  assert.equal(new Date(etTime('2026-10-20', 9.5)).toISOString(), '2026-10-20T13:30:00.000Z');
  assert.equal(new Date(etTime('2026-12-01', 9.5)).toISOString(), '2026-12-01T14:30:00.000Z');
});

test('5m bars aggregate into 15m and levels read the sessions', () => {
  const s = new BarStore();
  s.ingest(day('2026-10-19'), 5);
  const ov = {}; ov[Date.parse('2026-10-20T03:00Z')] = [100, 110, 99, 100]; // Asian high 110
  ov[Date.parse('2026-10-20T07:00Z')] = [100, 101, 90, 100]; // London (3 ET) low 90
  s.ingest(day('2026-10-20', ov).filter(r => r[0] * 1000 < Date.parse('2026-10-20T13:00Z')), 5);
  const L = levels(s);
  assert.equal(L.date, '2026-10-20');
  assert.equal(L.asia.high, 110);
  assert.equal(L.london.low, 90);
  assert.equal(L.prior.high, 101);
  assert.equal(s.bars.get(Date.parse('2026-10-20T03:00Z')).h, 110);
});

test('NY model: sweep of prior-day high then shift down gives a short with 2R target', () => {
  const s = new BarStore();
  s.ingest(day('2026-10-19'), 15);
  const ov = {};
  const T = (hhmm) => Date.parse(`2026-10-20T${hhmm}Z`);
  ov[T('13:30')] = [100, 103, 99.5, 102]; // 9:30 ET bar sweeps 101 (asia/london/pd highs)
  ov[T('13:45')] = [102, 102.5, 95, 96];  // 9:45 ET bar closes below lows of prior 3 bars (99)
  ov[T('14:00')] = [96, 96.5, 80, 81];    // runs to target
  const rows = day('2026-10-20', ov).filter(r => r[0] * 1000 <= T('14:15'));
  // feed 15m bars (already 15m aligned since day() steps 5m: keep only :00/:15/:30/:45)
  s.ingest(rows.filter(r => (r[0] / 60) % 15 === 0), 15);
  const L = levels(s);
  const ny = nyModel(s, L, { riskBudget: 250, pointValue: 2 });
  assert.equal(ny.trade.side, 'SHORT');
  assert.equal(ny.trade.entry, 96);
  assert.equal(ny.trade.stop, 104); // session high 103 + 1
  assert.equal(ny.trade.target, 96 - 2 * 8);
  assert.equal(ny.trade.status, 'target');
  assert.equal(ny.trade.contracts, 15);
  const ld = londonModel(s, L, { riskBudget: 250, pointValue: 2 });
  assert.ok(['done', 'watching', 'armed', 'in-trade'].includes(ld.phase));
});

test('open 15m bar is never used for a signal', () => {
  const s = new BarStore();
  s.ingest(day('2026-10-19'), 5);
  const T = (hhmm) => Date.parse(`2026-10-20T${hhmm}Z`);
  const ov = {}; ov[T('13:30')] = [100, 103, 99.5, 102]; ov[T('13:45')] = [102, 102, 94, 95];
  // stop the feed at 13:45 (only first 5m of the 13:45 bucket) → bucket not closed
  s.ingest(day('2026-10-20', ov).filter(r => r[0] * 1000 <= T('13:45')), 5);
  const ny = nyModel(s, levels(s), { riskBudget: 250, pointValue: 2 });
  assert.equal(ny.trade, undefined);
  assert.equal(ny.phase, 'armed');
});
