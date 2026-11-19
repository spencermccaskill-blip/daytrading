const $ = (id) => document.getElementById(id);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const fmt = (x, d = 2) => (x == null || !Number.isFinite(x) ? '--' : x.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }));
const signed = (x, d = 2) => (x == null ? '--' : (x > 0 ? '+' : '') + fmt(x, d));
const nyTime = (t) => new Date(t).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' });
const etDay = (t) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
let S = null, J = null, editingBudget = false;

// ── Rolling numbers: values tween from their last shown value and flash green/red on change ──
const prevVal = new Map();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
function rollNum(node, key, value, format) {
  const from = prevVal.get(key); prevVal.set(key, value);
  if (value == null || !Number.isFinite(value)) { node.textContent = format(value); return; }
  if (from == null || from === value || reduceMotion) { node.textContent = format(value); return; }
  node.classList.remove('flash-up', 'flash-down'); void node.offsetWidth; node.classList.add(value > from ? 'flash-up' : 'flash-down');
  const t0 = performance.now(), dur = 450;
  const stepFn = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); node.textContent = format(from + (value - from) * e); if (k < 1 && node.isConnected) requestAnimationFrame(stepFn); };
  requestAnimationFrame(stepFn);
}


// ── Tabs ─────────────────────────────────────────────
function showTab(t) {
  $('desk').hidden = t !== 'desk'; $('playbook').hidden = t !== 'playbook';
  const m = $(t); m.classList.remove('enter'); void m.offsetWidth; m.classList.add('enter'); revealPanels();
  for (const b of document.querySelectorAll('.tabs button')) {
    if (b.dataset.tab === t) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  history.replaceState(null, '', t === 'playbook' ? '#playbook' : '#');
}
for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => showTab(b.dataset.tab));

// ── Clocks ───────────────────────────────────────────
function etHour(d) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(d);
  return (+p.find((x) => x.type === 'hour').value % 24) + +p.find((x) => x.type === 'minute').value / 60;
}
function tick() {
  const d = new Date();
  $('clkET').textContent = d.toLocaleTimeString('en-GB', { timeZone: 'America/New_York', hour12: false });
  $('clkUTC').textContent = d.toLocaleTimeString('en-GB', { timeZone: 'UTC', hour12: false });
  const h = etHour(d), u = d.getUTCHours() + d.getUTCMinutes() / 60;
  $('session').textContent = h >= 9.5 && h < 11 ? 'NY signal window' : h >= 11 && h < 12 ? 'NY: manage only' : u >= 7 && u < 11 ? 'London window' : u < 7 ? 'Asian range building' : 'Off hours';
}

// ── Desk ─────────────────────────────────────────────
function renderStatus() {
  const f = S.feed, age = f.lastPost ? (S.now - f.lastPost) / 1000 : Infinity, st = $('status');
  let text = 'Chart not connected', cls = 'short';
  if (f.error && age < 30) { text = f.error; cls = 'armed'; }
  else if (age < 30) { const dl = /_DL:/.test(f.symbol || ''); text = `${dl ? 'Delayed' : 'Live'} · ${String(f.symbol).replace(/^.*:/, '')}`; cls = dl ? 'armed' : 'long'; }
  else if (f.lastPost) { text = 'Chart paused'; cls = 'armed'; }
  st.textContent = '● ' + text; st.className = 'status ' + cls;
  const n = $('notice');
  const need = !(age < 30) || !S.snap.ready;
  n.hidden = !need;
  if (need) {
    n.replaceChildren();
    const box = el('div', 'notice');
    box.append(el('span', '', 'Open TradingView on MNQ1! at 5 minutes, with the NQ Desk Bridge extension on, so prices come through.'));
    n.append(box);
  }
}

function word(s) {
  const t = s.trade;
  if (t) {
    if (t.status === 'open') return [t.side, t.dir > 0 ? 'long' : 'short'];
    if (t.status === 'target') return ['Target hit', 'long'];
    if (t.status === 'stopped') return ['Stopped out', 'short'];
    return ['Closed at noon', t.rNow >= 0 ? 'long' : 'short'];
  }
  return ({ 'no-data': ['No data yet', 'mute'], waiting: ['Standby', 'cyan'], watching: ['Watching', 'cyan'], armed: ['Armed', 'armed'], done: ['No trade today', 'mute'] })[s.phase] || ['Standby', 'cyan'];
}
function num(k, v, cls = '', roll) {
  const d = el('div'), dd = el('dd', cls, typeof v === 'string' ? v : '');
  d.append(el('dt', 'lbl', k), dd);
  if (roll) rollNum(dd, 'sig:' + k, roll[0], roll[1]);
  return d;
}

