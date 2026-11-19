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
