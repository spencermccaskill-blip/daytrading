import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCalendar, parseRss, topicOf, reaction, shocks, newsState } from '../server/news.js';
import { flat, closedCtx, Z } from './helpers.js';

const CAL = [
  { title: 'CPI m/m', country: 'USD', date: '2026-07-15T08:30:00-04:00', impact: 'High', forecast: '0.3%', previous: '0.2%' },
  { title: 'Crude Oil Inventories', country: 'USD', date: '2026-07-15T10:30:00-04:00', impact: 'Medium', forecast: '', previous: '' },
  { title: 'German ZEW', country: 'EUR', date: '2026-07-15T05:00:00-04:00', impact: 'High', forecast: '', previous: '' },
  { title: 'Bank Holiday', country: 'USD', date: '2026-07-15T00:00:00-04:00', impact: 'Holiday', forecast: '', previous: '' },
];
const RSS = `<rss><channel>
<item><title>Trump weighs strike on Iran as talks stall &amp; oil jumps</title><link>https://example.com/a</link><pubDate>Wed, 15 Jul 2026 13:40:00 GMT</pubDate></item>
<item><title><![CDATA[Local bakery wins award]]></title><link>https://example.com/b</link><pubDate>Wed, 15 Jul 2026 12:00:00 GMT</pubDate></item>
<item><title>No link here</title></item>
</channel></rss>`;

test('calendar keeps US high and medium impact releases, in time order', () => {
  const c = parseCalendar(CAL);
  assert.deepEqual(c.map(e => [e.title, e.impact]), [['CPI m/m', 'High'], ['Crude Oil Inventories', 'Medium']]);
  assert.equal(c[0].t, Z('2026-07-15T12:30'));
  assert.deepEqual(parseCalendar('nonsense'), []);
});

test('headlines are read from RSS, decoded, and tagged by topic', () => {
  const h = parseRss(RSS, 'Test');
  assert.equal(h.length, 2);
  assert.equal(h[0].title, 'Trump weighs strike on Iran as talks stall & oil jumps');
  assert.equal(h[0].t, Z('2026-07-15T13:40'));
  assert.equal(topicOf(h[0].title), 'War and geopolitics');
  assert.equal(topicOf('Fed chair signals rate cut is coming'), 'Fed and rates');
  assert.equal(topicOf('Trump announces new tariffs on chips'), 'Tariffs and trade');
  assert.equal(topicOf('Nvidia earnings beat expectations'), 'Big tech');
  assert.equal(topicOf(h[1].title), null);
});

test('reaction: how far price moved 15 and 60 minutes after a headline', () => {
  const D = '2026-07-15';
  const bars = flat('2026-07-14', D, { [D + 'T13:45']: [100, 101, 80, 82], [D + 'T14:30']: [82, 83, 60, 62] });
  const ctx = closedCtx(bars);
  assert.deepEqual(reaction(ctx, Z(D + 'T13:40')), { m15: -18, m60: -38 });
  assert.equal(reaction(ctx, Z('2026-07-10T13:40')), null);          // no bars back then
  assert.deepEqual(reaction(closedCtx(bars, Z(D + 'T14:00')), Z(D + 'T13:40')), { m15: -18, m60: null }); // an hour has not passed yet
});

test('shocks: unusually large 15-minute bars in the last day, with the headline nearest to each', () => {
  const D = '2026-07-15';
  const ctx = closedCtx(flat('2026-07-13', D, { [D + 'T13:45']: [100, 101, 20, 25] }), Z(D + 'T15:00'));
  const s = shocks(ctx, Z(D + 'T15:00'), parseRss(RSS, 'Test'));
  assert.equal(s.length, 1);
  assert.deepEqual([s[0].t, s[0].move], [Z(D + 'T13:45'), -75]);
  assert.match(s[0].headline.title, /Iran/);
});

test('newsState: next release, a caution just before and after it, and tagged headlines first', () => {
  const D = '2026-07-15', ctx = closedCtx(flat('2026-07-14', D), Z(D + 'T12:25'));
  const base = { ctx, calendar: parseCalendar(CAL), headlines: parseRss(RSS, 'Test'), errors: {} };
  const before = newsState({ ...base, now: Z(D + 'T12:25') });
  assert.equal(before.next.title, 'CPI m/m');
  assert.match(before.caution, /CPI m\/m in 5 min/);
  assert.match(newsState({ ...base, now: Z(D + 'T12:33') }).caution, /CPI m\/m was released 3 min ago/);
  const quiet = newsState({ ...base, now: Z(D + 'T11:00') });
  assert.equal(quiet.caution, null);
  assert.equal(quiet.next.title, 'CPI m/m');
  assert.equal(quiet.headlines.length, 0);                       // nothing published yet at 11:00
  const later = newsState({ ...base, now: Z(D + 'T15:00') });
  assert.equal(later.next, null);                                // only high-impact releases count as "next"
  assert.equal(later.headlines[0].topic, 'War and geopolitics');
  assert.equal(later.today.length, 2);
});
