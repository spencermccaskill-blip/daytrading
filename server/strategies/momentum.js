// Breakout and momentum setups from the published papers, in their 15-minute forms.
import { BAR, etTime, addDays } from '../time.js';
import { hiLo, openTrade, manage, withTrade, rth, priorDays, atr15, priorClose, vwapMap, MIN_RISK } from './common.js';

const NEED = 'Waiting for enough history: needs about 10 earlier trading days on the chart.';

/** N2. Opening range breakout on the 9:30 bar (Zarattini & Aziz, 15-minute form). */
export function nyOrb15(ctx, key) {
  const open = etTime(key, 9.5), flat = etTime(key, 16);
  const base = { levels: [], times: { open, lastSignal: open + BAR, flat } };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the New York open at 9:30 ET.' };
  const b = ctx.s.at(open);
  if (!b) return ctx.now >= open + 2 * BAR ? { ...base, phase: 'done', message: 'No 9:30 bar today.' } : { ...base, phase: 'watching', message: 'First 15 minutes are forming. Direction is set at 9:45 ET.' };
  const levels = [{ name: 'Opening range high', price: b.h, side: 'high' }, { name: 'Opening range low', price: b.l, side: 'low' }];
  const dir = Math.sign(b.c - b.o);
  if (!dir) return { ...base, levels, phase: 'done', message: 'The first bar closed where it opened. No trade today.' };
  const stop = dir > 0 ? b.l : b.h;
  if (Math.abs(b.c - stop) < MIN_RISK) return { ...base, levels, phase: 'done', message: 'The stop would be closer than 5 points. No trade today.' };
  return withTrade({ ...base, levels }, manage(ctx, openTrade(dir, b, stop, 10, `First 15m bar closed ${dir > 0 ? 'up' : 'down'}`), flat));
}

/** Shared set-up for the three midday setups: today's regular-hours bars, lookbacks, VWAP. */
function midday(ctx, key) {
  const days = priorDays(ctx, key), atr = atr15(ctx, days), pc = priorClose(ctx, days);
  const today = rth(ctx, key), vwap = vwapMap(today);
  return { days, atr, pc, today, vwap, open: etTime(key, 9.5), flat: etTime(key, 16) };
}

/** M1. Noise-area breakout (Zarattini, Aziz & Barbon), entries from the 12:00 close. */
export function nymidNoise(ctx, key) {
  const m = midday(ctx, key), first = etTime(key, 11.75), last = etTime(key, 15.25);
  const base = { levels: [], times: { open: first + BAR, lastSignal: last + BAR, flat: m.flat } };
  const o = ctx.s.at(m.open)?.o;
  if (m.atr == null || m.pc == null) return { ...base, phase: 'no-data', message: NEED };
  if (ctx.now < first + BAR || o == null) return { ...base, phase: 'waiting', message: 'First check is the 12:00 ET close.' };
  // Band at a check bar: average absolute move from the open at that time of day over the prior days.
  const band = (t) => {
    const off = t - etTime(key, 0); let sum = 0, n = 0;
    for (const k of m.days) { const b = ctx.s.at(etTime(k, 0) + off), o0 = ctx.s.at(etTime(k, 9.5)); if (b && o0) { sum += Math.abs(b.c / o0.o - 1); n++; } }
    if (n < 10) return null;
    const sg = sum / n;
    return { upper: Math.max(o, m.pc) * (1 + sg), lower: Math.min(o, m.pc) * (1 - sg) };
  };
  const isCheck = (t) => t >= first && t <= last && ((t - first) / BAR) % 2 === 0;
  let lastBand = null;
  for (const b of m.today) {
    if (!isCheck(b.t)) continue;
    const bd = band(b.t); if (!bd) continue;
    lastBand = bd;
    const dir = b.c > bd.upper ? 1 : b.c < bd.lower ? -1 : 0;
    if (!dir) continue;
    const trade = openTrade(dir, b, b.c - dir * 3 * m.atr, null, `12:00+ close ${dir > 0 ? 'above' : 'below'} the noise band`);
    const leave = (x) => { if (!isCheck(x.t)) return false; const g = band(x.t), v = m.vwap.get(x.t); if (!g || v == null) return false; return dir > 0 ? x.c < Math.max(g.upper, v) : x.c > Math.min(g.lower, v); };
    return withTrade({ ...base, levels: bandLevels(bd) }, manage(ctx, trade, m.flat, leave));
  }
  const levels = lastBand ? bandLevels(lastBand) : [];
  if (ctx.now >= last + 2 * BAR) return { ...base, levels, phase: 'done', message: 'Price stayed inside the noise band. No trade today.' };
  return { ...base, levels, phase: 'watching', message: 'Inside the noise band. Checks every half hour until 15:30 ET.' };
}
const bandLevels = (b) => [{ name: 'Noise band top', price: b.upper, side: 'high' }, { name: 'Noise band bottom', price: b.lower, side: 'low' }];

