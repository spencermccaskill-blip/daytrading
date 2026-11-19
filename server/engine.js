// NQ Desk engine: turns raw bars from TradingView into session levels and setup states.
// The NY model here mirrors the backtest rules exactly (15-minute bars, closed bars only).

export const BAR = 15 * 60 * 1000;
const HOUR = 36e5, DAY = 864e5;

// ── Clock helpers ─────────────────────────────────────────
const nthSunday = (y, m, n) => {
  const d = new Date(Date.UTC(y, m, 1));
  return Date.UTC(y, m, 1 + ((7 - d.getUTCDay()) % 7) + 7 * (n - 1));
};
/** Offset of New York time from UTC in hours (-4 in daylight saving, -5 otherwise). */
export function etOffset(t) {
  const y = new Date(t).getUTCFullYear();
  const start = nthSunday(y, 2, 2) + 7 * HOUR, end = nthSunday(y, 10, 1) + 6 * HOUR;
  return t >= start && t < end ? -4 : -5;
}
export const utcHour = (t) => (((t % DAY) + DAY) % DAY) / HOUR;
export const dateKey = (t) => new Date(t).toISOString().slice(0, 10);
const isWeekday = (k) => ![0, 6].includes(new Date(k + 'T12:00Z').getUTCDay());
/** ms timestamp of a New York wall-clock time (hours, e.g. 9.5) on a UTC date key. */
export const etTime = (k, h) => { const noon = Date.parse(k + 'T12:00Z'); return Date.parse(k + 'T00:00Z') + (h - etOffset(noon)) * HOUR; };

// ── Bar store ─────────────────────────────────────────────
export class BarStore {
  constructor() { this.raw = new Map(); this.bars = new Map(); this.lastRawT = 0; this.resMin = null; }

  /** rows: [[tSec, o, h, l, c, v], ...] from the chart, resMin: chart resolution in minutes */
  ingest(rows, resMin) {
    if (!Array.isArray(rows) || !rows.length) return 0;
    if (this.resMin && resMin !== this.resMin) { this.raw.clear(); this.bars.clear(); }
    this.resMin = resMin;
    const touched = new Set();
    for (const r of rows) {
      const t = r[0] * 1000;
      if (!Number.isFinite(t) || ![r[1], r[2], r[3], r[4]].every(Number.isFinite)) continue;
      this.raw.set(t, { t, o: r[1], h: r[2], l: r[3], c: r[4], v: r[5] || 0 });
      touched.add(Math.floor(t / BAR) * BAR);
      if (t > this.lastRawT) this.lastRawT = t;
    }
    for (const b of touched) this.#rebuild(b);
    return rows.length;
  }

  #rebuild(start) {
    const parts = [];
    for (let t = start; t < start + BAR; t += 60000) { const r = this.raw.get(t); if (r) parts.push(r); }
    if (!parts.length) return;
    this.bars.set(start, {
      t: start, o: parts[0].o, h: Math.max(...parts.map(p => p.h)), l: Math.min(...parts.map(p => p.l)),
      c: parts.at(-1).c, v: parts.reduce((a, p) => a + p.v, 0),
    });
  }

  /** Latest raw bar (live price). */
  last() { return this.raw.get(this.lastRawT) || null; }
  /** A 15m bar is closed once the feed has moved past its end. */
  isClosed(b) { return this.lastRawT >= b.t + BAR; }
  sorted() { return [...this.bars.values()].sort((a, b) => a.t - b.t); }
  rawAfter(t) { return [...this.raw.values()].filter(r => r.t >= t).sort((a, b) => a.t - b.t); }
  toJSON() { return { resMin: this.resMin, raw: [...this.raw.values()] }; }
  load(j) { if (!j?.raw) return; this.ingest(j.raw.map(b => [b.t / 1000, b.o, b.h, b.l, b.c, b.v]), j.resMin); }
}

