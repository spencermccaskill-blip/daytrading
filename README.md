# NQ Desk

A live dashboard for NQ / MNQ that runs on your laptop at http://localhost:3000.
It reads your TradingView chart through a small Chrome extension, so it needs no paid data feed.

What it shows:
- **NY sweep + shift**: the setup that tested best (rules below), with a live state: Watching, Armed, LONG/SHORT with entry, stop, 2R target and MNQ size, then the result.
- **Your London sweep + reclaim**: shown for reference. It lost money in every backtest version.
- **Levels**: Asian range, London 2–5 ET range, prior day high/low, London and NY VWAP, with distance from price.
- **US calendar** (high and medium impact) and **market headlines**.
- **Backtest scorecard**: the numbers behind each setup.

## Start it

Needs Node.js 18 or newer (the same as kalshi-edge).

```
cd nq-desk
npm install      # first time only
npm start
```

Then open http://localhost:3000.

## Connect TradingView (once)

1. In Chrome go to `chrome://extensions` and turn on **Developer mode** (top right).
2. Click **Load unpacked** and pick the `nq-desk/extension` folder.
3. Open TradingView, chart **MNQ1!** or **NQ1!** on the **1, 5 or 15 minute** timeframe.
   5 minutes is best: it keeps about a month of history for prior-day levels and the 20-day trend.
4. Keep that chart open in its own Chrome window. The dashboard's status pill turns green (live) or amber (delayed).

Your TradingView plan shows CME futures delayed ("D" next to the symbol). Signals then arrive late by the same amount.
TradingView's real-time CME data add-on fixes that.

## NY sweep + shift rules (fixed before testing)

1. Liquidity pools set before the open: Asian high/low (00:00–07:00 UTC), London high/low (2–5 ET), prior day high/low.
2. After 9:30 ET, price trades through one of those pools.
3. A 15-minute bar closes through the lowest low (after a high-side sweep) or highest high (after a low-side sweep) of the previous 3 bars, between 9:45 and 11:00 ET.
4. Entry at that close. Stop one point beyond the session extreme since 9:30. Target 2R. Otherwise out at 12:00 ET. One trade a day.

Backtest (NQ 15m, Dec 2018 – Oct 2026, 1 point cost per trade): +0.11R per trade from 2024 on (383 trades, t = 2.3),
+0.05R in 2019–2023, positive in 6 of 7 full years. It missed two of the four pass rules set in advance
(drawdown 10.9R vs a 10R limit; last 12 months close to flat at +0.03R), so treat it as unproven.
The engine on this dashboard matched the backtest trade-for-trade on 279 recent days.

## Files

- `server/` Express server, signal engine, calendar and news feeds, backtest numbers
- `public/` the dashboard page
- `extension/` the Chrome bridge (it only talks to localhost:3000)
- `data/` your settings and saved bars (created on first run)
- `test/` engine tests: `npm test`
