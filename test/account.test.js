// Setting the account from the Lucid dashboard, the thin-cushion rule, and exact entries on one-click trades.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { computeGuard, checkTrade, defaultSettings } from '../server/guard.js';
import { demoInput } from '../server/demo.js';
import { createApp } from '../server/index.js';

const Z = (s) => Date.parse(s + 'Z');
const NOW = Z('2026-07-15T15:00');
const tr = (iso, pnl) => ({ id: iso, kind: 'trade', ts: Z(iso), pnl });
// Spencer's real numbers: balance $50,046, minimum balance $49,363.
const anchored = () => { const s = defaultSettings(); s.account.anchor = { balance: 50046, floor: 49363, at: Z('2026-07-14T00:00') }; return s; };

test('account set from the Lucid dashboard: balance and minimum balance are taken as given', () => {
  const g = computeGuard(anchored(), { trades: [] }, NOW);
  assert.deepEqual([g.balance, g.floor, g.room], [50046, 49363, 683]);
  assert.equal(g.breached, false);
  assert.equal(g.maxContracts, 1);                                // small cushion: one micro until the room is back above $1,500
  assert.deepEqual([g.small, g.riskPerTrade, g.lossesLeft], [true, 100, 6]); // six full $100 losses fit in $683; the seventh reaches the limit
});

test('anchor: only trades after it count, and the limit keeps trailing from there', () => {
  const s = anchored();
  const g = computeGuard(s, { trades: [tr('2026-07-10T15:00', -900), tr('2026-07-14T15:00', 400), tr('2026-07-15T14:00', -100)] }, NOW);
  assert.equal(g.balance, 50346);                                  // 50,046 + 400 - 100; the older -900 is before the anchor
  assert.equal(g.floor, 49363);                                    // yesterday closed at 50,446, under the old high of 51,363
  const big = computeGuard(s, { trades: [tr('2026-07-14T15:00', 1500)] }, NOW);
  assert.equal(big.floor, 49546);                                  // closed at 51,546: the limit trails up to 51,546 - 2,000
  const locked = defaultSettings(); locked.account.anchor = { balance: 52500, floor: 50100, at: 0 };
  assert.deepEqual([computeGuard(locked, { trades: [] }, NOW).floor, computeGuard(locked, { trades: [] }, NOW).floorLocked], [50100, true]);
});

test('small cushion: under $1,500 of room it is one micro at $100 risk, and one loss and done under $1,000', () => {
  const s = anchored(), g = computeGuard(s, { trades: [] }, NOW);
  assert.deepEqual([g.thin, g.maxLosses, g.dailyStop], [true, 1, 100]);
  assert.equal(g.lockout, null);
  const wide = checkTrade(g, s, { stopPoints: 100 });
  assert.equal(wide.verdict, 'BLOCK');                                // $200 on one micro is over the $100 cap: marked too wide, never shrunk
  assert.match(wide.reason, /over your \$100/);
  const ok = checkTrade(g, s, { stopPoints: 40 });
  assert.deepEqual([ok.verdict, ok.contracts, ok.riskDollars], ['PASS', 1, 80]); // one micro, not three
  const after = computeGuard(s, { trades: [tr('2026-07-15T14:00', -80)] }, NOW);
  assert.match(after.lockout.reason, /one loss/i);
  assert.match(computeGuard(s, { trades: [tr('2026-07-15T14:00', -200)] }, NOW).lockout.reason, /daily stop of \$100/); // a loss bigger than the cap
  assert.equal(after.lockout.until, Z('2026-07-15T22:00'));
  const win = computeGuard(s, { trades: [tr('2026-07-15T14:00', 300)] }, NOW);
  assert.equal(win.lockout, null);                                  // a win does not end the day
  assert.equal(win.thin, true);                                     // judged on the room at the start of the day
});