/** M2. Last half-hour momentum (Gao, Han, Li & Zhou). */
export function nymidLast30(ctx, key) {
  const m = midday(ctx, key), sig = etTime(key, 15.25);
  const base = { levels: m.pc != null ? [{ name: 'Prior close', price: m.pc, side: 'mid' }] : [], times: { open: sig + BAR, lastSignal: sig + BAR, flat: m.flat } };
  if (m.atr == null || m.pc == null) return { ...base, phase: 'no-data', message: NEED };
  const b = ctx.s.at(sig);
  if (!b) return ctx.now >= sig + 2 * BAR ? { ...base, phase: 'done', message: 'No 15:15 bar today.' } : { ...base, phase: ctx.now >= etTime(key, 12) ? 'watching' : 'waiting', message: 'Decision is at the 15:30 ET close: up on the day is long, down is short.' };
  const dir = Math.sign(b.c - m.pc);
  if (!dir) return { ...base, phase: 'done', message: 'Flat on the day at 15:30. No trade.' };
  return withTrade(base, manage(ctx, openTrade(dir, b, b.c - dir * 2 * m.atr, null, `${dir > 0 ? 'Up' : 'Down'} on the day at 15:30 ET`), m.flat));
}

/** M3. VWAP trend, one decision at the 12:00 close (Zarattini & Aziz). */
export function nymidVwap(ctx, key) {
  const m = midday(ctx, key), sig = etTime(key, 11.75);
  const vNow = m.today.length ? m.vwap.get(m.today.at(-1).t) : null;
  const base = { levels: vNow != null ? [{ name: 'VWAP', price: vNow, side: 'mid' }] : [], times: { open: sig + BAR, lastSignal: sig + BAR, flat: m.flat } };
  if (m.atr == null) return { ...base, phase: 'no-data', message: NEED };
  const b = ctx.s.at(sig), v = m.vwap.get(sig);
  if (!b || v == null) return ctx.now >= sig + 2 * BAR ? { ...base, phase: 'done', message: 'No 11:45 bar today.' } : { ...base, phase: 'waiting', message: 'Decision is at the 12:00 ET close: above VWAP is long, below is short.' };
  const dir = Math.sign(b.c - v);
  if (!dir) return { ...base, phase: 'done', message: 'Closed exactly on VWAP. No trade.' };
  const leave = (x) => { const w = m.vwap.get(x.t); return w != null && (dir > 0 ? x.c < w : x.c > w); };
  return withTrade(base, manage(ctx, openTrade(dir, b, b.c - dir * 3 * m.atr, null, `12:00 ET close ${dir > 0 ? 'above' : 'below'} VWAP`), m.flat, leave));
}

/** A1. Evening range breakout: the first 30 minutes after the 18:00 ET reopen. */
export function asiaOrb(ctx, key) {
  const open = etTime(key, 18), first = etTime(key, 18.5), last = etTime(key, 21.75), flat = etTime(addDays(key, 1), 0);
  const base = { levels: [], times: { open: first, lastSignal: last + BAR, flat } };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the reopen at 4:00 PM Denver.' };
  const rb = ctx.s.between(open, first);
  if (rb.length < 2) return ctx.now >= first + BAR ? { ...base, phase: 'done', message: 'The opening 30 minutes are missing from the chart.' } : { ...base, phase: 'watching', message: 'The opening range is forming until 4:30 PM Denver.' };
  const r = hiLo(rb), levels = [{ name: 'Evening range high', price: r.high, side: 'high' }, { name: 'Evening range low', price: r.low, side: 'low' }];
  for (const b of ctx.s.between(first, last + BAR)) {
    const dir = b.c > r.high ? 1 : b.c < r.low ? -1 : 0;
    if (!dir) continue;
    const stop = dir > 0 ? r.low - 1 : r.high + 1;
    if (Math.abs(b.c - stop) < MIN_RISK) return { ...base, levels, phase: 'done', message: 'The stop would be closer than 5 points. No trade today.' };
    return withTrade({ ...base, levels }, manage(ctx, openTrade(dir, b, stop, 2, `15m close ${dir > 0 ? 'above' : 'below'} the evening range`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, levels, phase: 'done', message: 'No close outside the range. No trade today.' };
  const pending = [
    { dir: 1, side: 'LONG', trigger: r.high, stop: r.low - 1, risk: r.high - r.low + 1, target: r.high + 2 * (r.high - r.low + 1) },
    { dir: -1, side: 'SHORT', trigger: r.low, stop: r.high + 1, risk: r.high - r.low + 1, target: r.low - 2 * (r.high - r.low + 1) },
  ];
  return { ...base, levels, phase: 'armed', pending, message: 'Range is set. Waiting for a 15m close outside it.' };
}
