// TJR Boot Camp setups, one fixed mechanical reading of what the course teaches.
// Rules are in research/PREREGISTRATION.md (addendum 2026-11-28) and must match it.
//   T1  sweep + break            enter at the close of the 5-minute bar that breaks structure
//   T2  sweep + break + pullback resting entry at the fair value gap or order block, in the favourable half
// Both work on closed 5-minute bars, trade only with the daily bias, and put the stop beyond the sweep.
import { MIN, HOUR, BAR, etTime, londonTime, addDays } from '../time.js';
import { Series, side, MIN_RISK, flatTime } from './common.js';

export const M5 = 5 * MIN;
export const TJR_COST = 1.5;   // NQ points per trade: fees plus a tick of slippage each way
const BUFFER = 2;              // points beyond the sweep extreme
const SWEEP_BARS = 12;         // a sweep stays active this many 5-minute bars
const TICK = 0.25;
const OB_LOOKBACK = 6;

/**
 * Market structure the way Day 6 defines it. For each candle: the direction after it closes
 * (1 up, -1 down, null unknown) and the most recent swing high and low completed by it.
 */
export function structure(bars) {
  let dir = null, hi = null, lo = null;
  const out = new Array(bars.length);
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    if (hi != null && b.c > hi) dir = 1; else if (lo != null && b.c < lo) dir = -1;
    if (i > 0) {
      const p = bars[i - 1];
      if (p.c > p.o && b.c < b.o) hi = Math.max(p.h, b.h);
      else if (p.c < p.o && b.c > b.o) lo = Math.min(p.l, b.l);
    }
    out[i] = { dir, hi, lo };
  }
  return out;
}

const merge = (parts, t, end) => ({ t, end, o: parts[0].o, h: Math.max(...parts.map(p => p.h)), l: Math.min(...parts.map(p => p.l)), c: parts.at(-1).c });

/** Daily, 4-hour and 1-hour candles from the closed 15-minute bars, each with its structure. Cached per series. */
const htfCache = new WeakMap();
export function higherTimeframes(ctx) {
  const hit = htfCache.get(ctx.s);
  if (hit && hit.n === ctx.s.bars.length) return hit;
  const s = ctx.s, daily = [], h4 = [], h1 = [];
  if (s.bars.length) {
    const first = new Date(s.bars[0].t).toISOString().slice(0, 10), last = addDays(new Date(s.last.t).toISOString().slice(0, 10), 1);
    for (let key = first; key <= last; key = addDays(key, 1)) {
      const start = etTime(addDays(key, -1), 18), end = etTime(key, 17);
      const day = s.between(start, end);
      if (!day.length) continue;
      if (day.length >= 40) daily.push(merge(day, start, end)); // a trading day counts with at least 10 hours of bars
      for (let t = start; t < end; t += HOUR) { const p = s.between(t, Math.min(t + HOUR, end)); if (p.length) h1.push(merge(p, t, Math.min(t + HOUR, end))); }
      for (let t = start; t < end; t += 4 * HOUR) { const p = s.between(t, Math.min(t + 4 * HOUR, end)); if (p.length) h4.push(merge(p, t, Math.min(t + 4 * HOUR, end))); }
    }
  }
  const pack = (candles) => ({ candles, st: structure(candles) });
  const out = { n: s.bars.length, daily: pack(daily), h4: pack(h4), h1: pack(h1) };
  htfCache.set(ctx.s, out);
  return out;
}
/** Structure direction of a timeframe from the candles finished by time t. Also how many candles that is. */
function dirAt(tf, t) {
  let lo = 0, hi = tf.candles.length;
  while (lo < hi) { const m = (lo + hi) >> 1; if (tf.candles[m].end <= t) lo = m + 1; else hi = m; }
  return { dir: lo ? tf.st[lo - 1].dir : null, count: lo };
}
/** Daily bias and the 4-hour and 1-hour direction at a moment. dir: 1 up, -1 down, null unknown. */
export function biasAt(ctx, t) {
  const h = higherTimeframes(ctx), d = dirAt(h.daily, t);
  return { daily: d.count >= 5 ? d.dir : null, days: d.count, h4: dirAt(h.h4, t).dir, h1: dirAt(h.h1, t).dir };
}

