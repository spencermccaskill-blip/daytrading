// The replay log: every trade the setups would have suggested, worked out from the bars on hand.
// It runs the same setup functions as the live desk and the backtest, so a signal found here is
// exactly the one the desk would have shown at the time, including on days it was switched off.
import { byId } from './strategies/index.js';
import { BAR, etKey, addDays } from './time.js';

/** Every suggested trade in the bars, newest first. fromKey limits the replay to recent days. */
export function replaySignals(ctx, verdicts, { fromKey } = {}) {
  const first = ctx.raw.bars[0];
  if (!first) return [];
  const setups = verdicts.setups.filter(s => !s.carried && byId(s.id));
  const start = fromKey && fromKey > etKey(first.t) ? fromKey : etKey(first.t), end = etKey(ctx.now), out = [];
  for (let key = start; key <= end; key = addDays(key, 1)) {
    for (const s of setups) {
      const res = byId(s.id).evaluate(ctx, key), t = res.trade;
      if (!t) continue;
      out.push({ id: `${s.id}:${key}`, key, setupId: s.id, name: s.name, code: s.code, window: s.window, score: s.score, avgR: s.avgR, research: !!s.research, trial: !!s.trial,
        side: t.side, dir: t.dir, signalT: t.signalT + BAR, entry: t.entry, stop: t.stop, target: t.target, stopPoints: t.risk,
        status: t.status, exitPx: t.exitPx, exitT: t.exitT, r: t.r, flatAt: res.times.flat });
    }
  }
  return out.sort((a, b) => b.signalT - a.signalT);
}

/** Forward results per setup, from finished suggestions only. */
export function tally(signals) {
  const by = new Map();
  for (const s of signals) {
    if (s.status === 'open' || !Number.isFinite(s.r)) continue;
    const x = by.get(s.setupId) || { setupId: s.setupId, name: s.name, closed: 0, wins: 0, totalR: 0 };
    x.closed++; if (s.r > 0) x.wins++; x.totalR += s.r; by.set(s.setupId, x);
  }
  const round = (v) => Math.round(v * 100) / 100;
  return [...by.values()].map(x => ({ setupId: x.setupId, name: x.name, closed: x.closed, wins: x.wins, winPct: Math.round((100 * x.wins) / x.closed), avgR: round(x.totalR / x.closed), totalR: round(x.totalR) }))
    .sort((a, b) => b.closed - a.closed);
}
