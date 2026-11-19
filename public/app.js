// The Desk page. Asks the local server for the state every 2 seconds and draws it.
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
const short = (t) => tzShort.format(t).replace(':00', '').replace(' ', '');
function span(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
  return h >= 24 ? `${Math.floor(h / 24)}d ${h % 24}h` : h ? `${h}h ${String(m).padStart(2, '0')}m ${String(s % 60).padStart(2, '0')}s` : `${m}m ${String(s % 60).padStart(2, '0')}s`;
}

// ── Rolling numbers: tween from the last shown value, with a brief green/red flash ──
const shown = new Map();
function roll(node, key, value, format, flash = true) {
  const from = shown.get(key); shown.set(key, value);
  if (from == null || from === value || reduceMotion || !Number.isFinite(from)) { node.textContent = format(value); return; }
  if (flash) { node.classList.remove('flash-up', 'flash-down'); void node.offsetWidth; node.classList.add(value > from ? 'flash-up' : 'flash-down'); }
  const t0 = performance.now(), dur = 520;
  const step = (now) => { const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3); node.textContent = format(from + (value - from) * e); if (k < 1 && shown.get(key) === value) requestAnimationFrame(step); else if (shown.get(key) === value) node.textContent = format(value); };
  requestAnimationFrame(step);
}

// ── Clock: the server's time, carried forward by this browser's clock between polls ──
let state = null, fetchedAt = 0;
const nowMs = () => (state ? (demo ? state.now : state.now + (Date.now() - fetchedAt)) : Date.now());

// ── Guard ──
function drawGuard(g) {
  const el = $('guard'); el.dataset.status = g.status;
  roll($('gRoom'), 'room', g.room, (v) => usd(v));
  $('gRoom').className = 'mono ' + (g.room <= 0 ? 'bad' : g.room < 500 ? 'warn' : '');
  const roomPct = Math.max(0, Math.min(1, g.room / g.maxLossLimit));
  $('gRoomBar').style.width = roomPct * 100 + '%'; $('gRoomBar').style.background = g.room < 500 ? 'var(--short)' : g.room < 1000 ? 'var(--armed)' : 'var(--long)';
  const used = g.dailyLossUsed, usedPct = Math.min(1, used / g.dailyStop);
  $('gLoss').innerHTML = `<span id="gLossN"></span> <small>of ${usd(g.dailyStop)}</small>`;
  roll($('gLossN'), 'loss', used, (v) => usd(v));
  $('gLoss').className = 'mono ' + (usedPct >= 1 ? 'bad' : usedPct > 0 ? 'warn' : '');
  $('gLossBar').style.width = usedPct * 100 + '%'; $('gLossBar').style.background = usedPct >= 1 ? 'var(--short)' : 'var(--armed)';
  $('gTrades').textContent = g.tradesToday;
  $('gLosses').innerHTML = `${g.lossesToday} <small>of ${g.maxLosses}</small>`;
  $('gLosses').className = 'mono ' + (g.lossesToday >= g.maxLosses ? 'bad' : g.lossesToday ? 'warn' : '');
  $('gStatus').textContent = g.lockout ? (g.breached ? 'Limit reached' : 'Locked out') : g.status === 'caution' ? 'Careful' : 'Clear to trade';
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
    html += `<div class="tl-win" data-live="${w.live}" data-now="${current?.id === w.id && current.start === w.start}" style="left:${a}%;width:${b - a}%;--c:${WIN_VAR[w.id]}" title="${esc(w.name)}: ${short(w.start)} to ${short(w.end)} Denver. ${w.live ? 'A tested setup is live here.' : 'Stand down: no setup passed here.'}"><b><span class="full">${esc(w.name)}</span><span class="abbr">${SHORT_NAME[w.id]}</span></b><span class="when">${short(w.start)}-${short(w.end)}</span></div>`;
  }
  const n = pct(nowMs());
  html += `<div class="tl-now${n > 82 ? ' flip' : ''}" id="tlNow" style="left:${n}%"><span>now ${short(nowMs())}</span></div>`;
  $('timeline').innerHTML = html;
  $('tlKey').textContent = timeline.some(w => w.live) ? 'Solid outline: a tested setup is live in that window. Dashed: stand down.' : 'All windows dashed: no setup passed the test, so every window is a stand-down.';
}