/** Closed 5-minute bars from the raw feed (1-minute bars are grouped; anything slower than 5 minutes cannot be used). */
const m5Cache = new WeakMap();
function fiveMinute(ctx) {
  const hit = m5Cache.get(ctx.raw);
  if (hit && hit.now === ctx.now && hit.n === ctx.raw.bars.length) return hit;
  const raw = ctx.raw.bars; let step = Infinity;
  for (let i = Math.max(1, raw.length - 60); i < raw.length; i++) step = Math.min(step, raw[i].t - raw[i - 1].t);
  let out;
  if (!(step <= M5)) out = { ok: false };
  else {
    const bars = [];
    for (const r of raw) {
      const t = Math.floor(r.t / M5) * M5, b = bars.at(-1);
      if (b && b.t === t) { b.h = Math.max(b.h, r.h); b.l = Math.min(b.l, r.l); b.c = r.c; }
      else bars.push({ t, o: r.o, h: r.h, l: r.l, c: r.c });
    }
    while (bars.length && ctx.now < bars.at(-1).t + M5) bars.pop(); // the bar still forming is never a signal bar
    out = { ok: true, s5: new Series(bars), st: structure(bars) };
  }
  out.now = ctx.now; out.n = raw.length;
  m5Cache.set(ctx.raw, out);
  return out;
}

export const TJR_TIMES = {
  nyopen: { open: (k) => etTime(k, 9.5), last: (k) => etTime(k, 11), flat: (k) => etTime(k, 16), openLabel: 'the New York open at 9:30 ET', lastLabel: '11:00 ET' },
  nymid: { open: (k) => etTime(k, 12), last: (k) => etTime(k, 15), flat: (k) => etTime(k, 16), openLabel: '12:00 ET', lastLabel: '3:00 PM ET' },
  asia: { open: (k) => etTime(k, 18), last: (k) => etTime(k, 23), flat: (k) => etTime(addDays(k, 1), 0), openLabel: 'the reopen at 4:00 PM Denver', lastLabel: '9:00 PM Denver' },
  london: { open: (k) => londonTime(k, 8), last: (k) => londonTime(k, 11), flat: (k) => londonTime(k, 12), openLabel: 'the London open', lastLabel: '11:00 London' },
};

/** Highs and lows of the four session blocks that most recently finished before `open`. */
function markedLevels(s5, key, open) {
  const blocks = [];
  for (let n = -5; n <= 0; n++) {
    const d = addDays(key, n), lon = londonTime(d, 8);
    blocks.push({ name: 'Asian', start: etTime(addDays(d, -1), 18), end: lon }, { name: 'London', start: lon, end: etTime(d, 9.5) },
      { name: 'NY morning', start: etTime(d, 9.5), end: etTime(d, 12) }, { name: 'NY afternoon', start: etTime(d, 12), end: etTime(d, 17) });
  }
  const done = [];
  for (const b of blocks.filter(b => b.end <= open).sort((x, y) => y.end - x.end)) {
    const bars = s5.between(b.start, b.end);
    if (bars.length < 6) continue;
    const name = done.some(x => x.name === b.name) ? `Earlier ${b.name}` : b.name;
    done.push({ name, end: b.end, high: Math.max(...bars.map(x => x.h)), low: Math.min(...bars.map(x => x.l)) });
    if (done.length === 4) break;
  }
  if (done.length < 4) return null;
  const highs = [], lows = [];
  for (const b of done) {
    const since = s5.between(b.end, open);
    highs.push({ name: `${b.name} high`, price: b.high, end: b.end, live: !since.some(x => x.h > b.high) });
    lows.push({ name: `${b.name} low`, price: b.low, end: b.end, live: !since.some(x => x.l < b.low) });
  }
  return { highs, lows };
}

