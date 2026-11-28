// The November 2026 research: which setups are shown, the best estimate, ranges, fees and the checks.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildState } from '../server/desk.js';
import { loadVerdicts, windowSetups, winRange, rankR } from '../server/verdicts.js';
import { demoInput } from '../server/demo.js';
import { parseYahoo, dropBadTicks } from '../server/yahoo.js';
import { createApp } from '../server/index.js';
import { recencyCheck, welch, pearson, afterLossCheck } from '../research/checks.js';

test('verdicts: eight research setups, each too early to judge; only the ones the rule allows are suggested', () => {
  const v = loadVerdicts(), t = v.setups.filter(s => s.research === 'tjr');
  assert.equal(t.length, 8);
  assert.ok(t.every(s => s.label === 'Too early to judge' && s.trades < 150 && s.barMin === 5));
  for (const s of t) {
    const r = s.result;
    assert.equal(s.trial, !(r.judge.avgR > 0 && r.judge.avgR > r.control.mean), s.id); // the rule fixed before the test
    assert.equal(windowSetups(v, s.window).some(x => x.id === s.id), !s.trial, s.id);
  }
  assert.equal(v.variantsTried, 31);
  assert.equal(v.checks.recency.carries, false);
  assert.equal(v.checks.bias.daily.helps, false);
  assert.equal(v.checks.afterLoss.supported, false);
});

test('ranges and ranking: a small sample has a wide range and cannot outrank a large one on a lucky run', () => {
  assert.deepEqual(winRange(12, 19), { lo: 41, hi: 81 });
  assert.deepEqual(winRange(3, 5), { lo: 23, hi: 88 });
  assert.equal(winRange(0, 0), null);
  assert.ok(rankR(0.5, 5) < rankR(0.11, 383)); // +0.50R on 5 trades ranks below +0.11R on 383
});

test('the Desk leads with a best estimate: the long test nudged by the last 4 weeks, with the recent range beside it', () => {
  const v = loadVerdicts(), a1 = v.setups.find(s => s.id === 'ny_sweep_shift');
  const s = buildState({ ...demoInput('long'), verdicts: v, recent: { ny_sweep_shift: { closed: 19, wins: 12, winPct: 63, avgR: 0.43, days: 28 } } });
  const card = [s.answer, ...s.answer.others].find(c => c.setup.id === 'ny_sweep_shift');
  assert.equal(card.carries, false);
  assert.deepEqual(card.estimate, { pct: Math.round((100 * (12 + 50 * (a1.winPct / 100))) / 69), blended: true });
  assert.deepEqual(card.recent.range, { lo: 41, hi: 81 });
  const none = buildState({ ...demoInput('long'), verdicts: v, recent: {} });
  const plain = [none.answer, ...none.answer.others].find(c => c.setup.id === 'ny_sweep_shift');
  assert.deepEqual(plain.estimate, { pct: Math.round(a1.winPct), blended: false }); // no recent trades: the long test as it is
});

test('bad ticks: a bar that jumps more than 2% and is back in the same bar is dropped; a real move stays', () => {
  const rows = [[300, 100, 101, 99, 100, 1], [600, 105, 105, 99.8, 100.2, 1], [900, 100.2, 100.5, 100, 100.4, 1], [1200, 100.4, 104, 100.3, 103.9, 1], [1500, 103.9, 104.2, 103.5, 104, 1]];
  assert.deepEqual(dropBadTicks(rows).map(r => r[0]), [300, 900, 1200, 1500]);
  const json = { chart: { result: [{ timestamp: rows.map(r => r[0]), indicators: { quote: [{ open: rows.map(r => r[1]), high: rows.map(r => r[2]), low: rows.map(r => r[3]), close: rows.map(r => r[4]), volume: rows.map(r => r[5]) }] } }] } };
  assert.equal(parseYahoo(json).length, 4);
});

