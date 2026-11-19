// Economic calendar (Forex Factory weekly feed) and market headlines (RSS). Both free, no keys.

const CAL_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const NEWS_URLS = [
  ['CNBC Markets', 'https://www.cnbc.com/id/15839069/device/rss/rss.html'],
  ['CNBC Economy', 'https://www.cnbc.com/id/20910258/device/rss/rss.html'],
  ['MarketWatch', 'https://feeds.content.dowjones.io/public/rss/mw_topstories'],
];

export const feeds = { calendar: [], news: [], calUpdated: null, newsUpdated: null, errors: {} };

const UA = { 'User-Agent': 'Mozilla/5.0 NQ-Desk/1.0' };

export async function refreshCalendar() {
  try {
    const r = await fetch(CAL_URL, { headers: UA });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const rows = await r.json();
    feeds.calendar = rows
      .filter(e => e.country === 'USD' && ['High', 'Medium'].includes(e.impact))
      .map(e => ({ title: e.title, impact: e.impact, t: Date.parse(e.date), forecast: e.forecast || '', previous: e.previous || '' }))
      .filter(e => Number.isFinite(e.t))
      .sort((a, b) => a.t - b.t);
    feeds.calUpdated = Date.now(); delete feeds.errors.calendar;
  } catch (e) { feeds.errors.calendar = `Calendar unavailable (${e.message}). It retries every 30 minutes.`; }
}

const decode = (s) => s.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/[—–]/g, '-').trim();
const tag = (block, name) => { const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`)); return m ? decode(m[1]) : ''; };

export async function refreshNews() {
  const all = [], errs = [];
  await Promise.all(NEWS_URLS.map(async ([src, url]) => {
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const xml = await r.text();
      for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/g)) {
        const title = tag(m[0], 'title'), link = tag(m[0], 'link'), t = Date.parse(tag(m[0], 'pubDate'));
        if (title && link) all.push({ src, title, link, t: Number.isFinite(t) ? t : null });
      }
    } catch (e) { errs.push(`${src}: ${e.message}`); }
  }));
  if (all.length) {
    const seen = new Set();
    feeds.news = all.filter(n => !seen.has(n.title) && seen.add(n.title)).sort((a, b) => (b.t || 0) - (a.t || 0)).slice(0, 40);
    feeds.newsUpdated = Date.now();
  }
  if (errs.length) feeds.errors.news = `Some headline sources failed: ${errs.join('; ')}`; else delete feeds.errors.news;
}
