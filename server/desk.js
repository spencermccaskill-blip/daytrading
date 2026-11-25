// Builds everything the page shows from: the clock, the bars, the journal, the settings and the verdicts.
// Pure: same inputs, same output. The server calls it with the real clock; tests and demos pass their own.
import { sessionAt } from './sessions.js';
import { computeGuard, checkTrade } from './guard.js';
import { liveSetups, windowSetups } from './verdicts.js';
import { byId } from './strategies/index.js';
import { sessionRanges } from './strategies/sweep.js';
import { rth, vwapMap } from './strategies/common.js';
import { etKey, BAR, MIN } from './time.js';

const STALE_AFTER = 30000;   // no post from the chart for this long = stalled
const FROZEN_AFTER = 180000; // posts keep coming but the newest bar has not changed for this long = frozen
const RANK = { 'in-trade': 5, armed: 4, watching: 3, done: 2, waiting: 1, 'no-data': 0 };

function feedState(now, store, feed) {
  const source = feed?.source || null, auto = source === 'yahoo';
  return { ...feedCore(now, store, feed, auto), source };
}
function feedCore(now, store, feed, auto) {
  const lastBarT = store?.lastRawT || 0, symbol = feed?.symbol || null;
  if (!feed?.lastPost) return { status: 'off', label: feed?.fetchError || 'No prices yet', symbol, delayed: false, lastBarT, error: feed?.error || null };
  const age = now - feed.lastPost;
  if (feed.error) return { status: 'error', label: feed.error, symbol, delayed: false, lastBarT, error: feed.error };
  if (age > (auto ? 45000 : STALE_AFTER)) return { status: 'stale', label: `Feed stalled ${age > 120000 ? Math.round(age / 60000) + ' min' : Math.round(age / 1000) + ' s'} ago`, symbol, delayed: false, lastBarT, ageSec: Math.round(age / 1000), error: null };
  // The fetched feed only moves when a delayed bar updates, so give it longer before calling it frozen.
  if (feed.lastChange && now - feed.lastChange > (auto ? 3 * FROZEN_AFTER : FROZEN_AFTER)) return { status: 'stale', label: `Prices frozen: no change for ${Math.round((now - feed.lastChange) / MIN)} min`, symbol, delayed: false, lastBarT, ageSec: Math.round(age / 1000), error: null };
  // Connected but no new bar for a long time: market shut, or the tab went to sleep.
  if (lastBarT && now - lastBarT > 45 * MIN) return { status: 'stale', label: `No new bars for ${Math.round((now - lastBarT) / 36e5) >= 2 ? Math.round((now - lastBarT) / 36e5) + ' hours' : Math.round((now - lastBarT) / MIN) + ' min'}`, symbol, delayed: false, lastBarT, ageSec: Math.round(age / 1000), error: null };
  const lagMin = lastBarT ? Math.max(0, Math.round((now - lastBarT) / MIN) - (store.resMin || 5)) : 0;
  const delayed = auto || /_DL/i.test(symbol || '') || lagMin >= 3;
  return { status: delayed ? 'delayed' : 'live', label: delayed ? `Delayed ${lagMin >= 3 ? 'about ' + lagMin + ' min' : 'about 10 min'}` : 'Live', symbol, delayed, delayMin: lagMin, lastBarT, ageSec: Math.round(age / 1000), error: null };
}

function standardLevels(ctx, key, price, setupLevels, since) {
  const out = [], seen = new Set();
  // A level counts as swept once price has traded through it since the setup's window opened.
  const run = since != null && ctx.now >= since ? ctx.raw.between(since, Infinity) : [];
  const hi = run.length ? Math.max(...run.map(b => b.h)) : null, lo = run.length ? Math.min(...run.map(b => b.l)) : null;
  const push = (name, p, side) => { if (p == null || seen.has(name)) return; seen.add(name); out.push({ name, price: p, side, dist: price != null ? price - p : null, swept: side === 'high' ? hi != null && hi > p : side === 'low' ? lo != null && lo < p : false }); };
  for (const l of setupLevels || []) push(l.name, l.price, l.side);
  const r = sessionRanges(ctx, key);
  push('Prior day high', r.prior?.high, 'high'); push('Asian high', r.asia?.high, 'high'); push('London high', r.london?.high, 'high');
  push('London low', r.london?.low, 'low'); push('Asian low', r.asia?.low, 'low'); push('Prior day low', r.prior?.low, 'low');
  const today = rth(ctx, key);
  if (today.length) push('VWAP', vwapMap(today).get(today.at(-1).t), 'mid');
  return out.sort((a, b) => b.price - a.price);
}

