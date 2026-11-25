// Holidays, news tiles, focus and hidden setups, expandable setup cards, and adding armed trades with one click.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { sessionAt } from '../server/sessions.js';
import { holidayNotice, clipToOpenHours } from '../server/holidays.js';
import { parseRss, severityOf, newsState, parseCalendar } from '../server/news.js';
import { buildState } from '../server/desk.js';
import { loadVerdicts, windowSetups } from '../server/verdicts.js';
import { demoInput } from '../server/demo.js';
import { defaultSettings } from '../server/guard.js';
import { createApp } from '../server/index.js';
import { flat, closedCtx } from './helpers.js';

const Z = (s) => Date.parse(s + 'Z');
const N1 = 'ny_sweep_shift:2026-07-15';

// ── Holidays (late November: Denver is UTC-7, Chicago UTC-6) ──
test('Thanksgiving 2026: the midday window stops at the 11:00 AM Denver halt and the evening session still opens', () => {
  const mid = sessionAt(Z('2026-11-26T17:30')); // 10:30 AM Denver
  assert.equal(mid.current.id, 'nymid');
  assert.equal(mid.current.end, Z('2026-11-26T18:00'));
  assert.equal(mid.current.shortened, 'Thanksgiving');
  const after = sessionAt(Z('2026-11-26T18:30'));
  assert.equal(after.current, null);
  assert.deepEqual([after.next.id, after.next.start], ['asia', Z('2026-11-26T23:00')]);
  assert.equal(sessionAt(Z('2026-11-26T15:00')).current.id, 'nyopen'); // the open window is untouched
});

test('Black Friday is a short day, Christmas Day has no windows at all, and Christmas Eve has no evening session', () => {
  assert.equal(sessionAt(Z('2026-11-27T17:30')).current.end, Z('2026-11-27T18:15'));
  assert.equal(sessionAt(Z('2026-11-27T19:00')).current, null);
  assert.equal(sessionAt(Z('2026-12-25T15:00')).current, null);
  assert.equal(sessionAt(Z('2026-12-25T09:00')).current, null);
  assert.equal(sessionAt(Z('2026-12-25T00:30')).current, null);            // Thursday 5:30 PM Denver: would be Asia evening
  assert.equal(sessionAt(Z('2026-12-23T00:30')).current.id, 'asia');       // an ordinary evening that week is fine
  assert.deepEqual(clipToOpenHours([{ id: 'x', start: Z('2026-07-15T10:00'), end: Z('2026-07-15T12:00') }]).length, 1);
});

test('holiday notice: named a day ahead, with Denver times, and a caution while the short session is open', () => {
  const wed = holidayNotice(Z('2026-11-25T17:00'));
  assert.deepEqual([wed.name, wed.today, wed.caution], ['Thanksgiving', false, null]);
  assert.match(wed.text, /Thursday is Thanksgiving\. US stock market closed\. MNQ stops at 11:00 AM Denver and reopens at 4:00 PM/);
  assert.match(wed.text, /Lucid needs every position closed/);
  const thu = holidayNotice(Z('2026-11-26T15:00'));
  assert.equal(thu.today, true);
  assert.match(thu.caution, /Thanksgiving: MNQ stops at 11:00 AM Denver/);
  assert.equal(holidayNotice(Z('2026-11-26T19:00')).caution, null);        // already halted
  const fri = holidayNotice(Z('2026-11-27T15:00'));
  assert.match(fri.text, /usual pattern; check CME/);                       // not a published schedule
  assert.equal(holidayNotice(Z('2026-07-15T15:00')), null);
});

// ── News tiles ──
const RSS = `<rss xmlns:media="http://search.yahoo.com/mrss/"><channel>
<item><title>Fed signals a rate cut</title><link>https://example.com/fed</link><pubDate>Wed, 15 Jul 2026 13:40:00 GMT</pubDate><media:content url="https://images.example.com/fed.jpg?a=1&amp;b=2" medium="image" type="image/jpeg"/></item>
<item><title>Nvidia unveils a new chip</title><link>https://example.com/nv</link><pubDate>Wed, 15 Jul 2026 13:00:00 GMT</pubDate><enclosure url="https://images.example.com/nv.png" type="image/png"/></item>
<item><title>Local bakery wins award</title><link>https://example.com/b</link><pubDate>Wed, 15 Jul 2026 12:00:00 GMT</pubDate><media:content url="javascript:alert(1)" medium="image"/></item>
</channel></rss>`;

