// Widely taught setups, in 15-minute form. None has an audited track record: each is shown with
// its own tested win rate as a score. Rules match the 2026-11-20 addendum in research/PREREGISTRATION.md.
import { BAR, etTime, londonTime, addDays } from '../time.js';
import { hiLo, openTrade, manage, withTrade, rth, vwapMap, MIN_RISK } from './common.js';
import { sessionRanges } from './sweep.js';

const pair = (name, r) => [{ name: `${name} high`, price: r.high, side: 'high' }, { name: `${name} low`, price: r.low, side: 'low' }];
/** A trade whose target is a price level instead of a multiple of the risk. */
const toLevel = (dir, bar, stop, target, reason) => ({ ...openTrade(dir, bar, stop, null, reason), target });
const mid = (r) => (r.high + r.low) / 2;

/** A3. Evening range fade: a poke outside the first hour's range that closes back inside. */
export function asiaFade(ctx, key) {
  const open = etTime(key, 18), set = etTime(key, 19), last = etTime(key, 21.75), flat = etTime(addDays(key, 1), 0);
  const base = { levels: [], times: { open: set, lastSignal: last + BAR, flat } };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the reopen at 4:00 PM Denver.' };
  const rb = ctx.s.between(open, set);
  if (rb.length < 4) return ctx.now >= set + BAR ? { ...base, phase: 'done', message: 'The first hour is missing from the data.' } : { ...base, phase: 'watching', message: 'The first-hour range is forming until 5:00 PM Denver.' };
  const r = hiLo(rb), levels = pair('Evening range', r);
  for (const b of ctx.s.between(set, last + BAR)) {
    const up = b.h > r.high, down = b.l < r.low, inside = b.c < r.high && b.c > r.low;
    if (!inside || up === down) continue;
    const dir = up ? -1 : 1, stop = up ? b.h + 1 : b.l - 1, target = up ? r.low : r.high, risk = Math.abs(b.c - stop);
    if (risk < MIN_RISK || Math.abs(target - b.c) < risk) continue;
    return withTrade({ ...base, levels }, manage(ctx, toLevel(dir, b, stop, target, `Poke ${up ? 'above' : 'below'} the evening range closed back inside`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, levels, phase: 'done', message: 'No failed poke outside the range. No trade today.' };
  return { ...base, levels, phase: 'watching', message: 'Range is set. Waiting for a poke outside it that closes back inside.' };
}

function london(ctx, key) {
  const open = londonTime(key, 8), flat = londonTime(key, 12), day0 = Date.parse(key + 'T00:00Z');
  const ab = ctx.s.between(day0, open);
  return { open, flat, last: londonTime(key, 10.75), asia: ab.length >= 8 ? hiLo(ab) : null };
}
const NO_ASIA = 'Waiting for the overnight range (midnight UTC to the London open) to load.';

/** L1. London sweep + reclaim ("Judas swing"). */
export function londonSweep(ctx, key) {
  const L = london(ctx, key), base = { levels: L.asia ? pair('Asian', L.asia) : [], times: { open: L.open, lastSignal: L.last + BAR, flat: L.flat } };
  if (!L.asia) return { ...base, phase: 'no-data', message: NO_ASIA };
  if (ctx.now < L.open) return { ...base, phase: 'waiting', message: 'Asian range is set. Nothing to do until the London open.' };
  let hi = -Infinity, lo = Infinity, swH = false, swL = false;
  for (const b of ctx.s.between(L.open, L.flat)) {
    hi = Math.max(hi, b.h); lo = Math.min(lo, b.l);
    if (b.h > L.asia.high) swH = true; if (b.l < L.asia.low) swL = true;
    if (b.t > L.last) continue;
    for (const dir of [-1, 1]) {
      if (!(dir < 0 ? swH && b.c < L.asia.high : swL && b.c > L.asia.low)) continue;
      const stop = dir < 0 ? hi + 1 : lo - 1;
      if (Math.abs(b.c - stop) < MIN_RISK) continue;
      return withTrade(base, manage(ctx, openTrade(dir, b, stop, 2, `Asian ${dir < 0 ? 'high' : 'low'} swept, then a close back inside`), L.flat));
    }
  }
  if (ctx.now >= L.last + 2 * BAR) return { ...base, phase: 'done', message: 'No sweep and reclaim. No trade today.' };
  return { ...base, phase: swH || swL ? 'armed' : 'watching', pending: [], message: swH || swL ? `Asian ${swH ? 'high' : 'low'} swept. Waiting for a 15m close back inside the range.` : 'Inside the Asian range. Waiting for a sweep.' };
}

/** L2. London breakout of the Asian range. */
export function londonBreakout(ctx, key) {
  const L = london(ctx, key), base = { levels: L.asia ? pair('Asian', L.asia) : [], times: { open: L.open, lastSignal: L.last + BAR, flat: L.flat } };
  if (!L.asia) return { ...base, phase: 'no-data', message: NO_ASIA };
  if (ctx.now < L.open) return { ...base, phase: 'waiting', message: 'Asian range is set. Nothing to do until the London open.' };
  for (const b of ctx.s.between(L.open, L.last + BAR)) {
    const dir = b.c > L.asia.high ? 1 : b.c < L.asia.low ? -1 : 0;
    if (!dir) continue;
    const stop = mid(L.asia);
    if (Math.abs(b.c - stop) < MIN_RISK) return { ...base, phase: 'done', message: 'The stop would be closer than 5 points. No trade today.' };
    return withTrade(base, manage(ctx, openTrade(dir, b, stop, 2, `15m close ${dir > 0 ? 'above' : 'below'} the Asian range`), L.flat));
  }
  if (ctx.now >= L.last + 2 * BAR) return { ...base, phase: 'done', message: 'No close outside the Asian range. No trade today.' };
  const m = mid(L.asia), up = L.asia.high - m;
  return { ...base, phase: 'armed', message: 'Waiting for a 15m close outside the Asian range.', pending: up >= MIN_RISK ? [{ dir: 1, side: 'LONG', trigger: L.asia.high, stop: m, risk: up, target: L.asia.high + 2 * up }, { dir: -1, side: 'SHORT', trigger: L.asia.low, stop: m, risk: up, target: L.asia.low - 2 * up }] : [] };
}

/** L3. London opening range breakout: the first 30 minutes. */
export function londonOrb(ctx, key) {
  const open = londonTime(key, 8), first = londonTime(key, 8.5), last = londonTime(key, 10.25), flat = londonTime(key, 12);
  const base = { levels: [], times: { open: first, lastSignal: last + BAR, flat } };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the London open.' };
  const rb = ctx.s.between(open, first);
  if (rb.length < 2) return ctx.now >= first + BAR ? { ...base, phase: 'done', message: 'The opening 30 minutes are missing from the data.' } : { ...base, phase: 'watching', message: 'The London opening range is forming.' };
  const r = hiLo(rb), levels = pair('London open range', r);
  for (const b of ctx.s.between(first, last + BAR)) {
    const dir = b.c > r.high ? 1 : b.c < r.low ? -1 : 0;
    if (!dir) continue;
    const stop = dir > 0 ? r.low - 1 : r.high + 1;
    if (Math.abs(b.c - stop) < MIN_RISK) return { ...base, levels, phase: 'done', message: 'The stop would be closer than 5 points. No trade today.' };
    return withTrade({ ...base, levels }, manage(ctx, openTrade(dir, b, stop, 2, `15m close ${dir > 0 ? 'above' : 'below'} the London opening range`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, levels, phase: 'done', message: 'No close outside the opening range. No trade today.' };
  const w = r.high - r.low + 1;
  return { ...base, levels, phase: 'armed', message: 'Range is set. Waiting for a 15m close outside it.', pending: [{ dir: 1, side: 'LONG', trigger: r.high, stop: r.low - 1, risk: w, target: r.high + 2 * w }, { dir: -1, side: 'SHORT', trigger: r.low, stop: r.high + 1, risk: w, target: r.low - 2 * w }] };
}

/** N3. Initial balance breakout: the first hour of New York. */
export function nyInitialBalance(ctx, key) {
  const open = etTime(key, 9.5), set = etTime(key, 10.5), last = etTime(key, 11.75), flat = etTime(key, 16);
  const base = { levels: [], times: { open: set, lastSignal: last + BAR, flat } };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the New York open at 9:30 ET.' };
  const ib = ctx.s.between(open, set);
  if (ib.length < 4) return ctx.now >= set + BAR ? { ...base, phase: 'done', message: 'The first hour is missing from the data.' } : { ...base, phase: 'watching', message: 'The initial balance (first hour) is forming until 10:30 ET.' };
  const r = hiLo(ib), levels = pair('Initial balance', r), half = (r.high - r.low) / 2;
  for (const b of ctx.s.between(set, last + BAR)) {
    const dir = b.c > r.high ? 1 : b.c < r.low ? -1 : 0;
    if (!dir) continue;
    const stop = mid(r), target = dir > 0 ? r.high + half : r.low - half;
    if (Math.abs(b.c - stop) < MIN_RISK || dir * (target - b.c) <= 0) return { ...base, levels, phase: 'done', message: 'The breakout bar already reached the target. No trade today.' };
    return withTrade({ ...base, levels }, manage(ctx, toLevel(dir, b, stop, target, `15m close ${dir > 0 ? 'above' : 'below'} the initial balance`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, levels, phase: 'done', message: 'No close outside the initial balance. No trade today.' };
  return { ...base, levels, phase: 'armed', message: 'Initial balance is set. Waiting for a 15m close outside it.', pending: half >= MIN_RISK ? [{ dir: 1, side: 'LONG', trigger: r.high, stop: mid(r), risk: half, target: r.high + half }, { dir: -1, side: 'SHORT', trigger: r.low, stop: mid(r), risk: half, target: r.low - half }] : [] };
}

/** N4. Silver Bullet, 15-minute form: a pool is swept, then a fair value gap forms the other way by 11:00 ET. */
export function nySilverBullet(ctx, key) {
  const { asia, london: lon, prior } = sessionRanges(ctx, key);
  const open = etTime(key, 9.5), first = etTime(key, 9.75), last = etTime(key, 10.75), flat = etTime(key, 12);
  const highs = [asia?.high, lon?.high, prior?.high].filter(x => x != null), lows = [asia?.low, lon?.low, prior?.low].filter(x => x != null);
  const base = { levels: [], times: { open, lastSignal: last + BAR, flat } };
  if (!asia || !lon || !prior) return { ...base, phase: 'no-data', message: 'Waiting for enough history: needs the Asian session, London 2-5 ET and the prior day.' };
  if (ctx.now < open) return { ...base, phase: 'waiting', message: 'Nothing to do until the New York open at 9:30 ET.' };
  const day0 = Date.parse(key + 'T00:00Z'), bars = ctx.s.between(day0, day0 + 864e5);
  let swH = false, swL = false;
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    if (b.t < open) continue;
    if (highs.some(x => b.h > x)) swH = true; if (lows.some(x => b.l < x)) swL = true;
    if (b.t < first || b.t > last || i < 2) continue;
    const a = bars[i - 2];
    const dir = swL && b.l > a.h ? 1 : swH && b.h < a.l ? -1 : 0;
    if (!dir) continue;
    const stop = dir > 0 ? a.l - 1 : a.h + 1;
    if (Math.abs(b.c - stop) < MIN_RISK) continue;
    return withTrade(base, manage(ctx, openTrade(dir, b, stop, 2, `Pool swept, then a fair value gap ${dir > 0 ? 'up' : 'down'}`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, phase: 'done', message: 'No fair value gap after a sweep by 11:00 ET. No trade today.' };
  return { ...base, phase: swH || swL ? 'armed' : 'watching', pending: [], message: swH || swL ? `A ${swH && swL ? 'high and a low' : swH ? 'high' : 'low'} was swept. Waiting for a fair value gap the other way before 11:00 ET.` : 'No pool swept yet since 9:30 ET.' };
}

/** M4. VWAP bounce: a touch of VWAP that closes back on the trend side. */
export function nymidVwapBounce(ctx, key) {
  const first = etTime(key, 12), last = etTime(key, 15), flat = etTime(key, 16);
  const today = rth(ctx, key), vwap = vwapMap(today), vNow = today.length ? vwap.get(today.at(-1).t) : null;
  const base = { levels: vNow != null ? [{ name: 'VWAP', price: vNow, side: 'mid' }] : [], times: { open: first, lastSignal: last + BAR, flat } };
  if (ctx.now < first) return { ...base, phase: 'waiting', message: 'Looks for a VWAP bounce from 12:00 ET.' };
  for (let i = 3; i < today.length; i++) {
    const b = today[i], v = vwap.get(b.t);
    if (b.t < first || b.t > last) continue;
    const prev = today.slice(i - 3, i);
    const dir = prev.every(p => p.c > vwap.get(p.t)) && b.l <= v && b.c > v ? 1 : prev.every(p => p.c < vwap.get(p.t)) && b.h >= v && b.c < v ? -1 : 0;
    if (!dir) continue;
    const stop = dir > 0 ? b.l - 1 : b.h + 1;
    if (Math.abs(b.c - stop) < MIN_RISK) continue;
    return withTrade(base, manage(ctx, openTrade(dir, b, stop, 2, `Touched VWAP and closed back ${dir > 0 ? 'above' : 'below'} it`), flat));
  }
  if (ctx.now >= last + 2 * BAR) return { ...base, phase: 'done', message: 'No VWAP bounce today.' };
  return { ...base, phase: 'watching', message: 'Waiting for price to touch VWAP and close back on the trend side.' };
}
