import test from 'node:test';
import assert from 'node:assert/strict';
import { buildState } from '../server/desk.js';
import { loadVerdicts } from '../server/verdicts.js';
import { demoInput, SCENARIOS } from '../server/demo.js';
import { defaultSettings } from '../server/guard.js';
import { BarStore } from '../server/bars.js';

const Z = (s) => Date.parse(s + 'Z');
const demo = (name) => buildState(demoInput(name));

test('real verdicts: nothing passed, so every window is stand-down and no setup is live', () => {
  const v = loadVerdicts();
  assert.equal(v.setups.filter(s => s.label === 'Passed').length, 0);
  assert.ok(v.setups.find(s => s.id === 'ny_sweep_shift').label === 'Promising, not proven');
  assert.ok(v.setups.some(s => s.window === 'london' && s.label === 'Benched'));
  for (const [iso, id] of [['2026-07-15T23:00', 'asia'], ['2026-07-15T08:00', 'london'], ['2026-07-15T14:00', 'nyopen'], ['2026-07-15T17:00', 'nymid']]) {
    const s = buildState({ now: Z(iso), store: new BarStore(), feed: { symbol: null, lastPost: 0 }, settings: defaultSettings(), journal: { trades: [] }, verdicts: v });
    assert.equal(s.session.current.id, id);
    assert.equal(s.answer.kind, 'standdown', id);
    assert.match(s.answer.headline, /stand down/i);
    assert.ok(s.session.timeline.every(w => w.live === false));
  }
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
