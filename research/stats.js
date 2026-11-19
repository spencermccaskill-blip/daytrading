// Plain statistics for a list of trades ({ key, r, ... }), and the pass bar from PREREGISTRATION.md.

export function summary(trades) {
  const n = trades.length;
  if (!n) return { trades: 0, win: null, avgR: null, t: null, totalR: 0, maxDD: 0 };
  const rs = trades.map(t => t.r), sum = rs.reduce((a, b) => a + b, 0), avg = sum / n;
  const sd = n > 1 ? Math.sqrt(rs.reduce((a, r) => a + (r - avg) ** 2, 0) / (n - 1)) : 0;
  return { trades: n, win: (100 * rs.filter(r => r > 0).length) / n, avgR: avg, t: sd ? avg / (sd / Math.sqrt(n)) : null, totalR: sum, maxDD: drawdown(rs) };
}
/** Deepest peak-to-trough fall of the running total (a positive number). */
export function drawdown(values) {
  let run = 0, peak = 0, dd = 0;
  for (const v of values) { run += v; peak = Math.max(peak, run); dd = Math.max(dd, peak - run); }
  return dd;
}
export const inPeriod = (trades, from, to) => trades.filter(t => t.key >= from && t.key <= to);

/** MNQ dollars at a fixed risk budget with whole contracts. Signals that give 0 contracts are skipped, never shrunk. */
export function dollars(trades, risk = 250, pointValue = 2, cost = 1) {
  const taken = [];
  for (const t of trades) {
    const contracts = Math.floor(risk / (t.risk * pointValue));
    if (contracts < 1) continue;
    taken.push(contracts * pointValue * (t.dir * (t.exitPx - t.entry) - cost));
  }
  const stops = trades.map(t => t.risk).sort((a, b) => a - b);
  return { signals: trades.length, taken: taken.length, fitPct: trades.length ? (100 * taken.length) / trades.length : null, net: taken.reduce((a, b) => a + b, 0), maxDD: drawdown(taken), medianStop: stops.length ? stops[stops.length >> 1] : null };
}

/** Small seeded generator so the benchmark is repeatable. */
export function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Random-direction benchmark from each trade's precomputed long and short result. */
export function benchmark(pairs, runs = 500, seed = 12345) {
  if (!pairs.length) return { mean: null, p95: null };
  const rand = rng(seed), avgs = [];
  for (let i = 0; i < runs; i++) { let s = 0; for (const p of pairs) s += rand() < 0.5 ? p.long : p.short; avgs.push(s / pairs.length); }
  avgs.sort((a, b) => a - b);
  return { mean: avgs.reduce((a, b) => a + b, 0) / runs, p95: avgs[Math.floor(runs * 0.95)] };
}

export const PASS_BAR = { avgR: 0.10, t: 2.0, maxDD: 10, dollarDD: 2000, years: ['2024', '2025', '2026'] };

/** The six pre-registered rules, judged on 2024 onward. */
export function judge({ judge: j, years, last12, dollar }) {
  const rules = [
    { rule: 'Average at least +0.10R after costs', ok: j.avgR != null && j.avgR >= PASS_BAR.avgR, value: j.avgR },
    { rule: 't-stat at least 2.0', ok: j.t != null && j.t >= PASS_BAR.t, value: j.t },
    { rule: 'Positive in each of 2024, 2025, 2026', ok: PASS_BAR.years.every(y => years[y]?.avgR > 0), value: PASS_BAR.years.map(y => years[y]?.avgR ?? null) },
    { rule: 'Worst drawdown no deeper than 10R', ok: j.trades > 0 && j.maxDD <= PASS_BAR.maxDD, value: j.maxDD },
    { rule: 'Last 12 months above zero', ok: last12.avgR != null && last12.avgR > 0, value: last12.avgR },
    { rule: 'On MNQ at $250 risk: net positive and worst drawdown under $2,000', ok: dollar.taken > 0 && dollar.net > 0 && dollar.maxDD < PASS_BAR.dollarDD, value: [dollar.net, dollar.maxDD] },
  ];
  return rules;
}
export function label(rules, tune, j) {
  if (rules.every(r => r.ok)) return 'Passed';
  const a = tune.avgR ?? 0, b = j.avgR ?? 0;
  if (a > 0 && b > 0) return 'Promising, not proven';
  if (a <= 0 && b <= 0) return 'Benched';
  return 'No edge';
}
