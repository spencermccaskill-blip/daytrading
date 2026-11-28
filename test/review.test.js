// Cases added after the independent code review (2026-11-19).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { computeGuard, checkTrade, defaultSettings } from '../server/guard.js';
import { buildState } from '../server/desk.js';
import { demoInput } from '../server/demo.js';
import { BarStore } from '../server/bars.js';
import { createApp } from '../server/index.js';
import { STRATEGIES, byId } from '../server/strategies/index.js';
import { loadHistory, tradingDates } from '../research/history.js';
import { runStrategy } from '../research/backtest.js';
import { flat, closedCtx, Z } from './helpers.js';

const NOW = Z('2026-07-15T15:00');
const tr = (iso, pnl, kind = 'trade') => ({ id: iso, kind, ts: Z(iso), pnl });
const loose = () => { const s = defaultSettings(); s.personal.dailyStop = 99999; s.personal.maxLossesPerDay = 99; s.personal.smallCushion = false; return s; };

test('a breach stays a breach even if a later entry lifts the balance', () => {
  const g = computeGuard(loose(), { trades: [tr('2026-07-15T14:00', -2000), tr('2026-07-15T14:30', 300)] }, NOW);
  assert.equal(g.breached, true);
  assert.match(g.lockout.reason, /max loss limit/i);
});

test('the daily stop stays hit after a later win the same day', () => {
  const g = computeGuard(defaultSettings(), { trades: [tr('2026-07-15T14:00', -500), tr('2026-07-15T14:30', 200)] }, NOW);
  assert.match(g.lockout.reason, /daily stop/i);
  const s = loose(); s.account.dll = { on: true, amount: 1200 };
  assert.match(computeGuard(s, { trades: [tr('2026-07-15T14:00', -1200), tr('2026-07-15T14:30', 500)] }, NOW).lockout.reason, /daily loss limit/i);
});

test('guard boundaries: risk equal to the room blocks, risk equal to the daily-stop room passes', () => {
  const s = loose();
  const g = computeGuard(s, { trades: [tr('2026-07-13T15:00', -1760)] }, NOW); // room $240
  assert.equal(checkTrade(g, s, { stopPoints: 40 }).verdict, 'BLOCK');       // 3 x 40 x $2 = $240 = room
  const d = defaultSettings(), g2 = computeGuard(d, { trades: [tr('2026-07-15T14:00', -260)] }, NOW); // $240 left to the stop
  assert.equal(checkTrade(g2, d, { stopPoints: 40 }).verdict, 'PASS');
  const broken = { ...g2, maxContracts: undefined };
  assert.equal(checkTrade(broken, d, { stopPoints: 40 }).verdict, 'BLOCK'); // never PASS with an unknown size
});

test('bar store refuses future-dated, malformed and non-positive rows', () => {
  const s = new BarStore(), now = Z('2026-07-15T14:00');
  const n = s.ingest([null, 'x', [Z('2100-01-01T00:00') / 1000, 1, 2, 0.5, 1, 1], [now / 1000 - 300, 25000, 25010, 24990, 25005, '120'], [now / 1000 - 600, 0, 5, -1, 2, 1]], 5, now);
  assert.equal(n, 1);
  assert.equal(s.lastRawT, now - 300000);
  assert.equal(s.last().v, 120);
});

test('a chart that keeps posting the same frozen bar is stalled, not a signal', () => {
  const inp = demoInput('long');
  const s = buildState({ ...inp, feed: { symbol: 'CME_MINI:MNQ1!', lastPost: inp.now - 1000, lastChange: inp.now - 4 * 60000 } });
  assert.equal(s.feed.status, 'stale');
  assert.equal(s.answer.kind, 'nofeed');
  assert.equal(buildState({ ...inp, feed: { symbol: 'CME_MINI:MNQ1!', lastPost: inp.now - 1000, lastChange: inp.now - 20000 } }).answer.state, 'LONG');
});

test('once the entry has passed, the page says so instead of still reading as a fresh LONG', () => {
  const a = buildState(demoInput('late')).answer;
  assert.equal(a.kind, 'signal');
  assert.equal(a.state, 'LONG running');
  assert.match(a.headline, /entry passed/i);
  assert.match(a.sub, /do not chase/i);
  assert.ok(Number.isFinite(a.rNow));
  assert.equal(buildState(demoInput('long')).answer.fresh, true);
});