const pts = (x) => Math.round(x * 4) / 4;

/**
 * Everything the page shows about one setup right now: what it is, how it has done, its state,
 * and the numbers to act on. The leading setup and the "also in this window" ones are all cards.
 */
function card(e, { guard, settings, dataNow, key, journal, prefs, recent }) {
  const { setup: s, res } = e, t = res.trade, pv = settings.instrument.pointValue;
  const sized = (stopPoints) => checkTrade(guard, settings, { stopPoints });
  const taken = (side) => (journal.trades || []).some(x => x.signalId === `${s.id}:${key}` && (!side || x.side === side));
  const rc = recent?.[s.id] || null;
  const long = s.score == null ? 'Not tested.' : `Since 2024: won ${Math.round(s.winPct)}% of ${s.trades} tested trades, averaging ${s.avgR >= 0 ? '+' : ''}${s.avgR.toFixed(2)}R a trade${s.avgR <= 0 ? ' (it lost money in testing)' : ''}. ${s.proven ? 'Passed every test rule.' : 'Not proven.'}`;
  const base = {
    setup: { id: s.id, name: s.name, code: s.code, window: s.window }, focus: (prefs.focus || []).includes(s.id),
    score: s.score, winPct: s.winPct != null ? Math.round(s.winPct) : null, avgR: s.avgR, trades: s.trades, proven: !!s.proven, evidence: long,
    // The last few weeks of suggestions from the replay log. Small counts are shown as such.
    recent: rc && rc.closed ? { closed: rc.closed, wins: rc.wins, winPct: rc.winPct, avgR: rc.avgR, days: rc.days } : null,
  };
  if (t && t.status === 'open') {
    const check = sized(t.risk), blocked = check.verdict === 'BLOCK';
    // The tested entry is the close of the signal bar. One bar later, or a quarter of the risk away, it has passed.
    const minsAgo = Math.max(0, Math.round((dataNow - (t.signalT + BAR)) / MIN)), fresh = dataNow - (t.signalT + BAR) < BAR && Math.abs(t.rNow) <= 0.25;
    const late = !blocked && !fresh;
    return { ...base, tone: blocked ? 'bad' : t.dir > 0 ? 'long' : 'short', state: blocked ? 'Blocked' : late ? `${t.side} running` : t.side, headline: blocked ? 'Blocked' : late ? 'Entry passed' : t.side, side: t.side, fresh, live: true,
      sub: blocked ? check.reason : late ? `${t.side} from ${minsAgo} min ago at ${pts(t.entry)}. Price is now ${t.rNow >= 0 ? '+' : ''}${t.rNow.toFixed(2)}R from it. Do not chase. If you are in, the stop and target have not moved.` : t.reason + '.',
      entry: pts(t.entry), stop: pts(t.stop), target: t.target != null ? pts(t.target) : null, stopPoints: pts(t.risk), oneRisk: Math.round(pts(t.risk) * pv),
      contracts: check.contracts, riskDollars: check.riskDollars, check, signalT: t.signalT + BAR, rNow: t.rNow, flatAt: res.times.flat, signalId: `${s.id}:${key}`, taken: taken() };
  }
  if (t) {
    const word = t.status === 'target' ? 'Target hit' : t.status === 'stopped' ? 'Stopped' : 'Closed';
    return { ...base, tone: t.r > 0 ? 'good' : 'bad', state: word, headline: word, side: t.side, sub: `${t.side} from ${pts(t.entry)}, out at ${pts(t.exitPx)}. One trade a day for this setup: done.`,
      entry: pts(t.entry), stop: pts(t.stop), target: t.target != null ? pts(t.target) : null, exit: pts(t.exitPx), r: t.r, signalId: `${s.id}:${key}`, taken: taken() };
  }
  if (res.phase === 'armed') {
    const pending = (res.pending || []).map(p => { const check = sized(p.risk); return { side: p.side, trigger: pts(p.trigger), stop: pts(p.stop), target: pts(p.target), stopPoints: pts(p.risk), oneRisk: Math.round(pts(p.risk) * pv), contracts: check.contracts, riskDollars: check.riskDollars, check, signalId: `${s.id}:${key}`, taken: taken(p.side) }; });
    return { ...base, tone: 'armed', state: 'Armed', headline: 'Armed', sub: res.message, pending };
  }
  if (res.phase === 'done') return { ...base, tone: 'idle', state: 'Done', headline: 'No setup today', sub: res.message };
  return { ...base, tone: 'watch', state: 'Watching', headline: 'Watching', sub: res.message };
}