test('small cushion can be turned off or changed, and does not apply with a normal cushion', () => {
  const off = anchored(); off.personal.smallCushion = false;
  const g = computeGuard(off, { trades: [] }, NOW);
  assert.deepEqual([g.small, g.riskPerTrade, g.maxContracts, g.lossesLeft, g.dailyStop], [false, 250, 20, 2, 250]);
  assert.deepEqual([checkTrade(g, off, { stopPoints: 40 }).contracts, checkTrade(g, off, { stopPoints: 100 }).verdict], [3, 'PASS']);
  const own = anchored(); own.personal.smallRisk = 68; own.personal.smallUnder = 2000;
  assert.equal(computeGuard(own, { trades: [] }, NOW).riskPerTrade, 68);
  const rebuilt = anchored(); rebuilt.account.anchor = { balance: 50900, floor: 49363, at: 0 };
  assert.deepEqual([computeGuard(rebuilt, { trades: [] }, NOW).small, computeGuard(rebuilt, { trades: [] }, NOW).riskPerTrade], [false, 250]); // $1,537 of room
  const fresh0 = computeGuard(defaultSettings(), { trades: [] }, NOW);
  assert.deepEqual([fresh0.small, fresh0.riskPerTrade, fresh0.maxContracts, fresh0.lossesLeft], [false, 250, 20, 7]);
});

test('thin cushion can be turned off, and does not apply with a normal cushion', () => {
  const s = anchored(); s.personal.thinCushion = false;
  assert.deepEqual([computeGuard(s, { trades: [] }, NOW).thin, computeGuard(s, { trades: [] }, NOW).maxLosses], [false, 2]);
  const fresh = computeGuard(defaultSettings(), { trades: [] }, NOW);
  assert.deepEqual([fresh.thin, fresh.maxLosses, fresh.dailyStop], [false, 2, 500]);
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
const N1 = 'ny_sweep_shift:2026-07-15';

test('settings: the account can be set from the dashboard numbers, with a sanity check', async () => {
  const s = await boot('long');
  try {
    const ok = await s.call('POST', '/api/settings', { account: { anchor: { balance: '50046', floor: '49363' } } });
    assert.deepEqual([ok.json.settings.account.anchor.balance, ok.json.settings.account.anchor.floor, ok.json.settings.account.anchor.at], [50046, 49363, s.now]);
    const g = (await s.call('GET', '/api/state')).json.guard;
    assert.deepEqual([g.balance, g.floor, g.room, g.thin], [50046, 49363, 683, true]);
    assert.equal((await s.call('POST', '/api/settings', { account: { anchor: { balance: 49000, floor: 49363 } } })).status, 400);
    assert.equal((await s.call('POST', '/api/settings', { account: { anchor: { balance: 'x', floor: 1 } } })).status, 400);
    const cleared = await s.call('POST', '/api/settings', { account: { anchor: null } });
    assert.equal(cleared.json.settings.account.anchor, null);
  } finally { s.close(); }
});

test('one click with an exact entry: the result is worked out from the price actually paid', async () => {
  const a = await boot('long'); const dir = a.dataDir;
  try {
    const sig = (await a.call('GET', '/api/log')).json.signals.find(x => x.id === N1);
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1, entry: 'abc' })).status, 400);
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1, entry: sig.entry * 2 })).status, 400);   // nowhere near the market
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1, entry: sig.entry, contracts: 0 })).status, 400);
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1, entry: sig.entry, contracts: 999 })).status, 400);
    const took = await a.call('POST', '/api/journal/take', { id: N1, entry: sig.entry + 6.5, contracts: 1 });
    assert.deepEqual([took.json.trade.entry, took.json.trade.contracts, took.json.trade.open], [sig.entry + 6.5, 1, true]);
  } finally { a.close(); }
  const b = await boot('won', dir);
  try {
    const row = (await b.call('GET', '/api/journal')).json.trades.find(t => t.signalId === N1), sig = (await b.call('GET', '/api/log')).json.signals.find(x => x.id === N1);
    assert.equal(row.pnl, 1 * (2 * (sig.target - (sig.entry + 6.5)) - 1.5)); // 6.5 points worse than the rule entry: $13 less; then $1.50 of fees
  } finally { b.close(); }
});
