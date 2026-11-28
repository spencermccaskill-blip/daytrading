import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/index.js';

const Z = (s) => Date.parse(s + 'Z');
async function boot(now = Z('2026-07-15T14:20')) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'));
  const { app } = createApp({ dataDir, clock: () => now });
  const server = await new Promise(r => { const s = app.listen(0, () => r(s)); });
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json() }; };
  return { call, dataDir, close: () => server.close(), base };
}

test('journal entries feed the guard and are saved to disk; two losses lock the day', async () => {
  const s = await boot();
  try {
    assert.equal((await s.call('POST', '/api/journal', { pnl: 'abc' })).status, 400);
    await s.call('POST', '/api/journal', { pnl: -120, side: 'LONG', contracts: 1 });
    const second = await s.call('POST', '/api/journal', { pnl: -90 });
    assert.equal(second.json.guard.lossesToday, 2);
    const state = (await s.call('GET', '/api/state')).json;
    assert.equal(state.answer.kind, 'locked');
    assert.equal(state.guard.balance, 49790);
    assert.equal(JSON.parse(fs.readFileSync(path.join(s.dataDir, 'journal.json'), 'utf8')).trades.length, 2);
    const del = await s.call('DELETE', '/api/journal/' + second.json.trade.id);
    assert.equal(del.json.guard.lockout, null);
    assert.equal((await s.call('DELETE', '/api/journal/nope')).status, 404);
  } finally { s.close(); }
});

test('settings: plan presets, validation, and saving', async () => {
  const s = await boot();
  try {
    const pro = (await s.call('POST', '/api/settings', { account: { plan: 'pro' } })).json.settings;
    assert.deepEqual([pro.account.dll.on, pro.account.consistencyPct, pro.account.scaling], [true, 40, null]);
    assert.equal((await s.call('POST', '/api/settings', { personal: { riskPerTrade: -5 } })).status, 400);
    assert.equal((await s.call('POST', '/api/settings', { account: { plan: 'gold' } })).status, 400);
    const r = (await s.call('POST', '/api/settings', { personal: { riskPerTrade: 200 } })).json.settings;
    assert.equal(r.personal.riskPerTrade, 200);
    assert.equal(JSON.parse(fs.readFileSync(path.join(s.dataDir, 'settings.json'), 'utf8')).personal.riskPerTrade, 200);
  } finally { s.close(); }
});

test('manual rules check: PASS with size, BLOCK when the stop is too wide', async () => {
  const s = await boot();
  try {
    const ok = (await s.call('POST', '/api/check', { entry: 25000, stop: 24960 })).json;
    assert.deepEqual([ok.verdict, ok.side, ok.contracts, ok.target2R], ['PASS', 'LONG', 3, 25080]);
    assert.equal((await s.call('POST', '/api/check', { entry: 25000, stop: 25140 })).json.verdict, 'BLOCK');
    assert.equal((await s.call('POST', '/api/check', { entry: 25000 })).status, 400);
  } finally { s.close(); }
});

test('bars from the bridge: wrong symbol or timeframe is reported, good bars reach the state', async () => {
  const s = await boot();
  try {
    assert.match((await s.call('POST', '/api/bars', { symbol: 'CME_MINI:ES1!', resolution: '5', bars: [] })).json.error, /MNQ1!/);
    assert.match((await s.call('POST', '/api/bars', { symbol: 'CME_MINI:MNQ1!', resolution: '60', bars: [] })).json.error, /5 minutes/);
    const t = Z('2026-07-15T14:15') / 1000;
    const ok = await s.call('POST', '/api/bars', { symbol: 'CME_MINI_DL:MNQ1!', resolution: '5', bars: [[t, 25000, 25010, 24990, 25005, 100]] });
    assert.equal(ok.json.ok, true);
    const state = (await s.call('GET', '/api/state')).json;
    assert.equal(state.price, 25005);
    assert.equal(state.feed.status, 'delayed');
    assert.equal(state.answer.kind, 'nofeed'); // one unfinished bar is not enough to evaluate anything
    assert.equal((await s.call('GET', '/api/state?demo=long')).json.answer.state, 'LONG');
    assert.equal((await s.call('GET', '/api/state?demo=nope')).status, 404);
    const pb = (await s.call('GET', '/api/playbook')).json;
    assert.equal(pb.setups.length, 24); // 14 fifteen-minute setups, 8 from the course research, 2 carried over
    assert.equal((await fetch(s.base + '/')).status, 200);
  } finally { s.close(); }
});
