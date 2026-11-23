// The account guard: what the Lucid account and Spencer's own rules still allow right now.
// Fed by the manual journal. Every number here is editable in Settings.
// Lucid rules checked against support.lucidtrading.com on 2026-11-19 (see docs/LUCID-RULES.md).
import { zoned, zonedToUtc, DENVER, HOUR } from './time.js';

/** Funded-account presets for the $50K size. */
export const PLANS = {
  flex: { name: 'LucidFlex', trailing: 'eod', dll: { on: false, amount: 1200 }, scaling: [[0, 20], [1000, 30], [2000, 40]], maxMicros: 40, consistencyPct: null,
    note: 'Daily loss limit is optional on Flex (chosen at purchase) and its amount is not published: turn it on only if your account has one. Funded Flex starts at 20 micros and scales with closed profit.' },
  pro: { name: 'LucidPro', trailing: 'eod', dll: { on: true, amount: 1200, scalePct: 60 }, scaling: null, maxMicros: 40, consistencyPct: 40,
    note: 'Daily loss limit starts at $1,200 and becomes 60% of your best end-of-day profit once a day closes above $52,100. Biggest day must be 40% or less of the payout cycle profit.' },
  direct: { name: 'LucidDirect', trailing: 'eod', dll: { on: true, amount: 1200, scalePct: 60 }, scaling: null, maxMicros: 40, consistencyPct: 20,
    note: 'Daily loss limit is fixed by account size. Biggest day must be 20% or less of the payout cycle profit.' },
  daily: { name: 'LucidDaily', trailing: 'intraday', dll: { on: true, amount: 1200 }, scaling: null, maxMicros: 40, consistencyPct: null,
    note: 'Funded LucidDaily trails intraday. Trading high-impact US news is a hard breach on this plan. This guard only sees closed trades, so an open-trade peak can move the real limit higher than shown.' },
};

export function defaultSettings() {
  const p = PLANS.flex;
  return {
    account: { firm: 'Lucid Trading', size: '50K', plan: 'flex', startBalance: 50000, maxLossLimit: 2000, lockBalance: 50100, lockTrigger: 52100,
      trailing: p.trailing, dll: { ...p.dll }, scaling: p.scaling, maxMicros: p.maxMicros, consistencyPct: p.consistencyPct, payoutRequested: false, cycleStart: null, anchor: null },
    personal: { riskPerTrade: 250, maxLossesPerDay: 2, dailyStop: 500, thinCushion: true, thinUnder: 1000 },
    instrument: { symbol: 'MNQ', pointValue: 2 },
  };
}

/** The trading day a moment belongs to: it turns over at 4:00 PM Denver (the 6:00 PM ET reopen). */
export function tradingDay(t) { return zoned(t + 8 * HOUR, DENVER).key; }
/** When the current trading day ends (next 4:00 PM Denver). */
export function dayEnd(t) {
  const p = zoned(t, DENVER), four = zonedToUtc(DENVER, p.y, p.m, p.d, 16, 0);
  return t < four ? four : zonedToUtc(DENVER, p.y, p.m, p.d + 1, 16, 0);
}

const usd = (x) => '$' + Math.round(x).toLocaleString('en-US');