test('headlines carry the article image when the feed has one, and only real web images', () => {
  const h = parseRss(RSS, 'Test');
  assert.equal(h[0].image, 'https://images.example.com/fed.jpg?a=1&b=2');
  assert.equal(h[1].image, 'https://images.example.com/nv.png');
  assert.equal(h[2].image, null);
});

test('severity: by topic, raised when price actually moved', () => {
  assert.equal(severityOf('War and geopolitics', null), 'High');
  assert.equal(severityOf('Fed and rates', { m15: 3, m60: 5 }), 'High');
  assert.equal(severityOf('Inflation and jobs data', null), 'Medium');
  assert.equal(severityOf('Big tech', null), 'Low');
  assert.equal(severityOf(null, null), 'Low');
  assert.equal(severityOf(null, { m15: -55, m60: null }), 'High');           // an untagged headline followed by a 55 point drop
  assert.equal(severityOf('Big tech', { m15: 12, m60: 45 }), 'Medium');
});

test('newsState: newest first, each with image, severity and whether price moved; the holiday rides along', () => {
  const D = '2026-07-15';
  const ctx = closedCtx(flat('2026-07-14', D, { [D + 'T13:45']: [100, 101, 40, 42] }));
  const n = newsState({ now: Z(D + 'T15:00'), ctx, calendar: [], headlines: parseRss(RSS, 'Test'), errors: {} });
  assert.deepEqual(n.headlines.map(h => h.title), ['Fed signals a rate cut', 'Nvidia unveils a new chip', 'Local bakery wins award']);
  assert.deepEqual([n.headlines[0].severity, n.headlines[0].moved, n.headlines[0].src], ['High', true, 'Test']);
  assert.equal(n.headlines[2].severity, 'Low');
  assert.deepEqual(n.sources, ['Test']);
  assert.equal(n.holiday, null);
  const th = newsState({ now: Z('2026-11-26T15:00'), ctx, calendar: parseCalendar([]), headlines: [], errors: {} });
  assert.equal(th.holiday.name, 'Thanksgiving');
  assert.match(th.caution, /Thanksgiving/);
});

// ── Focus and hidden setups; expandable cards ──
test('focus: the chosen setup leads whenever its window is open; a hidden setup is not shown at all', () => {
  const v = loadVerdicts(), s = defaultSettings();
  const normal = buildState({ ...demoInput('long'), verdicts: v, settings: s });
  assert.equal(normal.answer.setup.id, 'ny_sweep_shift');                    // the live LONG leads
  s.setups = { focus: ['ny_ib'], off: ['ny_orb15'] };
  const focused = buildState({ ...demoInput('long'), verdicts: v, settings: s });
  assert.equal(focused.answer.setup.id, 'ny_ib');
  assert.equal(focused.answer.focus, true);
  const names = [focused.answer, ...focused.answer.others].map(c => c.setup.id);
  assert.ok(!names.includes('ny_orb15') && names.includes('ny_sweep_shift'));
  assert.equal(windowSetups(v, 'nyopen', { off: ['ny_orb15'] }).some(x => x.id === 'ny_orb15'), false);
});

test('every setup in the window is a full card: name, win rate, state and its own numbers', () => {
  const st = buildState({ ...demoInput('long'), verdicts: loadVerdicts() });
  const a = st.answer;
  assert.deepEqual([a.setup.name, a.winPct, a.trades], ['NY sweep + shift', 51, 383]);
  assert.ok(a.signalId && a.entry && a.contracts === 1);
  for (const o of a.others) {
    assert.ok(o.setup.name && o.state && o.headline && o.evidence && Number.isFinite(o.winPct), o.setup?.name);
    if (o.entry != null) assert.ok(o.signalId && o.stop != null);
  }
  assert.ok(a.others.length >= 3);
});

