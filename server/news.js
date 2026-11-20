// News: scheduled US releases, headlines, and what price did around them.
// This is context, not a signal. Nothing here predicts a reaction; it shows what happened.
import { zoned, DENVER, BAR, MIN, HOUR, DAY } from './time.js';

export const CALENDAR_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
export const HEADLINE_FEEDS = [
  ['MarketWatch', 'https://feeds.content.dowjones.io/public/rss/mw_topstories'],
  ['Yahoo Finance', 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=%5EIXIC,NQ%3DF&region=US&lang=en-US'],
  ['CNBC Markets', 'https://www.cnbc.com/id/15839069/device/rss/rss.html'],
  ['CNBC Economy', 'https://www.cnbc.com/id/20910258/device/rss/rss.html'],
];

/** US high and medium impact releases from the weekly calendar feed, oldest first. */
export function parseCalendar(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.filter(e => e && e.country === 'USD' && ['High', 'Medium'].includes(e.impact))
    .map(e => ({ title: String(e.title || ''), impact: e.impact, t: Date.parse(e.date), forecast: e.forecast || '', previous: e.previous || '' }))
    .filter(e => Number.isFinite(e.t) && e.title).sort((a, b) => a.t - b.t);
}

const decode = (s) => s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, '')
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const tag = (block, name) => { const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ''; };