export function computeGuard(settings, journal, now) {
  const a = settings.account, me = settings.personal;
  // "Anchor": the balance and minimum balance copied from the Lucid dashboard. Everything is counted from there.
  const an = a.anchor && Number.isFinite(a.anchor.balance) && Number.isFinite(a.anchor.floor) ? a.anchor : null;
  const rows = [...(journal?.trades || [])].filter(r => Number.isFinite(r.pnl) && Number.isFinite(r.ts) && (!an || r.ts > (an.at || 0))).sort((x, y) => x.ts - y.ts);
  const today = tradingDay(now);
  // Trades added with one click and not finished yet: they count as trades, but have no result to add.
  const stillOpen = (journal?.trades || []).filter(r => r.open && r.pnl == null && Number.isFinite(r.ts));
  const start = an ? an.balance : a.startBalance;
  // The high the limit trails from: worked back from the given minimum balance (or past the lock if it is already locked).
  const high0 = an ? (an.floor >= a.lockBalance ? a.lockTrigger + 1 : an.floor + a.maxLossLimit) : a.startBalance;
  let balance = start, peak = Math.max(high0, start), highEod = high0, lastEod = start, day = null;
  let dayPnl = 0, tradesToday = 0, lossesToday = 0, minDayPnl = 0, breachedEver = false;
  const floorOf = (hi) => (a.payoutRequested || hi > a.lockTrigger ? a.lockBalance : Math.min(hi - a.maxLossLimit, a.lockBalance));
  const dayProfit = new Map();
  for (const r of rows) {
    const d = tradingDay(r.ts);
    if (day && d !== day) { highEod = Math.max(highEod, balance); lastEod = balance; } // the previous day closed
    day = d; balance += r.pnl;
    // Once the balance has touched the limit the account is gone, whatever is logged afterwards.
    if (balance - floorOf(a.trailing === 'intraday' ? peak : highEod) <= 0) breachedEver = true;
    peak = Math.max(peak, balance);
    if (r.kind === 'adjustment') continue;
    if (!a.cycleStart || d >= a.cycleStart) dayProfit.set(d, (dayProfit.get(d) || 0) + r.pnl);
    if (d === today) { dayPnl += r.pnl; tradesToday++; if (r.pnl < 0) lossesToday++; minDayPnl = Math.min(minDayPnl, dayPnl); }
  }
  if (day && day < today) { highEod = Math.max(highEod, balance); lastEod = balance; }

  const high = a.trailing === 'intraday' ? peak : highEod;
  const floorLocked = !!a.payoutRequested || high > a.lockTrigger;
  const floor = floorOf(high);
  const room = balance - floor, breached = breachedEver || room <= 0;

  let dllAmount = null;
  if (a.dll?.on) dllAmount = a.dll.scalePct && highEod > a.lockTrigger ? Math.max(a.dll.amount, (a.dll.scalePct / 100) * (highEod - a.startBalance)) : a.dll.amount;
  const dllRoom = dllAmount == null ? null : Math.max(0, dllAmount + dayPnl);
  // Thin cushion: with little room left at the start of the day, one loss ends the day. It never blocks a trade for its size.
  const thinUnder = me.thinUnder ?? 1000;
  const thin = me.thinCushion !== false && (balance - dayPnl) - floor < thinUnder;
  const maxLosses = thin ? 1 : me.maxLossesPerDay, dailyStop = thin ? Math.min(me.dailyStop, me.riskPerTrade) : me.dailyStop;
  const stopRoom = Math.max(0, dailyStop + dayPnl);

  const closedProfit = lastEod - a.startBalance;
  const maxContracts = a.scaling ? a.scaling.filter(([p]) => closedProfit >= p).at(-1)?.[1] ?? a.scaling[0][1] : a.maxMicros;

  let lockout = null; const until = dayEnd(now);
  if (breached) lockout = { reason: 'At or under the max loss limit. Stop trading and check the account in Tradovate.', until: null };
  else if (dllAmount != null && minDayPnl <= -dllAmount) lockout = { reason: `Lucid daily loss limit of $${dllAmount.toLocaleString('en-US')} reached. Locked until the next session.`, until };
  else if (minDayPnl <= -dailyStop) lockout = { reason: 'Your daily stop of ' + usd(dailyStop) + ' is hit. Done for the day.', until };
  else if (lossesToday >= maxLosses) lockout = { reason: thin ? 'One loss today. With under ' + usd(thinUnder) + ' of room to the limit, that is the day.' : (maxLosses === 2 ? 'Two' : maxLosses) + ' losses today. Done for the day.', until };

  let consistency = null;
  if (a.consistencyPct) {
    const total = [...dayProfit.values()].reduce((x, y) => x + y, 0), bestDay = Math.max(0, ...dayProfit.values());
    const pct = total > 0 ? Math.round((100 * bestDay) / total) : null;
    consistency = { limitPct: a.consistencyPct, bestDay, total, pct, ok: pct != null && pct <= a.consistencyPct };
  }
  const tight = thin || room < 2 * me.riskPerTrade || lossesToday === maxLosses - 1 || stopRoom < dailyStop;
  return { day: today, balance, floor, floorLocked, room, breached, trailing: a.trailing, maxLossLimit: a.maxLossLimit,
    dayPnl, dailyLossUsed: Math.max(0, -dayPnl), dailyStop, stopRoom, thin, anchored: !!an, dllAmount, dllRoom,
    tradesToday: tradesToday + stillOpen.filter(r => tradingDay(r.ts) === today).length, openTrades: stillOpen.length, lossesToday, maxLosses, maxContracts, consistency, lockout, status: lockout ? 'locked' : tight ? 'caution' : 'ok' };
}