// ── The answer ──
let lastWord = null;
function drawAnswer(s) {
  const a = s.answer, el = $('answer');
  el.dataset.tone = a.tone;
  const cur = s.session.current;
  $('aWindow').innerHTML = cur ? `${esc(cur.name)} window · <span class="mono" data-until="${cur.end}" data-prefix="ends in "></span>` : 'Between windows';
  $('aSetup').textContent = a.setup ? a.setup.name : '';
  const word = $('aWord');
  if (word.textContent !== a.headline) { word.textContent = a.headline; if (lastWord !== null && !reduceMotion) { word.classList.remove('pop'); void word.offsetWidth; word.classList.add('pop'); } lastWord = a.headline; }
  $('aSub').textContent = a.sub || '';

  let right = '', checks = '';
  const chip = (c) => `<span class="chip ${c.verdict === 'PASS' ? 'pass' : 'block'}">${c.verdict}</span>`;
  const checkList = (c) => `<details${c.verdict === 'BLOCK' ? ' open' : ''}><summary>Guard check: ${chip(c)}</summary><ul class="checks">${c.checks.map(k => `<li><b class="${k.ok ? 'good' : 'bad'}">${k.ok ? 'Pass' : 'Block'}</b><span>${esc(k.name)}. ${esc(k.detail)}</span></li>`).join('')}</ul></details>`;
  if (a.kind === 'signal' && a.entry != null) {
    const done = a.exit != null;
    const cells = [['Entry', px(a.entry), ''], ['Stop', px(a.stop), 'bad'], ['Target', a.target != null ? px(a.target) : 'none', 'good']];
    if (done) cells.push(['Out at', px(a.exit), ''], ['Result', signed(a.r, 2) + 'R', a.r > 0 ? 'good' : 'bad']);
    else cells.push(['Size', a.contracts ? `${a.contracts} MNQ` : 'none', a.contracts ? '' : 'bad'], ['Risk', a.contracts ? usd(a.riskDollars) : usd(a.stopPoints * 2) + ' on 1', a.contracts ? '' : 'bad']);
    right = `<div class="nums">${cells.map(([l, v, c]) => `<div><span class="lbl">${l}</span><b class="${c}">${v}</b></div>`).join('')}</div>`;
    if (a.check) checks = checkList(a.check);
  } else if (a.pending?.length) {
    right = `<div class="pend">${a.pending.map(p => `<div class="pend-row"><p><span class="${p.side === 'LONG' ? 'good' : 'bad'}">${p.side}</span> if a 15m bar closes ${p.side === 'LONG' ? 'above' : 'below'} <span class="mono">${px(p.trigger)}</span> ${chip(p.check)}</p><div class="nums"><div><span class="lbl">Stop</span><b class="bad">${px(p.stop)}</b></div><div><span class="lbl">Target</span><b class="good">${px(p.target)}</b></div><div><span class="lbl">Size</span><b>${p.contracts ? p.contracts + ' MNQ' : 'none'}</b></div><div><span class="lbl">Risk</span><b>${p.contracts ? usd(p.riskDollars) : 'too wide'}</b></div></div></div>`).join('')}</div>`;
  } else if (a.countdownTo) {
    right = `<div class="count"><span class="lbl">${esc(a.countdownLabel)}</span><b data-until="${a.countdownTo}"></b></div>`;
  }
  $('aRight').innerHTML = right; $('aChecks').innerHTML = checks;
  const late = a.kind === 'signal' && s.feed.delayed ? ` Your data is delayed${s.feed.delayMin >= 3 ? ' about ' + s.feed.delayMin + ' minutes' : ''}, so this is that far behind the real market.` : '';
  const when = a.signalT && a.exit == null ? ` Signal bar closed ${short(a.signalT)} Denver. Setup is flat by ${short(a.flatAt)}.` : '';
  $('aFoot').textContent = 'Signals are information, not instructions. You place every trade yourself on Tradovate.' + when + late;
  tick();
}