// ── Levels ───────────────────────────────────────────────
export function levels(store) {
  const bars = store.sorted();
  if (!bars.length || !store.lastRawT) return null;
  const k = dateKey(store.lastRawT);
  const byDay = new Map();
  for (const b of bars) { const d = dateKey(b.t); if (!byDay.has(d)) byDay.set(d, []); byDay.get(d).push(b); }
  const days = [...byDay.keys()].filter(isWeekday).sort();
  const today = byDay.get(k) || [];
  const prevKey = days.filter(d => d < k).at(-1);
  const off = etOffset(Date.parse(k + 'T12:00Z'));
  const et = (b) => utcHour(b.t) + off;
  const hiLo = (a) => a.length ? { high: Math.max(...a.map(b => b.h)), low: Math.min(...a.map(b => b.l)), bars: a.length } : null;

  const asia = hiLo(today.filter(b => utcHour(b.t) < 7));
  const london = hiLo(today.filter(b => et(b) >= 2 && et(b) < 5));
  const pdBars = prevKey ? byDay.get(prevKey).filter(b => utcHour(b.t) < 21) : [];
  const prior = pdBars.length >= 40 ? { ...hiLo(pdBars), open: pdBars[0].o, close: pdBars.at(-1).c, date: prevKey } : null;

  // 20-day trend reference (prior closes), informational
  const closes = days.filter(d => d < k).map(d => byDay.get(d).filter(b => utcHour(b.t) < 21)).filter(a => a.length >= 40).map(a => a.at(-1).c);
  const sma20 = closes.length >= 20 ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20 : null;

  const vwapFrom = (t0) => {
    let pv = 0, v = 0;
    for (const r of store.rawAfter(t0)) { if (dateKey(r.t) !== k) continue; const w = r.v || 1; pv += ((r.h + r.l + r.c) / 3) * w; v += w; }
    return v ? pv / v : null;
  };
  return {
    date: k, etOffset: off, today, et,
    asia, london, prior, sma20,
    londonVwap: utcHour(store.lastRawT) >= 7 ? vwapFrom(Date.parse(k + 'T07:00Z')) : null,
    nyVwap: store.lastRawT >= etTime(k, 9.5) ? vwapFrom(etTime(k, 9.5)) : null,
  };
}

// ── Trade management shared by both setups ───────────────
function manage(store, trade, endT) {
  // Exit detection on raw (live) bars after the signal bar closed.
  let state = 'open', exitPx = null;
  for (const r of store.rawAfter(trade.signalT + BAR)) {
    if (r.t >= endT) { state = 'time'; break; }
    const hitStop = trade.dir > 0 ? r.l <= trade.stop : r.h >= trade.stop;
    const hitTgt = trade.dir > 0 ? r.h >= trade.target : r.l <= trade.target;
    if (hitStop) { state = 'stopped'; exitPx = trade.stop; break; }
    if (hitTgt) { state = 'target'; exitPx = trade.target; break; }
  }
  const last = store.last();
  if (state === 'open' && store.lastRawT >= endT) state = 'time';
  if (state === 'time') exitPx = store.rawAfter(trade.signalT).filter(r => r.t < endT).at(-1)?.c ?? last.c;
  const px = exitPx ?? last.c;
  return { ...trade, status: state, exitPx, rNow: (trade.dir * (px - trade.entry)) / trade.risk };
}

const sizeFor = (risk, budget, pointValue) => Math.floor(budget / (risk * pointValue));

// ── NY sweep + structure shift (backtested model A) ──────
export function nyModel(store, L, cfg) {
  const k = L.date, open = etTime(k, 9.5), lastSignal = etTime(k, 10.75), flat = etTime(k, 12);
  const pools = {
    highs: [['Asian high', L.asia?.high], ['London high', L.london?.high], ['Prior day high', L.prior?.high]].filter(p => p[1] != null),
    lows: [['Asian low', L.asia?.low], ['London low', L.london?.low], ['Prior day low', L.prior?.low]].filter(p => p[1] != null),
  };
  const base = { id: 'ny', name: 'NY sweep + shift', window: '9:45–11:00 ET signals · flat 12:00 ET', pools };
  if (!L.asia || !L.london || !L.prior) return { ...base, phase: 'no-data', message: 'Waiting for enough history: needs the Asian session, London 2–5 ET and the prior day on the chart.' };
  const now = store.lastRawT;
  if (now < open) return { ...base, phase: 'waiting', message: 'Pools are set. Nothing to do until the New York open at 9:30 ET.' };

  const bars = L.today; let hi = -Infinity, lo = Infinity, swept = { high: null, low: null };
  for (let i = 0; i < bars.length; i++) {
    const b = bars[i];
    if (b.t < open) continue;
    if (!store.isClosed(b)) break;
    hi = Math.max(hi, b.h); lo = Math.min(lo, b.l);
    for (const [n, x] of pools.highs) if (b.h > x && !swept.high) swept.high = n;
    for (const [n, x] of pools.lows) if (b.l < x && !swept.low) swept.low = n;
    if (b.t > lastSignal || i < 3) continue;
    const prev = bars.slice(i - 3, i);
    for (const dir of [-1, 1]) {
      const ok = dir < 0 ? swept.high && b.c < Math.min(...prev.map(x => x.l)) : swept.low && b.c > Math.max(...prev.map(x => x.h));
      if (!ok) continue;
      const stop = dir < 0 ? hi + 1 : lo - 1, risk = Math.abs(b.c - stop);
      if (risk < 5) continue;
      const trade = {
        dir, side: dir > 0 ? 'LONG' : 'SHORT', signalT: b.t, entry: b.c, stop, risk,
        target: b.c + dir * 2 * risk, reason: `${dir < 0 ? swept.high : swept.low} swept, then a 15m close through the last 3 bars`,
        contracts: sizeFor(risk, cfg.riskBudget, cfg.pointValue),
      };
      const m = manage(store, trade, flat);
      return { ...base, phase: m.status === 'open' ? 'in-trade' : 'done', trade: m, swept, sessionHigh: hi, sessionLow: lo };
    }
  }
  if (now >= lastSignal + BAR)
    return { ...base, phase: 'done', message: 'No setup today. The signal window closed at 11:00 ET.', swept };
  const phase = swept.high || swept.low ? 'armed' : 'watching';
  // What would trigger next: the 15m close level that completes the shift, with its stop and 2R target.
  const closed = bars.filter(b => store.isClosed(b));
  const last3 = closed.slice(-3);
  const pending = [];
  if (last3.length === 3) {
    const live = bars.find(b => !store.isClosed(b));
    const hiNow = Math.max(hi, live && live.t >= open ? live.h : -Infinity), loNow = Math.min(lo, live && live.t >= open ? live.l : Infinity);
    if (swept.high) {
      const trigger = Math.min(...last3.map(x => x.l)), stop = hiNow + 1, risk = stop - trigger;
      if (risk >= 5) pending.push({ dir: -1, side: 'SHORT', trigger, stop, risk, target: trigger - 2 * risk, contracts: sizeFor(risk, cfg.riskBudget, cfg.pointValue), pool: swept.high });
    }
    if (swept.low) {
      const trigger = Math.max(...last3.map(x => x.h)), stop = loNow - 1, risk = trigger - stop;
      if (risk >= 5) pending.push({ dir: 1, side: 'LONG', trigger, stop, risk, target: trigger + 2 * risk, contracts: sizeFor(risk, cfg.riskBudget, cfg.pointValue), pool: swept.low });
    }
  }
  const message = phase === 'armed'
    ? `${[swept.high, swept.low].filter(Boolean).join(' and ')} swept. Waiting for a 15m close through the last 3 bars.`
    : 'No pool swept yet since 9:30 ET.';
  return { ...base, phase, message, swept, sessionHigh: hi, sessionLow: lo, pending: phase === 'armed' ? pending : [] };
}

