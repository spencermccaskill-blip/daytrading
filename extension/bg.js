// Posts chart bars to The Desk on this computer. Only talks to localhost:3000.
chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  fetch('http://localhost:3000/api/bars', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(msg),
  }).then(r => r.json()).then(reply).catch(err => reply({ ok: false, error: String(err) }));
  return true;
});
