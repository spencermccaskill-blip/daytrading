// The standard carried over from NQ Desk: the live engine must reproduce the backtest trade-for-trade.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BarStore } from '../server/bars.js';
import { STRATEGIES, byId } from '../server/strategies/index.js';
import { loadHistory, tradingDates } from '../research/history.js';
import { runStrategy } from '../research/backtest.js';
import { BAR, DAY } from '../server/time.js';
import { flat, Z } from './helpers.js';

const hist = loadHistory();
const row = (b) => [b.t / 1000, b.o, b.h, b.l, b.c, b.v];
const core = (t) => (!t || t.status === "open") ? null : [t.dir, t.signalT, t.entry, t.stop, t.target, t.status, t.exitPx, t.r];

test('5m bars aggregate into 15m; the bar still forming is never a closed bar', () => {
  const s = new BarStore();
  const five = (t, o, h, l, c) => [Z(t) / 1000, o, h, l, c, 10];
  s.ingest([five('2026-07-01T13:30', 100, 102, 99, 101), five('2026-07-01T13:35', 101, 105, 100, 104), five('2026-07-01T13:40', 104, 104, 98, 99)], 5);
  assert.equal(s.ctx().s.bars.length, 0); // feed has not moved past 13:45 yet
  s.ingest([five('2026-07-01T13:45', 99, 100, 98, 99)], 5);
  assert.deepEqual(s.ctx().s.bars.map(b => [b.t, b.o, b.h, b.l, b.c, b.v]), [[Z('2026-07-01T13:30'), 100, 105, 98, 99, 30]]);
  assert.equal(s.ctx().raw.bars.length, 4);
  assert.equal(s.last().c, 99);
});

test('an open 15m bar never produces a signal', () => {
  const D = '2026-07-01', s = new BarStore();
  const bars = flat('2026-06-10', D, { [D + 'T13:30']: [100, 103, 99.5, 102], [D + 'T13:45']: [102, 102, 94, 95] });
  s.ingest(bars.filter(b => b.t <= Z(D + 'T13:45')).map(row), 15); // the 13:45 bar is the newest: still forming
  const r = byId('ny_sweep_shift').evaluate(s.ctx(), D);
  assert.equal(r.trade, undefined);
  assert.equal(r.phase, 'armed');
});

test('live engine reproduces the backtest trade-for-trade, every setup, every day of the last three contracts', () => {
  const recent = hist.contracts.slice(-3).map(c => c.code);
  const dates = [...tradingDates(hist)].filter(d => recent.includes(d.contract.code));
  let days = 0, trades = 0;
  for (const strat of STRATEGIES) {
    const want = new Map(runStrategy(hist, strat).map(t => [t.key, t]));
    for (const code of recent) {
      const contract = hist.contracts.find(c => c.code === code);
      const store = new BarStore(); let fed = 0;
      for (const { key } of dates.filter(d => d.contract.code === code)) {
        // Feed the chart forward to two days past this date, as the extension would have by then.
        const upTo = Date.parse(key + 'T00:00Z') + 2 * DAY, all = contract.ctx.s.bars;
        const chunk = []; while (fed < all.length && all[fed].t < upTo) chunk.push(row(all[fed++]));
        store.ingest(chunk, 15);
        const live = strat.evaluate(store.ctx(), key).trade, bt = want.get(key);
        days++;
        if (!bt) { assert.ok(!live || live.status === 'open', `${strat.id} ${key}: live has a trade the backtest does not`); continue; }
        assert.deepEqual(core(live), core(bt), `${strat.id} ${key}`);
        trades++;
      }
    }
  }
  assert.ok(days > 1000 && trades > 300, `checked ${days} setup-days, ${trades} trades`);
  console.log(`      matched ${trades} trades over ${days} setup-days`);
});

test('bar by bar, a signal never changes once given, and ends where the backtest ends (last 30 days)', () => {
  const contract = hist.contracts.at(-1), all = contract.ctx.s.bars;
  const dates = [...tradingDates(hist)].filter(d => d.contract.code === contract.code).slice(-32, -2);
  for (const strat of STRATEGIES) {
    const want = new Map(runStrategy(hist, strat).map(t => [t.key, t]));
    const store = new BarStore(); let fed = 0;
    for (const { key } of dates) {
      // Feed to 06:00 UTC the next morning: past the evening session's midnight-ET flat, before any next-day signal.
      const end = Date.parse(key + 'T00:00Z') + DAY + 6 * 36e5; let first = null, live = null;
      while (fed < all.length && all[fed].t < end) {
        store.ingest([row(all[fed++])], 15);
        if (all[fed - 1].t < Date.parse(key + 'T00:00Z')) continue;
        live = strat.evaluate(store.ctx(), key).trade;
        if (live && !first) {
          first = live;
          assert.equal(first.signalT + BAR, store.lastRawT, `${strat.id} ${key}: signal appears on the bar after its signal bar closes, not before`);
        }
        if (first) assert.deepEqual([live?.signalT, live?.entry, live?.stop, live?.target], [first.signalT, first.entry, first.stop, first.target], `${strat.id} ${key}: signal changed after it was given`);
      }
      assert.deepEqual(core(live), core(want.get(key)), `${strat.id} ${key}`);
    }
  }
});