/** PASS or BLOCK for one trade idea. Size comes from the stop; the stop is never shrunk to fit. */
export function checkTrade(guard, settings, { stopPoints }) {
  const risk = settings.personal.riskPerTrade, pv = settings.instrument.pointValue, sym = settings.instrument.symbol;
  const valid = Number.isFinite(stopPoints) && stopPoints > 0;
  const byRisk = valid ? Math.floor(risk / (stopPoints * pv)) : 0;
  const contracts = Math.min(byRisk, guard.maxContracts);
  const riskDollars = valid ? contracts * stopPoints * pv : 0;
  const checks = [];
  const add = (name, ok, detail) => checks.push({ name, ok, detail });
  add('Not locked out', !guard.lockout, guard.lockout ? guard.lockout.reason : 'No lockout.');
  if (!valid) add('Stop size', false, 'Enter the stop distance in points.');
  else add('Stop fits your risk', byRisk >= 1, byRisk >= 1
    ? `${stopPoints.toFixed(1)} points x ${contracts} ${sym} = ${usd(riskDollars)} at risk (limit ${usd(risk)}).`
    : `${stopPoints.toFixed(1)} points is ${usd(stopPoints * pv)} on 1 ${sym}, over your ${usd(risk)}. Skip it. Never shrink the stop to fit.`);
  if (!Number.isFinite(contracts)) add('Position size', false, 'The plan settings are incomplete, so the size cannot be worked out. Open Settings and save them again.');
  if (valid && byRisk > guard.maxContracts) add('Position size', true, `Capped at the ${guard.maxContracts} ${sym} your plan allows right now.`);
  if (contracts >= 1) {
    add('Room to the max loss limit', riskDollars < guard.room, riskDollars < guard.room ? `${usd(guard.room)} of room, ${usd(riskDollars)} at risk.` : `Only ${usd(guard.room)} of room to the max loss limit. A full loss would breach the account.`);
    add('Your daily stop', riskDollars <= guard.stopRoom, riskDollars <= guard.stopRoom ? `${usd(guard.stopRoom)} left before your ${usd(guard.dailyStop)} daily stop.` : `Only ${usd(guard.stopRoom)} left before your ${usd(guard.dailyStop)} daily stop. This trade risks ${usd(riskDollars)}.`);
    if (guard.dllRoom != null) add('Lucid daily loss limit', riskDollars < guard.dllRoom, `${usd(guard.dllRoom)} left before the Lucid daily loss limit.`);
  }
  const failed = checks.find(c => !c.ok);
  return { verdict: failed ? 'BLOCK' : 'PASS', contracts: failed && byRisk < 1 ? 0 : contracts, riskDollars, checks, reason: failed ? failed.detail : null };
}
