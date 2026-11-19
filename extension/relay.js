// Passes chart data from the page to the extension's background worker, which posts it to localhost.
window.addEventListener('message', (e) => {
  if (e.source !== window || !e.data || e.data.__nqdesk !== true) return;
  try { chrome.runtime.sendMessage(e.data.payload, () => void chrome.runtime.lastError); } catch {}
});
