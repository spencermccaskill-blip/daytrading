// Pre-registered checks on The Desk's own 15-minute history (PREREGISTRATION.md, addenda of 2026-11-28):
//   recency  do a setup's last 4 weeks predict its next 4?
//   bias     do trades with TJR's daily bias (and with all three timeframes) do better?
//   afterLoss  is the trade after a losing trade that day worse?
import { biasAt } from '../server/strategies/tjr.js';
import { BAR, DAY, etKey, HOUR } from '../server/time.js';
import { rng } from './stats.js';

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
const variance = (a) => { const m = mean(a); return a.length > 1 ? a.reduce((s, x) => s + (x - m) ** 2, 0) / (a.length - 1) : 0; };
/** Difference of two means with Welch's t-stat. */
export function welch(a, b) {
  if (a.length < 2 || b.length < 2) return { diff: null, t: null, nA: a.length, nB: b.length, meanA: mean(a), meanB: mean(b) };
  const se = Math.sqrt(variance(a) / a.length + variance(b) / b.length);
  return { diff: mean(a) - mean(b), t: se ? (mean(a) - mean(b)) / se : null, nA: a.length, nB: b.length, meanA: mean(a), meanB: mean(b) };
}
export function pearson(xs, ys) {
  const n = xs.length; if (n < 3) return null;
  const mx = mean(xs), my = mean(ys); let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; syy += (ys[i] - my) ** 2; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : null;
}

const BLOCK0 = Date.parse('2019-01-07T00:00Z'), BLOCK = 28 * DAY, MIN_IN_BLOCK = 5;

/** runs: [{ id, trades: [{ key, r }] }] for the 14 fifteen-minute setups. */
export function recencyCheck(runs, perms = 2000, seed = 12345) {
  const per = runs.map(({ id, trades }) => {
    const by = new Map();
    for (const t of trades) { const b = Math.floor((Date.parse(t.key + 'T00:00Z') - BLOCK0) / BLOCK); if (b < 0) continue; (by.get(b) || by.set(b, []).get(b)).push(t.r); }
    const blocks = new Map();
    for (const [b, rs] of by) if (rs.length >= MIN_IN_BLOCK) blocks.set(b, { n: rs.length, avgR: mean(rs), win: rs.filter(r => r > 0).length / rs.length });
    return { id, blocks };
  });
  const pairs = (field, order) => {
    const xs = [], ys = [];
    for (const s of per) {
      const idx = [...s.blocks.keys()].sort((a, b) => a - b), vals = idx.map(b => s.blocks.get(b)[field]), m = mean(vals) ?? 0;
      const seq = order ? order(vals) : vals, at = new Map(idx.map((b, i) => [b, seq[i] - m]));
      for (const b of idx) if (at.has(b + 1)) { xs.push(at.get(b)); ys.push(at.get(b + 1)); }
    }
    return [xs, ys];
  };
  const test = (field) => {
    const [xs, ys] = pairs(field), r = pearson(xs, ys), rand = rng(seed);
    const shuffle = (v) => { const a = [...v]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    let ge = 0;
    for (let i = 0; i < perms; i++) { const [px, py] = pairs(field, shuffle); if ((pearson(px, py) ?? -1) >= r) ge++; }
    return { r, p: ge / perms, pairs: xs.length };
  };
  const a = test('avgR'), aWin = test('win');
  // Follow the leader: the best win rate of the block just finished, against the plain average, in the next block.
  const all = new Set(); for (const s of per) for (const b of s.blocks.keys()) all.add(b);
  const diffs = []; let leaderSum = 0, avgSum = 0;
  for (const b of [...all].sort((x, y) => x - y)) {
    const el = per.filter(s => s.blocks.has(b) && s.blocks.has(b + 1));
    if (el.length < 2) continue;
    const leader = [...el].sort((x, y) => y.blocks.get(b).win - x.blocks.get(b).win || y.blocks.get(b).avgR - x.blocks.get(b).avgR)[0];
    const next = leader.blocks.get(b + 1).avgR, avg = mean(el.map(s => s.blocks.get(b + 1).avgR));
    diffs.push(next - avg); leaderSum += next; avgSum += avg;
  }
  const md = mean(diffs), sd = Math.sqrt(variance(diffs));
  const b = { boundaries: diffs.length, leaderNext: diffs.length ? leaderSum / diffs.length : null, averageNext: diffs.length ? avgSum / diffs.length : null, diff: md, t: sd ? md / (sd / Math.sqrt(diffs.length)) : null };
  const carries = a.r != null && a.r > 0 && a.p < 0.05 && b.t != null && b.t >= 2.0;
  return { blockDays: 28, minTrades: MIN_IN_BLOCK, persistence: a, persistenceWinRate: aWin, leader: b, carries };
}

/** runs: [{ id, trades: [{ key, r, dir, signalT, ctx }] }] where ctx is the contract the trade came from. */
export function biasCheck(runs, judgeFrom = '2024-01-01') {
  const rows = [];
  for (const { id, trades } of runs) for (const t of trades) {
    const b = biasAt(t.ctx, t.signalT + BAR);
    if (b.daily == null) continue;
    rows.push({ id, key: t.key, r: t.r, withDaily: b.daily === t.dir, allAgree: b.daily === t.dir && b.h4 === t.dir && b.h1 === t.dir });
  }
  const measure = (flag) => {
    const split = (set) => welch(set.filter(x => x[flag]).map(x => x.r), set.filter(x => !x[flag]).map(x => x.r));
    const whole = split(rows), judge = split(rows.filter(x => x.key >= judgeFrom));
    return { whole, judge, helps: whole.diff != null && whole.diff > 0 && whole.t >= 2.0 && judge.diff != null && judge.diff > 0 };
  };
  const bySetup = [...new Set(rows.map(x => x.id))].map(id => ({ id, ...welch(rows.filter(x => x.id === id && x.withDaily).map(x => x.r), rows.filter(x => x.id === id && !x.withDaily).map(x => x.r)) }));
  return { trades: rows.length, daily: measure('withDaily'), allAgree: measure('allAgree'), bySetup };
}

/** Is the trade that starts after an earlier trade that day closed at a loss worse than the rest? */
export function afterLossCheck(runs) {
  const all = [];
  for (const { trades } of runs) for (const t of trades) all.push({ entryT: t.signalT + BAR, exitT: t.exitT + BAR, r: t.r, day: etKey(t.signalT + BAR + 6 * HOUR) });
  all.sort((a, b) => a.entryT - b.entryT);
  const after = [], rest = [], byDay = new Map();
  for (const t of all) {
    const earlier = byDay.get(t.day) || [];
    (earlier.some(e => e.exitT <= t.entryT && e.r < 0) ? after : rest).push(t.r);
    earlier.push(t); byDay.set(t.day, earlier);
  }
  const w = welch(after, rest);
  return { ...w, supported: w.diff != null && w.diff < 0 && w.t <= -2.0 };
}
