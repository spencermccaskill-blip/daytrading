// The built-in price feed: The Desk fetches delayed MNQ bars itself when no chart tab is feeding it.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseYahoo, yahooUrl } from '../server/yahoo.js';
import { createApp } from '../server/index.js';

const Z = (s) => Date.parse(s + 'Z');
const NOW = Z('2026-07-15T14:20');
// A Yahoo chart reply: 5-minute bars, some empty slots, and a last entry that is a tick time, not a bar.
function reply(bars, extra = []) {
  const all = [...bars, ...extra];
  return { chart: { error: null, result: [{ meta: { symbol: 'MNQ=F' }, timestamp: all.map(b => b[0]), indicators: { quote: [{ open: all.map(b => b[1]), high: all.map(b => b[2]), low: all.map(b => b[3]), close: all.map(b => b[4]), volume: all.map(b => b[5]) }] } }] } };
}
const t = (iso) => Z(iso) / 1000;
const BARS = [[t('2026-07-15T14:00'), 25000, 25010, 24990, 25005, 100], [t('2026-07-15T14:05'), 25005, 25020, 25000, 25015, 120], [t('2026-07-15T14:10'), 25015, 25030, 25010, 25025, 90]];

test('parseYahoo keeps whole 5-minute bars and drops empty slots and the trailing tick', () => {
  const rows = parseYahoo(reply(BARS, [[t('2026-07-15T14:15'), null, null, null, null, null], [t('2026-07-15T14:17') + 44, 25026, 25026, 25026, 25026, 0]]));
  assert.deepEqual(rows, BARS);
  assert.deepEqual(parseYahoo({ chart: { error: { code: 'Not Found' }, result: null } }), []);
  assert.deepEqual(parseYahoo(null), []);
  assert.match(yahooUrl('60d'), /^https:\/\/query1\.finance\.yahoo\.com\/v8\/finance\/chart\/MNQ=F\?interval=5m&range=60d/);
});

async function boot(fetchImpl, now = { t: NOW }) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'));
  const made = createApp({ dataDir, clock: () => now.t, fetchImpl });
  const server = await new Promise(r => { const x = made.app.listen(0, () => r(x)); });
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json() }; };
  return { ...made, call, now, close: () => server.close() };
}
const ok = (body) => async () => ({ ok: true, status: 200, json: async () => body });

test('with no chart tab, the desk fetches prices itself and says where they come from', async () => {
  const urls = [];
  const s = await boot(async (u) => { urls.push(u); return ok(reply(BARS))(); });
  try {
    await s.pollPrices();
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.price, 25025);
    assert.equal(st.feed.source, 'yahoo');
    assert.equal(st.feed.status, 'delayed');
    assert.match(st.feed.label, /delayed/i);
    assert.match(urls[0], /range=60d/);            // first fetch loads all the history the service keeps
    await s.pollPrices();
    assert.match(urls[1], /range=1d/);             // after that, just today
  } finally { s.close(); }
});

test('an open chart tab wins: the desk does not fetch while the bridge is posting, and takes over after 3 quiet minutes', async () => {
  let calls = 0;
  const s = await boot(async () => { calls++; return ok(reply(BARS))(); });
  try {
    await s.call('POST', '/api/bars', { symbol: 'CME_MINI:MNQ1!', resolution: '5', bars: [[t('2026-07-15T14:15'), 25100, 25110, 25090, 25105, 50]] });
    await s.pollPrices();
    assert.equal(calls, 0);
    assert.equal((await s.call('GET', '/api/state')).json.feed.source, 'chart');
    s.now.t += 4 * 60000;
    await s.pollPrices();
    assert.equal(calls, 1);
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.feed.source, 'yahoo');
    assert.equal(st.price, 25025);                 // the chart's bars were cleared, not mixed in
  } finally { s.close(); }
});

test('a failed fetch never looks like fresh data, and the setting can turn fetching off', async () => {
  let fail = false, calls = 0;
  const s = await boot(async () => { calls++; if (fail) throw new Error('network down'); return ok(reply(BARS))(); });
  try {
    await s.pollPrices();
    fail = true; s.now.t += 60000;
    await s.pollPrices();
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.feed.status, 'stale');
    const off = await s.call('POST', '/api/settings', { feed: { auto: false } });
    assert.equal(off.json.settings.feed.auto, false);
    const before = calls; await s.pollPrices();
    assert.equal(calls, before);
  } finally { s.close(); }
});

test('a refusal from the price service (HTTP 429) is reported, not treated as data', async () => {
  const s = await boot(async () => ({ ok: false, status: 429, json: async () => ({}) }));
  try {
    await s.pollPrices();
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.price, null);
    assert.equal(st.feed.status, 'off');
    assert.match(st.feed.label, /429|price service/i);
  } finally { s.close(); }
});
