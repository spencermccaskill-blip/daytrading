# Pre-registration: The Desk strategy tests

Written 2026-11-19, **before any of the new tests were run**. This file is committed on its own
first, so the git history shows the rules and the pass bar came before the results.
Nothing below may be changed after results are seen. If a rule turns out to be badly specified,
the fix is recorded in `research/RESULTS.md` under "Changes after seeing results" and the setup
is flagged, never silently edited here.

No promise is made that any setup wins. The promise is a fair test and an honest report,
including "no edge".

## Data

- `data/history/nq-15m-contracts.json`: NQ 15-minute bars, 32 quarterly contracts,
  2018-12-02 to 2026-10-21, exported from TradingView. Times are UTC at bar open.
- Stitching (same as the original backtest): for each UTC date use the contract whose roll date
  (3rd Friday of Mar/Jun/Sep/Dec minus 7 days) comes next. Every lookback for that date (prior
  day, 14-day averages) reads the **same contract**, so no roll gaps enter a level.
- About 85% of weekdays are covered; a couple of weeks around each roll are missing.
- Only 15-minute bars exist. Papers that used 1- or 5-minute bars are tested in a 15-minute
  form; that is an adaptation and is named as one.

## Simulation rules (all setups)

- Signals only on **closed** 15-minute bars. Entry price = the close of the signal bar.
- Cost: **1 NQ point per trade**, subtracted from every result.
- If the stop and the target are both inside one bar, **the stop is assumed to hit first**.
- Results are in R (profit divided by the risk from entry to stop).
- A signal with a stop closer than 5 points is skipped (cost would dominate).
- One trade per setup per day. No re-entry.
- Periods: **2019–2023 is the look-at period** (context only; no parameters are tuned on it
  because every parameter below is fixed in advance). **2024-01-01 to 2026-10-21 is the judge
  period.** "Last 12 months" = 2025-10-22 to 2026-10-21.
- Benchmark: the same entry bars, same stop distance, same exit rules, but a **random
  direction** (500 seeded runs). A setup that is not clearly better than this has no edge.
- Reported for every setup: trades, win %, average R, t-stat, worst drawdown (R and dollars),
  a per-year table, the result without its best year, and the last 12 months.

## Pass bar (judge period, all must hold)

1. Average at least **+0.10R** per trade after costs.
2. t-stat at least **2.0**.
3. Positive average in **each** of 2024, 2025 and 2026.
4. Worst peak-to-trough drawdown no deeper than **10R**.
5. Last 12 months average **above zero**.
6. Practical on the account: trading MNQ ($2 per point) at $250 risk with whole contracts
   (`contracts = floor(250 / (stop points x 2))`, a signal that gives 0 contracts is skipped,
   the stop is never shrunk), the taken trades must be net positive in dollars and their worst
   dollar drawdown must stay **under $2,000** (the Lucid $50K max loss limit).

## Labels

- **Passed**: all six rules hold. Only a Passed setup may signal on The Desk.
- **Promising, not proven**: positive after costs in both periods, but at least one rule missed.
- **No edge**: positive in one period and not the other.
- **Benched**: zero or negative in both periods.

## Setups under test

All clock times are New York time (ET). Denver is always 2 hours behind ET.
"Prior 14 days" means the 14 most recent earlier dates of the same contract that have the
needed bars; a setup needs at least 10 of them or it does not trade that day.
`ATR15` = average (high minus low) of regular-hours (9:30–16:00) 15-minute bars over those days.
`PC` = prior day's close of the 15:45 bar. `VWAP` = volume-weighted average of
(high+low+close)/3 over the 15-minute bars from 9:30.

### NY open window (9:30–12:00 ET = 7:30–10:00 AM Denver)

**N1. NY sweep + shift** (carried over, already tested in Oct 2026; re-run only to confirm the
new code reproduces it). Pools: Asian high/low (00:00–07:00 UTC), London high/low (2–5 ET),
prior day high/low (prior UTC date before 21:00 UTC, at least 40 bars). After 9:30 a bar trades
through a pool. Then a bar opening 9:30–10:45 closes below the lowest low of the previous 3
bars (after a high-side sweep, short) or above their highest high (after a low-side sweep,
long). Stop 1 point beyond the session extreme since 9:30. Target 2R. Flat 12:00.

**N2. Opening range breakout, 15-minute form** (Zarattini & Aziz, SSRN 4416622, adapted from
5-minute bars). The 9:30 bar: close above open = long, below = short, equal = no trade.
Stop = that bar's low (long) or high (short). Target 10R. Flat 16:00.

