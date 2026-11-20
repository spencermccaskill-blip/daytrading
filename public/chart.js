// The chart: 15-minute candles, session levels as soft bands with pill labels on the right,
// the time ahead as a hatched area. Anything drawn in the hatched area is a rule level
// (trigger, stop, target), never a price forecast.

const C = { ground: '#05060a', line: '#1a1f2b', line2: '#2a3242', ink: '#f1f4fa', ink2: '#c3cad8', mute: '#8b95a9', long: '#3ddc97', short: '#ff5c74', armed: '#f5b942', cyan: '#38d3f5', asia: '#a99bff', london: '#6aa8ff', prior: '#9aa3b5' };
const WIN = { asia: '#a99bff', london: '#6aa8ff', nyopen: '#38d3f5', nymid: '#7fd6c2' };
const HOUR = 36e5, BAR = 15 * 60000;
const fmtPx = (x) => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const denver = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', hour: 'numeric', minute: '2-digit' });
const denverHour = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Denver', hour: 'numeric' });

export const levelColor = (name) => /Asian/.test(name) ? C.asia : /London/.test(name) ? C.london : /VWAP/.test(name) ? C.cyan : /Prior/.test(name) ? C.prior : C.ink2;
const projColor = { trigger: C.armed, entry: C.ink, stop: C.short, target: C.long };

