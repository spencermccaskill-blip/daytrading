// Shared pieces for every setup: the bar series, trade management, and day lookbacks.
// The backtest and the live desk both call the same functions with a "context":
//   s    closed 15-minute bars (never the bar still forming)
//   raw  the finest bars available, used only to see a stop or target being touched
//   now  the time the data has reached
import { BAR, MIN, etTime, addDays, isWeekday } from '../time.js';
import { haltWithin } from '../holidays.js';

export const COST_POINTS = 1;   // NQ points charged on every trade (commission + slippage)
export const MIN_RISK = 5;      // signals with a stop closer than this are skipped

export class Series {
  constructor(bars) { this.bars = bars; }
  /** Index of the first bar with t >= time. */
  lower(t) { let lo = 0, hi = this.bars.length; while (lo < hi) { const m = (lo + hi) >> 1; if (this.bars[m].t < t) lo = m + 1; else hi = m; } return lo; }
  between(t0, t1) { return this.bars.slice(this.lower(t0), this.lower(t1)); }
  at(t) { const b = this.bars[this.lower(t)]; return b && b.t === t ? b : null; }
  get last() { return this.bars.at(-1) || null; }
}
export const makeCtx = (s, raw, now) => ({ s, raw, now });

export const hiLo = (a) => a.length ? { high: Math.max(...a.map(b => b.h)), low: Math.min(...a.map(b => b.l)) } : null;
export const side = (dir) => (dir > 0 ? 'LONG' : 'SHORT');

/** A new trade taken at the close of a signal bar. target may be null (time or rule exit only). */
export function openTrade(dir, bar, stop, targetR, reason) {
  const risk = Math.abs(bar.c - stop);
  return { dir, side: side(dir), signalT: bar.t, entry: bar.c, stop, risk, target: targetR ? bar.c + dir * targetR * risk : null, reason };
}

/**
 * A trade's flat time, brought forward to a holiday halt when the halt comes first, and whether the
 * data has reached it. On a normal day that is simply now >= endT. Before a halt no bar opens at or
 * after it, so the time exit is due once the last bar's close reaches the halt.
 */
export function flatTime(ctx, fromT, endT) {
  const halt = haltWithin(fromT, endT);
  if (halt == null) return { endT, due: ctx.now >= endT, halt: null };
  const [prev, last] = ctx.raw.bars.slice(-2);
  const step = last && prev ? Math.min(BAR, last.t - prev.t) : MIN;
  return { endT: halt, due: ctx.now >= halt || (last != null && last.t + step >= halt), halt };
}

/**
 * Follow a trade to its exit. Stop is checked before target inside every bar (stop-first).
 * closeExit(bar15) may end the trade at a 15-minute close ("rule"). Still open if the data
 * has not reached an exit yet. r is net of the 1 point cost and null while open.
 * A holiday halt before endT becomes the time exit (see flatTime).
 */
export function manage(ctx, trade, endT, closeExit) {
  const flat = flatTime(ctx, trade.signalT, endT);
  endT = flat.endT;
  let status = 'open', exitPx = null, exitT = null;
  const touch = (r) => {
    const hitStop = trade.dir > 0 ? r.l <= trade.stop : r.h >= trade.stop;
    const hitTgt = trade.target != null && (trade.dir > 0 ? r.h >= trade.target : r.l <= trade.target);
    if (hitStop) { status = 'stopped'; exitPx = trade.stop; exitT = r.t; }
    else if (hitTgt) { status = 'target'; exitPx = trade.target; exitT = r.t; }
    return status !== 'open';
  };
  const start = trade.signalT + BAR;
  scan: {
    let t = start;
    for (const b of ctx.s.between(start, endT)) {
      for (const r of ctx.raw.between(b.t, b.t + BAR)) if (touch(r)) break scan;
      if (closeExit && closeExit(b)) { status = 'rule'; exitPx = b.c; exitT = b.t; break scan; }
      t = b.t + BAR;
    }
    for (const r of ctx.raw.between(t, endT)) if (touch(r)) break scan; // bars of the 15m bar still forming
  }
  if (status === 'open' && flat.due) {
    const last = ctx.raw.between(trade.signalT, endT).at(-1) || { c: trade.entry, t: trade.signalT };
    status = 'time'; exitPx = last.c; exitT = last.t;
  }
  const px = exitPx ?? ctx.raw.last?.c ?? trade.entry;
  const gross = (trade.dir * (px - trade.entry)) / trade.risk;
  return { ...trade, status, exitPx, exitT, rNow: gross, r: status === 'open' ? null : gross - COST_POINTS / trade.risk };
}

/** Regular-hours (9:30-16:00 ET) closed bars of a date. */
export const rth = (ctx, key) => ctx.s.between(etTime(key, 9.5), etTime(key, 16));

/** Up to n most recent earlier weekdays that have a 9:30 bar, newest first. */
export function priorDays(ctx, key, n = 14) {
  const out = [];
  for (let k = addDays(key, -1), i = 0; out.length < n && i < 35; k = addDays(k, -1), i++)
    if (isWeekday(k) && ctx.s.at(etTime(k, 9.5))) out.push(k);
  return out;
}
/** Average high-low of regular-hours 15m bars over the prior days. Null without 10 days. */
export function atr15(ctx, days) {
  if (days.length < 10) return null;
  let sum = 0, n = 0;
  for (const k of days) for (const b of rth(ctx, k)) { sum += b.h - b.l; n++; }
  return n ? sum / n : null;
}
/** Prior day's 16:00 ET close (close of the 15:45 bar). */
export const priorClose = (ctx, days) => (days.length ? ctx.s.at(etTime(days[0], 15.75))?.c ?? null : null);

/** Running VWAP from 9:30 ET, by bar open time. */
export function vwapMap(bars) {
  const m = new Map(); let pv = 0, v = 0;
  for (const b of bars) { const w = b.v || 1; pv += ((b.h + b.l + b.c) / 3) * w; v += w; m.set(b.t, pv / v); }
  return m;
}

/** Wrap up a result: phase follows the trade if there is one. */
export const withTrade = (base, trade) => ({ ...base, phase: trade.status === 'open' ? 'in-trade' : 'done', trade });
