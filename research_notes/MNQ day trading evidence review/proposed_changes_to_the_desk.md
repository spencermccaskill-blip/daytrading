# Proposed changes to The Desk (awaiting the trader's approval; nothing is built yet)

Written by the research coordinator, who also built The Desk and knows its code. This is a proposal, not a finding. The report should carry it as its final section, in plain words, and keep every item and every stated limit. It rests on the other notes in this folder and on The Desk's own test results in `/home/user/daytrading/research/RESULTS.md`.

## Facts about The Desk and the account that the proposal depends on

- Account: Lucid $50K Flex. Balance $50,046, minimum balance $49,363, so the cushion is $683. Personal rules today: $250 risk per trade; with under $1,000 of room the guard already switches to one loss and done for the day.
- One MNQ micro is $2 per point. It is the smallest size. A 50-point stop on one micro risks $100; a 125-point stop risks $250.
- The Desk has 14 setups across four windows (Asia evening, London, New York open, New York midday). Each is a fixed rule set, tested on 15-minute NQ bars from December 2018 to October 2026 with a 1-point cost, and judged on 2024 onward. None passed all six pre-registered rules. 23 variants have been tried in total.
- The best long-run setup is "NY sweep + shift": 383 trades since 2024, 51.4% wins, +0.111R average, t-stat 2.31. It is the 15-minute form of the same idea TJR teaches as entry model 1 (liquidity sweep, then a close through structure). Its median stop is 107 NQ points, so only 60% of its signals fit $250 risk on one micro, and almost none would fit $100.
- The Desk currently leads with each setup's win rate over the last 4 weeks (the trader asked for this on 25 November because he judges recent results more relevant), and shows the long-run number smaller.
- Over the last 4 weeks to 25 November: Evening range breakout 63% of 19 trades, +0.43R (the trader's current focus); NY sweep + shift 27% of 11, -0.25R; Opening range breakout 25% of 20, -0.43R. Long run, Evening range breakout is break-even: 46.0% of 570, +0.001R.
- Price data: The Desk fetches MNQ 5-minute bars from Yahoo, about 10 minutes delayed. Yahoo keeps about 60 days of 5-minute history and about 7 days of 1-minute. The long history file is 15-minute bars only. A TradingView bridge (optional browser extension) can feed live chart bars instead.
- The Desk never places orders. Every trade is placed by hand on Tradovate. Signals are information, not instructions.
- First-hand check: the coordinator read TJR's Days 29, 30, 32, 33, 34, 35, 36, 37 and 38 in full, separately from the note-takers. The rules in the notes for those days match that reading. Day 48 part 1 and Day 49 were not in the transcript set and were not studied.

## Part 1. Risk first: size for a $683 cushion

Why first: per the risk notes, $250 is 37% of the cushion and three losses in a row end the account. With a small real edge (+0.1R), the chance of breaching before the cushion is back to $2,000 falls from about 51% at $250 risk to about 33% at $100 and 23% at $68. With no edge it is about 66% at any size, so sizing helps only if the setups have an edge; it cannot create one.

Proposal (the trader decides; these are his rules):

1. Add a "small cushion" risk rule to the guard: while room to the limit is under $1,500, trade one micro only and cap risk per trade at $100 (a stop of 50 points or less). Above $1,500 of room, return to $250. Both numbers editable in Settings.
2. Keep "one loss and done for the day" while the cushion is thin.
3. Show "losses until the limit" on the account guard (today: 2 full losses at $250 leave $183; 6 at $100).
4. Trades whose stop is wider than the cap stay visible, marked as too wide, with what one micro would cost. They are not hidden. The trader has said he does not want every trade blocked, so the report must say plainly what this rule does to the existing setups: most signals from the wide-stop setups (median 107 points on NY sweep + shift) would be marked too wide. The 5-minute TJR setups in Part 2 have much tighter stops (the stop sits just beyond the sweep), which is the main practical reason to build them now.
5. Add commission to every estimate: about $1.30 to $1.90 per micro per round trip, plus slippage. On a 25-point stop that is about 0.06R per trade, so tight-stop setups must clear a higher bar.

## Part 2. TJR's model, built the way he teaches it, as new setups

What gets built (rules fixed and written into the pre-registration before any test is run):

1. Daily bias, shown on the Desk in every window: direction of the most recent daily close beyond the prior daily swing high or low. Beside it, the 4-hour and 1-hour structure direction, with his reading ("4-hour against the daily = a pullback on the daily"). Context only; it does not block trades.
2. Liquidity levels marked on the chart and in the levels list: prior day high and low, Asia session high and low, London session high and low, and the most recent 15-minute swing high and low, each marked "swept" once price has traded through it.
3. Setup "TJR sweep + break" (his entry model 1), on 5-minute bars:
   - Window: first 90 minutes after the 9:30 AM Eastern open (7:30 to 9:00 AM Denver). This is the only session he trades for indices.
   - Direction: with the daily bias only.
   - Trigger: a marked level is swept (price trades beyond it), then a 5-minute candle closes beyond the most recent opposing 5-minute swing point. Enter at that close.
   - Stop: beyond the extreme of the sweep, plus a 2-point buffer (he says a small buffer for spread).
   - Target: the first 15-minute swing high or low in the trade direction that is at least 1R away (his "one timeframe up, at least one to one"). Rule exit at the end of the New York open window if neither is hit.
   - One trade a day.
4. Setup "TJR sweep + break + pullback" (his entry models 2 to 4): same day rules, but the entry is a resting price: the pullback into the fair value gap or order block left by the break, only if that zone is in the favourable half of the move (his "equilibrium"). Same stop. If price never pulls back, no trade.
5. His news rules, applied to these two setups: no trade on CPI, PPI, FOMC or payrolls days; after any other high-impact US release, no entry for 30 minutes; no trade on US bank holidays; half-size note the day before a holiday. The Desk already has the calendar and holiday table.
6. The same two rule sets are also run in the other three windows (Asia evening, London, New York midday) and shown with a plain label that this is outside what he teaches (he calls Asia a poor session and does not trade indices in London). The trader mostly trades the Asia evening, so he should see what the model does there, good or bad.
7. Where TJR leaves a rule to the eye (which swing counts, how far back to look, what a "reaction" is, where an order block starts), one mechanical definition is chosen in advance, written down, and never tuned after seeing results. Every definition tried is counted in the "variants tried" number shown on the Desk (23 today).

Limits the report must state:

- TJR never trades or mentions NQ or MNQ in the course. His examples are an S&P 500 CFD, two pound currency pairs and gold. He enters indices on 5-minute and 1-minute charts.
- The Desk's free prices are 5-minute bars about 10 minutes late. So "enter at the close of the break candle" arrives late on the Desk. The pullback setup suffers less from the delay, because its entry price, stop and target are known in advance and the trader places a resting order on Tradovate. For anything closer to real time, the TradingView bridge or a paid CME data subscription (about $4 to $12 a month per the market-structure notes) is needed. No 1-minute trigger can be built on the free feed.
- A coded version is a mechanisation of a discretionary method. His own recorded trades skip steps he calls required (daily bias, the third confirmation), so no code reproduces "TJR"; it tests one fixed reading of him.
- The independent tests found so far (retail-published, not peer-reviewed) report little or no edge for mechanical versions of these patterns, with the liquidity sweep the only rule reported to help, and fair value gaps and order blocks no better than placebo levels. The Desk's own best long-run setup is a sweep setup, which is consistent with that. The expectation to set is modest.

## Part 3. Testing the new setups honestly

1. Pre-register first: rules, costs (1 point plus commission), pass rules and the judge period, before running anything.
2. Data: 5-minute history is needed. Yahoo gives about 60 days, enough for roughly 40 to 60 trades per setup, which the validation notes show is too few to separate 50% from 60% (that needs about 150 to 190 trades). The coordinator will try to obtain multi-year 1-minute data for the Nasdaq-100 from Dukascopy (an index CFD, so a close proxy, not the future itself), label it as a proxy, and report if it cannot be obtained.
3. Add a matched control: random entries at the same clock times with the same stop and target distances, so the high volatility of the New York open is not mistaken for an edge.
4. Report every setup with trades, win rate, average R, t-stat, drawdown and the number of variants tried, in the same table as the existing 14. If the TJR setups fail, the Desk says so.

## Part 4. Recent results versus long-run results on the Desk

The trader's view is that the last few weeks matter most in futures. The validation notes say a 19-trade window has a margin of about plus or minus 22 points and that the best of 14 no-edge setups would show about 74% over 4 weeks by luck. The proposal keeps his layout and tests his view on data instead of arguing it:

1. Keep "last 4 weeks" as the leading number, and print its honest range beside it (for example "63% of 19 trades; likely range 41% to 81%").
2. Run one pre-registered check on The Desk's own 2019 to 2026 history: does a setup's result over the previous 4 weeks predict its result over the next 4 weeks? Report the answer on the Playbook. If recent results do carry over, the Desk ranks setups by them with confidence. If they do not, the Desk says so next to the number and leads with a blend of recent and long-run results. Either way the trader sees the evidence.

## Part 5. Process items from the course (small, optional)

1. Journal: add "followed the plan? yes or no", the confluences present (filled in automatically for trades taken with the + button) and a one-line note on state of mind; a weekly review view. TJR's Day 46 journal fields.
2. A "one trade a day" switch in Settings (TJR's rule; it matches the thin-cushion rule already in the guard).
3. The pre-session checklist in the Journal tab updated to his order: calendar and holiday, weekly direction, daily bias, 4-hour and 1-hour, marked levels, then wait for the window.

## What would not be built, and why

- Fair value gaps or order blocks as signals by themselves: the only controlled test found shows no difference from placebo levels, and TJR himself says a touch of either is never an entry.
- More clock-window variants of the Silver Bullet: two independent long tests found the windows are not special, and The Desk's own 15-minute form is flat (+0.014R).
- Double size on "confident" days (TJR does this himself and tells viewers not to).
- Copying anyone's calls: no verified track record was found for TJR or ICT, and the verified traders studied do not publish live intraday Nasdaq trades.
- Anything that places orders.

## Decisions needed from the trader before building

1. Risk cap while the cushion is small: $100 on one micro (proposed), a different number, or keep $250.
2. Build the TJR setups for the New York open only, or also show them in the Asia evening, London and midday windows (proposed: all four, labelled).
3. Whether to run the "do recent results carry over" check and let its answer decide which number leads.
4. Whether to include the Part 5 process items.