export function drawChart(canvas, state, hover) {
  const box = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  if (!box.width) return null;
  if (canvas.width !== Math.round(box.width * dpr) || canvas.height !== Math.round(box.height * dpr)) { canvas.width = Math.round(box.width * dpr); canvas.height = Math.round(box.height * dpr); }
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, box.width, box.height);
  const W = box.width, H = box.height, narrow = W < 560;
  const gutter = narrow ? 118 : 168, padT = 10, padB = 26, plotW = W - gutter, plotH = H - padT - padB;
  const font = (px, w = 400) => `${w} ${px}px "IBM Plex Mono", ui-monospace, monospace`;

  const ch = state.chart, bars = [...ch.bars]; if (ch.forming) bars.push(ch.forming);
  if (!bars.length) { g.fillStyle = C.mute; g.font = `400 15px Outfit, system-ui, sans-serif`; g.fillText('No bars yet. Prices load by themselves within a few seconds.', 12, 30); return null; }
  const tNow = Math.max(state.feed.lastBarT || 0, bars.at(-1)[0]) + (ch.forming ? 0 : BAR);
  const back = (narrow ? 7 : 12) * HOUR, ahead = (narrow ? 2 : 3) * HOUR;
  const t0 = tNow - back, t1 = tNow + ahead;
  const vis = bars.filter(b => b[0] >= t0 - BAR);
  const x = (t) => ((t - t0) / (t1 - t0)) * plotW;

  // Price range: the visible bars and the rule levels; session levels only if they are near.
  let lo = Math.min(...vis.map(b => b[3])), hi = Math.max(...vis.map(b => b[2]));
  for (const p of ch.projections) { lo = Math.min(lo, p.price); hi = Math.max(hi, p.price); }
  const span0 = hi - lo || 10;
  const levels = state.levels.filter(l => l.price > lo - span0 * 0.35 && l.price < hi + span0 * 0.35);
  for (const l of levels) { lo = Math.min(lo, l.price); hi = Math.max(hi, l.price); }
  const pad = (hi - lo) * 0.07 || 5; lo -= pad; hi += pad;
  const y = (p) => padT + ((hi - p) / (hi - lo)) * plotH;

  // Grid and price axis ticks (quiet).
  g.lineWidth = 1; g.font = font(11); g.textBaseline = 'middle';
  const step = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find(s => (hi - lo) / s <= 6) || 2000;
  for (let p = Math.ceil(lo / step) * step; p < hi; p += step) { g.strokeStyle = C.line; g.beginPath(); g.moveTo(0, Math.round(y(p)) + .5); g.lineTo(plotW, Math.round(y(p)) + .5); g.stroke(); }

  // Time ahead: hatched.
  const xn = x(tNow);
  g.save(); g.beginPath(); g.rect(xn, padT, plotW - xn, plotH); g.clip();
  g.strokeStyle = 'rgba(139,149,169,.16)';
  for (let k = -plotH; k < plotW - xn + plotH; k += 9) { g.beginPath(); g.moveTo(xn + k, padT + plotH); g.lineTo(xn + k + plotH, padT); g.stroke(); }
  g.restore();
  g.strokeStyle = C.line2; g.beginPath(); g.moveTo(Math.round(xn) + .5, padT); g.lineTo(Math.round(xn) + .5, padT + plotH); g.stroke();
  g.fillStyle = C.mute; g.font = font(11); g.textAlign = 'left'; g.textBaseline = 'top';
  g.fillText(narrow ? 'ahead' : 'time ahead', xn + 6, padT + 4);

  // Session windows along the bottom edge.
  for (const w of ch.windows) {
    const a = Math.max(0, x(w.start)), b = Math.min(plotW, x(w.end)); if (b <= a) continue;
    g.strokeStyle = WIN[w.id]; g.globalAlpha = w.live ? 1 : .55; g.beginPath(); g.moveTo(a, padT + plotH + .5); g.lineTo(b, padT + plotH + .5); g.stroke(); g.globalAlpha = 1;
  }
  // Time labels.
  g.fillStyle = C.mute; g.font = font(11); g.textAlign = 'center'; g.textBaseline = 'top';
  const every = (narrow ? 3 : 2) * HOUR;
  for (let t = Math.ceil(t0 / every) * every; t < t1; t += every) { const px = x(t); if (px < 20 || px > plotW - 20) continue; g.fillText(denverHour.format(t).replace(' ', ''), px, padT + plotH + 8); g.strokeStyle = C.line2; g.beginPath(); g.moveTo(Math.round(px) + .5, padT + plotH); g.lineTo(Math.round(px) + .5, padT + plotH + 4); g.stroke(); }

  // Level bands: a soft band the full width, with the line at its centre.
  for (const l of levels) {
    const yy = y(l.price), col = levelColor(l.name);
    g.fillStyle = col; g.globalAlpha = .1; g.fillRect(0, yy - 4, plotW, 8);
    g.globalAlpha = l.swept ? .35 : .7; g.strokeStyle = col; g.beginPath(); g.moveTo(0, Math.round(yy) + .5); g.lineTo(plotW, Math.round(yy) + .5); g.stroke(); g.globalAlpha = 1;
  }

  // Candles.
  const bw = Math.max(2, Math.min(9, (plotW / ((t1 - t0) / BAR)) * 0.62));
  for (const b of vis) {
    const [t, o, h, l, c] = b, cx = x(t + BAR / 2), up = c >= o, col = up ? C.long : C.short, forming = b === ch.forming;
    g.strokeStyle = col; g.fillStyle = col;
    g.beginPath(); g.moveTo(Math.round(cx) + .5, y(h)); g.lineTo(Math.round(cx) + .5, y(l)); g.stroke();
    const top = y(Math.max(o, c)), ht = Math.max(1, Math.abs(y(o) - y(c)));
    if (forming) { g.fillStyle = C.ground; g.fillRect(cx - bw / 2, top, bw, ht); g.strokeRect(Math.round(cx - bw / 2) + .5, Math.round(top) + .5, Math.round(bw), Math.round(ht)); }
    else g.fillRect(cx - bw / 2, top, bw, ht);
  }

  // Rule projections: dashed, only in the time ahead.
  g.setLineDash([5, 4]);
  for (const p of ch.projections) { const yy = Math.round(y(p.price)) + .5; g.strokeStyle = projColor[p.kind]; g.beginPath(); g.moveTo(xn, yy); g.lineTo(plotW, yy); g.stroke(); }
  g.setLineDash([]);

  // Right-side pills, nudged apart so none overlap.
  const pills = [
    ...levels.map(l => ({ y: y(l.price), text: l.name.replace('Prior day', 'Prior').replace('Evening range', 'Range').replace('Opening range', 'Range'), px: l.price, col: levelColor(l.name), dim: l.swept })),
    ...ch.projections.map(p => ({ y: y(p.price), text: p.kind === 'trigger' ? 'Trigger' : p.kind === 'entry' ? 'Entry' : p.label, px: p.price, col: projColor[p.kind], strong: true })),
  ];
  if (state.price != null) pills.push({ y: y(state.price), text: ['off', 'stale', 'error'].includes(state.feed.status) ? (narrow ? 'Old' : 'Last (old)') : 'Last', px: state.price, col: C.ink, strong: true, fill: true });
  pills.sort((a, b) => a.y - b.y);
  const ph = narrow ? 17 : 19, gap = 3;
  for (let i = 1; i < pills.length; i++) if (pills[i].y - pills[i - 1].y < ph + gap) pills[i].y = pills[i - 1].y + ph + gap;
  const over = pills.length ? pills.at(-1).y + ph / 2 - (H - 4) : 0;
  if (over > 0) { pills.at(-1).y -= over; for (let i = pills.length - 2; i >= 0; i--) if (pills[i + 1].y - pills[i].y < ph + gap) pills[i].y = pills[i + 1].y - ph - gap; }
  g.textBaseline = 'middle'; g.textAlign = 'left';
  for (const p of pills) {
    const px0 = plotW + 8, w = gutter - 10, top = p.y - ph / 2;
    g.globalAlpha = p.dim ? .55 : 1;
    g.fillStyle = p.fill ? p.col : C.ground; g.strokeStyle = p.col;
    g.beginPath(); g.roundRect(px0 + .5, Math.round(top) + .5, w - 1, ph, 5); g.fill(); g.stroke();
    g.strokeStyle = p.col; g.beginPath(); g.moveTo(plotW, Math.round(y(p.px)) + .5); g.lineTo(px0, Math.round(p.y) + .5); g.stroke();
    g.fillStyle = p.fill ? C.ground : p.strong ? p.col : C.ink2; g.font = font(narrow ? 10 : 11, 500);
    const label = narrow ? p.text.replace(' high', ' hi').replace(' low', ' lo').replace('Asian', 'Asia') : p.text;
    g.fillText(label, px0 + 6, p.y + .5);
    g.textAlign = 'right'; g.fillStyle = p.fill ? C.ground : C.ink; g.fillText(narrow ? Math.round(p.px).toLocaleString('en-US') : fmtPx(p.px), px0 + w - 6, p.y + .5); g.textAlign = 'left';
    g.globalAlpha = 1;
  }

  // Hover crosshair.
  let tip = null;
  if (hover && hover.x >= 0 && hover.x <= plotW) {
    const t = t0 + (hover.x / plotW) * (t1 - t0), b = vis.find(v => t >= v[0] && t < v[0] + BAR);
    g.strokeStyle = C.line2; g.beginPath(); g.moveTo(Math.round(hover.x) + .5, padT); g.lineTo(Math.round(hover.x) + .5, padT + plotH); g.stroke();
    if (b) tip = { x: hover.x, y: y(b[2]), html: `${denver.format(b[0])}<br>O ${fmtPx(b[1])} H ${fmtPx(b[2])}<br>L ${fmtPx(b[3])} C ${fmtPx(b[4])}` };
    else if (t > tNow) tip = { x: hover.x, y: hover.y, html: `${denver.format(t)}<br>ahead of now` };
  }
  return { tip, plotW };
}