/** Nearest liquidity at least 1R from the entry: untouched 15-minute swings of the last 24 hours and live marked levels. */
function pickTarget(ctx, s5, levels, dir, entry, risk, atT) {
  const want = entry + dir * risk, cands = [];
  const b15 = ctx.s.between(atT - 24 * HOUR, atT).filter(b => b.t + BAR <= atT);
  for (let i = 1; i < b15.length; i++) {
    const p = b15[i - 1], b = b15[i];
    if (dir < 0 && p.c < p.o && b.c > b.o) { const L = Math.min(p.l, b.l); if (L <= want && !s5.between(b.t + BAR, atT).some(x => x.l < L)) cands.push({ price: L, name: '15-minute low' }); }
    if (dir > 0 && p.c > p.o && b.c < b.o) { const H = Math.max(p.h, b.h); if (H >= want && !s5.between(b.t + BAR, atT).some(x => x.h > H)) cands.push({ price: H, name: '15-minute high' }); }
  }
  for (const l of dir < 0 ? levels.lows : levels.highs) {
    const ok = dir < 0 ? l.price <= want && !s5.between(l.end, atT).some(x => x.l < l.price) : l.price >= want && !s5.between(l.end, atT).some(x => x.h > l.price);
    if (ok) cands.push({ price: l.price, name: l.name });
  }
  if (!cands.length) return null;
  return cands.sort((a, b) => (dir < 0 ? b.price - a.price : a.price - b.price))[0];
}

/** Follow a trade on the raw bars from `fromT`. Stop first inside every bar. r is net of the cost. */
export function follow(ctx, trade, fromT, endT, stoppedAtEntry = false) {
  const flat = flatTime(ctx, fromT, endT);
  endT = flat.endT;
  let status = 'open', exitPx = null, exitT = null;
  if (stoppedAtEntry) { status = 'stopped'; exitPx = trade.stop; exitT = fromT - M5; }
  else for (const r of ctx.raw.between(fromT, endT)) {
    const hitStop = trade.dir > 0 ? r.l <= trade.stop : r.h >= trade.stop;
    const hitTgt = trade.dir > 0 ? r.h >= trade.target : r.l <= trade.target;
    if (hitStop) { status = 'stopped'; exitPx = trade.stop; exitT = r.t; break; }
    if (hitTgt) { status = 'target'; exitPx = trade.target; exitT = r.t; break; }
  }
  if (status === 'open' && flat.due) {
    const last = ctx.raw.between(fromT - M5, endT).at(-1) || { c: trade.entry, t: fromT };
    status = 'time'; exitPx = last.c; exitT = last.t;
  }
  const px = exitPx ?? ctx.raw.last?.c ?? trade.entry;
  const gross = (trade.dir * (px - trade.entry)) / trade.risk;
  return { ...trade, status, exitPx, exitT, rNow: gross, r: status === 'open' ? null : gross - TJR_COST / trade.risk };
}

const biasWord = (d) => (d > 0 ? 'up' : 'down');

