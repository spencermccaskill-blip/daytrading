# Lucid Trading $50K rules the guard is built from

Read from support.lucidtrading.com on 2026-11-19 (all 60 help-center articles). lucidtrading.com itself
could not be read (it blocks automated readers), so nothing here is cross-checked against the checkout pages.
Article links are `https://support.lucidtrading.com/en/articles/<name>`. Every number is editable in Settings.
**Check your own account page in Lucid before trusting any of it.**

## Funded accounts

| | LucidFlex | LucidPro | LucidDirect | LucidDaily |
|---|---|---|---|---|
| Max loss limit | $2,000, end-of-day trailing | same | same | $2,000, **intraday** trailing by default |
| Limit locks at | $50,100 once the balance exceeds $52,100, **or as soon as a payout is requested** | $50,100 past $52,100 | same | same |
| Daily loss limit | Optional, chosen at purchase. **Amount for Flex not published** | $1,200 to start; 60% of best end-of-day profit once a day closes above $52,100. Optional | $1,200, same scaling, not optional | $1,200 fixed. Optional |
| Hitting the daily limit | Locked until the next session (not a breach) | same | same | same |
| Max size | **Scaling plan**: 20 micros under $1,000 profit, 30 from $1,000, 40 from $2,000. Updates at end of session | 40 micros | 40 micros | 40 micros |
| Consistency | None when funded | Biggest day at most 40% of the payout-cycle profit (35% on accounts bought before 2025-11-28) | 20% | None |
| News | Allowed | Allowed | Allowed | **High-impact US news is a hard breach** |

Sources: `12945815-lucidflex-drawdown`, `12945795-lucidflex-funded-account`, `16226050-lucidflex-customization`,
`12945808-lucidflex-scaling-plan`, `12890136-lucidpro-drawdown`, `12890122-lucidpro-daily-loss-limit`,
`12890109-lucidpro-consistency-percentage`, `12890192-luciddirect-drawdown`, `12890164-luciddirect-payout-objectives`,
`15998425-luciddaily-drawdown`, `15997244-luciddaily-funded-account`.

## Session times (Flex, Pro, Direct)

- All positions must be closed by 4:45 PM Eastern (2:45 PM Denver); Lucid closes anything left open. Not a breach.
- Trading resumes 6:00 PM Eastern (4:00 PM Denver), Sunday to Thursday.
- Source: `11404729-allowed-trading-times`.

## Where what you told me differed from Lucid's site

- "Max 4 minis / 40 micros": true for Pro, Direct, Daily. **Funded Flex starts at 20 micros** under its scaling plan.
- "Daily loss limit $1,200 where the plan has one": confirmed for Pro, Direct, Daily. On Flex it is optional and the amount is not stated.
  The guard ships with it **off** for Flex. Turn it on in Settings if your account has one.
- "Locks at $50,100": confirmed, and it also locks the moment you request a payout (tick the box in Settings).

## Not found on Lucid's site

- The exact clock time of the end-of-day balance snapshot. The guard turns the trading day over at 4:00 PM Denver (the 6 PM Eastern reopen).
- Whether the daily loss limit counts open-trade losses.
- Whether the lock needs a close above $52,100 or any touch (the text says "exceeds"; the guard uses the closing balance).

## What the guard cannot know

It only sees closed trades you type into the Journal. It cannot see an open position, fees you did not
enter, or a payout. Tradovate and the Lucid dashboard are the real record.
