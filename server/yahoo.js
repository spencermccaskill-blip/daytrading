// Built-in price feed: delayed MNQ 5-minute bars from Yahoo Finance's chart service, so The Desk
// can run without a TradingView tab. It is an unofficial, free service: about 10 minutes behind,
// and it can refuse or change without notice. The Desk treats any failure as "no fresh data".

export const YAHOO_SYMBOL = 'YAHOO:MNQ=F';

/** Address for 5-minute MNQ bars. range: '1mo' (history for the levels) or '1d' (keeping up). */
export const yahooUrl = (range) => `https://query1.finance.yahoo.com/v8/finance/chart/MNQ=F?interval=5m&range=${range}&includePrePost=true`;

/** Turns a Yahoo chart reply into rows [tSec, o, h, l, c, v]. Empty slots and the trailing tick (not a whole bar) are dropped. */
export function parseYahoo(json) {
  const r = json?.chart?.result?.[0], q = r?.indicators?.quote?.[0], ts = r?.timestamp;
  if (!Array.isArray(ts) || !q) return [];
  const rows = [];
  for (let i = 0; i < ts.length; i++) {
    const t = ts[i], o = q.open?.[i], h = q.high?.[i], l = q.low?.[i], c = q.close?.[i];
    if (!Number.isFinite(t) || t % 300 !== 0) continue;
    if (![o, h, l, c].every(x => Number.isFinite(x) && x > 0)) continue;
    rows.push([t, o, h, l, c, Number(q.volume?.[i]) || 0]);
  }
  return rows.sort((a, b) => a[0] - b[0]);
}

/** One fetch. Returns { rows } or { error } in plain words; never throws. */
export async function fetchYahoo(range, fetchImpl = fetch) {
  try {
    const res = await fetchImpl(yahooUrl(range), { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return { error: `The price service refused the request (HTTP ${res.status}). Trying again shortly.` };
    const rows = parseYahoo(await res.json());
    return rows.length ? { rows } : { error: 'The price service sent no bars. Trying again shortly.' };
  } catch (e) {
    return { error: `Could not reach the price service (${e?.name === 'TimeoutError' ? 'timed out' : 'no connection'}). Trying again shortly.` };
  }
}
