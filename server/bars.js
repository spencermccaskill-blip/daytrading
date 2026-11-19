// Holds the bars the TradingView extension posts, and builds 15-minute bars from them.
import { BAR, MIN } from './time.js';
import { Series, makeCtx } from './strategies/common.js';

export class BarStore {
  constructor() { this.raw = new Map(); this.bars = new Map(); this.lastRawT = 0; this.resMin = null; this.cache = null; }

  clear() { this.raw.clear(); this.bars.clear(); this.lastRawT = 0; this.cache = null; }

  /** rows: [[tSec, o, h, l, c, v], ...] from the chart; resMin: chart resolution in minutes; now: rows dated after it are refused. */
  ingest(rows, resMin, now = Infinity) {
    if (!Array.isArray(rows) || !rows.length) return 0;
    if (this.resMin && resMin !== this.resMin) { this.raw.clear(); this.bars.clear(); this.lastRawT = 0; }
    this.resMin = resMin; this.cache = null;
    const touched = new Set(); let n = 0;
    for (const r of rows) {
      if (!Array.isArray(r)) continue;
      const t = r[0] * 1000;
      if (!Number.isFinite(t) || t > now + BAR || ![r[1], r[2], r[3], r[4]].every(x => Number.isFinite(x) && x > 0)) continue;
      this.raw.set(t, { t, o: r[1], h: r[2], l: r[3], c: r[4], v: Number(r[5]) || 0 });
      touched.add(Math.floor(t / BAR) * BAR); n++;
      if (t > this.lastRawT) this.lastRawT = t;
    }
    for (const start of touched) this.#rebuild(start);
    return n;
  }
  #rebuild(start) {
    const parts = [];
    for (let t = start; t < start + BAR; t += MIN) { const r = this.raw.get(t); if (r) parts.push(r); }
    if (!parts.length) return;
    this.bars.set(start, { t: start, o: parts[0].o, h: Math.max(...parts.map(p => p.h)), l: Math.min(...parts.map(p => p.l)), c: parts.at(-1).c, v: parts.reduce((a, p) => a + p.v, 0) });
  }
  /** Latest raw bar (the live price). */
  last() { return this.raw.get(this.lastRawT) || null; }
  /** Context for the setups: closed 15m bars only (the feed has moved past their end), raw bars, feed time. */
  ctx() {
    if (!this.cache) {
      const closed = [...this.bars.values()].filter(b => this.lastRawT >= b.t + BAR).sort((a, b) => a.t - b.t);
      const raw = [...this.raw.values()].sort((a, b) => a.t - b.t);
      this.cache = makeCtx(new Series(closed), new Series(raw), this.lastRawT);
    }
    return this.cache;
  }
  /** Drop bars older than `days` so the saved file stays small. */
  prune(days = 45) { const cut = this.lastRawT - days * 864e5; for (const t of this.raw.keys()) if (t < cut) this.raw.delete(t); for (const t of this.bars.keys()) if (t < cut) this.bars.delete(t); this.cache = null; }
  toJSON() { return { resMin: this.resMin, raw: [...this.raw.values()] }; }
  load(j) { if (j?.raw?.length) this.ingest(j.raw.map(b => [b.t / 1000, b.o, b.h, b.l, b.c, b.v]), j.resMin); }
}