test('settings: the small-cushion numbers and the fees can be changed, and bad values are refused', async () => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'));
  const { app } = createApp({ dataDir, clock: () => Date.parse('2026-07-15T15:00Z'), fetchImpl: async () => { throw new Error('offline'); } });
  const server = await new Promise(r => { const x = app.listen(0, () => r(x)); });
  const call = async (body) => { const r = await fetch(`http://localhost:${server.address().port}/api/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); return { status: r.status, json: await r.json() }; };
  try {
    const ok = await call({ personal: { smallCushion: true, smallUnder: 1200, smallRisk: 68 }, instrument: { commission: 1.9 } });
    assert.equal(ok.status, 200);
    assert.deepEqual([ok.json.settings.personal.smallUnder, ok.json.settings.personal.smallRisk, ok.json.settings.instrument.commission], [1200, 68, 1.9]);
    assert.equal((await call({ personal: { smallRisk: 0 } })).status, 400);
    assert.equal((await call({ instrument: { commission: -1 } })).status, 400);
    const saved = JSON.parse(fs.readFileSync(path.join(dataDir, 'settings.json'), 'utf8'));
    assert.equal(saved.personal.smallRisk, 68);
  } finally { server.close(); }
});

test('recency check: persistent results carry over, shuffled ones do not', () => {
  const key = (b, i) => new Date(Date.parse('2019-01-07T00:00Z') + (b * 28 + i) * 864e5).toISOString().slice(0, 10);
  // Two setups whose good and bad stretches last many blocks: last block does predict the next.
  const sticky = [0, 1].map(id => ({ id: 's' + id, trades: Array.from({ length: 60 }, (_, b) => Array.from({ length: 8 }, (_, i) => ({ key: key(b, i), r: (Math.floor(b / 10) + id) % 2 ? (i % 4 ? 1 : -1) : (i % 4 ? -1 : 1) }))).flat() }));
  const a = recencyCheck(sticky, 300);
  assert.ok(a.persistence.r > 0.5 && a.persistence.p < 0.05);
  // The same result every block: nothing to carry over.
  const flat = [0, 1, 2].map(id => ({ id: 'f' + id, trades: Array.from({ length: 40 }, (_, b) => Array.from({ length: 6 }, (_, i) => ({ key: key(b, i), r: i % 2 ? 1 : -1 }))).flat() }));
  assert.equal(recencyCheck(flat, 100).carries, false);
});

test('check helpers: Welch difference, correlation, and the after-a-loss split', () => {
  const w = welch([1, 1.2, 0.8, 1.1], [0, 0.1, -0.1, 0.05]);
  assert.ok(w.diff > 0.9 && w.t > 5);
  assert.ok(Math.abs(pearson([1, 2, 3, 4], [2, 4, 6, 8]) - 1) < 1e-9);
  const T = (h, r) => ({ signalT: Date.parse('2026-07-15T00:00Z') + h * 36e5, exitT: Date.parse('2026-07-15T00:00Z') + (h + 0.5) * 36e5, r });
  const al = afterLossCheck([{ id: 'x', trades: [T(14, -1), T(16, 0.5), T(40, 1), T(42, 2)] }]);
  assert.deepEqual([al.nA, al.nB], [1, 3]); // only the 16:00 trade follows a loss that trading day
});

test('the replay log (what the live desk shows) finds the same TJR trades as the test, trade for trade', async () => {
  const { loadFive, runFive, tjrStrategies } = await import('../research/tjr-test.js');
  const { replaySignals } = await import('../server/replay.js');
  const five = loadFive(), v = loadVerdicts();
  const log = replaySignals(five.ctx, v).filter(s => s.research && s.status !== 'open');
  let n = 0;
  for (const strat of tjrStrategies()) {
    const want = runFive(five, strat), got = log.filter(s => s.setupId === strat.id).sort((a, b) => a.signalT - b.signalT);
    assert.deepEqual(got.map(s => [s.key, s.dir, s.signalT, s.entry, s.stop, s.target, s.r]), want.map(t => [t.key, t.dir, t.entryT, t.entry, t.stop, t.target, t.r]), strat.id);
    n += want.length;
  }
  assert.ok(n >= 40, `checked ${n} trades`);
});
