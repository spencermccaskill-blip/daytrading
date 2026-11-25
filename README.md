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

## What the Desk shows

Each of the four windows has three or four setups (fourteen in all). The Desk leads with one and
lists the rest under "Also in this window"; each of those opens on its own to show its full numbers
and its own green +. The setup's name is always above the big status word.

Two win rates sit under every suggestion:

- **Last 4 weeks** (the big one): what that setup's suggestions actually did recently, from the
  replay log, with the number of trades beside it. It is usually 10 to 20 trades, so it swings a lot.
- **Since 2024** (smaller): the long test, a few hundred trades. It says whether the setup has shown
  an edge over time. None has passed every test rule, so each is marked "not proven".

A setup can win often and still lose money, so the average result per trade (in R) is next to each.

**Focus and hide.** In Playbook, open a strategy and press "Focus on this" to make it lead the Desk
whenever its window is open, or "Hide from the Desk" to leave it out.

**Too-wide stops.** When a stop is wider than your risk allows, the trade is marked Block and shows
what one micro would cost. You can still log it with +; it is recorded as over your risk.

**Holidays.** The clock knows Thanksgiving, Black Friday, Christmas and New Year hours through
1 January 2027 (`server/holidays.js`). Windows are shortened or removed, and the Desk and News tab say
so. CME confirms holiday hours about two weeks ahead; rows not yet confirmed are labelled.

**News** shows headlines as tiles with the article picture where the feed has one, filters for time,
severity, topic and source, scheduled US releases, and unusually large moves. It is context: it
cannot predict how the market will react to a headline.

## Start and update on the Mac, without typing

In Finder, open `Projects/daytrading-claude-stoic-darwin-br4ivc` and double-click:

- **Start The Desk.command** to start it (it stops any copy already running, then opens the page).
- **Update The Desk.command** to download the newest version and start it. Your journal and settings are kept.

Each opens its own Terminal window; leave that window open while you trade. The first time, macOS may
ask whether to open it: choose Open. To keep them handy, drag either file to the right side of the Dock.

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

- **The + asks for your entry price first.** It is filled in with the rule's entry; change it to the
  price you actually got (and the contracts, if different) so the result is exact.

### Setting your real balance

If the account was traded before The Desk, open **Settings** and enter two numbers from your Lucid
dashboard under "Set it from your Lucid dashboard": the current balance and the minimum balance.
The guard counts from there. Do this again any time the guard and Lucid disagree.

With less than $1,000 of room to the limit, the guard switches to **one loss and done for the day**.
It does not shrink your risk per trade, so trades are not blocked for their size. You can turn this
off in Settings.

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
