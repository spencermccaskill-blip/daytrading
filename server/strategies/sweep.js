// Sweep + shift setups: a liquidity pool is run, then a 15-minute close breaks the last 3 bars.
import { BAR, etTime, addDays, isWeekday, utcKey } from '../time.js';
import { hiLo, openTrade, manage, withTrade, rth, MIN_RISK } from './common.js';

/** Core loop shared by the NY and evening versions. `bars` are today's closed bars; i0 = first index allowed to signal. */
function sweepShift(ctx, base, { bars, pools, open, lastSignal, flat, minIndex }) {
  const now = ctx.now;
  if (now < open) return { ...base, phase: 'waiting', message: `Pools are set. Nothing to do until ${base.openLabel}.` };
  let hi = -Infinity, lo = Infinity; const swept = { high: null, low: null };
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    if (b.t < open) continue;
    hi = Math.max(hi, b.h); lo = Math.min(lo, b.l);
    for (const p of pools.highs) if (b.h > p.price && !swept.high) swept.high = p.name;
    for (const p of pools.lows) if (b.l < p.price && !swept.low) swept.low = p.name;
    if (b.t > lastSignal || i < minIndex(bars)) continue;
    const prev = bars.slice(i - 3, i);
    for (const dir of [-1, 1]) {
      const ok = dir < 0 ? swept.high && b.c < Math.min(...prev.map(x => x.l)) : swept.low && b.c > Math.max(...prev.map(x => x.h));
      if (!ok) continue;
      const stop = dir < 0 ? hi + 1 : lo - 1;
      if (Math.abs(b.c - stop) < MIN_RISK) continue;
      const trade = openTrade(dir, b, stop, 2, `${dir < 0 ? swept.high : swept.low} swept, then a 15m close through the last 3 bars`);
      return withTrade({ ...base, swept }, manage(ctx, trade, flat));
    }
  }
  if (now >= lastSignal + BAR) return { ...base, phase: 'done', message: `No setup today. The signal window closed at ${base.lastLabel}.`, swept };
  const armed = swept.high || swept.low;
  const last3 = bars.slice(-3), pending = [];
  if (armed && last3.length === 3 && bars.length >= minIndex(bars)) {
    if (swept.high) { const trigger = Math.min(...last3.map(x => x.l)), stop = hi + 1, risk = stop - trigger; if (risk >= MIN_RISK) pending.push({ dir: -1, side: 'SHORT', trigger, stop, risk, target: trigger - 2 * risk, pool: swept.high }); }
    if (swept.low) { const trigger = Math.max(...last3.map(x => x.h)), stop = lo - 1, risk = trigger - stop; if (risk >= MIN_RISK) pending.push({ dir: 1, side: 'LONG', trigger, stop, risk, target: trigger + 2 * risk, pool: swept.low }); }
  }
  return {
    ...base, phase: armed ? 'armed' : 'watching', swept, pending,
    message: armed ? `${[swept.high, swept.low].filter(Boolean).join(' and ')} swept. Waiting for a 15m close through the last 3 bars.` : `No pool swept yet since ${base.openLabel}.`,
  };
}

const poolLevels = (pools) => [...pools.highs.map(p => ({ ...p, side: 'high' })), ...pools.lows.map(p => ({ ...p, side: 'low' }))];

/** Asian (00-07 UTC), London (2-5 ET) and prior-day ranges for a UTC date key. */
export function sessionRanges(ctx, key) {
  const day0 = Date.parse(key + 'T00:00Z');
  const asia = hiLo(ctx.s.between(day0, day0 + 7 * 36e5));
  const london = hiLo(ctx.s.between(etTime(key, 2), etTime(key, 5)));
  let prior = null;
  for (let k = addDays(key, -1), i = 0; i < 10; k = addDays(k, -1), i++) {
    if (!isWeekday(k)) continue;
    const t0 = Date.parse(k + 'T00:00Z');
    if (!ctx.s.between(t0, t0 + 864e5).length) continue; // most recent earlier weekday with any bars
    const pd = ctx.s.between(t0, t0 + 21 * 36e5);
    if (pd.length >= 40) prior = { ...hiLo(pd), date: k };
    break;
  }
  return { asia, london, prior };
}

export function nySweepShift(ctx, key) {
  const { asia, london, prior } = sessionRanges(ctx, key);
  const pools = {
    highs: [['Asian high', asia?.high], ['London high', london?.high], ['Prior day high', prior?.high]].filter(p => p[1] != null).map(([name, price]) => ({ name, price })),
    lows: [['Asian low', asia?.low], ['London low', london?.low], ['Prior day low', prior?.low]].filter(p => p[1] != null).map(([name, price]) => ({ name, price })),
  };
  const open = etTime(key, 9.5), lastSignal = etTime(key, 10.75), flat = etTime(key, 12);
  const base = { levels: poolLevels(pools), times: { open, lastSignal: lastSignal + BAR, flat }, openLabel: 'the New York open at 9:30 ET', lastLabel: '11:00 ET' };
  if (!asia || !london || !prior) return { ...base, phase: 'no-data', message: 'Waiting for enough history: needs the Asian session, London 2-5 ET and the prior day on the chart.' };
  const day0 = Date.parse(key + 'T00:00Z');
  return sweepShift(ctx, base, { bars: ctx.s.between(day0, day0 + 864e5), pools, open, lastSignal, flat, minIndex: () => 3 });
}

export function asiaSweep(ctx, key) {
  const open = etTime(key, 18), lastSignal = etTime(key, 21.75), flat = etTime(addDays(key, 1), 0);
  const day = rth(ctx, key), r = day.length >= 20 ? hiLo(day) : null;
  const pools = { highs: r ? [{ name: 'Day high', price: r.high }] : [], lows: r ? [{ name: 'Day low', price: r.low }] : [] };
  const base = { levels: poolLevels(pools), times: { open, lastSignal: lastSignal + BAR, flat }, openLabel: 'the reopen at 4:00 PM Denver', lastLabel: '8:00 PM Denver' };
  if (!r) return { ...base, phase: 'no-data', message: "Waiting for today's regular-hours range (9:30-16:00 ET) on the chart." };
  const bars = ctx.s.between(open, flat);
  return sweepShift(ctx, base, { bars, pools, open, lastSignal, flat, minIndex: () => 3 });
}