function renderSignal() {
  const ny = S.snap.setups?.[0]; if (!ny) return;
  const [w, cls] = word(ny), t = ny.trade, inst = S.settings.instrument;
  const wordEl = $('word'), changed = wordEl.textContent !== w;
  wordEl.textContent = w; wordEl.className = 'word ' + cls; if (changed) { void wordEl.offsetWidth; wordEl.classList.add('pop'); }
  $('signal').className = 'panel signal' + (cls === 'mute' ? '' : ' b-' + cls);
  let line = ny.message || '';
  if (t) { line = `${t.reason}. Signal on the ${nyTime(t.signalT + 15 * 60000)} ET close.`; if (t.contracts === 0) line += ` One ${inst} risks more than $${S.settings.riskBudget}, so skip it.`; }
  $('line').textContent = line;
  const n = $('nums'); n.replaceChildren();
  if (t) n.append(num('Entry', fmt(t.entry)), num('Stop', fmt(t.stop), 'short'), num('Target (2R)', fmt(t.target), 'long'), num('Risk', `${fmt(t.risk, 1)} pts`),
    num('Size', t.contracts > 0 ? `${t.contracts} ${inst}` : 'Skip', t.contracts > 0 ? '' : 'short'), num(t.status === 'open' ? 'Open P/L' : 'Result', '', t.rNow >= 0 ? 'long' : 'short', [t.rNow, (x) => `${signed(x)}R`]));
  else n.append(num('Last price', '', 'cyan', [S.snap.price, (x) => fmt(x)]), num('High swept', ny.swept?.high || 'None', ny.swept?.high ? 'armed' : 'mute'), num('Low swept', ny.swept?.low || 'None', ny.swept?.low ? 'armed' : 'mute'));
  const ld = S.snap.setups?.[1];
  if (ld) $('ldLine').textContent = ld.trade ? `Rule would have fired: ${ld.trade.side} at ${fmt(ld.trade.entry)}. Not traded: this setup lost money in testing.` : ld.message || '';
}

function renderLevels() {
  const L = S.snap.levels, px = S.snap.price, ny = S.snap.setups?.[0], ul = $('ladder');
  if (!L || px == null) return;
  const swept = new Set([ny?.swept?.high, ny?.swept?.low].filter(Boolean));
  const rows = [];
  const add = (name, v, sub) => v != null && rows.push({ name, v, sub });
  add('Prior day high', L.prior?.high); add('Asian high', L.asia?.high); add('London high', L.london?.high);
  add('London low', L.london?.low); add('Asian low', L.asia?.low); add('Prior day low', L.prior?.low);
  add('London VWAP', L.londonVwap, true); add('NY VWAP', L.nyVwap, true);
  rows.push({ name: 'Price', v: px, px: true });
  rows.sort((a, b) => b.v - a.v);
  ul.replaceChildren(...rows.map((r) => {
    const li = el('li', r.px ? 'px' : '');
    const name = el('span', r.sub ? 'name sub' : 'name', r.name); if (swept.has(r.name)) name.append(el('span', 'tag', 'swept'));
    const dist = el('span', 'dist ' + (r.px ? '' : r.v >= px ? 'long' : 'short')), val = el('span', 'v');
    li.append(name, dist, val);
    if (!r.px) rollNum(dist, 'dist:' + r.name, r.v - px, (x) => signed(x, 1)); rollNum(val, 'lvl:' + r.name, r.v, (x) => fmt(x));
    return li;
  }));
}

