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
      trailing: p.trailing, dll: { ...p.dll }, scaling: p.scaling, maxMicros: p.maxMicros, consistencyPct: p.consistencyPct, payoutRequested: false, cycleStart: null },
    personal: { riskPerTrade: 250, maxLossesPerDay: 2, dailyStop: 500 },
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

export function computeGuard(settings, journal, now) {
  const a = settings.account, me = settings.personal;
  const rows = [...(journal?.trades || [])].filter(r => Number.isFinite(r.pnl) && Number.isFinite(r.ts)).sort((x, y) => x.ts - y.ts);
  const today = tradingDay(now);
  let balance = a.startBalance, peak = a.startBalance, highEod = a.startBalance, lastEod = a.startBalance, day = null;
  let dayPnl = 0, tradesToday = 0, lossesToday = 0;
  const dayProfit = new Map();
  for (const r of rows) {
    const d = tradingDay(r.ts);
    if (day && d !== day) { highEod = Math.max(highEod, balance); lastEod = balance; } // the previous day closed
    day = d; balance += r.pnl; peak = Math.max(peak, balance);
    if (r.kind === 'adjustment') continue;
    if (!a.cycleStart || d >= a.cycleStart) dayProfit.set(d, (dayProfit.get(d) || 0) + r.pnl);
    if (d === today) { dayPnl += r.pnl; tradesToday++; if (r.pnl < 0) lossesToday++; }
  }
  if (day && day < today) { highEod = Math.max(highEod, balance); lastEod = balance; }

  const high = a.trailing === 'intraday' ? peak : highEod;
  const floorLocked = !!a.payoutRequested || high > a.lockTrigger;
  const floor = floorLocked ? a.lockBalance : Math.min(high - a.maxLossLimit, a.lockBalance);
  const room = balance - floor, breached = room <= 0;

  let dllAmount = null;
  if (a.dll?.on) dllAmount = a.dll.scalePct && highEod > a.lockTrigger ? Math.max(a.dll.amount, (a.dll.scalePct / 100) * (highEod - a.startBalance)) : a.dll.amount;
  const dllRoom = dllAmount == null ? null : Math.max(0, dllAmount + dayPnl);
  const stopRoom = Math.max(0, me.dailyStop + dayPnl);

  const closedProfit = lastEod - a.startBalance;
  const maxContracts = a.scaling ? a.scaling.filter(([p]) => closedProfit >= p).at(-1)?.[1] ?? a.scaling[0][1] : a.maxMicros;

  let lockout = null; const until = dayEnd(now);
  if (breached) lockout = { reason: 'At or under the max loss limit. Stop trading and check the account in Tradovate.', until: null };
  else if (dllRoom === 0) lockout = { reason: `Lucid daily loss limit of $${dllAmount.toLocaleString('en-US')} reached. Locked until the next session.`, until };
  else if (stopRoom === 0) lockout = { reason: `Your daily stop of $${me.dailyStop} is hit. Done for the day.`, until };
  else if (lossesToday >= me.maxLossesPerDay) lockout = { reason: `${me.maxLossesPerDay === 2 ? 'Two' : me.maxLossesPerDay} losses today. Done for the day.`, until };

  let consistency = null;
  if (a.consistencyPct) {
    const total = [...dayProfit.values()].reduce((x, y) => x + y, 0), bestDay = Math.max(0, ...dayProfit.values());
    const pct = total > 0 ? Math.round((100 * bestDay) / total) : null;
    consistency = { limitPct: a.consistencyPct, bestDay, total, pct, ok: pct != null && pct <= a.consistencyPct };
  }
  const tight = room < 2 * me.riskPerTrade || lossesToday === me.maxLossesPerDay - 1 || stopRoom < me.dailyStop;
  return { day: today, balance, floor, floorLocked, room, breached, trailing: a.trailing, maxLossLimit: a.maxLossLimit,
    dayPnl, dailyLossUsed: Math.max(0, -dayPnl), dailyStop: me.dailyStop, stopRoom, dllAmount, dllRoom,
    tradesToday, lossesToday, maxLosses: me.maxLossesPerDay, maxContracts, consistency, lockout, status: lockout ? 'locked' : tight ? 'caution' : 'ok' };
}

const usd = (x) => '$' + Math.round(x).toLocaleString('en-US');

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
  if (valid && byRisk > guard.maxContracts) add('Position size', true, `Capped at the ${guard.maxContracts} ${sym} your plan allows right now.`);
  if (contracts >= 1) {
    add('Room to the max loss limit', riskDollars < guard.room, riskDollars < guard.room ? `${usd(guard.room)} of room, ${usd(riskDollars)} at risk.` : `Only ${usd(guard.room)} of room to the max loss limit. A full loss would breach the account.`);
    add('Your daily stop', riskDollars <= guard.stopRoom, riskDollars <= guard.stopRoom ? `${usd(guard.stopRoom)} left before your ${usd(guard.dailyStop)} daily stop.` : `Only ${usd(guard.stopRoom)} left before your ${usd(guard.dailyStop)} daily stop. This trade risks ${usd(riskDollars)}.`);
    if (guard.dllRoom != null) add('Lucid daily loss limit', riskDollars < guard.dllRoom, `${usd(guard.dllRoom)} left before the Lucid daily loss limit.`);
  }
  const failed = checks.find(c => !c.ok);
  return { verdict: failed ? 'BLOCK' : 'PASS', contracts: failed && byRisk < 1 ? 0 : contracts, riskDollars, checks, reason: failed ? failed.detail : null };
}
