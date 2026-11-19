// Screenshot of the real (non-demo) page. Usage: node scripts/shot-real.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.env.BASE || 'http://localhost:3111';
const browser = await chromium.launch();
for (const [label, viewport, scale] of [['desktop', { width: 1320, height: 900 }, 1], ['phone', { width: 390, height: 844 }, 2]]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: scale });
  await page.goto(base + '/');
  await page.waitForFunction(() => document.getElementById('aWord').textContent !== '–');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight)); await page.waitForTimeout(500);
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(600);
  await page.screenshot({ path: `screenshots/${label}-real-now.png`, fullPage: true });
  await page.close();
}
await browser.close();
