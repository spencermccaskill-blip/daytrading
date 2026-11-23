// Dev only: runs The Desk on a made-up day with a frozen clock, in a throwaway data folder,
// so screens that need real state (journal, replay log) can be looked at. Usage: node scripts/dev-demo-server.mjs [scenario] [port]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/index.js';
import { demoInput } from '../server/demo.js';

const inp = demoInput(process.argv[2] || 'long'), port = Number(process.argv[3]) || 3112;
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'desk-dev-'));
fs.writeFileSync(path.join(dataDir, 'bars.json'), JSON.stringify(inp.store.toJSON()));
const { app } = createApp({ dataDir, clock: () => inp.now, fetchImpl: async () => { throw new Error('offline'); } });
// Pretend a chart is feeding it, so the page shows prices as current.
app.listen(port, async () => {
  const last = inp.store.ctx().raw.bars.slice(-40).map(b => [b.t / 1000, b.o, b.h, b.l, b.c, b.v]);
  const post = () => fetch(`http://localhost:${port}/api/bars`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ symbol: 'CME_MINI_DL:MNQ1!', resolution: '5', bars: last }) }).catch(() => {});
  await post(); setInterval(post, 5000);
  console.log(`dev demo (${process.argv[2] || 'long'}) at http://localhost:${port}`);
});
