// US market holidays that change when MNQ trades. Times are Chicago (exchange) clock time.
//   halt   - when equity-index futures stop that day ('00:00' = shut all day)
//   reopen - when they start again the same day, or null if they stay shut until the next session
// CME finalises holiday hours about two weeks ahead, so rows marked confirmed: false are the usual
// pattern, not a published schedule. The page says so. Add next year's rows here when CME posts them.
import { zoned, zonedToUtc, DENVER, DAY } from './time.js';

const CHICAGO = 'America/Chicago';

export const HOLIDAYS = [
  { date: '2026-11-26', name: 'Thanksgiving', halt: '12:00', reopen: '17:00', stocks: 'US stock market closed', confirmed: true,
    note: 'Volume is thin all day. Thin markets can jump on little news, and stops slip.' },
  { date: '2026-11-27', name: 'Black Friday (day after Thanksgiving)', halt: '12:15', reopen: null, stocks: 'US stock market closes early, 11:00 AM Denver', confirmed: false,
    note: 'A short, usually quiet day. In this desk\'s price history, 5 of the last 7 Black Fridays had about half the usual range and volume; 2021 was the exception, at double, on surprise news.' },
  { date: '2026-12-24', name: 'Christmas Eve', halt: '12:15', reopen: null, stocks: 'US stock market closes early, 11:00 AM Denver', confirmed: false,
    note: 'A short day with thin volume. No evening session.' },
  { date: '2026-12-25', name: 'Christmas Day', halt: '00:00', reopen: null, stocks: 'US stock market closed', confirmed: true, note: 'Markets are shut all day.' },
  { date: '2026-12-31', name: 'New Year\'s Eve', halt: '16:00', reopen: null, stocks: 'US stock market open normal hours', confirmed: false, note: 'Normal day session, thin volume, no evening session.' },
  { date: '2027-01-01', name: 'New Year\'s Day', halt: '00:00', reopen: null, stocks: 'US stock market closed', confirmed: true, note: 'Markets are shut all day.' },
];

const at = (date, hhmm) => { const [y, m, d] = date.split('-').map(Number), [hh, mm] = hhmm.split(':').map(Number); return zonedToUtc(CHICAGO, y, m, d, hh, mm); };
const denverClock = new Intl.DateTimeFormat('en-US', { timeZone: DENVER, hour: 'numeric', minute: '2-digit' });

/** Stretches of time MNQ is shut because of a holiday, as [start, end) in ms. */
export function closures(list = HOLIDAYS) {
  return list.map(h => {
    const [y, m, d] = h.date.split('-').map(Number);
    return { start: at(h.date, h.halt), end: h.reopen ? at(h.date, h.reopen) : zonedToUtc(CHICAGO, y, m, d + 1, 0, 0), holiday: h };
  });
}

let defaultClosures = null;
/** The start of the first holiday closure that begins after `from` and before `to`, or null. */
export function haltWithin(from, to, list = HOLIDAYS) {
  const shut = list === HOLIDAYS ? (defaultClosures ??= closures()) : closures(list);
  let first = null;
  for (const c of shut) if (c.start > from && c.start < to && (first == null || c.start < first)) first = c.start;
  return first;
}

/** Cut holiday closures out of a list of windows ({ start, end, ... }). Windows left shorter than 15 minutes are dropped. */
export function clipToOpenHours(windows, list = HOLIDAYS) {
  const shut = closures(list), out = [];
  for (const w of windows) {
    let { start, end } = w, short = null;
    for (const c of shut) {
      if (c.end <= start || c.start >= end) continue;
      short = c.holiday.name;
      if (c.start <= start) start = Math.min(end, c.end); else end = c.start;
    }
    if (end - start >= 15 * 60000) out.push(short ? { ...w, start, end, shortened: short } : w);
  }
  return out;
}

/** The holiday today (Denver date) or coming in the next `days` days, with the times put in Denver terms. */
export function holidayNotice(now, days = 3, list = HOLIDAYS) {
  const today = zoned(now, DENVER).key;
  const h = list.find(x => x.date >= today && Date.parse(x.date + 'T12:00Z') - Date.parse(today + 'T12:00Z') <= days * DAY);
  if (!h) return null;
  const isToday = h.date === today, allDay = h.halt === '00:00';
  const haltAt = allDay ? null : at(h.date, h.halt), reopenAt = h.reopen ? at(h.date, h.reopen) : null;
  const hours = allDay ? 'MNQ does not trade.' : `MNQ stops at ${denverClock.format(haltAt)} Denver${reopenAt ? ` and reopens at ${denverClock.format(reopenAt)}` : ' and stays shut until the next session'}.`;
  const when = isToday ? 'Today' : new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' }).format(Date.parse(h.date + 'T12:00Z'));
  return {
    date: h.date, name: h.name, today: isToday, confirmed: h.confirmed, haltAt, reopenAt, stocks: h.stocks,
    text: `${when} is ${h.name}. ${h.stocks}. ${hours}${h.confirmed ? '' : ' These hours are the usual pattern; check CME\'s holiday calendar.'} ${h.note} Lucid needs every position closed before the market shuts.`,
    // Shown on the answer itself while it is the holiday and the market is still open.
    caution: isToday && !allDay && now < haltAt ? `${h.name}: ${hours} Volume is thin, so moves can be jumpy and stops can slip. Be flat before it stops.` : null,
  };
}