// ── Levels ──
function drawLevels(s) {
  $('price').textContent = s.price != null ? px(s.price) : '';
  if (!s.levels.length) { $('levels').innerHTML = '<p class="empty">No levels yet. They appear once the chart has sent the overnight sessions.</p>'; return; }
  let html = '', placed = false;
  for (const l of s.levels) {
    const here = !placed && s.price != null && l.price < s.price; if (here) placed = true;
    html += `<div class="lv${here ? ' here' : ''}" style="--c:${levelColor(l.name)}"><i></i><span class="nm">${esc(l.name)}${l.swept ? '<small>swept</small>' : ''}</span><span class="px">${px(l.price)}</span><span class="ds">${l.dist != null ? signed(l.dist, 1) : ''}</span></div>`;
  }
  $('levels').innerHTML = html;
}

// ── Chart ──
let hover = null;
function paintChart() {
  if (!state) return;
  const out = drawChart($('chart'), state, hover), tip = $('tip');
  if (out?.tip) { tip.hidden = false; tip.innerHTML = out.tip.html; const w = tip.offsetWidth; tip.style.left = Math.max(4, Math.min(out.plotW - w - 4, out.tip.x + 12)) + 'px'; tip.style.top = Math.max(4, out.tip.y - 56) + 'px'; } else tip.hidden = true;
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
  if (tl && state) { const { dayStart, dayEnd } = state.session; tl.style.left = (100 * (now - dayStart)) / (dayEnd - dayStart) + '%'; tl.firstChild.textContent = 'now ' + short(now); }
}
setInterval(tick, 1000);

// ── Poll ──
async function refresh() {
  try {
    const r = await fetch('/api/state' + (demo ? '?demo=' + encodeURIComponent(demo) : ''), { cache: 'no-store' });
    if (!r.ok) throw new Error((await r.json()).error || 'HTTP ' + r.status);
    state = await r.json(); fetchedAt = Date.now();
    $('demo').hidden = !state.demo;
    $('feed').dataset.status = state.feed.status;
    $('feedLabel').textContent = state.feed.label + (state.feed.symbol && state.feed.status !== 'error' ? ' · ' + state.feed.symbol.split(':').pop() : '');
    drawGuard(state.guard); drawTimeline(state); drawAnswer(state); drawLevels(state); paintChart();
  } catch (e) {
    $('feed').dataset.status = 'error'; $('feedLabel').textContent = 'The Desk server is not answering. Start it with npm.cmd start.';
  }
}
refresh(); setInterval(refresh, 2000);
document.fonts?.ready.then(paintChart);

// ── Tabs ──
const loaders = { journal: loadJournal, playbook: loadPlaybook, settings: loadSettings };
function showTab(name) {
  for (const b of document.querySelectorAll('.tabs button')) b.toggleAttribute('aria-current', b.dataset.tab === name), b.dataset.tab === name && b.setAttribute('aria-current', 'page');
  for (const v of document.querySelectorAll('.view')) v.hidden = v.id !== 'view-' + name;
  loaders[name]?.(); if (name === 'desk') paintChart();
  history.replaceState(null, '', location.pathname + location.search + (name === 'desk' ? '' : '#' + name));
  scrollTo({ top: 0 });
}
for (const b of document.querySelectorAll('.tabs button')) b.addEventListener('click', () => showTab(b.dataset.tab));
const fromHash = () => showTab(loaders[location.hash.slice(1)] ? location.hash.slice(1) : 'desk');
if (location.hash) fromHash();
addEventListener('hashchange', fromHash);