test('a data problem locks the guard instead of pretending the account is fresh', () => {
  const s = buildState({ ...demoInput('long'), problem: 'journal.json could not be read.' });
  assert.equal(s.guard.status, 'locked');
  assert.equal(s.answer.kind, 'locked');
  assert.match(s.answer.sub, /journal\.json/);
});

async function boot(prep) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'));
  prep?.(dataDir);
  const now = Z('2026-07-15T14:20');
  const { app } = createApp({ dataDir, clock: () => now });
  const server = await new Promise(r => { const x = app.listen(0, () => r(x)); });
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json() }; };
  return { call, dataDir, now, close: () => server.close() };
}

test('a corrupt journal file is kept, reported, and locks the desk', async () => {
  const s = await boot(dir => fs.writeFileSync(path.join(dir, 'journal.json'), '{"trades":[{"pnl":-200'));
  try {
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.answer.kind, 'locked');
    assert.match(st.answer.sub, /journal\.json/);
    assert.equal((await s.call('POST', '/api/journal', { pnl: 50 })).status, 409);
    assert.equal(fs.readFileSync(path.join(s.dataDir, 'journal.json'), 'utf8'), '{"trades":[{"pnl":-200'); // untouched
  } finally { s.close(); }
});

test('journal: a trade can be dated when it happened; bad times and bad plans are refused', async () => {
  const s = await boot();
  try {
    const when = Z('2026-07-14T15:00'); // yesterday's session
    const r = await s.call('POST', '/api/journal', { pnl: -100, ts: when });
    assert.equal(r.json.trade.ts, when);
    assert.equal(r.json.guard.lossesToday, 0);
    for (const ts of [-1, [1], 'soon', s.now + 3600000]) assert.equal((await s.call('POST', '/api/journal', { pnl: 1, ts })).status, 400);
    const adj = await s.call('POST', '/api/journal', { pnl: -80, kind: 'adjustment' });
    assert.deepEqual([adj.json.guard.tradesToday, adj.json.guard.lossesToday], [0, 0]);
    assert.equal((await s.call('POST', '/api/settings', { account: { plan: 'constructor' } })).status, 400);
    const bad = await s.call('POST', '/api/bars', { symbol: 'CME_MINI:MNQ1!', resolution: '5', bars: [null, [4102444800, 1, 2, 1, 1, 1]] });
    assert.equal(bad.status, 200);
    assert.equal((await s.call('GET', '/api/state')).json.price, null);
  } finally { s.close(); }
});

test('switching the chart to another contract clears the old bars', async () => {
  const s = await boot();
  try {
    const t = s.now / 1000 - 300;
    await s.call('POST', '/api/bars', { symbol: 'CME_MINI:MNQ1!', resolution: '5', bars: [[t - 300, 25000, 25010, 24990, 25005, 100]] });
    await s.call('POST', '/api/bars', { symbol: 'CME_MINI:MNQZ2026', resolution: '5', bars: [[t, 25200, 25210, 25190, 25205, 100]] });
    const st = (await s.call('GET', '/api/state')).json;
    assert.equal(st.price, 25205);
    assert.equal(st.chart.bars.length + (st.chart.forming ? 1 : 0), 1);
  } finally { s.close(); }
});

// ── Strategy edges the flat fixtures did not reach ──
const D = '2026-07-01', FROM = '2026-06-10';
const run = (id, bars, key, upTo) => byId(id).evaluate(closedCtx(bars, upTo), key);

test('N1: a shift on the 11:00 ET bar is too late (last signal bar opens 10:45)', () => {
  const sweep = { [D + 'T13:30']: [100, 103, 99.5, 102] };
  assert.equal(run('ny_sweep_shift', flat(FROM, D, { ...sweep, [D + 'T14:45']: [100, 100.5, 95, 96] }), D).trade.side, 'SHORT');
  assert.equal(run('ny_sweep_shift', flat(FROM, D, { ...sweep, [D + 'T15:00']: [100, 100.5, 95, 96] }), D).trade, undefined);
});