test('a stop too wide for your risk still shows what one micro would cost, and stays blocked', () => {
  const s = defaultSettings(); s.personal.riskPerTrade = 100;
  const v = loadVerdicts(); v.setups = v.setups.filter(x => x.id === 'ny_sweep_shift');
  const a = buildState({ ...demoInput('long'), verdicts: v, settings: s }).answer;
  assert.deepEqual([a.state, a.contracts, a.oneRisk, a.check.verdict], ['Blocked', 0, 195, 'BLOCK']);
  const armed = buildState({ ...demoInput('armed'), verdicts: v, settings: s }).answer;
  assert.deepEqual([armed.pending[0].contracts, armed.pending[0].oneRisk, armed.pending[0].signalId], [0, 142, N1]);
});

// ── One click on an armed trade ──
async function boot(scenario, dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-'))) {
  const inp = demoInput(scenario);
  fs.writeFileSync(path.join(dataDir, 'bars.json'), JSON.stringify(inp.store.toJSON()));
  const { app } = createApp({ dataDir, clock: () => inp.now, fetchImpl: async () => { throw new Error('offline in tests'); } });
  const server = await new Promise(r => { const x = app.listen(0, () => r(x)); });
  const base = `http://localhost:${server.address().port}`;
  const call = async (method, url, body) => { const r = await fetch(base + url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json() }; };
  // Pretend the chart is feeding it, so the page state carries live cards.
  await call('POST', '/api/bars', { symbol: 'CME_MINI_DL:MNQ1!', resolution: '5', bars: inp.store.ctx().raw.bars.slice(-40).map(b => [b.t / 1000, b.o, b.h, b.l, b.c, b.v]) });
  return { call, dataDir, now: inp.now, close: () => server.close() };
}

test('an armed trade can be added before the desk sees it trigger, and settles like any other', async () => {
  const a = await boot('armed'); const dir = a.dataDir;
  let entry;
  try {
    const st = (await a.call('GET', '/api/state')).json, cards = [st.answer, ...st.answer.others];
    const p = cards.find(c => c.setup.id === 'ny_sweep_shift').pending[0];
    entry = p.trigger + 2;
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1, side: 'SHORT', entry, contracts: 1 })).status, 400); // only a LONG is armed
    assert.equal((await a.call('POST', '/api/journal/take', { id: 'ny_sweep_shift:2026-07-14', side: 'LONG', entry, contracts: 1 })).status, 404); // not today
    const took = await a.call('POST', '/api/journal/take', { id: N1, side: 'LONG', entry, contracts: 1 });
    assert.equal(took.status, 200);
    assert.deepEqual([took.json.trade.open, took.json.trade.side, took.json.trade.entry, took.json.trade.stop, took.json.trade.target], [true, 'LONG', entry, p.stop, p.target]);
    const again = (await a.call('GET', '/api/state')).json;
    assert.equal([again.answer, ...again.answer.others].find(c => c.setup.id === 'ny_sweep_shift').pending[0].taken, true);
  } finally { a.close(); }
  const b = await boot('won', dir);
  try {
    const row = (await b.call('GET', '/api/journal')).json.trades.find(t => t.signalId === N1), sig = (await b.call('GET', '/api/log')).json.signals.find(s => s.id === N1);
    assert.deepEqual([row.open, row.auto], [false, true]);
    assert.equal(row.pnl, 2 * (sig.exitPx - entry));
  } finally { b.close(); }
});

test('a too-wide trade can be logged when the size is given, and focus and hidden setups are saved', async () => {
  const a = await boot('long');
  try {
    await a.call('POST', '/api/settings', { personal: { riskPerTrade: 100 } });
    assert.equal((await a.call('POST', '/api/journal/take', { id: N1 })).status, 400);               // no size: refused, as before
    const ok = await a.call('POST', '/api/journal/take', { id: N1, entry: 25073, contracts: 1 });
    assert.deepEqual([ok.status, ok.json.trade.contracts, ok.json.trade.followedRules], [200, 1, false]); // over your risk: logged as breaking the rule
    const set = await a.call('POST', '/api/settings', { setups: { focus: ['asia_orb'], off: ['nymid_last30'] } });
    assert.deepEqual(set.json.settings.setups, { focus: ['asia_orb'], off: ['nymid_last30'] });
    assert.equal((await a.call('POST', '/api/settings', { setups: { focus: ['not_a_setup'] } })).status, 400);
    const pb = (await a.call('GET', '/api/playbook')).json;
    assert.deepEqual([pb.prefs.focus, pb.prefs.off], [['asia_orb'], ['nymid_last30']]);
    assert.ok(Array.isArray(pb.tally));
  } finally { a.close(); }
});
