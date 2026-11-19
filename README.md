# The Desk

One time-aware dashboard for NQ / MNQ day trading. It runs on your laptop at http://localhost:3000,
reads your open TradingView chart through a small browser extension, and replaces NQ Desk and London Desk.

**It never places an order. Signals are information, not instructions.**

What the page shows, top to bottom:

1. **Account guard** (always first): room to the Lucid max loss limit, daily loss used, trades today, losses, lockout.
2. **Your day**: the four windows on a 24-hour Denver timeline, with "now".
3. **One answer for right now**: the setup for this window (Watching, Armed, LONG / SHORT, result) with entry,
   stop, target and size. Or "Stand down". Or "No trade right now" with a countdown.
4. **Levels** and the **chart**.

Journal, Playbook (rules, checklist, backtest results) and Settings are behind tabs.

## The honest state of the strategies

A setup may signal only if it passed a test whose rules were written down first
(`research/PREREGISTRATION.md`). **Right now nothing has passed, so every window says stand down.**
Results are in `research/RESULTS.md`. That is the test working, not the app being broken.

## Start it (Windows, PowerShell)

Stop the old NQ Desk first if it is running (click its PowerShell window, press Ctrl+C).

First time, paste these one line at a time:

```
cd $HOME\Downloads
```
```
curl.exe -L -o the-desk.zip https://github.com/spencermccaskill-blip/daytrading/archive/refs/heads/claude/stoic-darwin-br4ivc.zip
```
```
Expand-Archive the-desk.zip -DestinationPath . -Force
```
```
cd daytrading-claude-stoic-darwin-br4ivc
```
```
npm.cmd install
```
```
npm.cmd start
```

Then open http://localhost:3000 in Edge. Leave the PowerShell window open while you trade.

Every day after that:

```
cd $HOME\Downloads\daytrading-claude-stoic-darwin-br4ivc
```
```
npm.cmd start
```

## Connect TradingView in Edge (once)

1. In Edge go to `edge://extensions` and switch on **Developer mode**.
2. If the old "NQ Desk Bridge" is listed, click **Remove** on it.
3. Click **Load unpacked** and pick the `extension` folder inside `Downloads\daytrading-claude-stoic-darwin-br4ivc`.
4. Open your TradingView chart: **MNQ1!**, **5 minutes**. Refresh that tab once.
5. Keep the chart tab open. In Edge settings, add tradingview.com to "Never put these sites to sleep".

The dot at the top right turns green (live) or amber (delayed). Your TradingView plan shows CME
futures about 10 minutes late unless you buy their real-time CME add-on, and the desk says "Delayed"
when that is the case. A delayed signal is that many minutes old.

## The guard needs the Journal

The desk cannot see Tradovate. After every trade, open **Journal** and type the profit or loss.
Two losses, $500 down on the day, or too little room to the Lucid limit, and the desk locks and blocks signals.
Check **Settings** once: plan, whether your account has a daily loss limit, and your own rules.

## Other commands

```
npm.cmd test
```
Runs all checks, including "the live engine reproduces the backtest trade for trade".

```
npm.cmd run backtest
```
Re-runs every registered setup on `data/history` and rewrites `research/RESULTS.md`.

To see every screen state with made-up data, add `?demo=` to the address, for example
http://localhost:3000/?demo=long . Names: closed, standdown, watching, armed, long, late, short, won, lost,
blocked, locked, stale. A banner marks it as demo data.

## Files

- `server/` the local server: clock (`sessions.js`), guard (`guard.js`), setups (`strategies/`), page state (`desk.js`)
- `public/` the page
- `extension/` the TradingView bridge (talks only to localhost:3000)
- `research/` pre-registration, backtest runner, results
- `data/` your settings, journal and saved bars (made on first run); `data/history` is the price history
- `docs/LUCID-RULES.md` the Lucid rules the guard is built from, with sources
- `test/` the checks