test('M1: the band uses the 14-day average move, and only :00/:30 closes count', () => {
  // Every earlier day closes its 11:45 ET bar 2% above the open, so today the band top is 100 x 1.02 = 102.
  const prior = {}; for (const b of flat(FROM, '2026-06-30')) if (new Date(b.t).toISOString().slice(11, 16) === '15:45') prior[new Date(b.t).toISOString().slice(0, 16)] = [100, 102.5, 99.5, 102];
  assert.equal(run('nymid_noise', flat(FROM, D, { ...prior, [D + 'T15:45']: [100, 102, 99.5, 101.9] }), D).trade, undefined);
  const t = run('nymid_noise', flat(FROM, D, { ...prior, [D + 'T15:45']: [100, 103, 99.5, 102.6] }), D).trade;
  assert.deepEqual([t.side, t.entry], ['LONG', 102.6]);
  // A breakout that closes at 12:15 ET (the 12:00 bar) is not a check time.
  assert.equal(run('nymid_noise', flat(FROM, D, { [D + 'T16:00']: [100, 104, 99.5, 103.5], [D + 'T16:15']: [100, 101, 99, 100], [D + 'T16:45']: [100, 101, 99, 100], [D + 'T17:15']: [100, 101, 99, 100] }), D, Z(D + 'T16:15')).trade, undefined);
});

test('short side: opening range breakout, last half hour, evening range', () => {
  const orb = run('ny_orb15', flat(FROM, D, { [D + 'T13:30']: [100, 103, 96, 97] }), D).trade;
  assert.deepEqual([orb.side, orb.entry, orb.stop, orb.target], ['SHORT', 97, 103, 37]);
  const last = run('nymid_last30', flat(FROM, D, { [D + 'T19:15']: [100, 100.5, 97.5, 98] }), D).trade;
  assert.deepEqual([last.side, last.entry, last.stop], ['SHORT', 98, 102]);
  const eve = run('asia_orb', flat(FROM, '2026-07-02', { [D + 'T22:30']: [100, 100.5, 96.5, 97] }), D).trade;
  assert.deepEqual([eve.side, eve.entry, eve.stop, eve.target], ['SHORT', 97, 102, 87]);
  // The evening cut-off: a breakout bar opening at 22:00 ET (02:00Z) is too late.
  assert.equal(run('asia_orb', flat(FROM, '2026-07-02', { ['2026-07-02T02:00']: [100, 100.5, 96.5, 97] }), D).trade, undefined);
});

test('5-minute chart: same signals as the backtest when the bars arrive as three 5-minute pieces', () => {
  const hist = loadHistory(), contract = hist.contracts.at(-1), all = contract.ctx.s.bars;
  const dates = [...tradingDates(hist)].filter(d => d.contract.code === contract.code).slice(-42, -2);
  const split = (b) => { const s = b.t / 1000, v = b.v / 3; return [[s, b.o, b.h, b.o, b.h, v], [s + 300, b.h, b.h, b.l, b.l, v], [s + 600, b.l, Math.max(b.l, b.c), b.l, b.c, v]]; };
  let signals = 0;
  for (const strat of STRATEGIES.filter(s => !s.research && s.id !== 'nymid_vwap' && s.id !== 'nymid_noise')) { // VWAP differs when volume is split evenly; the research setups have their own 5-minute test
    const want = new Map(runStrategy(hist, strat).map(t => [t.key, t]));
    const store = new BarStore(); let fed = 0;
    for (const { key } of dates) {
      const upTo = Date.parse(key + 'T00:00Z') + 2 * 864e5, chunk = [];
      while (fed < all.length && all[fed].t < upTo) chunk.push(...split(all[fed++]));
      store.ingest(chunk, 5);
      const live = strat.evaluate(store.ctx(), key).trade, bt = want.get(key);
      assert.deepEqual(live && [live.dir, live.signalT, live.entry, live.stop, live.target], bt ? [bt.dir, bt.signalT, bt.entry, bt.stop, bt.target] : live && live.status === 'open' ? [live.dir, live.signalT, live.entry, live.stop, live.target] : undefined, `${strat.id} ${key}`);
      if (bt) signals++;
    }
  }
  assert.ok(signals > 60, `checked ${signals} signals`);
});
