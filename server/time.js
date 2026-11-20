// Wall-clock helpers. All daylight-saving handling goes through the system time-zone database
// (Intl), so US and UK clock changes are right without hand-written rules.

export const MIN = 60000, HOUR = 36e5, DAY = 864e5;
export const BAR = 15 * MIN;
export const DENVER = 'America/Denver', NY = 'America/New_York', LONDON = 'Europe/London';

const fmts = new Map();
const fmt = (tz) => {
  if (!fmts.has(tz)) fmts.set(tz, new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric', weekday: 'short',
  }));
  return fmts.get(tz);
};
const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Wall-clock parts of instant `t` (ms) in time zone `tz`. dow: 0 = Sunday. */
export function zoned(t, tz) {
  const p = {};
  for (const x of fmt(tz).formatToParts(new Date(t))) p[x.type] = x.value;
  const y = +p.year, m = +p.month, d = +p.day;
  return { y, m, d, hh: +p.hour, mm: +p.minute, ss: +p.second, dow: DOW[p.weekday], key: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` };
}

/** Offset of `tz` from UTC at instant `t`, in ms (negative west of Greenwich). */
export function tzOffset(t, tz) {
  const p = zoned(t, tz);
  return Date.UTC(p.y, p.m - 1, p.d, p.hh, p.mm, p.ss) - Math.floor(t / 1000) * 1000;
}

/** Instant (ms) of a wall-clock time in `tz`. Month is 1-12. Day overflow is allowed (d = 32 rolls over). */
export function zonedToUtc(tz, y, m, d, hh = 0, mm = 0) {
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  let t = guess - tzOffset(guess, tz);
  t = guess - tzOffset(t, tz);
  return t;
}

/** Instant of `hours` (e.g. 9.5) New York time on date key 'YYYY-MM-DD'. */
export function etTime(key, hours) {
  const [y, m, d] = key.split('-').map(Number);
  return zonedToUtc(NY, y, m, d, Math.floor(hours), Math.round((hours % 1) * 60));
}
/** Instant of `hours` London time on date key 'YYYY-MM-DD'. */
export function londonTime(key, hours) {
  const [y, m, d] = key.split('-').map(Number);
  return zonedToUtc(LONDON, y, m, d, Math.floor(hours), Math.round((hours % 1) * 60));
}
export const etKey = (t) => zoned(t, NY).key;
export const utcKey = (t) => new Date(t).toISOString().slice(0, 10);
export const addDays = (key, n) => new Date(Date.parse(key + 'T12:00Z') + n * DAY).toISOString().slice(0, 10);
export const isWeekday = (key) => ![0, 6].includes(new Date(key + 'T12:00Z').getUTCDay());