const io = 'IntersectionObserver' in window && !reduceMotion ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }, { threshold: 0.06 }) : null;
for (const el of document.querySelectorAll('.rise')) io ? io.observe(el) : el.classList.add('in');

async function api(method, url, body) {
  const r = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Something went wrong.'); return j;
}
const say = (id, text, ok) => { const n = $(id); n.textContent = text; n.className = 'msg ' + (ok ? 'ok' : 'err'); };

// ── Journal ──
async function loadJournal() {
  const j = await api('GET', '/api/journal');
  $('jBalance').textContent = `Balance ${usd(j.guard.balance)} · limit at ${usd(j.guard.floor)}`;
  $('jList').innerHTML = j.trades.length ? `<table><thead><tr><th>When (Denver)</th><th>Side</th><th class="n">Size</th><th>Setup</th><th>Rules</th><th class="n">Result</th><th></th></tr></thead><tbody>${j.trades.map(t => `<tr><td>${tzDate.format(t.ts)}</td><td>${t.kind === 'adjustment' ? 'Adjustment' : esc(t.side || '')}</td><td class="n">${t.contracts ?? ''}</td><td>${esc(t.setup)}${t.note ? ` <span class="mute">${esc(t.note)}</span>` : ''}</td><td>${t.followedRules == null ? '' : t.followedRules ? 'Followed' : '<span class="warn">Broke</span>'}</td><td class="n ${t.pnl < 0 ? 'bad' : 'good'}">${usd(t.pnl, true)}</td><td><button class="btn ghost" data-del="${esc(t.id)}">Remove</button></td></tr>`).join('')}</tbody></table>` : '<p class="empty">Nothing logged yet. After each trade, type the result from Tradovate above. The guard counts from here.</p>';
}
$('jList').addEventListener('click', async (e) => { const id = e.target.dataset?.del; if (!id || !confirm('Remove this entry from the journal?')) return; await api('DELETE', '/api/journal/' + id); loadJournal(); refresh(); });
$('jForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = new FormData(e.target), body = Object.fromEntries(f); body.followedRules = f.has('followedRules');
  try { await api('POST', '/api/journal', body); e.target.reset(); say('jMsg', 'Added.', true); loadJournal(); refresh(); } catch (err) { say('jMsg', err.message, false); }
});
$('cForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const c = await api('POST', '/api/check', Object.fromEntries(new FormData(e.target)));
    $('cOut').innerHTML = `<p class="verdict ${c.verdict === 'PASS' ? 'good' : 'bad'}">${c.verdict}</p><p class="a-sub">${c.verdict === 'PASS' ? `${c.side}, ${c.contracts} MNQ, ${usd(c.riskDollars)} at risk. 2R target at <span class="mono">${px(c.target2R)}</span>.` : esc(c.reason)}</p><ul class="checks">${c.checks.map(k => `<li><b class="${k.ok ? 'good' : 'bad'}">${k.ok ? 'Pass' : 'Block'}</b><span>${esc(k.name)}. ${esc(k.detail)}</span></li>`).join('')}</ul>`;
  } catch (err) { $('cOut').innerHTML = `<p class="msg err">${esc(err.message)}</p>`; }
});

