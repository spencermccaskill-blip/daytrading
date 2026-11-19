import { BAR, isWeekday, addDays } from '../server/time.js';
import { Series, makeCtx } from '../server/strategies/common.js';

export const Z = (s) => Date.parse(s + 'Z');

/** Flat 15m bars (o100 h101 l99 c100 v10) for every weekday from `from` to `to`, with overrides {isoTime: [o,h,l,c]}. */
export function flat(from, to, overrides = {}) {
  const ov = new Map(Object.entries(overrides).map(([k, v]) => [Z(k), v]));
  const bars = [];
  for (let k = from; k <= to; k = addDays(k, 1)) {
    if (!isWeekday(k)) continue;
    for (let t = Z(k + 'T00:00'); t < Z(k + 'T00:00') + 96 * BAR; t += BAR) {
      const [o, h, l, c] = ov.get(t) || [100, 101, 99, 100];
      bars.push({ t, o, h, l, c, v: 10 });
    }
  }
  return bars;
}
/** Context where every bar is closed (how the backtest sees a finished day). */
export const closedCtx = (bars, upTo = Infinity) => {
  const b = bars.filter(x => x.t + BAR <= upTo);
  return makeCtx(new Series(b), new Series(b), upTo === Infinity ? b.at(-1).t + BAR : upTo);
};