function renderNews() {
  const now = S.now, ev = S.calendar.filter((e) => e.t > now - 6 * 36e5).slice(0, 8), cal = $('cal');
  cal.replaceChildren(...(ev.length ? ev.map((e) => {
    const li = el('li', 'ev' + (e.t < now ? ' past' : ''));
    li.append(el('span', 'mono mute small', (etDay(e.t) === etDay(now) ? '' : new Date(e.t).toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short' }) + ' ') + nyTime(e.t)),
      el('span', '', e.title), el('span', 'small ' + (e.impact === 'High' ? 'short' : 'armed'), e.impact === 'High' ? 'High' : 'Med'));
    return li;
  }) : [el('li', 'mute', S.feedErrors.calendar || 'No US releases left this week.')]));
  const hl = $('headlines');
  hl.replaceChildren(...(S.news.length ? S.news.slice(0, 14).map((n) => {
    const li = el('li'), a = el('a', '', n.title); a.href = n.link; a.target = '_blank'; a.rel = 'noopener';
    const ago = n.t ? Math.max(0, Math.round((now - n.t) / 60000)) : null;
    li.append(a, el('div', 'meta', `${n.src}${ago != null ? ' · ' + (ago < 60 ? ago + 'm' : Math.round(ago / 60) + 'h') + ' ago' : ''}`));
    return li;
  }) : [el('li', 'mute', S.feedErrors.news || 'Loading headlines.')]));
}

// ── Playbook ─────────────────────────────────────────
function renderRisk() {
  const { riskBudget: b, instrument: inst } = S.settings, pv = inst === 'NQ' ? 20 : 2;
  if (!editingBudget) $('budget').value = b;
  for (const btn of document.querySelectorAll('.seg button')) btn.setAttribute('aria-checked', String(btn.dataset.inst === inst));
  $('maxStop').textContent = `${Math.round(b / pv)} pts`;
  const fits = Math.floor(b / (107 * pv));
  $('typSize').textContent = fits > 0 ? `${fits} ${inst}` : 'Skip'; $('typSize').className = 'mono ' + (fits > 0 ? 'long' : 'short');
}
async function saveSettings(body) {
  try {
    const r = await fetch('/api/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const j = await r.json(); if (!r.ok) throw new Error(j.error); $('riskErr').textContent = ''; load();
  } catch (e) { $('riskErr').textContent = e.message; }
}
$('budget').addEventListener('focus', () => (editingBudget = true));
$('budget').addEventListener('blur', () => { editingBudget = false; saveSettings({ riskBudget: $('budget').value }); });
$('riskForm').addEventListener('submit', (e) => { e.preventDefault(); $('budget').blur(); });
for (const b of document.querySelectorAll('.seg button')) b.addEventListener('click', () => saveSettings({ instrument: b.dataset.inst }));

const CHECKS = [
  ['levels', 'Levels marked: Asian, London 2 to 5 ET, prior day'], ['calendar', 'Checked the 8:30 and 10:00 ET releases'],
  ['wait', 'Waited for a pool to be swept'], ['size', 'One contract fits my risk, or I skip'],
  ['twoR', 'Stop past the extreme, target 2R'], ['flat', 'Flat by 12:00 ET'],
];
function renderChecks() {
  const on = new Set(J?.today?.checks || []), ul = $('checks');
  ul.replaceChildren(...CHECKS.map(([k, label]) => {
    const li = el('li'), lab = el('label'), box = el('input'); box.type = 'checkbox'; box.id = 'chk-' + k; box.checked = on.has(k);
    box.addEventListener('change', () => toggleCheck(k));
    lab.append(box, el('span', on.has(k) ? 'done' : '', label)); li.append(lab); return li;
  }));
}
async function toggleCheck(k) {
  const on = new Set(J?.today?.checks || []); on.has(k) ? on.delete(k) : on.add(k);
  try {
    const r = await fetch('/api/journal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ checks: [...on] }) });
    J = await r.json(); $('checkErr').textContent = ''; renderChecks();
  } catch { $('checkErr').textContent = 'Could not save. Is the NQ Desk server still running?'; }
}

// ── Backtest strategies (NQ 15m, Dec 2018 to Oct 20 2026, 1 pt cost, 2R target) ──
const STRATS = [
  { id: 'ny', name: 'NY sweep + shift', verdict: ['Promising, not proven', 'armed'],
    rules: 'After 9:30 ET a pool is swept, then a 15m close through the last 3 bars. Stop past the extreme, 2R, flat at noon.',
    is: [713, 48.2, 0.052, 1.42, -16.0], oos: [383, 51.4, 0.111, 2.31, -10.9], l12: [128, 52.3, 0.030, 0.39, -10.2],
    years: { 2019: 0.142, 2020: -0.037, 2021: 0.114, 2022: 0.071, 2023: 0.011, 2024: 0.147, 2025: 0.135, 2026: 0.032 },
    note: 'The most consistent setup tested: positive in both periods and 6 of 7 full years, long and short. It missed 2 of the 4 pass rules set in advance (drawdown 10.9R vs a 10R limit, last 12 months nearly flat). Median stop is about 107 NQ points, so roughly 4 in 10 signals are too wide for 1 MNQ at $250.' },
  { id: 'pb', name: 'London sweep + reclaim', verdict: ['Benched', 'short'],
    rules: 'Asian high or low swept during 07:00 to 11:00 UTC, then a 15m close back inside the range. Stop past the London extreme, 2R.',
    is: [820, 40.6, -0.060, -1.45, -70.5], oos: [447, 37.1, -0.089, -1.56, -46.8], l12: [156, 34.6, -0.164, -1.72, -36.8],
    years: { 2019: -0.162, 2020: -0.151, 2021: 0.056, 2022: -0.107, 2023: -0.013, 2024: -0.021, 2025: -0.009, 2026: -0.286 },
    note: 'Your original London playbook. It lost money in every version tested (1R, 2R, 3R, range target, time exit) and is getting worse: the last 12 months are its worst stretch.' },
  { id: 'brk', name: 'London range breakout', verdict: ['Benched', 'short'],
    rules: 'First 15m close outside the Asian range during 07:00 to 11:00 UTC, trade the break. Stop at the range midpoint, 2R.',
    is: [826, 44.4, 0.018, 0.57, -28.6], oos: [436, 42.7, -0.068, -1.68, -38.8], l12: [157, 43.3, -0.074, -1.29, -16.8],
    years: { 2019: -0.032, 2020: 0.250, 2021: -0.074, 2022: 0.071, 2023: -0.092, 2024: -0.124, 2025: -0.076, 2026: 0.009 },
    note: 'Tested as the opposite of your playbook. One big year (2020) carried it early; since 2024 it has lost money. No edge.' },
  { id: 'tjr', name: 'London TJR sweep + shift', verdict: ['No proven edge', 'mute'],
    rules: 'Asian high or low swept during 07:00 to 11:00 UTC, then a 15m close through the last 3 bars against the sweep. Stop past the extreme, 2R.',
    is: [623, 44.6, -0.039, -1.33, -30.2], oos: [328, 52.7, 0.055, 1.33, -5.5], l12: [119, 53.8, 0.065, 0.91, -5.4],
    years: { 2019: -0.133, 2020: -0.025, 2021: 0.022, 2022: -0.046, 2023: -0.020, 2024: 0.059, 2025: 0.083, 2026: 0.017 },
    note: 'The same idea as the NY model, run in London. Lost money 2019 to 2023, slightly positive since. A random-direction test made about as much over 2024 to 2026, so this is not distinguishable from luck.' },
  { id: 'tjrT', name: 'London TJR + 20-day trend', verdict: ['Unproven: one good year', 'armed'],
    rules: 'London TJR sweep + shift, only in the direction of the prior close versus its 20-day average.',
    is: [306, 47.7, 0.000, 0.01, -18.1], oos: [170, 55.9, 0.123, 2.05, -4.6], l12: [59, 54.2, 0.164, 1.42, -3.7],
    years: { 2019: -0.012, 2020: 0.023, 2021: 0.059, 2022: -0.023, 2023: -0.019, 2024: 0.005, 2025: 0.317, 2026: 0.012 },
    note: 'Looks good since 2024, but almost all of it is 2025. Take 2025 out and it is roughly flat. The filter was also chosen after seeing results, so treat this as a lead to watch, not a system.' },
];
let btSel = 'ny';
try { btSel = localStorage.getItem('nqdesk.bt') || 'ny'; } catch {}
function renderBacktest() {
  const s = STRATS.find((x) => x.id === btSel) || STRATS[0];
  const tabs = $('btTabs');
  tabs.replaceChildren(...STRATS.map((x) => {
    const b = el('button', '', x.name); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(x.id === s.id));
    b.addEventListener('click', () => { btSel = x.id; try { localStorage.setItem('nqdesk.bt', x.id); } catch {} renderBacktest(); });
    return b;
  }));
  $('btName').textContent = s.name;
  $('btVerdict').textContent = s.verdict[0]; $('btVerdict').className = 'small ' + s.verdict[1];
  $('btRules').textContent = s.rules;
  const head = el('tr'); for (const h of ['Period', 'Trades', 'Win %', 'Avg R', 't-stat', 'Worst run']) head.append(el('th', '', h));
  const row = (label, a) => { const tr = el('tr'); tr.append(el('td', '', label), el('td', '', a[0]), el('td', '', a[1].toFixed(1)), el('td', a[2] >= 0 ? 'long' : 'short', signed(a[2], 3)), el('td', '', a[3].toFixed(2)), el('td', '', a[4].toFixed(1) + 'R')); return tr; };
  const thead = el('thead'); thead.append(head); const tb = el('tbody');
  tb.append(row('2019 to 2023', s.is), row('2024 to today', s.oos), row('Last 12 months', s.l12));
  $('btTable').replaceChildren(thead, tb);
  $('btBig').textContent = signed(s.oos[2], 2) + 'R'; $('btBig').className = 'mono big ' + (s.oos[2] >= 0 ? 'cyan' : 'short');
  $('btNote').textContent = s.note;
  // year bars, one scale for every strategy so tabs compare fairly
  const ys = Object.entries(s.years), W = 640, H = 220, mid = 112, sc = 88 / 0.32, bw = W / ys.length, ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg'); svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `${s.name}, average R per trade by year`);
  const mk = (n, a, txt) => { const e = document.createElementNS(ns, n); for (const k in a) e.setAttribute(k, a[k]); if (txt) e.textContent = txt; svg.append(e); return e; };
  mk('line', { x1: 0, x2: W, y1: mid, y2: mid, stroke: '#1a1f2b', 'stroke-width': 2 });
  ys.forEach(([y, v], i) => {
    const h = Math.min(Math.abs(v) * sc, 92), x = i * bw + bw * 0.25, w = bw * 0.5, pos = v >= 0;
    mk('rect', { class: pos ? 'pos' : 'neg', x, y: pos ? mid - h : mid, width: w, height: Math.max(h, 2), rx: 4, fill: pos ? 'rgba(61,220,151,.12)' : 'rgba(255,92,116,.12)', stroke: pos ? '#3ddc97' : '#ff5c74', 'stroke-width': 1.5 });
    mk('text', { x: x + w / 2, y: pos ? mid - h - 8 : mid + h + 18, 'text-anchor': 'middle', 'font-size': 13, fill: '#f1f4fa', 'font-family': 'IBM Plex Mono, monospace' }, (v > 0 ? '+' : '') + v.toFixed(2));
    mk('text', { x: x + w / 2, y: H - 2, 'text-anchor': 'middle', 'font-size': 13, fill: '#8b95a9', 'font-family': 'IBM Plex Mono, monospace' }, y);
  });
  $('years').replaceChildren(svg);
}

// ── Signal / chart switch ────────────────────────────
let sigView = 'signal';
try { sigView = localStorage.getItem('nqdesk.view') || 'signal'; } catch {}
function setView(v) {
  sigView = v; try { localStorage.setItem('nqdesk.view', v); } catch {}
  $('viewSignal').hidden = v !== 'signal'; $('viewChart').hidden = v !== 'chart';
  const shown = $(v === 'chart' ? 'viewChart' : 'viewSignal'); shown.classList.remove('view-enter'); void shown.offsetWidth; shown.classList.add('view-enter');
  for (const b of document.querySelectorAll('#signal .pills button')) b.setAttribute('aria-selected', String(b.dataset.view === v));
  if (v === 'chart' && S?.snap?.ready) renderChart(true);
}
for (const b of document.querySelectorAll('#signal .pills button')) b.addEventListener('click', () => setView(b.dataset.view));

// ── Price chart: candles, pools outlined, and the time still to come ──
const COL = { asia: '#a99bff', lon: '#38d3f5', pd: '#e6e9f2', vw: '#f5b942' };
let tf = 15;
try { tf = +localStorage.getItem('nqdesk.tf') || 15; } catch {}
for (const b of document.querySelectorAll('#tfPills button')) b.addEventListener('click', () => { tf = +b.dataset.tf; try { localStorage.setItem('nqdesk.tf', tf); } catch {} renderChart(true); });

function candles() {
  const src15 = (S.snap.bars || []).map(([t, o, h, l, c]) => ({ t, o, h, l, c }));
  const agg = (rows, ms) => { const m = new Map(); for (const r of rows) { const k = Math.floor(r.t / ms) * ms, x = m.get(k); if (!x) m.set(k, { t: k, o: r.o, h: r.h, l: r.l, c: r.c }); else { x.h = Math.max(x.h, r.h); x.l = Math.min(x.l, r.l); x.c = r.c; } } return [...m.values()].sort((p, q) => p.t - q.t); };
  if (tf === 60) return agg(src15, 36e5).slice(-40);
  if (tf === 5) { const raw = (S.snap.raw || []).map(([t, o, h, l, c]) => ({ t, o, h, l, c })); return (S.snap.resMin <= 5 ? agg(raw, 3e5) : src15).slice(-120); }
  return src15.slice(-72);
}

function renderChart(fresh) {
  for (const b of document.querySelectorAll('#tfPills button')) b.setAttribute('aria-selected', String(+b.dataset.tf === tf));
  const bars = candles(), box = $('chart');
  if (bars.length < 5) { box.replaceChildren(el('p', 'mute', 'The chart appears once prices come through.')); return; }
  const L = S.snap.levels, ny = S.snap.setups?.[0], times = S.snap.times || {}, price = S.snap.price;
  const swept = new Set([ny?.swept?.high, ny?.swept?.low].filter(Boolean));
  const step = tf * 60000, lastT = bars.at(-1).t;
  // future: through 12:00 ET flat when today's NY session is still ahead, else 2 hours
  const futureEnd = times.flat && times.flat > lastT ? Math.min(times.flat + step, lastT + 30 * step) : lastT + Math.max(8, Math.round(2 * 36e5 / step)) * step;
  const nFuture = Math.max(Math.round(bars.length * 0.18), Math.round((futureEnd - lastT) / step));
  const N = bars.length + nFuture;

  const levels = [];
  const add = (name, v, kind) => v != null && levels.push({ name, v, kind, swept: swept.has(name) });
  add('Prior day high', L.prior?.high, 'pd'); add('Prior day low', L.prior?.low, 'pd');
  add('Asian high', L.asia?.high, 'asia'); add('Asian low', L.asia?.low, 'asia');
  add('London high', L.london?.high, 'lon'); add('London low', L.london?.low, 'lon');
  const vwaps = [['London VWAP', L.londonVwap], ['NY VWAP', L.nyVwap]].filter(([, v]) => v != null);
  const trade = ny?.trade, pending = ny?.pending || [];

  const W = 800, H = 470, padL = 8, padR = 224, padT = 30, padB = 30;
  let lo = Math.min(...bars.map((b) => b.l)), hi = Math.max(...bars.map((b) => b.h));
  const reach = (hi - lo) * 0.6;
  const inView = levels.filter((x) => x.v >= lo - reach && x.v <= hi + reach);
  const extra = [...inView.map((x) => x.v), ...(trade ? [trade.stop, trade.target] : []), ...pending.flatMap((p) => [p.stop, p.target])];
  for (const v of extra) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
  const y = (v) => padT + (hi - v) / (hi - lo) * (H - padT - padB);
  const cw = (W - padL - padR) / N, xi = (i) => padL + i * cw + cw / 2;
  const xt = (t) => padL + ((t - bars[0].t) / step) * cw + cw / 2;
  const xNow = xi(bars.length - 1) + cw / 2, xEnd = W - padR;

  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Price chart with liquidity levels and projected entries');
  if (fresh) svg.classList.add('chart-in');
  const mk = (n, a, txt, parent = svg) => { const e = document.createElementNS(ns, n); for (const k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; parent.append(e); return e; };
  const defs = mk('defs', {});
  for (const [k, c] of Object.entries(COL)) {
    const g = mk('linearGradient', { id: 'g-' + k, x1: 0, x2: 1, y1: 0, y2: 0 }, null, defs);
    mk('stop', { offset: '0%', 'stop-color': c, 'stop-opacity': 0.02 }, null, g); mk('stop', { offset: '100%', 'stop-color': c, 'stop-opacity': 0.16 }, null, g);
  }
  const pat = mk('pattern', { id: 'future', width: 8, height: 8, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, null, defs);
  mk('line', { x1: 0, y1: 0, x2: 0, y2: 8, stroke: 'rgba(255,255,255,.05)', 'stroke-width': 2 }, null, pat);

  // time still to come
  mk('rect', { x: xNow, y: padT - 10, width: xEnd - xNow, height: H - padT - padB + 10, fill: 'url(#future)', rx: 8 });
  mk('text', { x: xNow + 8, y: padT + 4, fill: '#8b95a9', 'font-size': 12, 'font-family': 'Outfit, sans-serif' }, 'Ahead');
  mk('line', { x1: xNow, x2: xNow, y1: padT - 10, y2: H - padB, stroke: 'rgba(46,230,255,.35)', 'stroke-dasharray': '3 4' });

  // session shading for London 2 to 5 ET and the NY window
  const etH = (t) => { const p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date(t)); return (+p.find((q) => q.type === 'hour').value % 24) + +p.find((q) => q.type === 'minute').value / 60; };
  const lonIdx = bars.map((b, i) => [i, etH(b.t)]).filter(([, h]) => h >= 2 && h < 5).map(([i]) => i);
  if (lonIdx.length) { const s0 = lonIdx.filter((i, k, a) => k === 0 || a[k - 1] !== i - 1).at(-1), e0 = lonIdx.at(-1); mk('rect', { x: padL + s0 * cw, y: padT - 10, width: (e0 - s0 + 1) * cw, height: H - padT - padB + 10, fill: 'rgba(255,255,255,.025)', rx: 8 }); mk('text', { x: padL + s0 * cw + 8, y: padT + 4, fill: '#8b95a9', 'font-size': 12, 'font-family': 'Outfit, sans-serif' }, 'London'); }
  // key times ahead or today: 9:30 open, 11:00 last signal, 12:00 flat
  for (const [k, [t, label]] of [[times.nyOpen, '9:30 open'], [times.lastSignal, '11:00 last signal'], [times.flat, '12:00 flat']].entries()) {
    if (!t) continue; const x = xt(t); if (x < padL || x > xEnd) continue;
    mk('line', { x1: x, x2: x, y1: padT - 10, y2: H - padB, stroke: 'rgba(138,149,174,.35)', 'stroke-dasharray': '2 5' });
    mk('text', { x: x + 4, y: padT + 20 + k * 14, fill: '#8b95a9', 'font-size': 11, 'font-family': 'Outfit, sans-serif' }, label);
  }

  // pools as soft outlined bands
  const bandH = Math.max(6, (H - padT - padB) * 0.018);
  for (const x of inView) {
    const yy = y(x.v), c = COL[x.kind];
    mk('rect', { x: padL, y: yy - bandH / 2, width: xEnd - padL + 6, height: bandH, rx: bandH / 2, fill: `url(#g-${x.kind})`, stroke: c, 'stroke-opacity': x.swept ? 0.9 : 0.55, 'stroke-width': 1.2, 'stroke-dasharray': x.swept ? '5 4' : '' });
  }
  for (const [, v] of vwaps) mk('line', { x1: padL, x2: xNow, y1: y(v), y2: y(v), stroke: COL.vw, 'stroke-opacity': 0.7, 'stroke-width': 1.2, 'stroke-dasharray': '2 5', 'stroke-linecap': 'round' });

  // trade boxes: an active trade, or what the rules would do next
  const boxes = [];
  if (trade) boxes.push({ ...trade, x0: Math.max(padL, xt(trade.signalT + 15 * 60000)), entry: trade.entry, label: `${trade.side} ${fmt(trade.entry)}`, live: true });
  for (const p of pending) boxes.push({ ...p, x0: xNow, entry: p.trigger, label: `If a 15m bar closes ${p.dir < 0 ? 'below' : 'above'} ${fmt(p.trigger)}: ${p.side}`, live: false });
  for (const bx of boxes) {
    const x1 = times.flat ? Math.min(xEnd, Math.max(bx.x0 + 30, xt(times.flat))) : xEnd;
    const yE = y(bx.entry), yS = y(bx.stop), yT = y(bx.target), g = mk('g', { class: bx.live ? '' : 'pending' });
    mk('rect', { x: bx.x0, y: Math.min(yE, yS), width: x1 - bx.x0, height: Math.abs(yS - yE), fill: 'rgba(255,92,116,.13)', stroke: '#ff5c74', 'stroke-opacity': 0.55, rx: 4 }, null, g);
    mk('rect', { x: bx.x0, y: Math.min(yE, yT), width: x1 - bx.x0, height: Math.abs(yT - yE), fill: 'rgba(61,220,151,.11)', stroke: '#3ddc97', 'stroke-opacity': 0.55, rx: 4 }, null, g);
    mk('line', { x1: bx.x0, x2: x1, y1: yE, y2: yE, stroke: '#f1f4fa', 'stroke-width': 1.5, 'stroke-dasharray': bx.live ? '' : '6 4' }, null, g);
  }

  // candles
  bars.forEach((b, i) => {
    const up = b.c >= b.o, c = up ? '#3ddc97' : '#ff5c74', x = xi(i), bw = Math.max(2, cw * 0.62);
    mk('line', { x1: x, x2: x, y1: y(b.h), y2: y(b.l), stroke: c, 'stroke-opacity': 0.75, 'stroke-width': 1 });
    mk('rect', { x: x - bw / 2, y: y(Math.max(b.o, b.c)), width: bw, height: Math.max(1.2, Math.abs(y(b.o) - y(b.c))), rx: 1.5, fill: up ? 'rgba(61,220,151,.85)' : 'rgba(255,92,116,.85)', class: i === bars.length - 1 ? 'live-candle' : '' });
  });

  // labels on the right, nudged apart
  const labels = [...inView.map((x) => ({ text: `${x.name}${x.swept ? ' · swept' : ''}`, v: x.v, c: COL[x.kind] })),
    ...vwaps.map(([n, v]) => ({ text: n, v, c: COL.vw })), { text: 'Price', v: price, c: '#38d3f5', px: true },
    ...boxes.flatMap((bx) => [
      { text: bx.live ? `${bx.side} entry` : `${bx.side} trigger (15m close)`, v: bx.entry, c: '#f1f4fa' },
      { text: 'Stop', v: bx.stop, c: '#ff5c74' },
      { text: `Target · ${bx.contracts > 0 ? bx.contracts + ' ' + S.settings.instrument : 'too wide'}`, v: bx.target, c: '#3ddc97' },
    ])]
    .map((l) => ({ ...l, y: y(l.v) })).sort((p, q) => p.y - q.y);
  for (let k = 1; k < labels.length; k++) if (labels[k].y - labels[k - 1].y < 24) labels[k].y = labels[k - 1].y + 24;
  for (const l of labels) {
    const x0 = W - padR + 14, g = mk('g', {});
    mk('path', { d: `M ${xEnd + 4} ${y(l.v)} C ${x0 - 4} ${y(l.v)}, ${x0 - 8} ${l.y}, ${x0} ${l.y}`, stroke: l.c, 'stroke-opacity': 0.5, fill: 'none' }, null, g);
    mk('rect', { x: x0, y: l.y - 11, width: padR - 18, height: 22, rx: 11, fill: l.px ? l.c : '#0b0e14', stroke: l.c, 'stroke-opacity': l.px ? 1 : 0.6 }, null, g);
    mk('text', { x: x0 + 10, y: l.y + 4.5, fill: l.px ? '#05060a' : '#f1f4fa', 'font-size': 12.5, 'font-family': 'Outfit, sans-serif', 'font-weight': l.px ? 700 : 500 }, `${l.text}  ${fmt(l.v)}`, g);
  }
  const far = levels.filter((x) => !inView.includes(x));
  far.forEach((x, k) => {
    const above = x.v > hi, yy = above ? padT + 18 + k * 16 : H - padB - 22 - k * 16;
    mk('text', { x: padL + 6, y: yy, fill: COL[x.kind], 'font-size': 12, 'font-family': 'Outfit, sans-serif' }, `${above ? '↑' : '↓'} ${x.name} ${fmt(x.v)} (${signed(x.v - price, 0)} pts)`);
  });
  // time axis, New York time
  const every = tf === 60 ? 6 : tf === 15 ? 3 : 1;
  for (let i = 0; i < N; i++) {
    const t = bars[0].t + i * step, h = etH(t); if (Math.abs(h % every) > 0.01 || i % 1) continue;
    mk('text', { x: xi(i), y: H - 8, fill: '#8b95a9', 'font-size': 11, 'text-anchor': 'middle', 'font-family': 'IBM Plex Mono, monospace' }, new Date(t).toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric' }));
  }
  $('chartNote').textContent = pending.length ? 'A pool is swept: the boxes show the next possible entry.' : trade ? 'Trade on: entry, stop and target drawn to 12:00 ET.' : '';
  box.replaceChildren(svg);
}


// ── Panels slide in as they scroll into view ──
const io = 'IntersectionObserver' in window && !reduceMotion ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }, { threshold: 0.08 }) : null;
function revealPanels() {
  if (!io) return;
  for (const p of document.querySelectorAll('main:not([hidden]) .panel')) {
    p.classList.remove('in'); p.classList.add('reveal');
    const r = p.getBoundingClientRect();
    if (r.top < innerHeight) { void p.offsetWidth; p.classList.add('in'); } else io.observe(p);
  }
}

// ── Loop ─────────────────────────────────────────────
async function load() {
  try {
    S = await (await fetch('/api/state')).json();
    renderStatus(); renderRisk(); renderNews();
    if (S.snap.ready) { renderSignal(); renderLevels(); if (sigView === 'chart') renderChart(false); }
  } catch {
    $('status').textContent = '● NQ Desk server stopped. Run npm.cmd start'; $('status').className = 'status short';
  }
}
async function loadJournal() { try { J = await (await fetch('/api/journal')).json(); renderChecks(); } catch {} }
renderBacktest(); setView(sigView); renderChecks();
if (location.hash === '#playbook') showTab('playbook'); else revealPanels(); tick(); setInterval(tick, 1000);
load(); setInterval(load, 2000); loadJournal();