// ── Playbook ──
let pb = null, pbWin = null;
const f3 = (x) => (x == null ? 'n/a' : signed(x, 3)), f1 = (x, d = 1) => (x == null ? 'n/a' : x.toFixed(d));
async function loadPlaybook() {
  pb = await api('GET', '/api/playbook');
  pbWin ||= state?.session.current?.id || 'nyopen';
  const passed = pb.setups.filter(s => s.label === 'Passed');
  $('pbData').textContent = pb.data ? `NQ 15-minute bars, ${pb.data.start} to ${pb.data.end}` : 'Backtest not run yet';
  $('pbLead').textContent = passed.length
    ? `${passed.length} setup${passed.length > 1 ? 's' : ''} passed every rule and may signal: ${passed.map(s => s.name).join(', ')}.`
    : `No setup passed. Every window is a stand-down until one does. About ${pb.variantsTried} variants have been tried on this data, so one result with a t-stat near 2 is what luck alone would give.`;
  $('pbTabs').innerHTML = pb.windows.map(w => `<button role="tab" aria-selected="${w.id === pbWin}" data-win="${w.id}" style="--c:${WIN_VAR[w.id]}">${esc(w.name)}</button>`).join('');
  drawPlaybook();
}
$('pbTabs').addEventListener('click', (e) => { const w = e.target.dataset?.win; if (!w) return; pbWin = w; for (const b of $('pbTabs').children) b.setAttribute('aria-selected', b.dataset.win === w); drawPlaybook(); });
function drawPlaybook() {
  const list = pb.setups.filter(s => s.window === pbWin);
  $('pbBody').innerHTML = list.map(s => {
    const r = s.result, tag = `<span class="tag ${s.label.split(/[ ,]/)[0]}">${esc(s.label)}</span>`;
    let res = '';
    if (r) {
      const rows = [['2019-2023 (look-at)', r.tune], ['2024 on (judged)', r.judge], ['Last 12 months', r.last12], [`Judged, without ${r.withoutBest.year}`, r.withoutBest]];
      const ys = Object.entries(r.years).filter(([y]) => y >= '2019').sort(), max = Math.max(0.05, ...ys.map(([, v]) => Math.abs(v.avgR)));
      res = `<div class="table-wrap"><table><thead><tr><th>Period</th><th class="n">Trades</th><th class="n">Win %</th><th class="n">Avg R</th><th class="n">t-stat</th><th class="n">Worst drawdown</th></tr></thead><tbody>${rows.map(([n, x]) => `<tr><td>${n}</td><td class="n">${x.trades}</td><td class="n">${f1(x.win)}</td><td class="n ${x.avgR > 0 ? 'good' : 'bad'}">${f3(x.avgR)}</td><td class="n">${f1(x.t, 2)}</td><td class="n">${f1(x.maxDD)}R</td></tr>`).join('')}</tbody></table></div>
        <div class="years" role="img" aria-label="Average R by year">${ys.map(([y, v]) => { const hgt = (Math.abs(v.avgR) / max) * 50; return `<div class="yr" title="${y}: ${f3(v.avgR)}R over ${v.trades} trades"><div class="plot"><span class="zero"></span><span class="barv" style="${v.avgR >= 0 ? `bottom:50%;height:${hgt}%;background:var(--long)` : `top:50%;height:${hgt}%;background:var(--short)`}"></span></div><small>${y.slice(2)}</small></div>`; }).join('')}</div>
        <p class="small mute">Average R per trade by year. On the account: median stop ${f1(r.dollar.medianStop, 0)} points, ${f1(r.dollar.fitPct, 0)}% of signals fit $250 on 1 MNQ, worst drawdown ${usd(r.dollar.maxDD)} against the $2,000 limit. Random-direction entries made ${f3(r.benchmark.mean)}R.</p>
        <ul class="rules-met">${r.rules.map(x => `<li><b class="${x.ok ? 'met' : 'missed'}">${x.ok ? 'Met' : 'Missed'}</b><span>${esc(x.rule)}</span></li>`).join('')}</ul>`;
    } else if (s.carried) {
      res = `<p>${esc(s.summary)}</p>${s.rows.length ? `<div class="table-wrap"><table><thead><tr><th>Period</th><th class="n">Trades</th><th class="n">Win %</th><th class="n">Avg R</th><th class="n">t-stat</th></tr></thead><tbody>${s.rows.map(x => `<tr><td>${x.period}</td><td class="n">${x.trades}</td><td class="n">${f1(x.win)}</td><td class="n bad">${f3(x.avgR)}</td><td class="n">${f1(x.t, 2)}</td></tr>`).join('')}</tbody></table></div>` : ''}<p class="small mute">Tested in October 2026 and carried over. Not re-run.</p>`;
    } else res = '<p class="mute">Not tested yet. Run the backtest.</p>';
    return `<article class="setup"><div class="setup-head"><h3>${esc(s.name)}</h3>${tag}<span class="mute small">${esc(s.source)}</span></div><div class="setup-cols"><div><ul class="plain">${s.rules.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div>${res}</div></div></article>`;
  }).join('') || '<p class="empty">No setups for this window.</p>';
}

