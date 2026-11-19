import test from 'node:test';
import assert from 'node:assert/strict';
import { summary, drawdown, dollars, judge, label, benchmark } from '../research/stats.js';
import { rollKey } from '../research/history.js';

test('summary: average, win rate, t-stat and drawdown', () => {
  const s = summary([{ r: 2 }, { r: -1 }, { r: -1 }, { r: 2 }]);
  assert.equal(s.trades, 4); assert.equal(s.win, 50); assert.equal(s.avgR, 0.5);
  assert.ok(Math.abs(s.t - 0.5 / (Math.sqrt(3) / 2)) < 1e-9);
  assert.equal(s.maxDD, 2);
  assert.equal(drawdown([1, -3, 1, -2, 5]), 4);
});

test('dollars: whole MNQ contracts, a stop too wide for one contract is skipped not shrunk', () => {
  const d = dollars([
    { risk: 50, dir: 1, entry: 100, exitPx: 200 },  // floor(250/100) = 2 contracts: 2 x $2 x (100 - 1) = $396
    { risk: 130, dir: 1, entry: 100, exitPx: 0 },   // floor(250/260) = 0: skipped
    { risk: 125, dir: -1, entry: 100, exitPx: 225 } // 1 contract: $2 x (-125 - 1) = -$252
  ]);
  assert.equal(d.taken, 2); assert.equal(d.net, 396 - 252); assert.equal(d.maxDD, 252);
});

test('label follows the pre-registered pass bar', () => {
  const good = { trades: 300, avgR: 0.15, t: 2.5, maxDD: 8 };
  const years = { 2024: { avgR: 0.1 }, 2025: { avgR: 0.2 }, 2026: { avgR: 0.1 } };
  const dollar = { taken: 200, net: 5000, maxDD: 1500 };
  const pass = judge({ judge: good, years, last12: { avgR: 0.05 }, dollar });
  assert.equal(label(pass, { avgR: 0.05 }, good), 'Passed');
  const deep = judge({ judge: { ...good, maxDD: 10.9 }, years, last12: { avgR: 0.05 }, dollar });
  assert.equal(label(deep, { avgR: 0.05 }, good), 'Promising, not proven');
  const breach = judge({ judge: good, years, last12: { avgR: 0.05 }, dollar: { ...dollar, maxDD: 2400 } });
  assert.equal(label(breach, { avgR: 0.05 }, good), 'Promising, not proven');
  assert.equal(label(deep, { avgR: -0.05 }, good), 'No edge');
  assert.equal(label(deep, { avgR: -0.05 }, { avgR: -0.01 }), 'Benched');
});

test('benchmark is repeatable and roll dates follow the third Friday', () => {
  const pairs = Array.from({ length: 50 }, (_, i) => ({ long: i % 2 ? 1 : -1, short: i % 2 ? -1 : 1 }));
  assert.deepEqual(benchmark(pairs), benchmark(pairs));
  assert.equal(rollKey('NQH2019'), '2019-03-08'); // expiry Mar 15, 2019
  assert.equal(rollKey('NQZ2026'), '2026-12-11'); // expiry Dec 18, 2026
});