/** The one answer for right now. */
function answerFor({ session, feed, guard, settings, live, evaluated, dataNow, key, journal, prefs, recent }) {
  const next = session.next, countdown = next ? { countdownTo: next.start, countdownLabel: `${next.name} opens in` } : {};
  if (guard.lockout) return { kind: 'locked', tone: 'bad', headline: guard.breached ? 'Account limit reached' : 'Locked out', sub: guard.lockout.reason, countdownTo: guard.lockout.until, countdownLabel: 'Unlocks in' };
  if (!session.current && !live.length) return { kind: 'closed', tone: 'idle', headline: 'No trade right now', sub: next ? `Next window: ${next.name}.` : 'No window ahead.', ...countdown };
  if (!live.length) return { kind: 'standdown', tone: 'idle', headline: 'Stand down', sub: `No setup is switched on for the ${session.current.name} window. Nothing to trade here.`, ...countdown };
  const windowEndsAt = session.current?.end ?? null;
  if (feed.status === 'off' || feed.status === 'stale' || feed.status === 'error') return { kind: 'nofeed', tone: 'warn', headline: feed.status === 'stale' ? 'Feed stalled' : 'No live data', sub: feed.status === 'error' ? feed.error : feed.status === 'stale' ? 'Prices have stopped updating. No signal can be trusted until they are back.' : 'No prices are arriving. Check the internet connection, or open your TradingView chart (MNQ1!, 5 minutes) with the bridge extension on.', windowEndsAt };

  // Your focus setup leads. After that, the most active (in a trade, then armed, then watching); ties go to the better tested average.
  // A signal whose stop is too wide to take at your risk sits below an armed setup: it must not hide something tradable.
  const focus = (e) => ((prefs.focus || []).includes(e.setup.id) ? 1 : 0);
  const rank = (e) => (e.res.trade?.status === 'open' && Math.floor(settings.personal.riskPerTrade / (e.res.trade.risk * settings.instrument.pointValue)) < 1 ? 3.5 : RANK[e.res.phase]);
  const order = [...evaluated].sort((a, b) => focus(b) - focus(a) || rank(b) - rank(a) || (b.setup.avgR ?? -9) - (a.setup.avgR ?? -9));
  const ctx = { guard, settings, dataNow, key, journal, prefs, recent };
  const cards = order.map(e => card(e, ctx));
  const disagree = !!cards[0].live && cards.slice(1).some(o => o.live && o.side !== cards[0].side);
  return { kind: 'signal', ...cards[0], others: cards.slice(1), disagree, windowEndsAt, delayed: feed.delayed };
}