### NY midday / close window (12:00–16:00 ET = 10:00 AM–2:00 PM Denver)

**M1. Intraday momentum, noise-area breakout** (Zarattini, Aziz & Barbon, SSRN 4824172, adapted
to 15-minute bars and to entries from 12:00 only). For each bar close time T on a :00 or :30
from 12:00 to 15:30: `sigma(T)` = average over the prior 14 days of
|close at T / 9:30 open - 1|. Upper = max(today's 9:30 open, PC) x (1 + sigma),
Lower = min(open, PC) x (1 - sigma). Enter at the first such close above Upper (long) or below
Lower (short). Hard stop 3 x ATR15 from entry. At each later :00/:30 close, exit a long if the
close is below max(Upper, VWAP), a short if above min(Lower, VWAP). Otherwise flat 16:00.

**M2. Last half-hour momentum** (Gao, Han, Li & Zhou, JFE 2018). At the 15:30 close:
long if close > PC, short if close < PC. Hard stop 2 x ATR15. Exit 16:00.

**M3. VWAP trend** (Zarattini & Aziz, SSRN 4631351, reduced to one midday decision). At the
12:00 close: long if close > VWAP, short if below. Hard stop 3 x ATR15. Exit at the first later
15-minute close on the other side of VWAP, otherwise 16:00.

### Asia evening window (18:00–00:00 ET = 4:00–10:00 PM Denver)

No audited or academic source was found for an NQ evening-session setup; both are common
practitioner forms and are tested, not assumed.

**A1. Evening range breakout.** Range = high/low of the 18:00 and 18:15 bars. First bar opening
18:30–21:45 that closes above the range = long, below = short. Stop 1 point beyond the other
side of the range. Target 2R. Flat 00:00.

**A2. Evening sweep + shift.** Pools = that day's regular-hours (9:30–16:00) high and low.
From 18:00 a bar trades through a pool. Then a bar opening 18:45–21:45 closes through the
lowest low / highest high of the previous 3 bars (all three at or after 18:00). Stop 1 point
beyond the extreme since 18:00. Target 2R. Flat 00:00.

### London window (08:00–12:00 London = 1:00–5:00 AM Denver)

Nothing new is registered. Carried over from the October 2026 tests and **not re-run here**:
London sweep + reclaim (negative in every version: Benched), London breakout (no edge),
London TJR (no edge), London TJR + 20-day trend (only 2025 good: no edge),
1:00 AM range breakout (losing: Benched).

## Count of variants tried

Before today: about 10 (NY sweep + shift; London sweep + reclaim in 5 exit versions; London
breakout; London TJR; TJR + trend; 1 AM range breakout). Registered today: 6 new (N2, M1, M2,
M3, A1, A2). Total about 16. With that many tries, **one result with a t-stat near 2 is
expected by luck alone**; a single marginal pass must be read with that in mind.

---

# Addendum, 2026-11-20: popular setups, shown with a score

Written before any of these were run. On 2026-11-20 Spencer changed how The Desk uses the tests:

- **The backtest is no longer a gate.** The Desk shows the most active setup in each window whether
  or not it passed, with a score. The six pass rules above are unchanged and are still reported.
- **Score out of 10** = the share of that setup's tested trades since 2024-01-01 that ended in
  profit after the 1 point cost, times 10 (51.4% of trades = 5.1). It is the same for every signal
  from a setup. It is a historical win rate, not a forecast, and a high win rate with small wins
  can still lose money, so the average R is always shown beside it.
- The setups below were chosen because they are widely taught and traded (prop-firm and broker
  material, ICT/TJR-style content, TradingView scripts). **None has an audited track record.**
  Sources disagree on details; where they do, the simplest common version is used. All are
  15-minute forms because the history is 15-minute bars.

Simulation rules are the same as above (closed bars, 1 point cost, stop-first, skip stops under
5 points, one trade per setup per day). London times are London clock time.

### Asia evening

**A3. Evening range fade.** Range = high/low of 18:00–19:00 ET. A bar opening 19:00–21:45 trades
beyond the range but closes back inside it: fade it. Stop 1 point beyond that bar's extreme.
Target = the far side of the range (skipped if that is less than 1R away). Flat 00:00 ET.

### London (08:00–12:00 London)

Asian range for all three = high/low from 00:00 UTC to the 08:00 London open.

**L1. London sweep + reclaim ("Judas swing").** From 08:00 a bar trades beyond the Asian high or
low. Then a bar opening 08:00–10:45 closes back inside the range: trade back into it. Stop 1 point
beyond the extreme since 08:00. Target 2R. Flat 12:00 London. (The October test of this lost money.)

**L2. London breakout.** The first bar opening 08:00–10:45 that closes outside the Asian range:
trade with it. Stop at the middle of the Asian range. Target 2R. Flat 12:00 London.

**L3. London opening range breakout.** Range = high/low of 08:00–08:30 London. First bar opening
08:30–10:15 that closes outside it: trade with it. Stop 1 point beyond the other side. Target 2R.
Flat 12:00 London.

### NY open

**N3. Initial balance breakout.** Initial balance = high/low of 9:30–10:30 ET. First bar opening
10:30–11:45 that closes outside it: trade with it. Stop at the middle of the initial balance.
Target = half the initial balance range beyond the broken edge. Flat 16:00 ET.

**N4. Silver Bullet, 15-minute form** (ICT). A pool (same pools as N1) is swept after 9:30 ET.
Then three bars leave a fair value gap in the other direction (after a low sweep: the third bar's
low is above the first bar's high), with the third bar closing between 10:00 and 11:00 ET. Enter
at that close. Stop 1 point beyond the first bar's extreme. Target 2R. Flat 12:00 ET. The original
uses 1- to 5-minute charts and a limit order in the gap; this is a simplification.

### NY midday / close

**M4. VWAP bounce.** A bar opening 12:00–15:00 ET touches VWAP and closes back on the side the
previous three bars all closed on (above = long, below = short). Stop 1 point beyond that bar's
extreme. Target 2R. Flat 16:00 ET.

Variants tried now: about 16 before, plus these 7 = about 23.


# Addendum, 2026-11-28: TJR setups on 5-minute bars, and the recency check

Written **before any of these tests were run** and committed on its own first. It follows the
research report in `reports/MNQ day trading evidence review.md`, which the trader approved on
2026-11-28. Nothing below may be changed after results are seen; a badly specified rule is
recorded under "Changes after seeing results" in `research/RESULTS.md`, never edited here.

No promise is made that any of these setups wins. TJR never trades NQ or MNQ in his course, his
method is discretionary, and no verified record of his results exists. This is one fixed,
mechanical reading of what he teaches. The earlier "London TJR" test (October 2026, no edge)
stays in the count below.

## Data

- `data/history/mnq-5m-yahoo.json`: MNQ front-month 5-minute bars from Yahoo Finance,
  2026-09-18 to 2026-11-27 (13,503 bars, about 48 trading days). This is all the 5-minute
  history the free service keeps. A multi-year 1-minute source (Dukascopy) refused the download.
- Bad-tick rule, fixed here: a bar whose open is more than 2% away from the previous bar's close
  and whose close is back within 0.5% of that close is dropped. It removes one bar
  (2026-10-30 19:00 UTC, a 1,300-point print that vanished in the same bar). The large move on
  2026-11-23 13:55 UTC is kept: price stayed there.
- 15-minute, 1-hour, 4-hour and daily candles are built from these bars. A trading day runs
  18:00 to 17:00 New York time and counts only with at least 10 hours of bars.
- Because the sample is about 48 days, **no result from it can pass or fail a setup**. See Labels.

## Definitions (TJR Boot Camp, Day 6, applied the same way on every timeframe)

- Up candle: close above open. Down candle: close below open.
- Swing high: an up candle immediately followed by a down candle. Level = the higher high of the
  two. Swing low: a down candle immediately followed by an up candle; level = the lower low.
- "Most recent swing high / low" at a candle = the last one completed by the candle before it.
- Structure direction: becomes **up** when a candle closes above the most recent swing high and
  **down** when a candle closes below the most recent swing low. Otherwise it stays as it was.
- Daily bias = the structure direction of the daily candles finished before the window opens.
  It needs at least 5 finished daily candles and a known direction; otherwise no trade.

## Marked levels

Session blocks on the New York clock: Asia 18:00 to the London open (08:00 London); London from
its open to 09:30; New York morning 09:30 to 12:00; New York afternoon 12:00 to 17:00.
At a window's open the marked levels are the high and the low of each of the **four most
recently finished blocks** (a block needs at least 6 bars). A high is **live** if no bar between
the end of its block and the window open traded above it; a low likewise.

## Windows

| Window | Opens | Last entry | Flat |
|---|---|---|---|
| NY open | 09:30 New York | 11:00 (his "first hour and a half") | 16:00 New York |
| NY midday | 12:00 New York | 15:00 | 16:00 New York |
| Asia evening | 18:00 New York (4 PM Denver) | 23:00 New York (9 PM Denver) | 24:00 New York (10 PM Denver) |
| London | 08:00 London | 11:00 London | 12:00 London |

Only the NY open is a session he trades for indices. The other three are outside what he
teaches and are labelled so on The Desk.

## Setup T1: TJR sweep + break (his entry model 1)

1. Sweep: the first 5-minute bar at or after the window open that trades beyond a live marked
   level (above a high, below a low). The sweep stays active for 12 bars after the latest
   swept level. Extreme = the highest high (lowest low) from the first sweep bar onward.
2. Break: while a high sweep is active, a 5-minute bar (the sweep bar or a later one) closes
   below the most recent 5-minute swing low. For a low sweep, the mirror.
3. Bias: a break down is taken only when the daily bias is down; a break up only when it is up.
4. Entry at the close of the break bar, at or before the window's last entry time.
5. Stop: 2 points beyond the extreme. Signals with a stop closer than 5 points are skipped.
6. Target: the nearest liquidity at least 1R from the entry. Candidates: 15-minute swing lows
   (highs for longs) formed in the previous 24 hours that price has not traded through since,
   and live marked levels. No candidate at least 1R away: the signal is skipped.
7. A skipped signal does not use up the day; the first signal that meets every rule is the trade.
   One trade per window per day.
8. Exit at the stop, the target or the flat time. Stop first when both are inside one bar.

## Setup T2: TJR sweep + break + pullback (his entry models 2 to 4)

Steps 1 to 3 as T1. Then, once the break bar has closed:

4. Two zones are marked. **Gap:** the latest three consecutive candles, finishing at or before
   the break bar and with the middle candle at or after the bar that made the extreme, where the
   first candle's low is above the third candle's high (mirror for longs). The zone is the space
   between them; the entry edge is the side nearest the price. **Order block:** the last up
   candle (down candle for longs) at or before the bar that made the extreme, looking back at
   most 6 bars; the zone is that candle's low to high; the entry edge is the side nearest price.
5. Equilibrium: an edge may be used only if it sits in the half of the move nearer the extreme,
   measured from the extreme to the lowest low (highest high) made since, up to the previous bar.
6. Entry is a resting order at the edge. It counts as filled when a later bar trades at least
   one tick (0.25) beyond the edge, at or before the last entry time. Fill price = the edge, or
   the bar's open if the bar opens beyond it. If both edges are reached in one bar the nearer is used.
7. Stop: 2 points beyond the extreme as it stood at the break. If price reaches the stop level
   before any fill, the setup is over and the search for a new sweep goes on.
8. Target, skip rules, one trade per window per day and exits as T1, with R measured from the
   resting entry. In the fill bar only the stop is checked (stop first); the target is checked
   from the next bar.

## Simulation rules for T1 and T2

- Signals on closed 5-minute bars only.
- Cost: **1.5 NQ points per trade** (about $1.30 to $1.90 of fees per micro plus a tick of
  slippage each way; higher than the 1 point used for the 15-minute setups because these stops
  are tighter).
- TJR's news rule (no trade on CPI, PPI, FOMC or payrolls days; wait 30 minutes after other
  major US releases) is **not** applied in the test: there is no checked list of past release
  dates in the data. The Desk shows it as a notice on the day.
- Control: 500 seeded runs. In each run every trade is replaced by an entry on a randomly chosen
  other trading day at the same New York clock time, in a random direction, with the same stop
  distance and target distance in points, the same flat time and the same cost. Reported: the
  mean and the 95th percentile of the average R. This is the check that the result is more than
  the time of day.
- Reported for each of the eight: trades, win %, average R, t-stat, worst drawdown, median stop
  in points, the share of signals that fit $100 and $250 on one micro, and the control.

## Labels for T1 and T2

- Fewer than 150 closed trades in the test: **Too early to judge**, whatever the numbers.
- From 150 trades: "Promising, not proven" if the average is above zero and above the control's
  95th percentile; "Benched" if the average is at or below zero; otherwise "No edge". "Passed"
  needs the original six-rule pass bar on at least two calendar years of data.

## Count of variants tried

Eight more (two entry models in four windows). The count shown on The Desk goes from 23 to **31**.
With 31 tries, a t-stat near 2 on one of them is what luck alone produces.

## Ranking on The Desk

When two setups are equally active, the one with the better tested average leads. From now on
that average is shrunk for small samples before comparing: average R x trades / (trades + 50).
A setup with 20 trades cannot outrank one with 380 on a lucky month.

## The recency check: do the last 4 weeks predict the next 4?

The trader's view is that recent weeks matter most. This check tests that on The Desk's own
history, with the rule for reading the answer fixed here first.

- Data: every trade of the 14 fifteen-minute setups over the whole history (2018-12 to 2026-10),
  from the same backtest code.
- Blocks: consecutive 28-day blocks starting Monday 2019-01-07. For each setup and block: trades,
  win rate, average R. A block counts for a setup with at least 5 trades.
- Test A, persistence: for each setup subtract its own average over all its blocks, then take
  the correlation between one block and the next, pooled over all setups. One-sided permutation
  p-value from 2,000 seeded shuffles of the block order within each setup.
- Test B, follow the leader: at each block boundary the leader is the setup with the highest win
  rate in the block just finished (ties: higher average R). Its average R in the next block is
  compared with the plain average of all counted setups in that next block. Reported: the mean
  difference and its t-stat across boundaries.
- Reading: recent results **carry over** only if Test A has a positive correlation with
  p below 0.05 **and** Test B has a t-stat of at least 2.0. Then The Desk keeps leading with the
  last-4-weeks win rate. Otherwise they **do not carry over**, The Desk says so beside the
  number, and it leads with a blended estimate:
  (wins in the last 4 weeks + 50 x long-run win rate) / (trades in the last 4 weeks + 50).
- Either way the last-4-weeks win rate stays on the page with its 95% range (Wilson interval).


# Addendum 2, 2026-11-28: which course topics earn a place on The Desk

Written the same day, **before any test in either addendum was run**. The trader's instruction:
do not add something because it is in the videos; evaluate it and build it only if it helps.
Each topic below gets a check on The Desk's own data and a rule, fixed here, for what happens
to it. A topic that cannot be checked is not built as a rule.

## Which TJR setups are shown on The Desk

The 48-day test cannot prove a setup. It can show one doing worse than chance. So:

- A T1 or T2 setup is **shown** in a window only if, in the test, its average R after costs is
  above zero **and** above the mean of its control (random entries at the same clock times).
- Otherwise it is **on trial**: listed in the Playbook, tracked in the replay log so a forward
  record builds without money, and not suggested on The Desk.
- Every one of the eight is labelled "Too early to judge" either way, and is re-read at 150 trades.

## Check C1: does trading with the daily bias help?

- Data: every closed trade of the 14 fifteen-minute setups over the whole history.
- For each trade, at its signal time: the daily bias (as defined in the first addendum, from
  daily candles of the same contract; a trading day needs at least 40 fifteen-minute bars), and
  the 4-hour and 1-hour structure direction (4-hour candles start at 18:00 New York).
  Trades with no known daily bias are left out.
- Measures: (a) average R of trades with the daily bias minus trades against it; (b) average R
  of trades where daily, 4-hour and 1-hour all agree with the trade minus all other trades.
  Welch t-stat for each, pooled over the 14 setups. A per-setup table is reported for context.
- Reading: a measure **helps** if the pooled difference is above zero with a t-stat of at least
  2.0 over the whole history **and** is above zero in the judge period (2024 on). If (a) helps,
  the daily bias is shown on every suggestion as "with" or "against". If (b) helps, timeframe
  agreement is shown too. If neither helps, bias is not shown on suggestions for the existing
  setups (it stays inside T1 and T2, where it is part of his rules).

## Check C2: is the trade after a losing trade worse?

- Data: the same trades, ordered by time. A trading day turns over at 18:00 New York.
- Measure: average R of trades that start after an earlier trade that day closed at a loss,
  minus the average R of all other trades. Welch t-stat.
- Reading: if the difference is below zero with a t-stat of -2.0 or lower, "stop after a loss"
  is supported as a rule about the setups and a "one trade a day" switch is added. If not, the
  existing "one loss and done" stays only as protection for a small cushion (which the risk
  maths supports) and no new switch is added. This check is about the setups; the published
  finding that people take worse trades after losses is about the trader, and is not tested here.

## Topics with no check available

- News days (CPI, PPI, FOMC, payrolls): no checked list of past release dates, so no new rule.
  The Desk's existing notice of scheduled releases stays as it is.
- Mindset lessons (discipline, goals, fear, confidence), the written trading plan, the weekly
  preview and the journal prompts: nothing on The Desk's data can test them. They are not built
  unless they are needed by something that passed a check.
- Risk size: already settled by the breach simulation in the report (not a backtest); built.
