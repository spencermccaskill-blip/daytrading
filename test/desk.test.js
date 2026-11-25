import test from 'node:test';
import assert from 'node:assert/strict';
import { buildState } from '../server/desk.js';
import { loadVerdicts, windowSetups } from '../server/verdicts.js';
import { demoInput, SCENARIOS } from '../server/demo.js';
import { defaultSettings } from '../server/guard.js';
import { BarStore } from '../server/bars.js';

const Z = (s) => Date.parse(s + 'Z');
const demo = (name) => buildState(demoInput(name));

test('real verdicts: nothing is proven, but every window shows its setups with a score', () => {
  const v = loadVerdicts();
  assert.equal(v.setups.filter(s => s.proven).length, 0);
  const n1 = v.setups.find(s => s.id === 'ny_sweep_shift');
  assert.deepEqual([n1.label, n1.score, n1.trades], ['Promising, not proven', 5.1, 383]);
  for (const id of ['asia', 'london', 'nyopen', 'nymid']) assert.ok(windowSetups(v, id).length >= 3, id);
  assert.equal(windowSetups(v, 'nyopen')[0].id, 'ny_orb15'); // ranked by tested average, not by win rate
  // No bars at all: never a signal.
  const empty = buildState({ now: Z('2026-07-15T14:00'), store: new BarStore(), feed: { symbol: null, lastPost: 0 }, settings: defaultSettings(), journal: { trades: [] }, verdicts: v });
  assert.equal(empty.answer.kind, 'nofeed');
  // With bars: the most active setup is shown with its score and an honest line about its testing.
  const s = buildState({ ...demoInput('long'), verdicts: v });
  assert.equal(s.answer.kind, 'signal');
  assert.equal(s.answer.proven, false);
  assert.ok(s.answer.score > 0 && s.answer.score < 10);
  assert.match(s.answer.evidence, /Since 2024: won \d+% of \d+ tested trades.*Not proven\./);
  assert.ok(s.answer.others.length >= 3);
  assert.ok(s.session.timeline.every(w => w.live === false && w.setups >= 3));
});

test('a setup that lost money in testing says so next to its score', () => {
  const v = loadVerdicts(), ib = v.setups.find(s => s.id === 'ny_ib');
  assert.ok(ib.score >= 5.5 && ib.avgR < 0); // wins often, loses overall
  v.setups = v.setups.filter(s => s.id === 'ny_ib');
  const s = buildState({ ...demoInput('won'), verdicts: v });
  assert.match(s.answer.evidence, /lost money in testing/);
});

test('outside every window: no trade right now, with a countdown to the next window', () => {
  const s = demo('closed');
  assert.equal(s.answer.kind, 'closed');
  assert.equal(s.answer.headline, 'No trade right now');
  assert.equal(s.answer.countdownTo, s.session.next.start);
  assert.equal(s.session.next.id, 'nyopen');
});

test('demo walk-through: watching, armed, long, short, won, lost', () => {
  assert.equal(demo('watching').answer.state, 'Watching');
  const armed = demo('armed').answer;
  assert.equal(armed.state, 'Armed');
  assert.equal(armed.pending[0].side, 'LONG');
  assert.ok(armed.pending[0].trigger > armed.pending[0].stop);
  const long = demo('long').answer;
  assert.deepEqual([long.kind, long.state, long.check.verdict], ['signal', 'LONG', 'PASS']);
  assert.ok(long.contracts >= 1 && long.stop < long.entry && long.target === long.entry + 2 * (long.entry - long.stop));
  assert.ok(long.riskDollars <= 250);
  const short = demo('short').answer;
  assert.equal(short.state, 'SHORT');
  assert.ok(short.stop > short.entry && short.target < short.entry);
  assert.equal(demo('won').answer.state, 'Target hit');
  assert.equal(demo('lost').answer.state, 'Stopped');
});

test('the guard blocks a signal that does not fit, and a lockout replaces the answer', () => {
  const b = demo('blocked').answer;
  assert.deepEqual([b.kind, b.state, b.check.verdict], ['signal', 'Blocked', 'BLOCK']);
  assert.match(b.sub, /daily stop/i);
  const l = demo('locked');
  assert.equal(l.answer.kind, 'locked');
  assert.equal(l.guard.status, 'locked');
  assert.equal(l.answer.countdownTo, l.guard.lockout.until);
});

test('a stalled feed is never shown as a signal', () => {
  const s = demo('stale');
  assert.equal(s.feed.status, 'stale');
  assert.equal(s.answer.kind, 'nofeed');
  assert.equal(s.answer.entry, undefined);
});

test('delayed data is labelled as delayed', () => {
  const s = demo('long');
  assert.equal(s.feed.delayed, true);
  assert.match(s.feed.label, /delayed/i);
  const live = buildState({ ...demoInput('long'), feed: { symbol: 'CME_MINI:MNQ1!', lastPost: demoInput('long').now } });
  assert.equal(live.feed.delayed, false);
});

test('chart payload: levels, rule-based projections only, and every demo scenario builds', () => {
  const s = demo('armed');
  assert.ok(s.chart.bars.length > 20);
  assert.deepEqual(s.chart.projections.map(p => p.kind), ['trigger', 'stop', 'target']);
  assert.ok(s.levels.some(l => l.name === 'London low' && l.swept));
  const long = demo('long');
  assert.deepEqual(long.chart.projections.map(p => p.kind), ['entry', 'stop', 'target']);
  for (const name of SCENARIOS) assert.ok(demo(name).answer.headline, name);
  assert.equal(demo('long').demo, true);
});

test('connected chart with no new bar for 45+ minutes counts as stalled, not as delayed data', () => {
  const inp = demoInput('long');
  const s = buildState({ ...inp, now: inp.now + 50 * 60000, feed: { symbol: 'CME_MINI:MNQ1!', lastPost: inp.now + 50 * 60000 - 1000 } });
  assert.equal(s.feed.status, 'stale');
  assert.match(s.feed.label, /No new bars for 5\d min/);
  assert.equal(s.answer.kind, 'nofeed');
});

test('a signal too wide to take does not hide a setup that can still be traded', () => {
  const v = loadVerdicts();
  v.setups = v.setups.filter(s => ['ny_sweep_shift', 'ny_ib'].includes(s.id));
  const tight = defaultSettings(); tight.personal.riskPerTrade = 100;       // the demo LONG needs $195 on 1 MNQ: cannot be taken
  const s = buildState({ ...demoInput('late'), verdicts: v, settings: tight }); // 10:41 ET: the first hour is set, so the breakout setup is armed
  assert.equal(s.answer.setup.id, 'ny_ib');
  assert.equal(s.answer.state, 'Armed');
  assert.ok(s.answer.others.some(o => o.setup.name === 'NY sweep + shift' && o.state === 'Blocked'));
  const normal = buildState({ ...demoInput('late'), verdicts: v });
  assert.equal(normal.answer.setup.id, 'ny_sweep_shift');                    // at $250 it fits, so the live signal leads
});