export function buildState({ now, store, feed, settings, journal, verdicts, demo = false, problem = null, news = null, recent = null }) {
  const prefs = settings.setups || {};
  const session = sessionAt(now);
  const hasLive = (id) => liveSetups(verdicts, id).length > 0;
  session.timeline = session.timeline.map(w => ({ ...w, live: hasLive(w.id), setups: windowSetups(verdicts, w.id, prefs).length, focus: windowSetups(verdicts, w.id, prefs).some(s => (prefs.focus || []).includes(s.id)) }));
  if (session.current) session.current = { ...session.current, live: hasLive(session.current.id) };
  if (session.next) session.next = { ...session.next, live: hasLive(session.next.id) };

  let guard = computeGuard(settings, journal, now);
  // If a saved file could not be read, the numbers above are not the real account: lock rather than guess.
  if (problem) guard = { ...guard, status: 'locked', lockout: { reason: `${problem} The guard cannot be trusted until this is fixed, so the desk is locked.`, until: null } };
  const f = feedState(now, store, feed);
  const ctx = store.ctx(), key = etKey(now), price = store.last()?.c ?? null;
  const run = (setup) => ({ setup, res: byId(setup.id).evaluate(ctx, key) });
  const live = session.current ? windowSetups(verdicts, session.current.id, prefs) : [];
  let evaluated = ctx.s.bars.length ? live.map(run) : [];
  // A setup from an earlier window whose trade is still open stays on the page until it is closed.
  if (ctx.s.bars.length) for (const s of verdicts.setups.filter(s => !s.carried && !live.includes(s) && !(prefs.off || []).includes(s.id))) { const e = run(s); if (e.res.phase === 'in-trade') { evaluated.push(e); live.push(s); } }
  const answer = answerFor({ dataNow: ctx.now, key, journal, prefs, recent, session, feed: evaluated.length || !live.length ? f : { ...f, status: f.status === 'live' || f.status === 'delayed' ? 'off' : f.status }, guard, settings, live, evaluated });

  const shown = answer.kind === 'signal' ? evaluated.find(e => e.setup.id === answer.setup.id)?.res : null;
  const levels = ctx.s.bars.length ? standardLevels(ctx, key, price, shown?.levels, shown?.times?.open) : [];

  // Projections are rules, never forecasts: where the next trigger, the stop and the target sit.
  const projections = [];
  if (answer.kind === 'signal' && answer.entry != null && answer.exit == null) {
    projections.push({ kind: 'entry', price: answer.entry, label: `${answer.side} entry` }, { kind: 'stop', price: answer.stop, label: 'Stop' });
    if (answer.target != null) projections.push({ kind: 'target', price: answer.target, label: 'Target' });
  } else if (answer.pending?.length) {
    const p = answer.pending[0];
    projections.push({ kind: 'trigger', price: p.trigger, label: `${p.side} if a 15m bar closes ${p.side === 'LONG' ? 'above' : 'below'}` }, { kind: 'stop', price: p.stop, label: 'Stop' }, { kind: 'target', price: p.target, label: 'Target' });
  }
  const closed = ctx.s.bars.slice(-96).map(b => [b.t, b.o, b.h, b.l, b.c]);
  const lastClosedEnd = closed.length ? closed.at(-1)[0] + BAR : 0;
  const formingRaw = ctx.raw.between(lastClosedEnd, Infinity);
  const forming = formingRaw.length ? [Math.floor(formingRaw[0].t / BAR) * BAR, formingRaw[0].o, Math.max(...formingRaw.map(r => r.h)), Math.min(...formingRaw.map(r => r.l)), formingRaw.at(-1).c] : null;

  // A scheduled release or a holiday right now is shown on the answer itself.
  if (news?.caution) answer.caution = news.caution;
  const top = news?.headlines.find(h => h.topic) || null;
  return {
    now, demo, session, feed: f, guard, answer, price, levels,
    news: news && { next: news.next, caution: news.caution, holiday: news.holiday ? { name: news.holiday.name, text: news.holiday.text, today: news.holiday.today } : null, top: top && { title: top.title, topic: top.topic, t: top.t, reaction: top.reaction }, shock: news.shocks[0] || null },
    chart: { bars: closed, forming, projections, windows: session.timeline, markers: shown?.times || null },
  };
}
