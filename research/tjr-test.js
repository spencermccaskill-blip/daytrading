// The pre-registered test of the TJR setups on 5-minute MNQ bars (PREREGISTRATION.md, addendum 2026-11-28).
// The bars go through the same BarStore the live desk uses, so the test and the desk see the same trades.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATEGIES } from '../server/strategies/index.js';
import { TJR_TIMES, TJR_COST, follow, M5 } from '../server/strategies/tjr.js';
import { side } from '../server/strategies/common.js';
import { BarStore } from '../server/bars.js';
import { dropBadTicks } from '../server/yahoo.js';
import { BAR, etKey, etTime, addDays, isWeekday } from '../server/time.js';
import { summary, rng } from './stats.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const M5_FILE = path.join(root, 'data', 'history', 'mnq-5m-yahoo.json');
export const MIN_TRADES = 150;

export function loadFive(file = M5_FILE) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8')), rows = dropBadTicks(j.rows);
  const store = new BarStore();
  store.ingest(rows, 5);
  return { meta: j.meta, dropped: j.rows.length - rows.length, bars: rows.length, ctx: store.ctx(), first: etKey(rows[0][0] * 1000), last: etKey(rows.at(-1)[0] * 1000) };
}

/** Every closed trade a TJR setup takes over the data, oldest first. */
export function runFive(data, strat) {
  const trades = [];
  for (let key = data.first; key <= data.last; key = addDays(key, 1)) {
    const res = strat.evaluate(data.ctx, key), t = res.trade;
    if (!t || t.status === 'open') continue;
    trades.push({ key, dir: t.dir, entryT: t.signalT + BAR, entry: t.entry, stop: t.stop, risk: t.risk, target: t.target, status: t.status, exitPx: t.exitPx, exitT: t.exitT, r: t.r });
  }
  return trades;
}

/**
 * Control: each trade is replaced by an entry on another trading day at the same New York clock time,
 * in a random direction, with the same stop and target distances, flat time and cost.
 */
export function control(data, strat, trades, runs = 500, seed = 12345) {
  if (!trades.length) return { mean: null, p95: null };
  const days = [];
  for (let key = data.first; key <= data.last; key = addDays(key, 1)) if (isWeekday(key) || strat.window === 'asia') days.push(key);
  const rand = rng(seed), s5 = data.ctx.raw, flatOf = TJR_TIMES[strat.window].flat, avgs = [];
  const cache = new Map();
  const one = (t, key, dir) => {
    const id = `${t.entryT}|${key}|${dir}`;
    if (cache.has(id)) return cache.get(id);
    const at = etTime(key, 0) + (t.entryT - etTime(t.key, 0)), bar = s5.at(at - M5);
    let r = null;
    if (bar && key !== t.key) {
      const dist = Math.abs(t.target - t.entry);
      r = follow(data.ctx, { dir, side: side(dir), entry: bar.c, stop: bar.c - dir * t.risk, risk: t.risk, target: bar.c + dir * dist }, at, flatOf(key)).r;
    }
    cache.set(id, r);
    return r;
  };
  for (let i = 0; i < runs; i++) {
    let sum = 0;
    for (const t of trades) {
      let r = null;
      for (let tries = 0; r == null && tries < 40; tries++) r = one(t, days[Math.floor(rand() * days.length)], rand() < 0.5 ? 1 : -1);
      sum += r ?? 0;
    }
    avgs.push(sum / trades.length);
  }
  avgs.sort((a, b) => a - b);
  return { mean: avgs.reduce((a, b) => a + b, 0) / runs, p95: avgs[Math.floor(runs * 0.95)] };
}

export function reportFive(data, strat) {
  const trades = runFive(data, strat), s = summary(trades), ctl = control(data, strat, trades);
  const stops = trades.map(t => t.risk).sort((a, b) => a - b);
  const fit = (usd) => (trades.length ? (100 * trades.filter(t => t.risk * 2 <= usd).length) / trades.length : null);
  const shown = s.trades > 0 && s.avgR > 0 && s.avgR > ctl.mean;
  let label = 'Too early to judge';
  if (s.trades >= MIN_TRADES) label = s.avgR <= 0 ? 'Benched' : s.avgR > ctl.p95 ? 'Promising, not proven' : 'No edge';
  return { id: strat.id, code: strat.code, name: strat.name, window: strat.window, source: strat.source, research: 'tjr', outside: !!strat.outside, label, shown, trial: !shown,
    judge: s, control: ctl, medianStop: stops.length ? stops[stops.length >> 1] : null, fit100: fit(100), fit250: fit(250), cost: TJR_COST,
    period: { from: data.first, to: data.last }, trades };
}

export const tjrStrategies = () => STRATEGIES.filter(s => s.research === 'tjr');
