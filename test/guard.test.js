import test from 'node:test';
import assert from 'node:assert/strict';
import { computeGuard, checkTrade, tradingDay, defaultSettings, PLANS } from '../server/guard.js';

const Z = (s) => Date.parse(s + 'Z');
// July 2026, Denver = UTC-6. The trading day turns over at 4:00 PM Denver (22:00Z).
const NOW = Z('2026-07-15T15:00'); // Wednesday 9:00 AM Denver
const S = () => defaultSettings();
const tr = (iso, pnl, extra = {}) => ({ id: iso, kind: 'trade', ts: Z(iso), pnl, ...extra });
const g = (trades, s = S(), now = NOW) => computeGuard(s, { trades }, now);

test('defaults: Lucid $50K Flex and the personal rules', () => {
  const s = S();
  assert.deepEqual([s.account.plan, s.account.startBalance, s.account.maxLossLimit, s.account.lockBalance], ['flex', 50000, 2000, 50100]);
  assert.deepEqual([s.personal.riskPerTrade, s.personal.maxLossesPerDay, s.personal.dailyStop], [250, 2, 500]);
  assert.deepEqual(Object.keys(PLANS), ['flex', 'pro', 'direct', 'daily']);
});

test('trading day turns over at 4:00 PM Denver, so an evening trade belongs to the next day', () => {
  assert.equal(tradingDay(Z('2026-07-14T21:59')), '2026-07-14');
  assert.equal(tradingDay(Z('2026-07-14T22:00')), '2026-07-15');
  assert.equal(tradingDay(Z('2026-07-15T15:00')), '2026-07-15');
  assert.equal(tradingDay(Z('2026-01-14T23:00')), '2026-01-15'); // winter: 4 PM MST
});

test('fresh account: full room, nothing used, clear to trade', () => {
  const x = g([]);
  assert.deepEqual([x.balance, x.floor, x.room, x.dayPnl, x.tradesToday, x.lossesToday, x.status], [50000, 48000, 2000, 0, 0, 0, 'ok']);
  assert.equal(x.lockout, null);
  assert.equal(x.maxContracts, 20); // funded Flex scaling plan starts at 20 micros
});

test('end-of-day trailing: the floor follows the highest closing balance, not intraday highs', () => {
  const x = g([tr('2026-07-13T15:00', 600), tr('2026-07-14T15:00', -200), tr('2026-07-15T14:00', 300)]);
  assert.equal(x.balance, 50700);
  assert.equal(x.floor, 48600);   // best close was 50,600 on the 13th; today is not closed yet
  assert.equal(x.room, 2100);
});

test('the floor locks at $50,100 once a day closes above $52,100, and on a payout request', () => {
  const x = g([tr('2026-07-13T15:00', 2200), tr('2026-07-14T15:00', -300)]);
  assert.deepEqual([x.floor, x.floorLocked, x.room], [50100, true, 1800]);
  const at = g([tr('2026-07-13T15:00', 2100)]); // exactly 52,100 does not lock: Lucid says "exceeds"
  assert.deepEqual([at.floor, at.floorLocked], [50100, false]);
  const s = S(); s.account.payoutRequested = true;
  assert.deepEqual([g([], s).floor, g([], s).floorLocked], [50100, true]);
});

test('intraday trailing (LucidDaily) follows the running peak', () => {
  const s = S(); s.account.plan = 'daily'; s.account.trailing = 'intraday';
  const x = g([tr('2026-07-15T14:00', 400), tr('2026-07-15T14:30', -100)], s);
  assert.deepEqual([x.balance, x.floor, x.room], [50300, 48400, 1900]);
});

test('two losses and done for the day', () => {
  const x = g([tr('2026-07-15T14:00', -100), tr('2026-07-15T14:30', -120)]);
  assert.equal(x.lossesToday, 2);
  assert.equal(x.status, 'locked');
  assert.match(x.lockout.reason, /two losses/i);
  assert.equal(x.lockout.until, Z('2026-07-15T22:00'));
});

test('personal daily stop at $500', () => {
  const x = g([tr('2026-07-15T14:00', 300), tr('2026-07-15T14:30', -800)]);
  assert.equal(x.dayPnl, -500);
  assert.match(x.lockout.reason, /daily stop/i);
  assert.equal(g([tr('2026-07-15T14:30', -499)]).lockout, null);
});