/** Headlines from one RSS feed. Items without a title or link are dropped. */
export function parseRss(xml, src) {
  const out = [];
  for (const m of String(xml || '').matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
    const title = tag(m[0], 'title'), link = tag(m[0], 'link'), t = Date.parse(tag(m[0], 'pubDate'));
    if (title && /^https?:\/\//.test(link)) out.push({ src, title, link, t: Number.isFinite(t) ? t : null });
  }
  return out;
}

// Topics that have moved index futures before. A match means "worth a look", nothing more.
const TOPICS = [
  ['War and geopolitics', /\b(iran|israel|gaza|hezbollah|russia|ukraine|taiwan|north korea|missile|air ?strike|strikes? on|military|invasion|ceasefire|sanctions?|nuclear|war)\b/i],
  ['Tariffs and trade', /\b(tariffs?|trade (war|deal|talks)|export (ban|controls?|curbs?)|import dut)/i],
  ['Fed and rates', /\b(fed|fomc|powell|warsh|rate (cut|hike|decision)|interest rates?|treasury yields?|bond yields?)\b/i],
  ['Inflation and jobs data', /\b(cpi|ppi|pce|inflation|payrolls?|jobs report|jobless|unemployment|gdp|retail sales)\b/i],
  ['White House', /\b(trump|white house|executive order|shutdown|debt ceiling|congress)\b/i],
  ['Big tech', /\b(nvidia|apple|microsoft|alphabet|google|amazon|meta|tesla|broadcom|amd|chip(maker)?s?|semiconductors?|nasdaq)\b/i],
];
export const topicOf = (title) => TOPICS.find(([, re]) => re.test(title))?.[0] ?? null;

const near = (series, x, within = 20 * MIN) => { const i = series.lower(x + 1) - 1, b = series.bars[i]; return b && x - b.t <= within ? b : null; };

/** Points MNQ moved from the moment of a headline to 15 and 60 minutes later. Null where the bars do not exist yet. */
export function reaction(ctx, t) {
  const b0 = near(ctx.raw, t);
  if (!b0) return null;
  const at = (x) => { if (x > ctx.now) return null; const b = near(ctx.raw, x); return b ? Math.round((b.c - b0.o) * 4) / 4 : null; };
  return { m15: at(t + 15 * MIN), m60: at(t + 60 * MIN) };
}

/** 15-minute bars in the last day that were at least 3 times the usual size (and 40+ points), newest first, with the nearest headline. */
export function shocks(ctx, now, headlines = []) {
  const bars = ctx.s.bars, out = [];
  for (let i = ctx.s.lower(now - DAY); i < bars.length; i++) {
    const b = bars[i], prev = bars.slice(Math.max(0, i - 96), i);
    if (prev.length < 20) continue;
    const usual = prev.reduce((a, p) => a + (p.h - p.l), 0) / prev.length, range = b.h - b.l;
    if (range < 3 * usual || range < 40) continue;
    const close = headlines.filter(h => h.t && Math.abs(h.t - b.t) <= 45 * MIN).sort((x, y) => Math.abs(x.t - b.t) - Math.abs(y.t - b.t))[0] || null;
    out.push({ t: b.t, move: Math.round((b.c - b.o) * 4) / 4, range: Math.round(range), times: Math.round(range / usual), headline: close && { title: close.title, link: close.link, src: close.src, t: close.t } });
  }
  return out.sort((a, b) => b.t - a.t).slice(0, 6);
}

/** Everything the News tab and the caution line need. */
export function newsState({ now, ctx, calendar, headlines, errors = {}, updated = {} }) {
  const today = zoned(now, DENVER).key;
  const high = calendar.filter(e => e.impact === 'High');
  const next = high.find(e => e.t > now) || null, last = [...high].reverse().find(e => e.t <= now) || null;
  let caution = null;
  if (next && next.t - now <= 10 * MIN) caution = `${next.title} in ${Math.max(1, Math.round((next.t - now) / MIN))} min. Expect a fast move: stops can slip and spreads widen.`;
  else if (last && now - last.t <= 5 * MIN) caution = `${last.title} was released ${Math.max(1, Math.round((now - last.t) / MIN))} min ago. The first minutes after a release are the wildest.`;
  const recent = headlines.filter(h => h.t && h.t <= now && now - h.t <= DAY)
    .map(h => ({ ...h, topic: topicOf(h.title), reaction: reaction(ctx, h.t) }))
    .sort((a, b) => (a.topic ? 0 : 1) - (b.topic ? 0 : 1) || b.t - a.t).slice(0, 30);
  return {
    next: next && { ...next, inMin: Math.round((next.t - now) / MIN) }, caution,
    today: calendar.filter(e => zoned(e.t, DENVER).key === today), week: calendar.filter(e => e.t > now).slice(0, 12),
    headlines: recent, shocks: shocks(ctx, now, headlines), errors, updated,
  };
}

/** Fetches and holds the calendar and headlines. Failures are recorded in plain words and the old data is kept. */
export function createNews(fetchImpl = fetch) {
  const data = { calendar: [], headlines: [], errors: {}, updated: {} };
  const get = (url) => fetchImpl(url, { headers: { 'User-Agent': 'Mozilla/5.0 TheDesk/2.0', Accept: '*/*' }, signal: AbortSignal.timeout(12000) });
  async function refreshCalendar() {
    try {
      const r = await get(CALENDAR_URL);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      data.calendar = parseCalendar(await r.json()); data.updated.calendar = Date.now(); delete data.errors.calendar;
    } catch (e) { data.errors.calendar = `The release calendar could not be loaded (${e.message}). It retries every 30 minutes.`; }
  }
  async function refreshHeadlines() {
    const all = [], failed = [];
    await Promise.all(HEADLINE_FEEDS.map(async ([src, url]) => {
      try { const r = await get(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); all.push(...parseRss(await r.text(), src)); } catch { failed.push(src); }
    }));
    if (all.length) { const seen = new Set(); data.headlines = all.filter(h => !seen.has(h.title) && seen.add(h.title)); data.updated.headlines = Date.now(); }
    if (failed.length === HEADLINE_FEEDS.length) data.errors.headlines = 'No headline source could be reached. It retries every 3 minutes.';
    else if (failed.length) data.errors.headlines = `Not loading: ${failed.join(', ')}. The others are fine.`;
    else delete data.errors.headlines;
  }
  return { data, refreshCalendar, refreshHeadlines };
}
