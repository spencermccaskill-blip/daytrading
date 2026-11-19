# NQ 15-minute history

`nq-15m-contracts.json` — 183,607 bars across 32 quarterly NQ contracts (NQH2019 … NQZ2026),
2018-12-02 to 2026-10-21, exported from TradingView.

Shape: `{ meta, contracts: { "NQH2019": [[timeSec_utc, open, high, low, close, volume], ...], ... } }`

## Stitching into one series (how the original backtest did it)
- Contract expiry = 3rd Friday of Mar (H) / Jun (M) / Sep (U) / Dec (Z). Roll date = expiry minus ~7 days.
- For each trading date, use the contract whose roll date comes next.
- Take the prior day's levels from the SAME contract, to avoid roll gaps.
- Expect ~85% weekday coverage: a couple of weeks are missing around each roll. Say so in any results.

## Limits
- Ends 2026-10-21. Later bars need a fresh pull from TradingView.
- Times are UTC seconds at bar open. 9:30 ET is 13:30 UTC in summer and 14:30 UTC in winter.
