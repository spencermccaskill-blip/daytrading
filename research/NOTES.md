
## Carried over from October 2026 (not re-run here)

| Setup | Window | Verdict | What the earlier test found |
|---|---|---|---|
| London sweep + reclaim | london | **Benched** | 2024 on: 447 trades, 37.1% wins, -0.089R, t -1.56. 2019-2023: -0.060R. Last 12 months: -0.164R. Negative in every exit version tried. |
| London breakout | london | **No edge** | No positive result after costs. |
| London TJR | london | **No edge** | Influencer setup, no audited record; tested, no edge. |
| London TJR + 20-day trend | london | **No edge** | Only 2025 was good. The trend filter was added after seeing results (post-hoc). |
| 1:00 AM range breakout | london | **Benched** | Losing. |

## How to read this

- **Nothing passed all six rules.** Since 2026-11-20, at Spencer's instruction, The Desk shows the
  setups anyway: the most active one in each window, with a score. The pass rules did not change.
- **Score out of 10 = win rate.** It is the share of a setup's tested trades since 2024 that ended
  in profit. It says nothing about how big the wins and losses were. N3 (initial balance breakout)
  wins 60% of the time and still loses money on average, because its losses are bigger than its wins.
  Read the average R beside the score.
- **The seven popular setups added on 2026-11-20 mostly lost money in this test.** Only the 15-minute
  Silver Bullet form was positive in both periods, and barely (+0.014R, t 0.31). All three London
  setups were negative since 2024. These are 15-minute simplifications of setups usually traded on
  1- to 5-minute charts with discretion, so this does not prove the originals fail; it shows these
  mechanical versions had no edge here.
- N1 reproduces the October numbers on the judge period exactly (383 trades, +0.111R, t 2.31,
  10.9R drawdown). The 2019-2023 count differs slightly (705 here, 713 then) because the two
  programs stitch a few roll-week days differently; the conclusion is the same.
- N2 (opening range breakout) has the highest average but is not close to tradeable on this
  account: it wins rarely and big (10R target), so its losing runs are several times deeper
  than the $2,000 limit allows.
- About 23 variants have now been tried on this data. A few showing a small positive average is
  what luck alone would produce.
- Coverage is about 85% of weekdays (roll weeks are missing) and the data ends 2026-10-21.
- N2, M1 and M3 are 15-minute forms of studies done on 1- or 5-minute bars, and M1/M3 only use
  the midday part of an all-day rule. A miss here does not test the original papers.
- The earlier note that "N1 trades that fit $250 returned +0.18R" was a cut made after seeing
  results. It is not used anywhere.

## Small differences between the written rules and the code

An independent review compared `PREREGISTRATION.md` to the code line by line after the run. It found
no look-ahead and nothing that flatters a result, and these small differences. They were **not**
changed after seeing results; they are listed so the record is complete.

- A2 only trades if the day has at least 20 regular-hours bars (skips half-days). Not written in the rules.
- M1's 14-day average uses the last 14 days that have a 9:30 bar and skips any of those missing the bar
  at that time of day, instead of reaching further back.
- Lookbacks stop at 35 calendar days back.
- After a signal is skipped for a stop under 5 points, N1 and A2 keep looking that day; N2 and A1 stop.
- The random-direction benchmark uses the stop, target and time exit but not the "leave on a close
  through VWAP / the band" rule of M1 and M3. The benchmark is context only, not a pass rule.
- On a 5-minute chart the live desk sees which came first inside a 15-minute bar, stop or target. The
  backtest only has 15-minute bars and always assumes the stop. So a live result can occasionally be
  better than the backtest would have scored it, never worse.

## Changes after seeing results

No rule or parameter of any setup was changed after its first run.

One change to how results are used: on 2026-11-20, after seeing that nothing passed, Spencer chose to
show setups on The Desk regardless of the pass rules, each with its tested win rate as a score. That
is a decision made after seeing results and is recorded here as one. The carried-over London table
above is superseded for sweep + reclaim and breakout by L1 and L2, which are now tested here.
