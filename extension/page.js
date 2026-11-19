// Runs inside the TradingView chart page. Reads the main chart series and hands it to relay.js.
(() => {
  let lastSend = 0, lastFull = 0, series = null, hooked = null, backfilled = new Set();

  const getChart = () => { try { return window.TradingViewApi?.activeChart?.(); } catch { return null; } };

  function rows(s, n) {
    const b = s.bars(), out = [];
    const first = Math.max(b.firstIndex(), n ? b.lastIndex() - n + 1 : b.firstIndex());
    for (let i = first; i <= b.lastIndex(); i++) { const v = b.valueAt(i); if (v) out.push([v[0], v[1], v[2], v[3], v[4], v[5] || 0]); }
    return out;
  }

  function send(force) {
    const c = getChart(); if (!c) return;
    let s; try { s = c._chartWidget.model().mainSeries(); } catch { return; }
    const now = Date.now();
    if (!force && now - lastSend < 2000) return;
    const full = force || now - lastFull > 60000 || s !== series;
    series = s; lastSend = now; if (full) lastFull = now;
    const key = c.symbol() + '|' + c.resolution();
    if (!backfilled.has(key)) { backfilled.add(key); for (let k = 0; k < 4; k++) setTimeout(() => { try { s.requestMoreData(5000); } catch {} }, 1500 * (k + 1)); setTimeout(() => send(true), 9000); }
    window.postMessage({ __nqdesk: true, payload: { symbol: c.symbol(), resolution: c.resolution(), bars: rows(s, full ? 0 : 40) } }, '*');
  }

  function hook() {
    const c = getChart(); if (!c) return;
    let s; try { s = c._chartWidget.model().mainSeries(); } catch { return; }
    if (hooked === s) return;
    hooked = s;
    try { s.dataEvents().dataUpdated().subscribe(null, () => send(false)); } catch {}
    send(true);
  }

  // Event-driven updates arrive with every tick; the timer is a fallback and re-hooks after symbol changes.
  setInterval(() => { hook(); send(false); }, 3000);
})();