function evaluate(model, windowId, ctx, key) {
  const w = TJR_TIMES[windowId], open = w.open(key), last = w.last(key), flat = w.flat(key);
  const base = { levels: [], times: { open, lastSignal: last, flat }, openLabel: w.openLabel, lastLabel: w.lastLabel, barMin: 5 };
  const d = fiveMinute(ctx);
  if (!d.ok) return { ...base, phase: 'no-data', message: 'This setup needs 5-minute bars. The chart is on a slower timeframe.' };
  const { s5, st } = d, bars = s5.bars;
  const levels = markedLevels(s5, key, open);
  if (!levels) return { ...base, phase: 'no-data', message: 'Waiting for enough history: needs the last four session ranges on the chart.' };
  base.levels = [...levels.highs.map(l => ({ name: l.name, price: l.price, side: 'high' })), ...levels.lows.map(l => ({ name: l.name, price: l.price, side: 'low' }))];
  const bias = biasAt(ctx, open);
  base.bias = bias;
  if (bias.daily == null) return { ...base, phase: 'no-data', message: 'Waiting for enough history to read the daily bias (needs at least 5 finished days with a break of structure).' };
  const only = bias.daily > 0 ? 'longs' : 'shorts';
  if (ctx.now < open) return { ...base, phase: 'waiting', message: `Daily bias is ${biasWord(bias.daily)}: ${only} only. Nothing to do until ${w.openLabel}.` };

  // Per side: -1 = a high was swept (short setup), 1 = a low was swept (long setup).
  const sweep = { '-1': null, 1: null }, taken = new Set();
  let pending = null, i0 = s5.lower(open), mismatch = null;
  for (let i = i0; i < bars.length && bars[i].t < flat; i++) {
    const b = bars[i], closeT = b.t + M5;

    // T2: a break has happened; wait for the pullback into a zone.
    if (pending) {
      const p = pending, dir = p.dir;
      if (closeT > last) pending = null;
      else {
        const mid = (p.ext + p.far) / 2;
        const ok = p.edges.filter(e => (dir < 0 ? e.price >= mid : e.price <= mid));
        const hit = ok.filter(e => (dir < 0 ? b.h >= e.price + TICK : b.l <= e.price - TICK)).sort((x, y) => (dir < 0 ? x.price - y.price : y.price - x.price))[0];
        if (hit) {
          const entry = dir < 0 ? Math.max(hit.price, b.o) : Math.min(hit.price, b.o), risk = Math.abs(p.stop - entry);
          if (risk >= MIN_RISK) {
            const trade = { dir, side: side(dir), signalT: closeT - BAR, entry, stop: p.stop, risk, target: hit.target.price, targetName: hit.target.name, reason: `${p.pool} swept, structure broke ${dir < 0 ? 'down' : 'up'}, then price pulled back into the ${hit.zone}` };
            const stoppedNow = dir < 0 ? b.h >= p.stop : b.l <= p.stop;
            const t = follow(ctx, trade, closeT, flat, stoppedNow);
            return { ...base, swept: p.pool, phase: t.status === 'open' ? 'in-trade' : 'done', trade: t };
          }
          pending = null;
        } else if (dir < 0 ? b.h >= p.stop : b.l <= p.stop) pending = null; // the sweep failed before any pullback entry
        else p.far = dir < 0 ? Math.min(p.far, b.l) : Math.max(p.far, b.h);
      }
    }

    // Sweeps: a live marked level is traded through.
    for (const l of levels.highs) if (l.live && !taken.has(l.name) && b.h > l.price) { taken.add(l.name); const s = sweep[-1]; if (s && i - s.last <= SWEEP_BARS) { s.last = i; s.names.push(l.name); } else sweep[-1] = { start: i, last: i, ext: b.h, extIdx: i, names: [l.name] }; }
    for (const l of levels.lows) if (l.live && !taken.has(l.name) && b.l < l.price) { taken.add(l.name); const s = sweep[1]; if (s && i - s.last <= SWEEP_BARS) { s.last = i; s.names.push(l.name); } else sweep[1] = { start: i, last: i, ext: b.l, extIdx: i, names: [l.name] }; }
    for (const dir of [-1, 1]) {
      const s = sweep[dir];
      if (!s) continue;
      if (i - s.last > SWEEP_BARS) { sweep[dir] = null; continue; }
      if (dir < 0 ? b.h > s.ext : b.l < s.ext) { s.ext = dir < 0 ? b.h : b.l; s.extIdx = i; }
    }

    // Break of structure after a sweep, in the direction of the daily bias.
    if (closeT > last || i === 0) continue;
    for (const dir of [-1, 1]) {
      const s = sweep[dir];
      if (!s) continue;
      const swing = dir < 0 ? st[i - 1].lo : st[i - 1].hi;
      if (swing == null || !(dir < 0 ? b.c < swing : b.c > swing)) continue;
      if (bias.daily !== dir) { mismatch = { dir, pool: s.names.join(' and ') }; continue; }
      const stop = s.ext - dir * BUFFER, pool = s.names.join(' and ');
      if (model === 1) {
        const risk = Math.abs(stop - b.c);
        if (risk < MIN_RISK) continue;
        const tgt = pickTarget(ctx, s5, levels, dir, b.c, risk, closeT);
        if (!tgt) continue;
        const trade = { dir, side: side(dir), signalT: closeT - BAR, entry: b.c, stop, risk, target: tgt.price, targetName: tgt.name, reason: `${pool} swept, then a 5-minute close ${dir < 0 ? 'below the last swing low' : 'above the last swing high'}` };
        const t = follow(ctx, trade, closeT, flat);
        return { ...base, swept: pool, phase: t.status === 'open' ? 'in-trade' : 'done', trade: t };
      }
      // T2: mark the gap and the order block left by the move; the entry rests at the edge nearest price.
      const edges = [];
      for (let k = i; k >= Math.max(2, s.extIdx + 1); k--) {
        const a = bars[k - 2], c = bars[k];
        if (dir < 0 ? a.l > c.h : a.h < c.l) { edges.push({ zone: 'fair value gap', price: dir < 0 ? c.h : c.l }); break; }
      }
      for (let k = s.extIdx; k >= Math.max(0, s.extIdx - OB_LOOKBACK); k--) {
        const x = bars[k];
        if (dir < 0 ? x.c > x.o : x.c < x.o) { edges.push({ zone: 'order block', price: dir < 0 ? x.l : x.h }); break; }
      }
      const usable = [];
      for (const e of edges) {
        const risk = Math.abs(stop - e.price);
        if (risk < MIN_RISK) continue;
        const tgt = pickTarget(ctx, s5, levels, dir, e.price, risk, closeT);
        if (tgt) usable.push({ ...e, risk, target: tgt });
      }
      sweep[dir] = null; // this sweep has had its break
      if (!usable.length) continue;
      let far = b.c;
      for (let k = s.extIdx; k <= i; k++) far = dir < 0 ? Math.min(far, bars[k].l) : Math.max(far, bars[k].h);
      pending = { dir, stop, ext: s.ext, far, edges: usable, pool, breakT: closeT };
    }
  }

  if (ctx.now >= last) return { ...base, phase: 'done', message: `No setup today. The entry window closed at ${w.lastLabel}.` };
  const out = [];
  if (pending) {
    const p = pending, mid = (p.ext + p.far) / 2;
    for (const e of p.edges.filter(e => (p.dir < 0 ? e.price >= mid : e.price <= mid)).sort((x, y) => (p.dir < 0 ? x.price - y.price : y.price - x.price)))
      out.push({ dir: p.dir, side: side(p.dir), kind: 'limit', trigger: e.price, stop: p.stop, risk: e.risk, target: e.target.price, pool: p.pool, zone: e.zone });
    if (out.length) return { ...base, swept: p.pool, phase: 'armed', pending: out, message: `${p.pool} swept and structure broke ${p.dir < 0 ? 'down' : 'up'}. Resting ${side(p.dir) === 'LONG' ? 'buy' : 'sell'} at the ${out[0].zone}; no trade if price does not pull back.` };
    return { ...base, swept: p.pool, phase: 'watching', message: `${p.pool} swept and structure broke, but the gap and order block are not in the favourable half of the move yet.` };
  }
  const s = sweep[bias.daily], lastBar = bars.at(-1);
  if (s && lastBar) {
    const dir = bias.daily, swing = dir < 0 ? st.at(-1).lo : st.at(-1).hi, pool = s.names.join(' and ');
    if (model === 1 && swing != null) {
      const stop = s.ext - dir * BUFFER, risk = Math.abs(stop - swing);
      const tgt = risk >= MIN_RISK ? pickTarget(ctx, s5, levels, dir, swing, risk, lastBar.t + M5) : null;
      if (tgt) out.push({ dir, side: side(dir), kind: 'close', trigger: swing, stop, risk, target: tgt.price, pool });
    }
    return { ...base, swept: pool, phase: 'armed', pending: out, message: `${pool} swept. Waiting for a 5-minute close ${dir < 0 ? 'below the last swing low' : 'above the last swing high'}${model === 2 ? ', then a pullback' : ''}.` };
  }
  if (mismatch) return { ...base, phase: 'watching', message: `${mismatch.pool} swept and structure broke ${mismatch.dir < 0 ? 'down' : 'up'}, but the daily bias is ${biasWord(bias.daily)}: ${only} only.` };
  return { ...base, phase: 'watching', message: `Daily bias is ${biasWord(bias.daily)}: ${only} only. Waiting for a marked ${bias.daily < 0 ? 'high' : 'low'} to be swept.` };
}

/** One evaluate function per entry model and window, in the shape every other setup uses. */
export const tjr = (model, windowId) => (ctx, key) => evaluate(model, windowId, ctx, key);