test('yesterday does not count against today; an evening loss counts toward tomorrow', () => {
  const x = g([tr('2026-07-14T15:00', -250), tr('2026-07-14T16:00', -250), tr('2026-07-14T23:00', -100)]);
  assert.deepEqual([x.tradesToday, x.lossesToday, x.dayPnl], [1, 1, -100]);
  assert.equal(x.lockout, null);
});

test('Lucid daily loss limit, when the plan has one, is a lockout', () => {
  const s = S(); s.account.dll = { on: true, amount: 1200 }; s.personal.dailyStop = 5000; s.personal.maxLossesPerDay = 9;
  const x = g([tr('2026-07-15T14:00', -1200)], s);
  assert.match(x.lockout.reason, /daily loss limit/i);
  assert.equal(x.dllRoom, 0);
  assert.equal(g([], S()).dllRoom, null); // Flex default: no daily loss limit
});

test('at or under the max loss limit: breached', () => {
  const s = S(); s.personal.dailyStop = 99999; s.personal.maxLossesPerDay = 99;
  const x = g([tr('2026-07-15T14:00', -2000)], s);
  assert.equal(x.room, 0);
  assert.equal(x.breached, true);
  assert.match(x.lockout.reason, /max loss limit/i);
});

test('Flex scaling plan: contracts allowed follow closed profit', () => {
  assert.equal(g([tr('2026-07-14T15:00', 1000)]).maxContracts, 30);
  assert.equal(g([tr('2026-07-14T15:00', 2000)]).maxContracts, 40);
  assert.equal(g([tr('2026-07-15T14:00', 2500)]).maxContracts, 20); // today is not closed yet
  const s = S(); s.account.plan = 'pro'; s.account.scaling = null; s.account.maxMicros = 40;
  assert.equal(g([], s).maxContracts, 40);
});

test('sizing: floor($250 / stop), and a stop too wide is refused, never shrunk', () => {
  const s = S(), x = g([], s);
  const ok = checkTrade(x, s, { stopPoints: 40 });
  assert.deepEqual([ok.verdict, ok.contracts, ok.riskDollars], ['PASS', 3, 240]);
  const wide = checkTrade(x, s, { stopPoints: 130 });
  assert.deepEqual([wide.verdict, wide.contracts], ['BLOCK', 0]);
  assert.match(wide.reason, /skip/i);
  const tiny = checkTrade(x, s, { stopPoints: 5 }); // 25 by the math, capped at the 20 the plan allows
  assert.deepEqual([tiny.verdict, tiny.contracts, tiny.riskDollars], ['PASS', 20, 200]);
  assert.equal(checkTrade(x, s, { stopPoints: 0 }).verdict, 'BLOCK');
});

test('a signal is blocked when locked out, or when its risk does not fit what is left', () => {
  const s = S();
  const locked = g([tr('2026-07-15T14:00', -100), tr('2026-07-15T14:30', -120)]);
  assert.equal(checkTrade(locked, s, { stopPoints: 40 }).verdict, 'BLOCK');
  const oneLoss = g([tr('2026-07-15T14:00', -300)]); // $200 left before the $500 daily stop
  const c = checkTrade(oneLoss, s, { stopPoints: 40 });
  assert.equal(c.verdict, 'BLOCK');
  assert.match(c.reason, /daily stop/i);
  const s2 = S(); s2.personal.dailyStop = 99999; s2.personal.maxLossesPerDay = 99;
  const thin = g([tr('2026-07-13T15:00', -1800)], s2); // $200 of room to the limit
  assert.match(checkTrade(thin, s2, { stopPoints: 40 }).reason, /max loss limit/i);
});

test('adjustments move the balance but are not trades', () => {
  const x = g([{ id: 'a', kind: 'adjustment', ts: Z('2026-07-15T14:00'), pnl: -500 }]);
  assert.deepEqual([x.balance, x.tradesToday, x.lossesToday, x.dayPnl], [49500, 0, 0, 0]);
});

test('consistency (Pro 40%, Direct 20%): biggest day as a share of cycle profit', () => {
  const s = S(); s.account.plan = 'pro'; s.account.consistencyPct = 40;
  const x = g([tr('2026-07-13T15:00', 600), tr('2026-07-14T15:00', 400)], s);
  assert.deepEqual([x.consistency.limitPct, x.consistency.bestDay, x.consistency.pct, x.consistency.ok], [40, 600, 60, false]);
  assert.equal(g([], S()).consistency, null);
});
