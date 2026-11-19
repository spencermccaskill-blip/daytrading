
## Carried over from October 2026 (not re-run here)

| Setup | Window | Verdict | What the earlier test found |
|---|---|---|---|
| London sweep + reclaim | london | **Benched** | 2024 on: 447 trades, 37.1% wins, -0.089R, t -1.56. 2019-2023: -0.060R. Last 12 months: -0.164R. Negative in every exit version tried. |
| London breakout | london | **No edge** | No positive result after costs. |
| London TJR | london | **No edge** | Influencer setup, no audited record; tested, no edge. |
| London TJR + 20-day trend | london | **No edge** | Only 2025 was good. The trend filter was added after seeing results (post-hoc). |
| 1:00 AM range breakout | london | **Benched** | Losing. |

## How to read this

- **Nothing passed.** No setup met all six rules, so The Desk shows "stand down" in every window.
- N1 reproduces the October numbers on the judge period exactly (383 trades, +0.111R, t 2.31,
  10.9R drawdown). The 2019-2023 count differs slightly (705 here, 713 then) because the two
  programs stitch a few roll-week days differently; the conclusion is the same.
- N2 (opening range breakout) has the highest average but is not close to tradeable on this
  account: it wins rarely and big (10R target), so its losing runs are several times deeper
  than the $2,000 limit allows.
- About 16 variants have now been tried on this data. One of them showing a t-stat near 2 is
  what luck alone would produce.
- Coverage is about 85% of weekdays (roll weeks are missing) and the data ends 2026-10-21.
- N2, M1 and M3 are 15-minute forms of studies done on 1- or 5-minute bars, and M1/M3 only use
  the midday part of an all-day rule. A miss here does not test the original papers.
- The earlier note that "N1 trades that fit $250 returned +0.18R" was a cut made after seeing
  results. It is not used anywhere.

## Changes after seeing results

None. No rule or parameter in `PREREGISTRATION.md` was changed after the first run.
