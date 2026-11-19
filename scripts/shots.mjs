// Takes screenshots of every demo state at desktop and phone width. Usage: node scripts/shots.mjs [names...]
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.BASE || 'http://localhost:3111';
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['closed', 'standdown', 'watching', 'armed', 'long', 'short', 'won', 'lost', 'blocked', 'locked', 'stale'];
const browser = await chromium.launch();
const errors = [];
for (const [label, viewport, scale] of [['desktop', { width: 1320, height: 900 }, 1], ['phone', { width: 390, height: 844 }, 2]]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  page.on('console', m => m.type() === 'error' && errors.push(`${label}: ${m.text()}`));
  page.on('pageerror', e => errors.push(`${label}: ${e.message}`));
  for (const n of names) {
    const [demo, hash] = n.split('#');
    await page.goto(`${base}/?demo=${demo}${hash ? '#' + hash : ''}`);
    await page.waitForFunction(() => document.getElementById('aWord').textContent !== '–');
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
    await page.screenshot({ path: `screenshots/${label}-${n.replace('#', '-')}.png`, fullPage: true });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) errors.push(`${label} ${n}: page scrolls sideways by ${overflow}px`);
  }
  await page.close();
}
await browser.close();
console.log(errors.length ? errors.join('\n') : 'no console errors, no sideways scroll');
