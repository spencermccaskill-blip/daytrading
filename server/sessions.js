// The four trading windows of Spencer's day, and where "now" sits among them.
// Each window is pinned to the clock of the market it follows, then shown in Denver time:
//   Asia evening  4-10 PM Denver            (CME reopen)
//   London        8 AM-12 PM London         (1-5 AM Denver; 2-6 AM in the weeks US and UK clocks disagree)
//   NY open       9:30 AM-12 PM New York    (7:30-10 AM Denver, always)
//   NY midday     12-4 PM New York          (10 AM-2 PM Denver, always)
import { zoned, zonedToUtc, DENVER, NY, LONDON, DAY } from './time.js';
import { clipToOpenHours } from './holidays.js';

export const WINDOWS = [
  { id: 'asia', name: 'Asia evening', tz: DENVER, start: [16, 0], end: [22, 0], days: [0, 1, 2, 3, 4] },
  { id: 'london', name: 'London', tz: LONDON, start: [8, 0], end: [12, 0], days: [1, 2, 3, 4, 5] },
  { id: 'nyopen', name: 'NY open', tz: NY, start: [9, 30], end: [12, 0], days: [1, 2, 3, 4, 5] },
  { id: 'nymid', name: 'NY midday / close', tz: NY, start: [12, 0], end: [16, 0], days: [1, 2, 3, 4, 5] },
];

/** Every window occurrence that overlaps [from, to), sorted by start. */
export function occurrences(from, to) {
  const out = [];
  for (const w of WINDOWS) {
    const p = zoned(from - DAY, w.tz);
    for (let i = 0; i < Math.ceil((to - from) / DAY) + 3; i++) {
      const start = zonedToUtc(w.tz, p.y, p.m, p.d + i, ...w.start);
      const end = zonedToUtc(w.tz, p.y, p.m, p.d + i, ...w.end);
      if (!w.days.includes(zoned(start, w.tz).dow)) continue;
      if (end > from && start < to) out.push({ id: w.id, name: w.name, start, end });
    }
  }
  return clipToOpenHours(out).filter(o => o.end > from && o.start < to).sort((a, b) => a.start - b.start);
}

/** Where `now` is: the open window (or null), the next one, and today's Denver-day timeline. */
export function sessionAt(now) {
  const occ = occurrences(now - DAY, now + 5 * DAY);
  const current = occ.find(o => now >= o.start && now < o.end) || null;
  const next = occ.find(o => o.start > now) || null;
  const d = zoned(now, DENVER);
  const dayStart = zonedToUtc(DENVER, d.y, d.m, d.d, 0, 0), dayEnd = zonedToUtc(DENVER, d.y, d.m, d.d + 1, 0, 0);
  return { now, current, next, dayStart, dayEnd, timeline: occ.filter(o => o.end > dayStart && o.start < dayEnd) };
}
