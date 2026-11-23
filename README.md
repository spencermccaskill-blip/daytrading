# The Desk

One time-aware dashboard for NQ / MNQ day trading. It runs on your laptop at http://localhost:3000,
fetches delayed MNQ prices by itself (or reads your open TradingView chart through a small browser extension), and replaces NQ Desk and London Desk.

**It never places an order. Signals are information, not instructions.**

What the page shows, top to bottom:

1. **Account guard** (always first): room to the Lucid max loss limit, daily loss used, trades today, losses, lockout.
2. **Your day**: the four windows on a 24-hour Denver timeline, with "now".
3. **One answer for right now**: the setup for this window (Watching, Armed, LONG / SHORT, result) with entry,
   stop, target and size. Or "Stand down". Or "No trade right now" with a countdown.
4. **Levels** and the **chart**.

Journal, Playbook (rules, checklist, backtest results) and Settings are behind tabs.

## What the setups and scores mean

Each of the four windows has three or four setups (fourteen in all). The Desk shows the most active
one, with the others one click away. **None has passed every test rule**, so every one is marked
"Not proven".

The **score out of 10** is that setup's win rate in testing since 2024 (51% of trades = 5.1). It is
the same for every signal from that setup and is not a forecast. A setup can win often and still lose
money, so the average result per trade is shown next to it, and the line says plainly when a setup
lost money in testing. Rules are in `research/PREREGISTRATION.md`, results in `research/RESULTS.md`.

The **News** tab shows scheduled US releases, headlines sorted by market-moving topic, what MNQ did
in the 15 and 60 minutes after each, and any unusually large 15-minute moves in the last day. It is
context: it cannot predict how the market will react to a headline.

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

## On a Mac

The app is the same on a Mac; only the commands differ. You need Node.js once: download the
"LTS" installer from https://nodejs.org and click through it.

Open the **Terminal** app and paste these one line at a time:

```
cd ~/Downloads
```
```
curl -L -o the-desk.zip https://github.com/spencermccaskill-blip/daytrading/archive/refs/heads/claude/stoic-darwin-br4ivc.zip
```
```
unzip -o the-desk.zip
```
```
cd daytrading-claude-stoic-darwin-br4ivc
```
```
npm install
```
```
npm start
```

Every day after that:

```
cd ~/Downloads/daytrading-claude-stoic-darwin-br4ivc
```
```
npm start
```

Differences from Windows:

- It is `npm`, not `npm.cmd`. Stop the server with **Control + C** (not Command).
- The bridge extension works in **Edge or Chrome** on a Mac (`edge://extensions` or `chrome://extensions`,
  Developer mode, Load unpacked, pick the `extension` folder). **Safari cannot load it.**
- Hard refresh is **Command + Shift + R**.
- Keep the Mac awake while trading: a sleeping Mac stops the feed, and The Desk will say "Feed stalled".

### Bringing your journal and settings over

They live in the `data` folder of the app on the Windows laptop and are not on GitHub (they are private).
Copy these two files to the same `data` folder on the Mac, with The Desk stopped on both:

- `data\journal.json` (every trade you logged: the guard is built from it)
- `data\settings.json` (your Lucid plan and rules)

Email them to yourself, or use a USB stick or iCloud Drive. `data\bars.json` does not need to move;
the chart refills it. If you skip this, the Mac starts with an empty journal and default settings,
so the guard would show a fresh $50,000 account.

## Where the prices come from

The Desk fetches MNQ prices by itself, so **no chart tab needs to be open**. They come from Yahoo
Finance, free and about 10 minutes delayed. It is an unofficial service: it can refuse requests or
stop working without notice, and when it does The Desk says "Feed stalled" and shows no signal.
The top right of the page says "fetched automatically" when this feed is in use.

If a TradingView chart with the bridge extension is open, The Desk uses that instead (it says
"from your chart"), and switches back to fetching 3 minutes after the tab goes quiet. The two are
never mixed. You can turn the automatic fetch off in Settings.

The Mac still has to be on and awake, with The Desk running in Terminal.

## Connect TradingView in Edge (optional)

1. In Edge go to `edge://extensions` and switch on **Developer mode**.
2. If the old "NQ Desk Bridge" is listed, click **Remove** on it.
3. Click **Load unpacked** and pick the `extension` folder inside `Downloads\daytrading-claude-stoic-darwin-br4ivc`.
4. Open your TradingView chart: **MNQ1!**, **5 minutes**. Refresh that tab once.
5. Keep the chart tab open. In Edge settings, add tradingview.com to "Never put these sites to sleep".

The dot at the top right turns green (live) or amber (delayed). Your TradingView plan shows CME
futures about 10 minutes late unless you buy their real-time CME add-on, and the desk says "Delayed"
when that is the case. A delayed signal is that many minutes old.

## The journal, without typing

The desk cannot see Tradovate, so the guard only knows about trades that are in the Journal.

- **Green + next to a suggested trade** ("I took this"): adds it to the journal at the size the desk
  suggested. When the trade reaches its target, stop or time exit, the desk fills in the result by
  itself. Results are worked out from the rule exit, before commissions, and are marked "estimate".
  If your real fill or exit was different, click "estimate · fix" in the Journal and type the real number.
- **Suggested trades** (Journal tab): every trade the setups suggested, worked out from the price
  history when The Desk starts, including days it was off. Finished ones are saved, so the list keeps
  growing. Press + on any you took. "How the suggestions have done" keeps a running tally per setup.
- You can still type a trade in by hand, and "Adjustment" is for fees, payouts and corrections.

Two losses, $500 down on the day, or too little room to the Lucid limit, and the desk locks and blocks
signals. Check **Settings** once: plan, whether your account has a daily loss limit, and your own rules.

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
