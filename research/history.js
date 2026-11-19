// Loads data/history and stitches the quarterly contracts the way data/history/README.md describes:
// each date uses the contract whose roll date (expiry minus 7 days) comes next, and every lookback
// for that date reads the same contract.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Series, makeCtx } from '../server/strategies/common.js';
import { BAR, DAY, addDays, utcKey } from '../server/time.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const HISTORY_FILE = path.join(root, 'data', 'history', 'nq-15m-contracts.json');
const MONTH = { H: 2, M: 5, U: 8, Z: 11 };

/** Roll date key for a contract code like NQH2019: third Friday of the month, minus 7 days. */
export function rollKey(code) {
  const m = code.match(/([HMUZ])(\d{4})$/);
  const first = new Date(Date.UTC(+m[2], MONTH[m[1]], 1));
  const thirdFriday = 1 + ((5 - first.getUTCDay() + 7) % 7) + 14;
  return utcKey(Date.UTC(+m[2], MONTH[m[1]], thirdFriday) - 7 * DAY);
}

export function loadHistory(file = HISTORY_FILE) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const contracts = Object.entries(j.contracts).map(([code, rows]) => {
    const bars = rows.map(r => ({ t: r[0] * 1000, o: r[1], h: r[2], l: r[3], c: r[4], v: r[5] || 0 })).sort((a, b) => a.t - b.t);
    const s = new Series(bars);
    return { code, roll: rollKey(code), first: utcKey(bars[0].t), last: utcKey(bars.at(-1).t), ctx: makeCtx(s, s, bars.at(-1).t + BAR) };
  }).sort((a, b) => a.roll.localeCompare(b.roll));
  return { meta: j.meta, contracts, start: contracts[0].first, end: contracts.map(c => c.last).sort().at(-1) };
}

/** The front contract for a date: the one whose roll date comes next. */
export const contractFor = (hist, key) => hist.contracts.find(c => c.roll > key) || null;

/** Every calendar date in the history with its front contract (dates the contract has no bars for are skipped). */
export function* tradingDates(hist) {
  for (let k = hist.start; k <= hist.end; k = addDays(k, 1)) {
    const c = contractFor(hist, k);
    if (c && k >= c.first && k <= c.last) yield { key: k, contract: c };
  }
}
