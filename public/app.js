// The Desk page. Asks the local server for the state every 2 seconds and draws only what changed.
import { drawChart, levelColor } from './chart.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const demo = new URLSearchParams(location.search).get('demo');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const usd = (x, sign = false) => (x < 0 ? '-' : sign && x > 0 ? '+' : '') + '$' + Math.abs(Math.round(x)).toLocaleString('en-US');
const px = (x) => Number(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const signed = (x, d = 1) => (x > 0 ? '+' : '') + x.toFixed(d);
const tzTime = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit', second: '2-digit' });
const tzShort = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit' });
const tzDate = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const tzDay = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', weekday: 'short', hour: 'numeric', minute: '2-digit' });
const short = (t) => tzShort.format(t).replace(':00', '').replace(' ', '');
function span(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h ? `${h}h ${String(m).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
}
const ago = (t, now) => { const m = Math.max(0, Math.round((now - t) / 60000)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : tzDay.format(t); };

// ── Drawing without flicker ──
// A region is only rewritten when its content really changed, so open menus, focus and scroll are left alone.
const drawn = new WeakMap();
function setHTML(el, html) { if (drawn.get(el) === html) return false; drawn.set(el, html); el.innerHTML = html; return true; }
// Fold-out sections remember whether you opened them, across refreshes of the data.
const openKeys = new Map();
try { for (const [k, v] of Object.entries(JSON.parse(sessionStorage.getItem('desk-open') || '{}'))) openKeys.set(k, v); } catch { /* nothing saved */ }
const isOpen = (key, fallback = false) => (openKeys.has(key) ? openKeys.get(key) : fallback);
document.addEventListener('toggle', (e) => {
  const key = e.target.dataset?.key; if (!key) return;
  openKeys.set(key, e.target.open);
  try { sessionStorage.setItem('desk-open', JSON.stringify(Object.fromEntries(openKeys))); } catch { /* ignore */ }
}, true);
const fold = (key, fallback) => `data-key="${esc(key)}"${isOpen(key, fallback) ? ' open' : ''}`;
for (const d of document.querySelectorAll('details[data-key]')) d.open = isOpen(d.dataset.key, d.open);

// ── Rolling numbers: tween from the last shown value, with a brief green/red flash ──
const shown = new Map();
function roll(node, key, value, format, flash = true) {
  const from = shown.get(key); shown.set(key, value);
  if (from === value) return;
  if (from == null || reduceMotion || !Number.isFinite(from)) { node.textContent = format(value); return; }
  if (flash) { node.classList.remove('flash-up', 'flash-down'); void node.offsetWidth; node.classList.add(value > from ? 'flash-up' : 'flash-down'); }
  const t0 = performance.now(), dur = 520;
  const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); node.textContent = format(from + (value - from) * e); if (k < 1 && shown.get(key) === value) requestAnimationFrame(step); else if (shown.get(key) === value) node.textContent = format(value); };
  requestAnimationFrame(step);
}

// ── Clock: the server's time, carried forward by this browser's clock between polls ──
let state = null, fetchedAt = 0, riskLimit = 250;
const nowMs = () => (state ? (demo ? state.now : state.now + (Date.now() - fetchedAt)) : Date.now());

// ── Guard ──
function drawGuard(g) {
  $('guard').dataset.status = g.status;
  roll($('gRoom'), 'room', g.room, (v) => usd(v));
  $('gRoom').className = 'mono ' + (g.room <= 0 ? 'bad' : g.room < 500 ? 'warn' : '');
  const roomPct = Math.max(0, Math.min(1, g.room / g.maxLossLimit));
  $('gRoomBar').style.width = roomPct * 100 + '%'; $('gRoomBar').style.background = g.room < 500 ? 'var(--short)' : g.room < 1000 ? 'var(--armed)' : 'var(--long)';
  const used = g.dailyLossUsed, usedPct = Math.min(1, used / g.dailyStop);
  if (setHTML($('gLoss'), `<span id="gLossN"></span> <small>of ${usd(g.dailyStop)}</small>`)) shown.delete('loss');
  roll($('gLossN'), 'loss', used, (v) => usd(v));
  $('gLoss').className = 'mono ' + (usedPct >= 1 ? 'bad' : usedPct > 0 ? 'warn' : '');
  $('gLossBar').style.width = usedPct * 100 + '%'; $('gLossBar').style.background = usedPct >= 1 ? 'var(--short)' : 'var(--armed)';
  $('gTrades').textContent = g.tradesToday + (g.openTrades ? ` (${g.openTrades} open)` : '');
  setHTML($('gLosses'), `${g.lossesToday} <small>of ${g.maxLosses}</small>`);
  $('gLosses').className = 'mono ' + (g.lossesToday >= g.maxLosses ? 'bad' : g.lossesToday ? 'warn' : '');
  setHTML($('gLeft'), g.breached ? '0' : `${g.lossesLeft} <small>at ${usd(g.riskPerTrade)}</small>`);
  $('gLeft').className = 'mono ' + (g.lossesLeft <= 2 ? 'bad' : g.lossesLeft <= 5 ? 'warn' : '');
  $('gStatus').textContent = g.lockout ? (g.breached ? 'Limit reached' : 'Locked out') : g.small ? `Small cushion: 1 micro, ${usd(g.riskPerTrade)} risk` : g.thin ? 'Thin cushion: one loss and done' : g.status === 'caution' ? 'Careful' : 'Clear to trade';
  $('gStatus').title = g.lockout?.reason || `Balance ${usd(g.balance)}. Limit at ${usd(g.floor)}${g.floorLocked ? ' (locked)' : ''}. Up to ${g.maxContracts} MNQ.`;
}

// ── Timeline across the Denver day ──
const SHORT_NAME = { asia: 'Asia', london: 'London', nyopen: 'NY', nymid: 'Mid' };
const WIN_VAR = { asia: 'var(--asia)', london: 'var(--london)', nyopen: 'var(--nyopen)', nymid: 'var(--nymid)' };
function drawTimeline(s) {
  const { dayStart, dayEnd, timeline, current } = s.session, len = dayEnd - dayStart, pct = (t) => (100 * (Math.min(Math.max(t, dayStart), dayEnd) - dayStart)) / len;
  let html = '';
  for (let h = 0; h <= 24; h += 6) { const t = dayStart + (h / 24) * len; html += `<span class="tl-tick" style="left:${pct(t)}%"></span><span class="tl-hour${h === 24 ? ' end' : ''}" style="left:${pct(t)}%">${h === 0 || h === 24 ? '12AM' : h === 12 ? '12PM' : h < 12 ? h + 'AM' : h - 12 + 'PM'}</span>`; }
  for (const w of timeline) {
    const a = pct(w.start), b = pct(w.end);
    html += `<div class="tl-win" data-live="${w.live}" data-focus="${!!w.focus}" data-now="${current?.id === w.id && current.start === w.start}" style="left:${a}%;width:${b - a}%;--c:${WIN_VAR[w.id]}" title="${esc(w.name)}: ${short(w.start)} to ${short(w.end)} Denver.${w.shortened ? ' Shortened for ' + esc(w.shortened) + '.' : ''}${w.focus ? ' Your focus setup trades here.' : ''}"><b><span class="full">${esc(w.name)}</span><span class="abbr">${SHORT_NAME[w.id]}</span></b><span class="when">${short(w.start)}-${short(w.end)}${w.shortened ? ' · short day' : ''}${w.focus ? ' · focus' : ''}</span></div>`;
  }
  html += `<div class="tl-now" id="tlNow"><span></span></div>`;
  setHTML($('timeline'), html);
  tick();
}

// ── One setup's trade numbers, used for the leading setup and for every other one ──
const takeInfo = new Map();
// Setups from the November 2026 course research carry an asterisk wherever their name appears.
const star = (x) => (x?.research ? '<sup class="star" title="New from the November 2026 course research">*</sup>' : '');
const chip = (c) => `<span class="chip ${c.verdict === 'PASS' ? 'pass' : 'block'}">${c.verdict}</span>`;
const cells = (list) => `<div class="nums">${list.map(([l, v, c, note]) => `<div><span class="lbl">${l}</span><b class="${c || ''}">${v}</b>${note ? `<small class="${c || 'mute'}">${note}</small>` : ''}</div>`).join('')}</div>`;
// Size and risk: when the stop is too wide for your risk, show what one micro would cost instead of "none".
const sizeCells = (c) => c.contracts >= 1 ? [['Size', `${c.contracts} MNQ`, ''], ['Risk', usd(c.riskDollars), '']] : [['Size', '1 MNQ', 'warn', 'smallest size'], ['Risk', usd(c.oneRisk), 'bad', `over your ${usd(riskLimit)}`]];

/** The green "+": put this trade in the journal. For an armed trade the key also carries the side. */
function plus(c, p) {
  if (demo || !c.signalId && !p) return '';
  const id = p ? p.signalId : c.signalId, key = p ? `${id}|${p.side}` : id, src = p || c, done = c.exit != null;
  takeInfo.set(key, { id, pending: !!p, name: c.setup.name, side: p ? p.side : c.side, entry: p ? p.trigger : c.entry, stop: src.stop, target: src.target, contracts: Math.max(1, src.contracts || 0) });
  if (src.taken) return `<div class="take"><span class="took">In your journal</span><span class="mute small">${done ? '' : 'The result fills in by itself at the target, stop or time exit.'}</span></div>`;
  const label = done ? 'I took this one' : p ? `I am in this ${p.side}` : 'I took this';
  const hint = src.contracts >= 1 || done ? 'You confirm your entry price first.' : `One micro risks ${usd(src.oneRisk)}, over your ${usd(riskLimit)}. It will be logged as over your risk.`;
  return `<div class="take"><button class="plus" type="button" data-take="${esc(key)}" aria-label="${esc(label)}: add ${esc(c.setup.name)} to the journal">+</button><span><b>${label}</b> <span class="mute small">${hint}</span></span></div>`;
}
function tradeBlock(c) {
  if (c.entry != null) {
    const list = [['Entry', px(c.entry), ''], ['Stop', px(c.stop), 'bad'], ['Target', c.target != null ? px(c.target) : 'none', 'good']];
    if (c.exit != null) list.push(['Out at', px(c.exit), ''], ['Result', signed(c.r, 2) + 'R', c.r > 0 ? 'good' : 'bad']);
    else if (c.fresh === false && c.state !== 'Blocked' && c.state !== 'Too wide') list.push(['Now', signed(c.rNow, 2) + 'R', c.rNow >= 0 ? 'good' : 'bad'], ['Entry was', short(c.signalT), '']);
    else list.push(...sizeCells(c));
    return cells(list) + plus(c);
  }
  if (c.pending?.length) return `<div class="pend">${c.pending.map(p => `<div class="pend-row"><p><b class="${p.side === 'LONG' ? 'good' : 'bad'}">${p.side}</b> ${p.kind === 'limit' ? `with a resting ${p.side === 'LONG' ? 'buy' : 'sell'} order at` : `if a ${c.barMin || 15}m bar closes ${p.side === 'LONG' ? 'above' : 'below'}`} <span class="mono">${px(p.trigger)}</span>${p.zone ? ` <span class="mute small">(${esc(p.zone)})</span>` : ''} ${chip(p.check)}</p>${cells([['Stop', px(p.stop), 'bad'], ['Target', px(p.target), 'good'], ...sizeCells(p)])}${plus(c, p)}</div>`).join('')}</div>`;
  return '';
}
/**
 * Track record. Recent weeks did not predict the next weeks when tested, so the big number is the best
 * estimate (the long test, nudged by the last 4 weeks); the last 4 weeks sit beside it with their range.
 * Setups from the new research have only a short test: that is shown, with its range, and said plainly.
 */
function recordBlock(c) {
  if (c.score == null && !c.recent) return '';
  const r = c.recent, tone = (x) => (x > 0 ? 'good' : 'bad'), rng = (x) => (x ? ` · likely range ${x.lo}% to ${x.hi}%` : '');
  const avg = c.avgR != null ? `avg <span class="${tone(c.avgR)}">${signed(c.avgR, 2)}R</span>` : '';
  const recent = r ? `<b class="mono">${r.winPct}%</b><span>${r.wins} of ${r.closed} trade${r.closed === 1 ? '' : 's'} won · avg <span class="${tone(r.avgR)}">${signed(r.avgR, 2)}R</span>${rng(r.range)}</span>` : '<b class="mono mute">–</b><span>No finished trades in the last 4 weeks.</span>';
  if (c.setup.research) {
    const main = c.winPct != null ? `<b class="mono">${c.winPct}%</b><span>only ${c.trades} tested trade${c.trades === 1 ? '' : 's'} · ${avg}${rng(c.range)} · <span class="warn">too early to judge</span></span>` : '<b class="mono mute">–</b><span>No tested trades yet.</span>';
    return `<div class="rec"><div class="rec-main"><span class="lbl">Win rate in the short test</span>${main}</div><div class="rec-side"><span class="lbl">Last 4 weeks</span>${recent}</div></div>
      <p class="star-note"><sup class="star">*</sup> New from the November 2026 course research (TJR Boot Camp), on 5-minute bars.${c.setup.outside ? ' He does not trade this window for indices, so this is outside what he teaches.' : ''} The test covers about 48 days.</p>`;
  }
  if (c.carries) {
    const side = c.winPct != null ? `<b class="mono">${c.winPct}%</b><span>${c.trades} trades · ${avg} · ${c.proven ? 'passed' : 'not proven'}</span>` : '<b class="mono mute">–</b><span>Not tested.</span>';
    return `<div class="rec"><div class="rec-main"><span class="lbl">Win rate, last 4 weeks</span>${recent}</div><div class="rec-side"><span class="lbl">Since 2024</span>${side}</div></div>`;
  }
  const est = c.estimate, main = est ? `<b class="mono ${tone(c.avgR)}">${est.pct}%</b><span>long test ${c.winPct}% of ${c.trades} trades${est.blended ? ', nudged by the last 4 weeks' : ''} · ${avg}${c.avgR <= 0 ? ' · lost money in testing' : ''} · ${c.proven ? 'passed' : 'not proven'}</span>` : '<b class="mono mute">–</b><span>Not tested.</span>';
  return `<div class="rec"><div class="rec-main"><span class="lbl">Best estimate of the win rate</span>${main}</div><div class="rec-side"><span class="lbl">Last 4 weeks</span>${recent}</div></div>`;
}
const stateTone = (c) => ({ long: 'good', short: 'bad', good: 'good', bad: 'bad', armed: 'warn', watch: '', idle: 'mute' }[c.tone] ?? '');

// ── The answer ──
let lastWord = null;
function drawAnswer(s) {
  const a = s.answer, cur = s.session.current, sig = a.kind === 'signal';
  $('answer').dataset.tone = a.tone;
  setHTML($('aWindow'), cur ? `${esc(cur.name)} window · <span class="mono" data-until="${cur.end}" data-prefix="ends in "></span>${cur.shortened ? ` <span class="warn">· short day (${esc(cur.shortened)})</span>` : ''}` : 'Between windows');
  setHTML($('aFocus'), sig && a.focus ? '<span class="chip focus">Your focus</span>' : '');
  setHTML($('aName'), sig ? esc(a.setup.name) + star(a.setup) : ''); $('aName').hidden = !sig;
  const word = $('aWord');
  if (word.textContent !== a.headline) { word.textContent = a.headline; if (lastWord !== null && !reduceMotion) { word.classList.remove('pop'); void word.offsetWidth; word.classList.add('pop'); } lastWord = a.headline; }
  $('aSub').textContent = a.sub || '';
  $('aCaution').hidden = !a.caution; $('aCaution').textContent = a.caution || '';

  setHTML($('aTrade'), sig ? tradeBlock(a) : a.countdownTo ? `<div class="count"><span class="lbl">${esc(a.countdownLabel)}</span><b data-until="${a.countdownTo}"></b></div>` : '');
  $('aRecord').hidden = !sig; setHTML($('aRecord'), sig ? recordBlock(a) + (a.disagree ? '<p class="warn small">Another setup in this window points the other way.</p>' : '') : '');
  setHTML($('aChecks'), sig && a.check ? `<details ${fold('guard-check', a.check.verdict === 'BLOCK')}><summary>Guard check ${chip(a.check)}</summary><ul class="checks">${a.check.checks.map(k => `<li><b class="${k.ok ? 'good' : 'bad'}">${k.ok ? 'Pass' : 'Block'}</b><span>${esc(k.name)}. ${esc(k.detail)}</span></li>`).join('')}</ul></details>` : '');

  const others = sig ? a.others || [] : [];
  $('aOthers').hidden = !others.length;
  setHTML($('aOthers'), others.length ? `<h2>Also in this window</h2>${others.map(o => {
    const rate = o.setup.research ? (o.winPct != null ? `${o.winPct}% <small>of ${o.trades} tested</small>` : '') : o.carries && o.recent ? `${o.recent.winPct}% <small>last 4 wks (${o.recent.closed})</small>` : o.estimate ? `${o.estimate.pct}% <small>best estimate</small>` : '';
    return `<details class="oc" ${fold('oc-' + o.setup.id)}><summary><span class="oc-name">${esc(o.setup.name)}${star(o.setup)}${o.focus ? ' <span class="chip focus">Focus</span>' : ''}</span><span class="oc-state ${stateTone(o)}">${esc(o.headline === 'No setup today' ? 'Done' : o.headline)}</span><span class="oc-rate mono">${rate}</span></summary><div class="oc-body"><p class="a-sub">${esc(o.sub || '')}</p>${tradeBlock(o)}${recordBlock(o)}</div></details>`;
  }).join('')}` : '');

  const late = sig && s.feed.delayed ? ` Prices are delayed${s.feed.delayMin >= 3 ? ' about ' + s.feed.delayMin + ' minutes' : ''}, so this is that far behind the real market.` : '';
  const when = a.signalT && a.exit == null ? ` Signal bar closed ${short(a.signalT)} Denver. Flat by ${short(a.flatAt)}.` : '';
  $('aFoot').textContent = 'Signals are information, not instructions. You place every trade yourself on Tradovate.' + when + late;
  tick();
}

// ── The + pop-up: confirm the exact entry price and size ──
let takeKey = null;
function openTake(key) {
  const s = takeInfo.get(key); if (!s) return;
  takeKey = key;
  $('takeWhat').textContent = `${s.name}: ${s.side}. ${s.pending ? 'Trigger' : 'Rule entry'} ${px(s.entry)}, stop ${px(s.stop)}${s.target != null ? ', target ' + px(s.target) : ''}. Type the price you actually got so the result is exact.`;
  $('takeEntry').value = s.entry; $('takeContracts').value = s.contracts; $('takeErr').textContent = '';
  takeRisk(); $('takeDlg').showModal(); $('takeEntry').select();
}
function takeRisk() {
  const s = takeInfo.get(takeKey), e = Number($('takeEntry').value), c = Number($('takeContracts').value), el = $('takeRisk');
  if (!s || !(e > 0) || !(c > 0)) { el.textContent = ''; return; }
  const dist = Math.abs(e - s.stop), risk = dist * 2 * c, over = risk > riskLimit * 1.02;
  el.innerHTML = `Stop is ${dist.toFixed(2)} points from your entry: <b class="${over ? 'bad' : ''}">${usd(risk)} at risk</b>${over ? ` (over your ${usd(riskLimit)} per trade; it will be logged that way)` : ''}.`;
}
$('takeEntry').addEventListener('input', takeRisk); $('takeContracts').addEventListener('input', takeRisk);
$('takeCancel').addEventListener('click', () => $('takeDlg').close());
$('takeForm').addEventListener('submit', async (e) => {
  e.preventDefault(); $('takeOk').disabled = true;
  const s = takeInfo.get(takeKey);
  try {
    await api('POST', '/api/journal/take', { id: s.id, side: s.pending ? s.side : undefined, entry: $('takeEntry').value, contracts: $('takeContracts').value });
    $('takeDlg').close(); await refresh(); if (!$('view-journal').hidden) loadJournal();
  } catch (err) { $('takeErr').textContent = err.message; }
  $('takeOk').disabled = false;
});
document.addEventListener('click', (e) => { const key = e.target.closest?.('[data-take]')?.dataset.take; if (key) openTake(key); });

// One line under the timeline: a holiday, the next release, or the latest market-moving headline.
function drawNewsLine(n) {
  const el = $('newsLine');
  if (!n || (!n.next && !n.top && !n.caution && !n.holiday)) { el.hidden = true; return; }
  el.hidden = false;
  const move = (r) => (r && r.m15 != null ? ` MNQ ${signed(r.m15, 0)} in 15 min.` : '');
  const holiday = n.holiday ? `<span class="warn"><b>${esc(n.holiday.name)}.</b> ${esc(n.holiday.text)}</span> ` : '';
  setHTML(el, n.caution && !n.holiday?.today ? `<b class="warn">${esc(n.caution)}</b>`
    : `${holiday}${n.next ? `Next US release: <b>${esc(n.next.title)}</b> <span class="mono" data-until="${n.next.t}" data-prefix="in "></span>.` : holiday ? '' : 'No high-impact US release left this week.'}${n.top && !holiday ? ` <span class="mute">Latest: ${esc(n.top.title)} (${short(n.top.t)}).${move(n.top.reaction)}</span>` : ''}`);
}

// ── Levels ──
function drawLevels(s) {
  $('price').textContent = s.price != null ? px(s.price) : '';
  if (!s.levels.length) { setHTML($('levels'), '<p class="empty">No levels yet. They appear once the overnight sessions have loaded.</p>'); return; }
  let html = '', placed = false;
  for (const l of s.levels) {
    const here = !placed && s.price != null && l.price < s.price; if (here) placed = true;
    html += `<div class="lv${here ? ' here' : ''}" style="--c:${levelColor(l.name)}"><i></i><span class="nm">${esc(l.name)}${l.swept ? '<small>swept</small>' : ''}</span><span class="px">${px(l.price)}</span><span class="ds">${l.dist != null ? signed(l.dist, 1) : ''}</span></div>`;
  }
  setHTML($('levels'), html);
}

// ── Chart: redrawn only when its data changed, or on hover and resize ──
let hover = null, chartSig = '';
function paintChart() {
  if (!state || $('view-desk').hidden) return;
  const out = drawChart($('chart'), state, hover), tip = $('tip');
  if (out?.tip) { tip.hidden = false; tip.innerHTML = out.tip.html; const w = tip.offsetWidth; tip.style.left = Math.max(4, Math.min(out.plotW - w - 4, out.tip.x + 12)) + 'px'; tip.style.top = Math.max(4, out.tip.y - 56) + 'px'; } else tip.hidden = true;
}
function paintChartIfChanged() {
  const c = state.chart, sig = JSON.stringify([c.bars.at(-1), c.forming, c.projections, state.levels.map(l => [l.price, l.swept]), state.price, state.feed.status]);
  if (sig !== chartSig) { chartSig = sig; paintChart(); }
}
$('chart').addEventListener('pointermove', (e) => { const r = e.currentTarget.getBoundingClientRect(); hover = { x: e.clientX - r.left, y: e.clientY - r.top }; paintChart(); });
$('chart').addEventListener('pointerleave', () => { hover = null; paintChart(); });
addEventListener('resize', paintChart);

// ── Once a second: clock, countdowns, the "now" marker ──
function tick() {
  const now = nowMs();
  $('clock').textContent = tzTime.format(now) + ' Denver';
  for (const n of document.querySelectorAll('[data-until]')) n.textContent = (n.dataset.prefix || '') + span(Number(n.dataset.until) - now);
  const tl = $('tlNow');
  if (tl && state) { const { dayStart, dayEnd } = state.session, p = (100 * (now - dayStart)) / (dayEnd - dayStart); tl.style.left = p + '%'; tl.classList.toggle('flip', p > 82); tl.firstChild.textContent = 'now ' + short(now); }
}
setInterval(tick, 1000);

// ── Poll ──
async function refresh() {
  let next;
  try {
    const r = await fetch('/api/state' + (demo ? '?demo=' + encodeURIComponent(demo) : ''), { cache: 'no-store' });
    if (!r.ok) throw new Error((await r.json()).error || 'HTTP ' + r.status);
    next = await r.json();
  } catch { return offline(); }
  document.body.classList.remove('offline');
  try {
    state = next; fetchedAt = Date.now(); riskLimit = state.guard.riskPerTrade ?? riskLimit;
    $('demo').hidden = !state.demo;
    $('feed').dataset.status = state.feed.status;
    $('feedLabel').textContent = state.feed.label + (state.feed.source === 'yahoo' ? ' · MNQ, fetched automatically' : state.feed.symbol && state.feed.status !== 'error' ? ' · ' + state.feed.symbol.split(':').pop() + ' from your chart' : '');
    const old = ['off', 'stale', 'error'].includes(state.feed.status) && state.feed.lastBarT;
    $('chartNote').textContent = old ? `Old data, not live. Last bar ${tzDate.format(state.feed.lastBarT)} Denver.` : '15 minute bars, Denver time. Lines ahead of now are rule levels, not a forecast.';
    $('chartNote').className = 'small ' + (old ? 'warn' : 'mute');
    drawGuard(state.guard); drawTimeline(state); drawNewsLine(state.news); drawAnswer(state); drawLevels(state); paintChartIfChanged();
    $('price').classList.toggle('mute', !!old);
  } catch (e) {
    console.error(e);
    $('feed').dataset.status = 'error'; $('feedLabel').textContent = 'The page hit an error drawing this state. Refresh the page.';
  }
}
// The server stopped answering: nothing on screen is current, so say that instead of leaving old numbers up.
function offline() {
  document.body.classList.add('offline');
  $('feed').dataset.status = 'error'; $('feedLabel').textContent = 'No connection to The Desk';
  $('answer').dataset.tone = 'warn'; $('aWindow').textContent = 'Not connected'; drawn.delete($('aWindow'));
  $('aName').hidden = true; $('aWord').textContent = 'No connection'; lastWord = 'No connection';
  $('aSub').textContent = 'The Desk on this Mac is not answering, so every number on this page is old. Start it again in Terminal (npm start, from the app folder) and this page reconnects by itself.';
  for (const id of ['aTrade', 'aChecks', 'aRecord', 'aOthers', 'aFocus']) setHTML($(id), '');
  $('aRecord').hidden = true; $('aOthers').hidden = true; $('aCaution').hidden = true; $('newsLine').hidden = true;
  $('gStatus').textContent = 'Unknown'; $('guard').dataset.status = 'offline';
}

// ── Tabs and the smaller section switches inside a tab ──
const loaders = { journal: loadJournal, playbook: loadPlaybook, news: loadNews, settings: loadSettings };
function showTab(name) {
  for (const b of document.querySelectorAll('.tabs button')) { if (b.dataset.tab === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }
  for (const v of document.querySelectorAll('.view')) v.hidden = v.id !== 'view-' + name;
  loaders[name]?.(); if (name === 'desk') paintChart();
  history.replaceState(null, '', location.pathname + location.search + (name === 'desk' ? '' : '#' + name));
  scrollTo({ top: 0 });
}
for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => showTab(b.dataset.tab));
function showPane(seg, pane) {
  for (const b of seg.querySelectorAll('button')) { b.setAttribute('aria-selected', b.dataset.pane === pane); $(b.dataset.pane).hidden = b.dataset.pane !== pane; }
  try { localStorage.setItem('desk-pane-' + seg.dataset.seg, pane); } catch { /* ignore */ }
}
for (const seg of document.querySelectorAll('.seg')) {
  seg.addEventListener('click', (e) => { const p = e.target.closest('button')?.dataset.pane; if (p) showPane(seg, p); });
  let saved = null; try { saved = localStorage.getItem('desk-pane-' + seg.dataset.seg); } catch { /* ignore */ }
  if (saved && seg.querySelector(`[data-pane="${saved}"]`)) showPane(seg, saved);
}
const fromHash = () => showTab(loaders[location.hash.slice(1)] ? location.hash.slice(1) : 'desk');
addEventListener('hashchange', fromHash);

const io = 'IntersectionObserver' in window && !reduceMotion ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }, { threshold: 0.06 }) : null;
for (const el of document.querySelectorAll('.rise')) io ? io.observe(el) : el.classList.add('in');

async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Something went wrong.'); return j;
}
const say = (id, text, ok) => { const n = $(id); n.textContent = text; n.className = 'msg ' + (ok ? 'ok' : 'err'); };

// ── Journal ──
// Fill the time box with this Mac's current time; change it when logging a trade from earlier.
function stampNow() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); $('jForm').elements.when.value = d.toISOString().slice(0, 16); }
async function loadJournal() {
  if (!$('jForm').elements.when.value) stampNow();
  const [j, log] = await Promise.all([api('GET', '/api/journal'), api('GET', '/api/log')]);
  $('jBalance').textContent = `Balance ${usd(j.guard.balance)} · limit at ${usd(j.guard.floor)}${j.guard.openTrades ? ` · ${j.guard.openTrades} open` : ''}`;
  const result = (t) => t.open ? `<span class="warn">Open</span> <button class="btn ghost" data-fix="${esc(t.id)}">Close by hand</button>`
    : `<span class="${t.pnl < 0 ? 'bad' : 'good'}">${usd(t.pnl, true)}</span>${t.auto ? ` <button class="btn ghost" data-fix="${esc(t.id)}" title="Worked out from the rule exit, before commissions. Click if your real result was different.">estimate · fix</button>` : ''}`;
  setHTML($('jList'), j.trades.length ? `<table><thead><tr><th>When (Denver)</th><th>Side</th><th class="n">Size</th><th class="n">Entry</th><th>Setup</th><th>Rules</th><th class="n">Result</th><th></th></tr></thead><tbody>${j.trades.map(t => `<tr><td>${tzDate.format(t.ts)}</td><td class="${t.side === 'LONG' ? 'good' : t.side === 'SHORT' ? 'bad' : ''}">${t.kind === 'adjustment' ? 'Adjustment' : esc(t.side || '')}</td><td class="n">${t.contracts ?? ''}</td><td class="n">${t.entry != null ? px(t.entry) : ''}</td><td>${esc(t.setup)}${t.note ? ` <span class="mute">${esc(t.note)}</span>` : ''}</td><td>${t.followedRules == null ? '' : t.followedRules ? 'Followed' : '<span class="warn">Broke</span>'}</td><td class="n">${result(t)}</td><td><button class="btn ghost" data-del="${esc(t.id)}">Remove</button></td></tr>`).join('')}</tbody></table>` : '<p class="empty">Nothing logged yet. Press the green + on a suggested trade, or add one by hand below. The guard counts from here.</p>');
  drawLog(log);
}
let logAll = false, lastLog = null;
function drawLog(log) {
  lastLog = log;
  const rows = logAll ? log.signals : log.signals.slice(0, 25);
  const res = (s) => s.status === 'open' ? '<span class="warn">Running</span>' : `<span class="${s.r > 0 ? 'good' : 'bad'}">${signed(s.r, 2)}R</span>${s.dollars != null ? ` <span class="mute">${usd(s.dollars, true)}</span>` : ''}`;
  const out = (s) => ({ target: 'Target', stopped: 'Stop', time: 'Time', rule: 'Rule exit', open: '' }[s.status]);
  const add = (s) => { takeInfo.set(s.id, { id: s.id, pending: false, name: s.name, side: s.side, entry: s.entry, stop: s.stop, target: s.target, contracts: Math.max(1, s.contracts || 0) }); return s.taken ? '<span class="took">In journal</span>' : `<button class="plus small" type="button" data-take="${esc(s.id)}" aria-label="Add ${esc(s.name)} to the journal">+</button>`; };
  $('logSince').textContent = log.total ? `${log.total} suggested trades since ${tzDate.format(log.since)}` : '';
  setHTML($('logList'), rows.length ? `<table><thead><tr><th>Signal (Denver)</th><th>Setup</th><th>Side</th><th class="n">Entry</th><th class="n">Stop</th><th class="n">Target</th><th class="n">Size</th><th>Out</th><th class="n">Result</th><th>Took it?</th></tr></thead><tbody>${rows.map(s => `<tr><td>${tzDate.format(s.signalT)}</td><td>${esc(s.name)}${star(s)}${s.trial ? ' <span class="mute small">on trial</span>' : ''}</td><td class="${s.side === 'LONG' ? 'good' : 'bad'}">${s.side}</td><td class="n">${px(s.entry)}</td><td class="n">${px(s.stop)}</td><td class="n">${s.target != null ? px(s.target) : ''}</td><td class="n">${s.contracts >= 1 ? s.contracts : '<span class="warn" title="Too wide for your risk at any size">1*</span>'}</td><td>${out(s)}</td><td class="n">${res(s)}</td><td>${add(s)}</td></tr>`).join('')}</tbody></table>${!logAll && log.signals.length > 25 ? `<p><button class="btn ghost" id="logMore" type="button">Show all ${log.signals.length}</button></p>` : ''}<p class="note">1* means the stop was too wide for your risk even on one micro.</p>` : '<p class="empty">No suggested trades yet. They appear here once prices have loaded, including any from days The Desk was off.</p>');
}
$('logList').addEventListener('click', (e) => { if (e.target.id === 'logMore') { logAll = true; drawLog(lastLog); } });
$('jList').addEventListener('click', async (e) => {
  const fix = e.target.dataset?.fix, del = e.target.dataset?.del;
  if (fix) { const v = prompt('Your real profit or loss on this trade, in dollars (for example 180 or -240):'); if (v == null || v.trim() === '') return; try { await api('PATCH', '/api/journal/' + fix, { pnl: v }); } catch (err) { alert(err.message); } loadJournal(); refresh(); return; }
  if (!del || !confirm('Remove this entry from the journal?')) return;
  await api('DELETE', '/api/journal/' + del); loadJournal(); refresh();
});
$('jForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = new FormData(e.target), body = Object.fromEntries(f); body.followedRules = f.has('followedRules');
  body.ts = new Date(body.when).getTime(); delete body.when;
  try { await api('POST', '/api/journal', body); e.target.reset(); stampNow(); say('jMsg', 'Added.', true); loadJournal(); refresh(); } catch (err) { say('jMsg', err.message, false); }
});
$('cForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const c = await api('POST', '/api/check', Object.fromEntries(new FormData(e.target)));
    $('cOut').innerHTML = `<p class="verdict ${c.verdict === 'PASS' ? 'good' : 'bad'}">${c.verdict}</p><p class="a-sub">${c.verdict === 'PASS' ? `${c.side}, ${c.contracts} MNQ, ${usd(c.riskDollars)} at risk. 2R target at <span class="mono">${px(c.target2R)}</span>.` : esc(c.reason)}</p><ul class="checks">${c.checks.map(k => `<li><b class="${k.ok ? 'good' : 'bad'}">${k.ok ? 'Pass' : 'Block'}</b><span>${esc(k.name)}. ${esc(k.detail)}</span></li>`).join('')}</ul>`;
  } catch (err) { $('cOut').innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
});

// Checklist: kept in this browser, resets each day.
const CHECKS = ['The guard says I can trade', 'My last trade is in the Journal', 'I know which strategy this is and how it has been doing', 'The signal came from a closed bar (15-minute; 5-minute for the starred setups)', 'The stop is where the rule puts it, and I know the dollars at risk', 'I will not move the stop or add to the trade', 'I know my loss limit for today (it is in the guard strip)'];
function drawChecklist() {
  const key = 'desk-checks-' + new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  let on = []; try { on = JSON.parse(localStorage.getItem(key) || '[]'); } catch { /* private window: nothing saved */ }
  $('checklist').innerHTML = CHECKS.map((c, i) => `<label class="check"><input type="checkbox" data-i="${i}"${on.includes(i) ? ' checked' : ''}> ${esc(c)}</label>`).join('');
  $('checklist').onchange = () => { const v = [...$('checklist').querySelectorAll('input:checked')].map(n => +n.dataset.i); try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } };
}
drawChecklist();

// ── News: tiles with filters ──
let news = null;
const TOPIC_NAMES = ['War and geopolitics', 'Tariffs and trade', 'Fed and rates', 'Inflation and jobs data', 'White House', 'Big tech', 'Other'];
const nf = $('nFilters');
try { const saved = JSON.parse(localStorage.getItem('desk-news-filters') || '{}'); for (const [k, v] of Object.entries(saved)) { const el = nf.elements[k]; if (!el) continue; if (el.type === 'checkbox') el.checked = !!v; else el.dataset.want = v; } } catch { /* ignore */ }
$('nTopic').innerHTML = '<option value="">Any</option>' + TOPIC_NAMES.map(t => `<option>${t}</option>`).join('');
for (const el of nf.elements) if (el.dataset?.want != null && [...(el.options || [])].some(o => o.value === el.dataset.want || o.text === el.dataset.want)) el.value = el.dataset.want;
nf.addEventListener('change', () => {
  const f = Object.fromEntries(new FormData(nf)); f.moved = nf.elements.moved.checked;
  try { localStorage.setItem('desk-news-filters', JSON.stringify(f)); } catch { /* ignore */ }
  drawTiles();
});
nf.addEventListener('submit', (e) => e.preventDefault());
async function loadNews() {
  news = await api('GET', '/api/news' + (demo ? '?demo=' + encodeURIComponent(demo) : ''));
  const now = nowMs();
  $('nErr').textContent = Object.values(news.errors || {}).join(' ');
  const h = news.holiday;
  $('nHoliday').hidden = !h;
  if (h) setHTML($('nHoliday'), `<div class="p-head"><h2>${esc(h.name)}</h2><span class="mute small">${h.today ? 'Today' : 'Coming up'}${h.confirmed ? '' : ' · hours not yet confirmed by CME'}</span></div><p class="lead">${esc(h.text)}</p>`);
  const src = $('nSource'), want = src.value || src.dataset.want || '';
  src.innerHTML = '<option value="">Any</option>' + (news.sources || []).map(s => `<option>${esc(s)}</option>`).join('');
  if ([...src.options].some(o => o.value === want)) src.value = want;
  drawTiles();
  const rows = [...news.today.filter(e => e.t <= now), ...news.week];
  setHTML($('nCal'), rows.length ? `<table><thead><tr><th>When</th><th>Release</th><th>Impact</th><th class="n">Forecast</th><th class="n">Previous</th></tr></thead><tbody>${rows.map(e => `<tr${e.t <= now ? ' class="mute"' : ''}><td>${tzDay.format(e.t)}</td><td>${esc(e.title)}</td><td class="${e.impact === 'High' ? 'bad' : 'warn'}">${e.impact}</td><td class="n">${esc(e.forecast)}</td><td class="n">${esc(e.previous)}</td></tr>`).join('')}</tbody></table>` : '<p class="empty">No US releases left this week.</p>');
  setHTML($('nShocks'), news.shocks.length ? news.shocks.map(s => `<div class="shock"><div><b class="mono ${s.move < 0 ? 'bad' : 'good'}">${signed(s.move, 0)} points</b> <span class="mute">in 15 minutes at ${tzDay.format(s.t)} (${s.times} times the usual bar)</span></div>${s.headline ? `<a href="${esc(s.headline.link)}" target="_blank" rel="noopener">${esc(s.headline.title)}</a> <span class="mute small">${esc(s.headline.src)}, ${short(s.headline.t)}. Close in time; not proof it was the cause.</span>` : '<span class="mute small">No headline found within 45 minutes of it.</span>'}</div>`).join('') : '<p class="empty">No unusually large 15-minute moves in the last day.</p>');
}
function drawTiles() {
  if (!news) return;
  const f = Object.fromEntries(new FormData(nf)), now = nowMs(), hours = Number(f.time) || 24, size = (h) => Math.max(Math.abs(h.reaction?.m15 ?? 0), Math.abs(h.reaction?.m60 ?? 0));
  let list = news.headlines.filter(h => now - h.t <= hours * 36e5 && (!f.severity || h.severity === f.severity) && (!f.topic || (h.topic || 'Other') === f.topic) && (!f.source || h.src === f.source) && (!nf.elements.moved.checked || h.moved));
  if (f.sort === 'move') list = [...list].sort((a, b) => size(b) - size(a));
  $('nCount').textContent = `${list.length} of ${news.headlines.length} headlines from the last 24 hours.`;
  const rx = (r) => !r || r.m15 == null ? '<span class="mute">Too recent to measure</span>' : `MNQ <span class="${r.m15 < 0 ? 'bad' : r.m15 > 0 ? 'good' : 'mute'}">${signed(r.m15, 0)}</span> in 15 min${r.m60 != null ? ` · <span class="${r.m60 < 0 ? 'bad' : r.m60 > 0 ? 'good' : 'mute'}">${signed(r.m60, 0)}</span> in 1 h` : ''}`;
  setHTML($('nTiles'), list.length ? list.map(h => `<article class="tile" data-sev="${h.severity}">
    <a class="t-img${h.image ? '' : ' none'}" href="${esc(h.link)}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">${h.image ? `<img loading="lazy" decoding="async" alt="" src="${esc(h.image)}">` : ''}<span>${esc(h.topic || h.src)}</span></a>
    <div class="t-body"><div class="t-tags"><span class="chip sev ${h.severity}">${h.severity}</span>${h.topic ? `<span class="chip topic">${esc(h.topic)}</span>` : ''}${h.moved ? '<span class="chip moved">Moved MNQ</span>' : ''}</div>
    <h3><a href="${esc(h.link)}" target="_blank" rel="noopener">${esc(h.title)}</a></h3>
    <p class="t-meta">${esc(h.src)} · ${ago(h.t, now)}</p><p class="t-rx mono">${rx(h.reaction)}</p></div></article>`).join('') : '<p class="empty">No headlines match these filters. Widen the time or severity.</p>');
}
// A picture that fails to load falls back to the plain band, so no tile is left with a broken image.
$('nTiles').addEventListener('error', (e) => { if (e.target.tagName === 'IMG') { e.target.closest('.t-img').classList.add('none'); e.target.remove(); } }, true);

// ── Playbook ──
let pb = null, pbWin = null;
const f3 = (x) => (x == null ? 'n/a' : signed(x, 3)), f1 = (x, d = 1) => (x == null ? 'n/a' : x.toFixed(d));
async function loadPlaybook() {
  pb = await api('GET', '/api/playbook');
  pbWin ||= state?.session.current?.id || state?.session.next?.id || 'nyopen';
  const passed = pb.setups.filter(s => s.label === 'Passed');
  $('pbData').textContent = pb.data ? `Long test: NQ 15-minute bars, ${pb.data.start} to ${pb.data.end}` : 'Backtest not run yet';
  drawResearch();
  $('pbLead').textContent = passed.length ? `${passed.length} setup${passed.length > 1 ? 's' : ''} passed every test rule: ${passed.map(s => s.name).join(', ')}.`
    : `No setup has passed every rule of the long test, so each one is marked "not proven". About ${pb.variantsTried} variants have been tried on this data; a few looking good is what luck alone produces.`;
  setHTML($('pbTabs'), pb.windows.map(w => `<button role="tab" aria-selected="${w.id === pbWin}" data-win="${w.id}" style="--c:${WIN_VAR[w.id]}">${esc(w.name)} <small>${pb.setups.filter(s => s.window === w.id && !s.carried).length}</small></button>`).join(''));
  drawPlaybook();
  $('tallySince').textContent = pb.tallySince ? `Since ${tzDate.format(pb.tallySince)}` : '';
  setHTML($('logTally'), pb.tally.length ? `<table><thead><tr><th>Setup</th><th class="n">Finished</th><th class="n">Won</th><th class="n">Avg R</th><th class="n">Total R</th></tr></thead><tbody>${pb.tally.map(t => { const m = pb.setups.find(x => x.id === t.setupId); return `<tr><td>${esc(t.name)}${star(m)}${m?.trial ? ' <span class="mute small">on trial</span>' : ''}</td><td class="n">${t.closed}</td><td class="n">${t.winPct}%</td><td class="n ${t.avgR > 0 ? 'good' : 'bad'}">${signed(t.avgR, 2)}</td><td class="n ${t.totalR > 0 ? 'good' : 'bad'}">${signed(t.totalR, 1)}</td></tr>`; }).join('')}</tbody></table>` : '<p class="empty">No finished suggestions yet.</p>');
}
$('pbTabs').addEventListener('click', (e) => { const w = e.target.closest('button')?.dataset.win; if (!w) return; pbWin = w; for (const b of $('pbTabs').children) b.setAttribute('aria-selected', b.dataset.win === w); drawPlaybook(); });
$('pbBody').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-pref]'); if (!b) return;
  const id = b.dataset.id, kind = b.dataset.pref, cur = { focus: [...(pb.prefs.focus || [])], off: [...(pb.prefs.off || [])] };
  cur[kind] = cur[kind].includes(id) ? cur[kind].filter(x => x !== id) : [...cur[kind], id];
  if (kind === 'focus' && cur.focus.includes(id)) cur.off = cur.off.filter(x => x !== id);
  try { await api('POST', '/api/settings', { setups: cur }); await loadPlaybook(); refresh(); } catch (err) { alert(err.message); }
});
/** A setup from the new research: its short test, its control, and whether it is suggested or only tracked. */
function researchCard(s, rc, focus, off, tag) {
  const r = s.result, j = r?.judge;
  const stats = `<span class="st"><small>Last 4 weeks</small><b class="mono">${rc ? rc.winPct + '%' : '–'}</b><small>${rc ? `${rc.closed} trade${rc.closed === 1 ? '' : 's'}, ${signed(rc.avgR, 2)}R` : 'no trades'}</small></span><span class="st"><small>Short test</small><b class="mono">${s.winPct != null ? Math.round(s.winPct) + '%' : '–'}</b><small class="${s.avgR > 0 ? 'good' : 'bad'}">${s.trades} trades${s.avgR != null ? ', ' + signed(s.avgR, 2) + 'R' : ''}</small></span>`;
  const res = j ? `<div class="table-wrap"><table><thead><tr><th>Period</th><th class="n">Trades</th><th class="n">Win %</th><th class="n">Avg R</th><th class="n">t-stat</th><th class="n">Worst drawdown</th></tr></thead><tbody><tr><td>${r.period.from} to ${r.period.to}</td><td class="n">${j.trades}</td><td class="n">${f1(j.win)}</td><td class="n ${j.avgR > 0 ? 'good' : 'bad'}">${f3(j.avgR)}</td><td class="n">${f1(j.t, 2)}</td><td class="n">${f1(j.maxDD)}R</td></tr></tbody></table></div>
      <p class="small mute">Random entries at the same clock times averaged ${f3(r.control.mean)}R (95th percentile ${f3(r.control.p95)}R). Median stop ${f1(r.medianStop, 0)} points; ${f1(r.fit100, 0)}% of signals fit $100 on 1 MNQ and ${f1(r.fit250, 0)}% fit $250. Cost ${r.cost} points a trade.</p>
      <p class="small">${s.range ? `With ${j.trades} trades the true win rate could be anywhere from ${s.range.lo}% to ${s.range.hi}%. ` : ''}Under 150 trades the label stays "Too early to judge" whatever the numbers.</p>` : '<p class="mute">Not tested yet.</p>';
  const where = s.trial ? '<p class="note">On trial: its average in the short test was not above zero and above random entries, so it is not suggested on the Desk. Its suggestions are still tracked under Results so far, to build a record without money.</p>'
    : `<div class="row gap"><button class="btn ${focus ? '' : 'ghost'}" type="button" data-pref="focus" data-id="${s.id}" aria-pressed="${focus}">${focus ? 'Focused: leads the Desk' : 'Focus on this'}</button><button class="btn ghost" type="button" data-pref="off" data-id="${s.id}" aria-pressed="${off}">${off ? 'Hidden: show it again' : 'Hide from the Desk'}</button></div>`;
  return `<details class="strat${off || s.trial ? ' off' : ''}" ${fold('pb-' + s.id)}><summary><span class="s-name"><b>${esc(s.name)}${star(s)}</b>${s.trial ? ' <span class="chip">On trial</span>' : ''}${focus ? ' <span class="chip focus">Focus</span>' : ''}${off ? ' <span class="chip">Hidden</span>' : ''}<small>${tag}</small></span>${stats}</summary><div class="s-body">${where}<div class="setup-cols"><div><h3>Rules</h3><ul class="plain">${s.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small mute">${esc(s.source)}${s.outside ? '. He does not trade this window for indices: outside what he teaches.' : ''}</p></div><div><h3>Short test</h3>${res}</div></div></div></details>`;
}

/** What the November 2026 research checked, what each check found, and what was built or left out. */
function drawResearch() {
  const c = pb.checks; if (!c) return setHTML($('pbResearch'), '<p class="empty">The research checks have not been run yet.</p>');
  const t = pb.setups.filter(s => s.research), w = (id) => pb.windows.find(x => x.id === id)?.name || id;
  const line = (m) => t.filter(s => s.id.startsWith(m)).map(s => `${w(s.window)}: ${s.trades} trades, ${s.avgR != null ? signed(s.avgR, 2) + 'R' : 'none'} (${s.trial ? 'on trial' : 'shown'})`).join('; ');
  const d = c.bias.daily.whole, al = c.afterLoss, rc = c.recency;
  const rows = [
    ['Risk size on a small cushion', 'A simulation of this account: the chance of reaching the limit before the cushion is rebuilt, at different risk per trade.', 'With a small real edge: about 51% at $250, 33% at $100, 23% at $68. With no edge, about 66% at any size.', 'Built. Under $1,500 of room: one micro, $100 cap, losses left shown in the guard. Change it in Settings.', 'good'],
    ['Do the last 4 weeks predict the next 4?', `Every trade of the 14 older setups since 2019, in 28-day blocks (${rc.persistence.pairs} block pairs).`, `No. Correlation ${signed(rc.persistence.r, 3)} (chance alone gives this ${Math.round(rc.persistence.p * 100)}% of the time). Following last block's best setup made ${f3(rc.leader.leaderNext)}R next block against ${f3(rc.leader.averageNext)}R for the plain average.`, 'Built. The big number is now a best estimate (long test, nudged by recent weeks). The last 4 weeks stay beside it with their range.', 'good'],
    ['TJR entry 1: sweep, then a break of structure', 'His rules on 5-minute bars, about 48 days, all four windows, against random entries at the same clock times.', line('tjr1_') + '. Far too few trades to judge.', 'Added where the short test was above zero and above random entries; the rest are on trial. All starred.', 'warn'],
    ['TJR entries 2 to 4: the pullback into the gap or order block', 'The same test with a resting entry in the favourable half of the move.', line('tjr2_') + '. Far too few trades to judge.', 'Same rule. Starred.', 'warn'],
    ['Trading only with the daily bias', `${c.bias.trades.toLocaleString('en-US')} past trades of the 14 older setups, split by whether they agreed with his daily bias.`, `No difference: with the bias minus against it was ${f3(d.diff)}R (t ${f1(d.t, 2)}). All three timeframes agreeing did not help either.`, 'Not added to the older setups. It stays inside the TJR setups, where it is part of his rules.', 'mute'],
    ['Stopping after a losing trade', 'Whether the trade after a loss that day did worse than the rest.', `Not supported (${f3(al.diff)}R, and the comparison is muddied by which setups trade later in the day).`, 'No new switch. "One loss and done" stays only as protection while the cushion is small.', 'mute'],
    ['Skipping big news days', 'No checked list of past CPI, PPI, FOMC and payrolls dates was available.', 'Could not be tested.', 'No new rule. The scheduled-release notice the Desk already has stays.', 'mute'],
    ['Fair value gaps and order blocks by themselves', 'Outside tests found them no better than random levels; he also says a touch alone is never an entry.', 'No support.', 'Not built as signals. Used only inside the pullback entry.', 'mute'],
    ['Mindset lessons, written plan, weekly preview, journal prompts', 'Nothing in the price data can test these.', 'Could not be tested.', 'Not built.', 'mute'],
    ['Fees', 'About $1.30 to $1.90 a micro for the round trip at firms that use Tradovate.', 'Small on wide stops, about 6% of the risk on a 25-point stop.', 'Built. Taken off every estimate; set your own number in Settings.', 'good'],
  ];
  setHTML($('pbResearch'), `<div class="table-wrap"><table class="research"><thead><tr><th>Topic</th><th>What was checked</th><th>What it found</th><th>On the Desk</th></tr></thead><tbody>${rows.map(([a, b, x, y, k]) => `<tr><td><b>${a}</b></td><td>${b}</td><td>${x}</td><td class="${k}">${y}</td></tr>`).join('')}</tbody></table></div>
    <p class="small mute">Rules for every check were written down before it was run (research/PREREGISTRATION.md). Results: research/RESULTS.md. Full report: reports/MNQ day trading evidence review.md.</p>`);
}

function drawPlaybook() {
  const list = pb.setups.filter(s => s.window === pbWin), prefs = pb.prefs || {};
  setHTML($('pbBody'), list.map(s => {
    const r = s.result, rc = pb.recent?.[s.id], focus = (prefs.focus || []).includes(s.id), off = (prefs.off || []).includes(s.id);
    const tag = `<span class="tag ${s.label.split(/[ ,]/)[0]}">${esc(s.label)}</span>`;
    if (s.research) return researchCard(s, rc, focus, off, tag);
    const stats = s.carried ? '<span class="st mute">Old test, not re-run</span>'
      : `<span class="st"><small>Last 4 weeks</small><b class="mono">${rc ? rc.winPct + '%' : '–'}</b><small>${rc ? `${rc.closed} trade${rc.closed === 1 ? '' : 's'}, ${signed(rc.avgR, 2)}R` : 'no trades'}</small></span><span class="st"><small>Since 2024</small><b class="mono">${s.winPct != null ? Math.round(s.winPct) + '%' : '–'}</b><small class="${s.avgR > 0 ? 'good' : 'bad'}">${s.trades} trades, ${s.avgR != null ? signed(s.avgR, 2) + 'R' : ''}</small></span>`;
    let res = '';
    if (r) {
      const rows = [['2019-2023 (look-at)', r.tune], ['2024 on (judged)', r.judge], ['Last 12 months', r.last12], [`Judged, without ${r.withoutBest.year}`, r.withoutBest]];
      const ys = Object.entries(r.years).filter(([y]) => y >= '2019').sort(), max = Math.max(0.05, ...ys.map(([, v]) => Math.abs(v.avgR)));
      res = `<div class="table-wrap"><table><thead><tr><th>Period</th><th class="n">Trades</th><th class="n">Win %</th><th class="n">Avg R</th><th class="n">t-stat</th><th class="n">Worst drawdown</th></tr></thead><tbody>${rows.map(([n, x]) => `<tr><td>${n}</td><td class="n">${x.trades}</td><td class="n">${f1(x.win)}</td><td class="n ${x.avgR > 0 ? 'good' : 'bad'}">${f3(x.avgR)}</td><td class="n">${f1(x.t, 2)}</td><td class="n">${f1(x.maxDD)}R</td></tr>`).join('')}</tbody></table></div>
        <div class="years" role="img" aria-label="Average R by year">${ys.map(([y, v]) => { const hgt = (Math.abs(v.avgR) / max) * 50; return `<div class="yr" title="${y}: ${f3(v.avgR)}R over ${v.trades} trades"><div class="plot"><span class="zero"></span><span class="barv" style="${v.avgR >= 0 ? `bottom:50%;height:${hgt}%;background:var(--long)` : `top:50%;height:${hgt}%;background:var(--short)`}"></span></div><small>${y.slice(2)}</small></div>`; }).join('')}</div>
        <p class="small mute">Average R per trade by year. Median stop ${f1(r.dollar.medianStop, 0)} points; ${f1(r.dollar.fitPct, 0)}% of signals fit $250 on 1 MNQ; worst drawdown ${usd(r.dollar.maxDD)} against the $2,000 limit.</p>
        <ul class="rules-met">${r.rules.map(x => `<li><b class="${x.ok ? 'met' : 'missed'}">${x.ok ? 'Met' : 'Missed'}</b><span>${esc(x.rule)}</span></li>`).join('')}</ul>`;
    } else if (s.carried) res = `<p>${esc(s.summary)}</p>`;
    else res = '<p class="mute">Not tested yet.</p>';
    const controls = s.carried ? '' : `<div class="row gap"><button class="btn ${focus ? '' : 'ghost'}" type="button" data-pref="focus" data-id="${s.id}" aria-pressed="${focus}">${focus ? 'Focused: leads the Desk' : 'Focus on this'}</button><button class="btn ghost" type="button" data-pref="off" data-id="${s.id}" aria-pressed="${off}">${off ? 'Hidden: show it again' : 'Hide from the Desk'}</button></div>`;
    return `<details class="strat${off ? ' off' : ''}" ${fold('pb-' + s.id)}><summary><span class="s-name"><b>${esc(s.name)}</b>${focus ? ' <span class="chip focus">Focus</span>' : ''}${off ? ' <span class="chip">Hidden</span>' : ''}<small>${tag}</small></span>${stats}</summary><div class="s-body">${controls}<div class="setup-cols"><div><h3>Rules</h3><ul class="plain">${s.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul><p class="small mute">${esc(s.source)}</p></div><div><h3>Long test</h3>${res}</div></div></div></details>`;
  }).join('') || '<p class="empty">No setups for this window.</p>');
}

// ── Settings ──
let plans = {};
function fillSettings({ settings: s, plans: p }) {
  plans = p;
  const f = $('sForm').elements, a = s.account;
  f.plan.value = a.plan; $('planNote').textContent = p[a.plan]?.note || '';
  for (const k of ['startBalance', 'maxLossLimit', 'lockBalance', 'lockTrigger', 'maxMicros']) f[k].value = a[k];
  f.trailing.value = a.trailing; f.dllOn.checked = !!a.dll.on; f.dllAmount.value = a.dll.amount; f.consistencyPct.value = a.consistencyPct ?? '';
  f.useScaling.checked = !!a.scaling; f.payoutRequested.checked = !!a.payoutRequested;
  for (const k of ['riskPerTrade', 'dailyStop', 'maxLossesPerDay']) f[k].value = s.personal[k];
  f.feedAuto.checked = s.feed?.auto !== false;
  f.thinCushion.checked = s.personal.thinCushion !== false;
  f.smallCushion.checked = s.personal.smallCushion !== false; f.smallUnder.value = s.personal.smallUnder ?? 1500; f.smallRisk.value = s.personal.smallRisk ?? 100; f.commission.value = s.instrument?.commission ?? 1.5;
  const an = a.anchor;
  f.anchorBalance.value = ''; f.anchorFloor.value = '';
  $('anchorNote').textContent = an ? `Counting from ${usd(an.balance)} with the limit at ${usd(an.floor)}, set ${tzDate.format(an.at)} Denver. Journal entries before that are ignored. Update these any time your Lucid dashboard disagrees with the guard.` : 'Not set: the guard counts from the $50,000 starting balance and your journal. If you traded this account before using The Desk, enter both numbers from your Lucid dashboard.';
}
$('anchorSet').addEventListener('click', async () => { const f = $('sForm').elements; try { fillSettings(await api('POST', '/api/settings', { account: { anchor: { balance: f.anchorBalance.value, floor: f.anchorFloor.value } } })); say('aMsg', 'Set.', true); refresh(); } catch (err) { say('aMsg', err.message, false); } });
$('anchorClear').addEventListener('click', async () => { try { fillSettings(await api('POST', '/api/settings', { account: { anchor: null } })); say('aMsg', 'Cleared.', true); refresh(); } catch (err) { say('aMsg', err.message, false); } });
async function loadSettings() { fillSettings(await api('GET', '/api/settings')); }
$('sForm').elements.plan.addEventListener('change', async (e) => { try { fillSettings(await api('POST', '/api/settings', { account: { plan: e.target.value } })); say('sMsg', `Switched to ${plans[e.target.value].name} defaults.`, true); refresh(); } catch (err) { say('sMsg', err.message, false); } });
$('sForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = e.target.elements;
  const body = { account: { startBalance: f.startBalance.value, maxLossLimit: f.maxLossLimit.value, lockBalance: f.lockBalance.value, lockTrigger: f.lockTrigger.value, maxMicros: f.maxMicros.value, trailing: f.trailing.value, dll: { on: f.dllOn.checked, amount: f.dllAmount.value }, consistencyPct: f.consistencyPct.value === '' ? null : f.consistencyPct.value, useScaling: f.useScaling.checked, payoutRequested: f.payoutRequested.checked }, personal: { riskPerTrade: f.riskPerTrade.value, dailyStop: f.dailyStop.value, maxLossesPerDay: f.maxLossesPerDay.value, thinCushion: f.thinCushion.checked, smallCushion: f.smallCushion.checked, smallUnder: f.smallUnder.value, smallRisk: f.smallRisk.value }, instrument: { commission: f.commission.value }, feed: { auto: f.feedAuto.checked } };
  try { fillSettings(await api('POST', '/api/settings', body)); say('sMsg', 'Saved.', true); refresh(); } catch (err) { say('sMsg', err.message, false); }
});

// ── Go ──
refresh(); setInterval(refresh, 2000);
document.fonts?.ready.then(paintChart);
if (location.hash) fromHash();
