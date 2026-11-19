import test from 'node:test';
import assert from 'node:assert/strict';
import { zonedToUtc, zoned } from '../server/time.js';
import { sessionAt, WINDOWS } from '../server/sessions.js';

const Z = (s) => Date.parse(s + 'Z');
const MIN = 60000;
const idAt = (t) => sessionAt(t).current?.id ?? 'closed';

// Every boundary of a window: one minute before start is not it, start is, last minute is, end is not.
function edges(id, startZ, endZ) {
  const s = Z(startZ), e = Z(endZ);
  assert.notEqual(idAt(s - MIN), id, `${id} one minute before ${startZ}`);
  assert.equal(idAt(s), id, `${id} at start ${startZ}`);
  assert.equal(idAt(e - MIN), id, `${id} last minute before ${endZ}`);
  assert.notEqual(idAt(e), id, `${id} at end ${endZ}`);
}

test('time helpers convert wall clock to UTC across daylight saving', () => {
  assert.equal(zonedToUtc('America/Denver', 2026, 1, 15, 16, 0), Z('2026-01-15T23:00'));
  assert.equal(zonedToUtc('America/Denver', 2026, 7, 15, 16, 0), Z('2026-07-15T22:00'));
  assert.equal(zonedToUtc('Europe/London', 2026, 7, 15, 8, 0), Z('2026-07-15T07:00'));
  assert.equal(zonedToUtc('America/New_York', 2026, 12, 1, 9, 30), Z('2026-12-01T14:30'));
  const p = zoned(Z('2026-07-15T22:00'), 'America/Denver');
  assert.deepEqual([p.y, p.m, p.d, p.hh, p.mm, p.dow], [2026, 7, 15, 16, 0, 3]);
});

test('winter (US and UK both on standard time): all four windows', () => {
  edges('asia', '2026-01-14T23:00', '2026-01-15T05:00');   // 4-10 PM MST
  edges('london', '2026-01-15T08:00', '2026-01-15T12:00'); // 1-5 AM MST
  edges('nyopen', '2026-01-15T14:30', '2026-01-15T17:00'); // 7:30-10 AM MST
  edges('nymid', '2026-01-15T17:00', '2026-01-15T21:00');  // 10 AM-2 PM MST
  assert.equal(idAt(Z('2026-01-15T21:30')), 'closed');
  assert.equal(idAt(Z('2026-01-15T06:00')), 'closed');
});

test('summer (US and UK both on daylight time): all four windows', () => {
  edges('asia', '2026-07-14T22:00', '2026-07-15T04:00');
  edges('london', '2026-07-15T07:00', '2026-07-15T11:00'); // still 1-5 AM in Denver
  edges('nyopen', '2026-07-15T13:30', '2026-07-15T16:00');
  edges('nymid', '2026-07-15T16:00', '2026-07-15T20:00');
});

test('March gap: US has changed clocks, UK has not (Mar 8 to Mar 29, 2026)', () => {
  edges('asia', '2026-03-16T22:00', '2026-03-17T04:00');
  edges('london', '2026-03-17T08:00', '2026-03-17T12:00'); // 2-6 AM in Denver for these weeks
  edges('nyopen', '2026-03-17T13:30', '2026-03-17T16:00');
  edges('nymid', '2026-03-17T16:00', '2026-03-17T20:00');
  const lon = sessionAt(Z('2026-03-17T09:00')).current;
  assert.equal(zoned(lon.start, 'America/Denver').hh, 2);
});

test('autumn gap: UK has changed clocks, US has not (Oct 25 to Nov 1, 2026)', () => {
  edges('asia', '2026-10-26T22:00', '2026-10-27T04:00');
  edges('london', '2026-10-27T08:00', '2026-10-27T12:00');
  edges('nyopen', '2026-10-27T13:30', '2026-10-27T16:00');
  edges('nymid', '2026-10-27T16:00', '2026-10-27T20:00');
});

test('the change-over days themselves', () => {
  edges('asia', '2026-03-08T22:00', '2026-03-09T04:00');   // Sunday evening after US spring forward
  edges('asia', '2026-11-01T23:00', '2026-11-02T05:00');   // Sunday evening after US fall back
  edges('london', '2026-03-30T07:00', '2026-03-30T11:00'); // first Monday after UK spring forward
  edges('london', '2026-10-26T08:00', '2026-10-26T12:00'); // first Monday after UK fall back
  edges('nyopen', '2026-03-09T13:30', '2026-03-09T16:00');
  edges('nyopen', '2026-11-02T14:30', '2026-11-02T17:00');
  edges('nymid', '2026-11-02T17:00', '2026-11-02T21:00');
});

test('weekend: market shut from Friday close to Sunday evening', () => {
  assert.equal(idAt(Z('2026-07-17T22:30')), 'closed'); // Friday 4:30 PM Denver: no Asia window
  assert.equal(idAt(Z('2026-07-18T14:00')), 'closed'); // Saturday NY-open time
  assert.equal(idAt(Z('2026-07-19T08:00')), 'closed'); // Sunday London time
  assert.equal(idAt(Z('2026-07-19T22:30')), 'asia');   // Sunday evening reopens
  const s = sessionAt(Z('2026-07-18T14:00'));
  assert.equal(s.next.id, 'asia');
  assert.equal(s.next.start, Z('2026-07-19T22:00'));
});

test('next window and the day timeline', () => {
  const s = sessionAt(Z('2026-07-15T12:00')); // 6 AM Denver, between London and NY open
  assert.equal(s.current, null);
  assert.equal(s.next.id, 'nyopen');
  assert.equal(s.next.start, Z('2026-07-15T13:30'));
  assert.equal(s.dayStart, Z('2026-07-15T06:00'));
  assert.equal(s.dayEnd, Z('2026-07-16T06:00'));
  assert.deepEqual(s.timeline.map(w => w.id), ['london', 'nyopen', 'nymid', 'asia']);
  assert.equal(WINDOWS.length, 4);
});
