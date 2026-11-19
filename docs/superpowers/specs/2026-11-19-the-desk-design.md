# The Desk: design

## Intent
One localhost dashboard for Spencer's MNQ day trading on a Lucid $50K funded account. It answers one
question at the top of the page: what, if anything, is there to trade right now, and does the account allow it.
It replaces NQ Desk and London Desk. It never places orders.

## Goals
- Session-aware: four windows on the Denver clock, right across US and UK clock changes.
- A setup signals only if it passed a pre-registered backtest. Otherwise the window is a stand-down.
- Account guard first and always visible; it blocks signals that do not fit. Fed by a manual journal.
- The live engine reproduces the backtest trade-for-trade (kept as a unit test).

## Non-goals
Order placement, broker links, news and calendar feeds, price forecasts, any gamification.

## Anti-goals
Showing a weak setup to fill space. Promising a winning strategy. Shrinking a stop to fit the risk.

## Approaches considered
1. **Patch the old engine in place** (one `engine.js` with NY and London models). Fast, but the backtest lived
   in a browser, so "engine matches backtest" could not be a repeatable test, and adding windows meant more special cases.
2. **One strategy function per setup, shared by the backtest and the live desk** (chosen). Each setup is a
   pure function of (closed 15-minute bars, raw bars, data time). The backtest calls it on history; the server
   calls it on the bars the extension posts. Matching is then a property the tests check, not a hope.
3. **A separate research project** exporting a signals file. Cleaner split, but two code paths again.

Chosen: 2. Same shape as before on the outside (Express server, plain page, MV3 extension, `data/*.json`, one command).

## Calls made without asking (builder's)
- London window is pinned to the London clock (8 AM to noon London). That is 1 to 5 AM Denver except the
  weeks the US and UK clocks disagree, when it shows as 2 to 6 AM Denver.
- The trading day turns over at 4:00 PM Denver, so an evening trade counts toward the next day's loss count.
- Calendar and headline feeds from NQ Desk were dropped: the main view is only what gets acted on.
- Fonts are served from the app itself (npm packages), so the page looks right offline.
- A chart that is connected but sends no new bar for 45 minutes is treated as stalled.
- Settings and journal files are no longer tracked in git (they are personal state).

## Pieces
`server/time.js`, `sessions.js` (clock) · `bars.js` (bar store) · `strategies/` (seven setups) ·
`guard.js` (Lucid + personal rules, sizing, PASS/BLOCK) · `verdicts.js` (who may signal) ·
`desk.js` (the page state, pure) · `demo.js` (made-up scenarios) · `index.js` (HTTP) ·
`research/` (pre-registration, history stitching, stats, runner, results) · `public/` (page, chart) · `extension/`.