// ── London playbook sweep-and-reclaim (backtest negative; shown for reference) ──
export function londonModel(store, L, cfg) {
  const k = L.date, start = Date.parse(k + 'T07:00Z'), end = Date.parse(k + 'T11:00Z');
  const base = { id: 'london', name: 'London sweep + reclaim', window: '07:00–11:00 UTC' };
  if (!L.asia) return { ...base, phase: 'no-data', message: 'Waiting for the Asian range (00:00–07:00 UTC).' };
  const now = store.lastRawT;
  if (now < start) return { ...base, phase: 'waiting', message: 'Asian range still building.' };
  let hi = -Infinity, lo = Infinity, swH = false, swL = false;
  for (const b of L.today) {
    if (b.t < start || b.t >= end) continue;
    if (!store.isClosed(b)) break;
    hi = Math.max(hi, b.h); lo = Math.min(lo, b.l);
    if (b.h > L.asia.high) swH = true; if (b.l < L.asia.low) swL = true;
    for (const dir of [-1, 1]) {
      const ok = dir < 0 ? swH && b.c < L.asia.high : swL && b.c > L.asia.low;
      if (!ok) continue;
      const stop = dir < 0 ? hi + 1 : lo - 1, risk = Math.abs(b.c - stop);
      if (risk < 5) continue;
      const trade = { dir, side: dir > 0 ? 'LONG' : 'SHORT', signalT: b.t, entry: b.c, stop, risk, target: b.c + dir * 2 * risk, reason: `Asian ${dir < 0 ? 'high' : 'low'} swept and reclaimed`, contracts: sizeFor(risk, cfg.riskBudget, cfg.pointValue) };
      const m = manage(store, trade, end);
      return { ...base, phase: m.status === 'open' ? 'in-trade' : 'done', trade: m };
    }
  }
  if (now >= end) return { ...base, phase: 'done', message: 'London window closed with no reclaim.' };
  return { ...base, phase: swH || swL ? 'armed' : 'watching', message: swH || swL ? `Asian ${swH ? 'high' : 'low'} swept. Waiting for a 15m close back inside.` : 'Inside the Asian range.' };
}

/** Full desk snapshot. */
export function snapshot(store, cfg) {
  const L = levels(store);
  const last = store.last();
  if (!L) return { ready: false };
  const { today, et, ...lv } = L;
  return {
    ready: true, price: last?.c ?? null, lastBarT: store.lastRawT, resMin: store.resMin,
    bars: store.sorted().slice(-160).map(b => [b.t, b.o, b.h, b.l, b.c]),
    raw: [...store.raw.values()].sort((a, b) => a.t - b.t).slice(-480).map(b => [b.t, b.o, b.h, b.l, b.c]),
    times: { nyOpen: etTime(L.date, 9.5), lastSignal: etTime(L.date, 11), flat: etTime(L.date, 12) },
    levels: lv, setups: [nyModel(store, L, cfg), londonModel(store, L, cfg)],
  };
}