// Checklist: kept in this browser, resets each day.
const CHECKS = ['Guard says clear to trade', 'I logged my last trade in the Journal', 'The window has a setup that passed (otherwise I stand down)', 'Signal came from a closed 15-minute bar', 'Stop is where the rule puts it, and the size fits $250', 'I will not move the stop or add to the trade', 'Two losses or $500 down and I am done for the day'];
function drawChecklist() {
  const key = 'desk-checks-' + new Date().toLocaleDateString('en-CA', { timeZone: 'America/Denver' });
  let on = []; try { on = JSON.parse(localStorage.getItem(key) || '[]'); } catch { /* private window: nothing saved */ }
  $('checklist').innerHTML = CHECKS.map((c, i) => `<label class="check"><input type="checkbox" data-i="${i}"${on.includes(i) ? ' checked' : ''}> ${esc(c)}</label>`).join('');
  $('checklist').onchange = () => { const v = [...$('checklist').querySelectorAll('input:checked')].map(n => +n.dataset.i); try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* ignore */ } };
}
drawChecklist();

// ── Settings ──
let plans = {};
function fillSettings({ settings: s, plans: p }) {
  plans = p; const f = $('sForm').elements, a = s.account;
  f.plan.value = a.plan; $('planNote').textContent = p[a.plan]?.note || '';
  for (const k of ['startBalance', 'maxLossLimit', 'lockBalance', 'lockTrigger', 'maxMicros']) f[k].value = a[k];
  f.trailing.value = a.trailing; f.dllOn.checked = !!a.dll.on; f.dllAmount.value = a.dll.amount; f.consistencyPct.value = a.consistencyPct ?? '';
  f.useScaling.checked = !!a.scaling; f.payoutRequested.checked = !!a.payoutRequested;
  for (const k of ['riskPerTrade', 'dailyStop', 'maxLossesPerDay']) f[k].value = s.personal[k];
}
async function loadSettings() { fillSettings(await api('GET', '/api/settings')); }
$('sForm').elements.plan.addEventListener('change', async (e) => { try { fillSettings(await api('POST', '/api/settings', { account: { plan: e.target.value } })); say('sMsg', `Switched to ${plans[e.target.value].name} defaults.`, true); refresh(); } catch (err) { say('sMsg', err.message, false); } });
$('sForm').addEventListener('submit', async (e) => {
  e.preventDefault(); const f = e.target.elements;
  const body = { account: { startBalance: f.startBalance.value, maxLossLimit: f.maxLossLimit.value, lockBalance: f.lockBalance.value, lockTrigger: f.lockTrigger.value, maxMicros: f.maxMicros.value, trailing: f.trailing.value, dll: { on: f.dllOn.checked, amount: f.dllAmount.value }, consistencyPct: f.consistencyPct.value === '' ? null : f.consistencyPct.value, useScaling: f.useScaling.checked, payoutRequested: f.payoutRequested.checked }, personal: { riskPerTrade: f.riskPerTrade.value, dailyStop: f.dailyStop.value, maxLossesPerDay: f.maxLossesPerDay.value } };
  try { fillSettings(await api('POST', '/api/settings', body)); say('sMsg', 'Saved.', true); refresh(); } catch (err) { say('sMsg', err.message, false); }
});
