// The replay log (every suggested trade, including ones made while the desk was off) and one-click journal entries.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { replaySignals, tally } from '../server/replay.js';
import { loadVerdicts } from '../server/verdicts.js';
import { demoInput } from '../server/demo.js';
import { computeGuard, defaultSettings } from '../server/guard.js';
import { createApp } from '../server/index.js';

const N1 = 'ny_sweep_shift:2026-07-15';
const only = (ids) => { const v = loadVerdicts(); v.setups = v.setups.filter(s => ids.includes(s.id)); return v; };

test('replay finds the suggested trade in past bars, with its result once the exit has happened', () => {
  const won = replaySignals(demoInput('won').store.ctx(), only(['ny_sweep_shift']));
  assert.equal(won.length, 1);
  const s = won[0];
  assert.deepEqual([s.id, s.setupId, s.side, s.status, s.key], [N1, 'ny_sweep_shift', 'LONG', 'target', '2026-07-15']);
  assert.equal(s.target, s.entry + 2 * (s.entry - s.stop));
  assert.ok(Math.abs(s.r - (2 - 1 / s.stopPoints)) < 1e-9);
  assert.equal(s.score, 5.1);
  const open = replaySignals(demoInput('long').store.ctx(), only(['ny_sweep_shift']))[0];
  assert.deepEqual([open.status, open.r, open.exitPx], ['open', null, null]);
  assert.deepEqual([open.entry, open.stop, open.target], [s.entry, s.stop, s.target]); // same signal, seen earlier
});

test('replay covers every setup and every day in the bars, newest first', () => {
  const all = replaySignals(demoInput('won').store.ctx(), loadVerdicts());
  assert.ok(all.length >= 2);
  assert.ok(all.every((s, i) => i === 0 || all[i - 1].signalT >= s.signalT));
  assert.equal(new Set(all.map(s => s.id)).size, all.length);
});

test('tally: how the suggestions have done since tracking began, per setup', () => {
  const t = tally([{ setupId: 'a', name: 'A', status: 'target', r: 1.9 }, { setupId: 'a', name: 'A', status: 'stopped', r: -1.1 }, { setupId: 'a', name: 'A', status: 'open', r: null }, { setupId: 'b', name: 'B', status: 'time', r: 0.2 }]);
  assert.deepEqual(t.find(x => x.setupId === 'a'), { setupId: 'a', name: 'A', closed: 2, wins: 1, winPct: 50, avgR: 0.4, totalR: 0.8 });
  assert.equal(t.find(x => x.setupId === 'b').closed, 1);
});

test('guard: a trade that is still open counts as a trade today but does not move the balance', () => {
  const now = Date.parse('2026-07-15T15:00Z');
  const g = computeGuard(defaultSettings(), { trades: [{ id: 'x', kind: 'trade', ts: now - 60000, pnl: null, open: true }] }, now);
  assert.deepEqual([g.tradesToday, g.openTrades, g.balance, g.lossesToday], [1, 1, 50000, 0]);
});

async function boot(scenario, dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'))) {
  const inp = demoInput(scenario);
  fs.writeFileSync(path.join(dataDir, 'bars.json'), JSON.stringify(inp.store.toJSON()));
  const { app } = createApp({ dataDir, clock: () => inp.now, fetchImpl: async () => { throw new Error('offline in tests'); } });
  const server = await new Promise(r => { const x = app.listen(0, () => r(x)); });
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json() }; };
  return { call, dataDir, now: inp.now, close: () => server.close() };
}

test('one click: taking a live suggestion adds it to the journal, and the desk fills in the result at the rule exit', async () => {
  const a = await boot('long');
  let dir;
  try {
    dir = a.dataDir;
    const log = (await a.call('GET', '/api/log')).json;
    const sig = log.signals.find(s => s.id === N1);
    assert.deepEqual([sig.status, sig.taken, sig.contracts], ['open', false, 1]);
    const took = await a.call('POST', '/api/journal/take', { id: N1 });
    assert.equal(took.status, 200);
    assert.deepEqual([took.json.trade.open, took.json.trade.pnl, took.json.trade.side, took.json.trade.contracts, took.json.trade.setup, took.json.trade.signalId], [true, null, 'LONG', 1, 'NY sweep + shift', N1]);
    assert.equal(took.json.guard.tradesToday, 1);
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1 })).status, 409);          // not twice
    assert.equal((await a.call('POST', '/api/journal/take', { id: 'nope:2026-01-01' })).status, 404);
    assert.equal((await a.call('GET', '/api/log')).json.signals.find(s => s.id === N1).taken, true);
  } finally { a.close(); }
  // Later the same day: price has reached the target. The desk settles the open journal entry by itself.
  const b = await boot('won', dir);
  try {
    const j = (await b.call('GET', '/api/journal')).json;
    const row = j.trades.find(t => t.signalId === N1), sig = (await b.call('GET', '/api/log')).json.signals.find(s => s.id === N1);
    assert.equal(row.open, false);
    assert.equal(row.auto, true);
    assert.equal(row.pnl, 1 * 2 * (sig.target - sig.entry));                                      // 1 MNQ x $2 x points to the target
    assert.equal(row.ts, sig.exitT);
    assert.equal(j.guard.balance, 50000 + row.pnl);
    // His real fill was different: one edit fixes it and it stops being an estimate.
    const fixed = await b.call('PATCH', '/api/journal/' + row.id, { pnl: 350 });
    assert.deepEqual([fixed.json.trade.pnl, fixed.json.trade.auto], [350, false]);
    assert.equal((await b.call('PATCH', '/api/journal/' + row.id, { pnl: 'lots' })).status, 400);
    // A suggestion that already finished can be added after the fact, with its rule result.
    const other = (await b.call('GET', '/api/log')).json.signals.find(s => s.id !== N1 && s.status !== 'open' && s.contracts >= 1);
    if (other) { const late = await b.call('POST', '/api/journal/take', { id: other.id }); assert.deepEqual([late.json.trade.open, late.json.trade.auto, late.json.trade.ts], [false, true, other.exitT]); }
  } finally { b.close(); }
});

test('finished suggestions are saved, so the log outlives the bars they came from', async () => {
  const a = await boot('won'); let dir = a.dataDir;
  try { await a.call('GET', '/api/log'); } finally { a.close(); }
  const saved = JSON.parse(fs.readFileSync(path.join(dir, 'signals.json'), 'utf8'));
  assert.ok(saved.signals[N1] && saved.signals[N1].status === 'target');
  fs.writeFileSync(path.join(dir, 'bars.json'), JSON.stringify({ resMin: 5, raw: [] }));          // the bars are gone
  const { app } = createApp({ dataDir: dir, clock: () => a.now, fetchImpl: async () => { throw new Error('offline'); } });
  const server = await new Promise(r => { const x = app.listen(0, () => r(x)); });
  try {
    const log = await (await fetch(`http://localhost:${server.address().port}/api/log`)).json();
    assert.ok(log.signals.some(s => s.id === N1 && s.status === 'target'));
    assert.ok(log.tally.length >= 1);
  } finally { server.close(); }
});

test('a suggestion too wide for one contract cannot be added with one click', async () => {
  const a = await boot('long');
  try {
    await a.call('POST', '/api/settings', { personal: { riskPerTrade: 100 } });                   // the stop needs $195 on 1 MNQ
    assert.equal((await a.call('GET', '/api/log')).json.signals.find(s => s.id === N1).contracts, 0);
    const r = await a.call('POST', '/api/journal/take', { id: N1 });
    assert.equal(r.status, 400);
    assert.match(r.json.error, /too wide/i);
  } finally { a.close(); }
});
