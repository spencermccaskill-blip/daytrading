# Shrink the risk, then test TJR

The most important finding is about trade size, not about setups. With $683 between your balance and the level where Lucid closes the account, one $250 loss is 37% of everything you have left and three in a row end it; by the research's own simulation, even a small real edge leaves about a **51% chance of losing the account** before the cushion is rebuilt at $250 risk, against about 33% at $100 and 23% at $68, and with no edge it is about 66% at any size. TJR's free Boot Camp (55 lessons, about 18.5 hours, about a third of them mindset talks or check-ins) teaches one trade: take direction from the daily chart, wait for the New York open, let price run through a marked high or low, wait for a candle to close back through the last opposing swing point, enter there or on the pullback, put the stop beyond the run, aim first for at least one-to-one, take one trade a day and skip big news days. The frame of that trade (direction, session, the closing break, the stop, the first target, one trade a day) is exact enough for a program to follow; the parts that pick the level and the entry zone he decides by eye, he gives four different entry triggers and conflicting rules on risk, news and trades per day, his own recorded trades skip steps he calls required, and the course never mentions NQ or MNQ. Outside the course, no popular intraday rule has clean after-cost evidence on Nasdaq micro futures: opening-range and VWAP strategies earn before costs and about nothing after, the "sweep" is the only piece of this family with any outside support, and fair value gaps and order blocks did no better than random levels in the one controlled test found. The Desk's own best setup is a sweep setup (+0.111R over 383 trades), and after 23 variants tried that result is about what luck alone produces, so it is promising and not proven. A 4-week record of 19 trades is accurate only to about plus or minus 22 points, so recent results cannot yet tell your setups apart; the proposal keeps your recent-first layout and tests your view on The Desk's own history. Nothing is built yet: the last section lists every proposed change, its limits, and the four decisions that are yours.

A few words are used throughout. **MNQ** is the Micro E-mini Nasdaq-100 future: $2 for every index point, smallest size one contract (one "micro"). **R** is the amount risked on a trade, so "+0.1R average" means each trade makes, on average over many trades, one tenth of what it risks. The **cushion** is your balance minus Lucid's minimum balance, the level at which Lucid closes a funded account (the firm's account that you trade under its loss rules). A **drawdown** is the deepest fall from a high point during a losing run. A **t-stat** is a score for how hard a result is to explain by luck; about 2 looks interesting for a single test, and the bar rises to about 3 when many setups have been tried. Nothing in this report is proven to make money, and nothing here promises profit.

## Three losses at $250 end the account, so size comes first

Your account is a Lucid $50K Flex with a balance of $50,046 and a minimum balance of $49,363, which leaves **$683 of room**. Lucid describes the minimum balance as trailing the account's highest end-of-day balance ([Lucid help center](https://intercom.help/lucid-trading/en/articles/11404720-max-loss-limit-eod-drawdown)). At $250 per trade the cushion is 2.7 losing trades. Two losses leave $183. At a 45% win rate, three losses in a row happen about one time in six.

The research notes ran a simulation of this exact account. It is the researchers' own calculation, not a published figure, and it assumes each trade is independent and every stop fills at its price, so real odds are somewhat worse. The table shows the chance of hitting the minimum balance before the cushion is back to its full $2,000, for a setup that wins 45% of the time.

| True edge per trade | $250 risk | $150 | $100 | $68 | $50 | $34 |
|---|---|---|---|---|---|---|
| Loses 0.1R | 84% | 89% | 95% | 98% | 100% | 100% |
| No edge | 65% | 65% | 66% | 66% | 66% | 66% |
| +0.05R | 56% | 54% | 47% | 39% | 32% | 20% |
| +0.1R | 51% | 43% | 33% | 23% | 14% | 6% |
| +0.2R | 40% | 29% | 17% | 8% | 4% | 1% |

Three things follow. First, **smaller size helps only if the setups have a real edge**. With no edge the account fails about two times in three at any size, and with a negative edge smaller size only makes the end slower. Size controls how bumpy the ride is; the edge decides where it ends. Second, at your current $250 even the best edge The Desk has measured leaves the account close to a coin flip. Third, smaller size costs time: at +0.1R, rebuilding the cushion takes about 53 trades at $250, 132 at $100 and 194 at $68.

Standard money-management formulas point the same way. The Kelly formula, a long-established rule for the bet size that grows money fastest, gives between $17 and $137 per trade on a $683 cushion for the edges tested, and the people who wrote it up advise betting half of that or less because the edge is never known exactly ([Thorp](https://gwern.net/doc/statistics/decision/2006-thorp.pdf); [MacLean, Thorp and Ziemba](https://www.stat.berkeley.edu/~aldous/157/Papers/Good_Bad_Kelly.pdf); [Carver, via CXO Advisory](https://www.cxoadvisory.com/big-ideas/a-few-notes-on-systematic-trading)). Rules of thumb published for funded accounts, which come from firms and trader forums with a commercial interest and not from independent studies, cluster at **5% to 12% of the remaining room per trade** ([Apex](https://apextraderfunding.com/resources/prop-trading/effective-risk-management-strategies-for-prop-firm-funded-accounts/); [NexusFi](https://nexusfi.com/a/prop-firms/funded-account-position-sizing)). On $683 that is about $34 to $82. The proposal in the last section suggests $100, which sits above that band, and the number is your first decision. Your $250 was 12.5% of a full $2,000 cushion and is 37% of today's. TJR's own rule of 1% to 3% of the account does not carry over to a funded account: 1% of $50,046 is $500, which is 73% of your real room.

One micro is the smallest size, and that sets a floor. One micro risks $50 with a 25-point stop, $100 with a 50-point stop, $200 at 100 points and $300 at 150. A $68 risk is possible only with a stop of 34 points or less. This matters because The Desk's best long-run setup, NY sweep + shift, has a median stop of 107 points: only 60% of its signals fit $250 on one micro and almost none would fit $100. Its worst drawdown in the test was $1,778 at $250 risk, which a full $2,000 cushion survives and a $683 cushion does not.

Costs bite hardest on tight stops. Fees at firms that route through Tradovate run about **$1.30 to $1.90 per micro for a round trip** (in and out), and one tick of slippage (the gap between the price you wanted and the price you got) on each side adds $1.00 ([Tradeify](https://intercom.help/tradeify/en/articles/10468315-trading-commission-fees); [Top One Futures](https://intercom.help/top-one-futures/en/articles/12829687-top-one-futures-commissions-and-fees-on-tradovate-accounts)). That is about 0.05R to 0.06R on a 25-point stop and under 0.01R on a 150-point stop. Lucid's own fee schedule was not found, so check your statement.

"One loss and done for the day" has indirect support only. A study of futures floor traders found that those with morning losses took more risk in the afternoon and traded at worse prices ([Coval and Shumway](https://econpapers.repec.org/RePEc:bla:jfinan:v:60:y:2005:i:1:p:1-34)), which makes a stop-after-a-loss rule sensible. No study was found showing that a daily stop or a one-trade rule improves results by itself; in the maths it slows things down and leaves the edge per trade unchanged. Cutting size as the cushion shrinks is different: it lowers the chance of failure whenever the edge is positive.

The background odds are sobering and worth knowing. Of 1,551 Brazilians who day traded index futures for more than 300 days, **97% lost money** ([Chague, De-Losso and Giovannetti](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101)). In Taiwan, fewer than 1% of day traders earned reliable profits after fees ([Barber, Lee, Liu and Odean](https://ideas.repec.org/a/eee/finmar/v18y2014icp1-24.html)). A US regulator's staff study found the median retail futures trader loses a small amount, and that retail traders often hold micro index contracts such as the Micro Nasdaq-100 ([CFTC staff paper](https://www.cftc.gov/sites/default/files/2024-11/Retail_Traders_Futures_V2_new_ada.pdf)). Topstep, the futures firm with the best published figures, says by its own count that a third of its funded traders received any payout in 2025 ([Topstep](https://www.topstep.com/topstep-dashboard)). No such figures were found for Lucid.

Two limits apply to this section. Lucid's own rule pages could not be opened; third-party descriptions of Lucid's 50K accounts say the minimum balance stops trailing and locks at $50,100 once an end-of-day balance of $52,100 is reached, and one site contradicts the end-of-day description, so confirm the lock level, the daily loss limit and the payout consistency rule in your Lucid dashboard. And no independent, peer-reviewed study of the best risk size under a trailing limit was found.

## TJR's 55 lessons reduce to one trade: sweep, break, pullback

The course notes come from full caption transcripts of 55 lessons. References such as "Day 38, 0:01:00" give the lesson and the caption time, accurate to about 30 seconds. Day 48 part 1 and Day 49 were not in the transcript set and were not studied. The captions for Days 21, 29, 33, 35, 36, 41, 53 and Boot Camp 2.0 read as if they had been machine-translated, so exact wording in those lessons is less certain. Nothing in the course is checked against a chart here; this section reports what he says.

His examples are an S&P 500 contract with an offshore broker, the currency pairs GBP/USD and GBP/JPY, and gold. **He never trades or mentions NQ or MNQ in the course.** Nasdaq appears once, as one of the markets a viewer could pick (Day 29, 0:13:24). He says himself that the bare strategy "will not make you profitable" on its own (Day 32, 0:03:38) and that viewers "definitely won't be profitable" after the two months (Day 9, 0:04:35).

### Lesson by lesson: two-thirds trading, one-third mindset

| Day | Title | What it teaches |
|---|---|---|
| 1 | Take Action | Motivation and his life story. No trading rule. Mentions his early "London fake-out" trade. |
| 2 | Candlesticks | How to read one candle. Candle shapes are never a reason to trade. Decide only on candles that have closed. |
| 3 | Discipline | Pick one uncomfortable habit and do it daily. No trading rule. |
| 4 | Trends | Uptrend is higher highs and higher lows. Higher timeframes outrank lower ones. Trade only in the higher timeframe's direction. |
| 5 | Goal Setting | Three long-term goals, ten steps each, read aloud daily. The notebook becomes the journal. |
| 6 | Break of Structure | A high or low is a two-candle turn. A break of structure is a candle **closing** beyond the most recent high or low. A wick through it does not count. |
| 7 | Individuality | Do not copy him; drop any tool that does not click. |
| 8 | Liquidity 1 | "Liquidity" is resting orders. Big players need them to fill their own. First statement of "sweep, then confirmation". |
| 9 | Check In | No trading content. |
| 10 | Liquidity 2 | Orders rest above highs and below lows. Spotting sweeps on charts. |
| 11 | How to Take a Loss | Losses are part of a percentages game. Study them. Practise on demo first. |
| 12 | Liquidity 3 | Mark "prominent" highs and lows. A sweep needs a break of structure after it. Liquidity is both the trigger area and the target. |
| 13 | Risk Management | Risk 1% to 3%, stated per trade and then per day. Cap the number of trades. |
| 14 | Fair Value Gaps 1 | What a fair value gap is. He uses it for pullbacks, not as a first entry. |
| 15 | Identifying Problems | A root-cause exercise for non-strategy problems. |
| 16 | Fair Value Gaps 2 | The exact three-candle definition. Price touching a gap is not an entry. |
| 17 | Patience | Spoken checklist: sweep, break of structure, gap entered, reaction, enter. When not to trade. |
| 18 | Fair Value Gaps 3 | Gaps combined with trend, sweep and break. No trades before the open. |
| 19 | How to Read News | Never trade on the days of CPI and PPI (US inflation reports), FOMC (the Federal Reserve's rate decision) or payrolls (the monthly US jobs report). Wait 15 to 30 minutes after other major releases. |
| 20 | Order Blocks 1 | An order block is the move that caused the sweep. His first choice for a pullback entry. |
| 21 | How to Take a Win | Treat a win like a loss. One trade, then stop. 1% risk. Trading content ends after about 21 minutes of 61. |
| 22 | Order Blocks 2 | Spotting order blocks. Match the stop and target to the order block's timeframe. |
| 23 | Check In | Almost no trading content. |
| 24 | Order Blocks 3 | How he draws the box, given two ways. |
| 25 | Over Confidence | The first trade at the open is the good one. One trade a day, two at most. No trading when the Fed chair speaks. |
| 26 | Equilibrium 1 | Equilibrium is the 50% level of a swing. A gauge of whether the pullback is deep enough, not an entry. |
| 27 | Fear | Staged path: demo until profitable for three months, then a $100 live account, then a funded account. One trade a day at 1%. |
| 28 | Equilibrium 2 | Drawing the 0 / 0.5 / 1 box and combining it with gaps, order blocks and a break of structure. |
| 29 | Trading Plan | A written plan: risk, when, what, how. One trade a day, one instrument, entries only in the first hour and a half of the New York open. |
| 30 | Execution 1 | Five building blocks and four ways to combine them into an entry. |
| 31 | Hard Work | Motivation. No trading rule. |
| 32 | Execution 2 | Chart drills for entry 1 (sweep plus break) and entry 2 (pullback into the order block). |
| 33 | Execution 3 | Chart drills for entry 3 (pullback into the gap) and entry 4 (with equilibrium added). |
| 34 | Daily Bias 1 | Weekly for background, daily structure for the bias, 4-hour and 1-hour to confirm, 15- and 5-minute to enter. |
| 35 | Daily Bias 2 | His pre-market call: a bias and marked zones for the S&P, GBP/USD and gold. |
| 36 | Daily Bias 3 | A break on one timeframe is only a pullback on the next one up. Numbered targets on a gold short. |
| 37 | Taking Profits | Targets sit at the building blocks ahead. First target one timeframe above the entry, at least one-to-one. Three or four targets. |
| 38 | Stop Losses | Stop beyond the sweep, with a small buffer. Half size on big news days and before holidays. No trading on US bank holidays. |
| 39 | Calculating Lot Size | Size from balance, risk percent and stop distance. His own normal, half and double sizes. Never go "full port". |
| 40 | Help Me Help You | Check-in. He says the strategy teaching is finished. |
| 41 | Learn from Losses | Do not change strategy. His one adjustment: no more entries on sweep plus break alone; a pullback into an order block, gap or equilibrium is now required. |
| 42 | How to Backtest | He rejects bar-by-bar replay. "Backtesting" means scrolling back and spotting examples. The real test is live or demo. |
| 43 | Weekly Analysis | Weekend routine: news calendar first, then monthly-to-4-hour read of each market. |
| 44 | Try Not to Trade | Skip when the setup is against the bias, timeframes disagree, the market is choppy, or news is due. |
| 45 | Over Complicating | One strategy, one bias, no more tools. |
| 46 | Journaling Trades | Journal fields: market, session, confluences (his word for separate reasons that line up), risk, plan followed or not, emotions, how to improve. |
| 47 | Back Testing CPI | Hindsight review of a CPI day. For currencies and gold: mark Asia and London session highs and lows. |
| 48 pt 2 | Live Bias on PPI | Fullest statement of the entry sequence, the equilibrium rule and the stop. |
| 48 pt 1, 49 | (not studied) | Not in the transcript set. |
| 50 | Weekly Analysis | Week plan. He says he has shown everything he knows; later videos are recaps. |
| 51 | Sunday Motivation | Judge results over a year. Stop for the day after a loss. |
| 52 | Bias + Break-Even Recap | A small GBP/USD short against the daily trend, closed by hand for +$199. His verdict: do not take this trade. |
| 53 | Bias + GBP/JPY Recap | A "textbook" short: session highs swept, break, 1-minute entry, half closed at the first target, stop moved to break-even. |
| 54 | Bias + No Trades | Why he skipped three possible trades. |
| 55 | The End | Ends the series. No method content. |
| 2.0 | Boot Camp 2.0 | Two recaps: an S&P short taken on a break alone lost $13,000; a GBP/JPY long hit its first target. |

### The complete model, step by step

A "liquidity sweep" is price trading through an earlier high or low where stop orders are assumed to rest. A "break of structure" is a candle closing beyond the most recent opposing swing point, which he reads as the turn being confirmed. A "fair value gap" is a three-candle pattern in which the first and third candles' wicks do not overlap, leaving a price range that traded in one direction only. An "order block" is the move that made the sweep. "Daily bias" is the direction he will trade that day. The table sets out the model in the order it happens on a trading day and says how exact each step is.

| Step | What he teaches | Exact rule or judgement |
|---|---|---|
| 1. Plan | Fix risk, one instrument, the session and one trade a day in writing before the day starts (Day 29, 0:05:48, 0:09:20). | Exact. |
| 2. Calendar | No trading on US bank holidays (Day 38, 0:12:18). On major news, skip the day (Day 19, 0:07:14) or trade half size (Day 38, 0:10:16). | Holiday rule exact. News rule stated both ways. |
| 3. Weekly | Read the weekly chart for background, "literally just look at it" (Day 34, 0:00:34). | Judgement. |
| 4. Daily bias | Bullish if the most recent daily break of structure was up, bearish if down. It flips on one candle (Day 34, 0:02:11; Day 36, 0:05:45). | Exact once you fix which swing counts. He never fixes it. |
| 5. Direction | Longs only when bullish, shorts only when bearish (Day 29, 0:18:29). | Exact. |
| 6. 4-hour and 1-hour | If the 4-hour runs against the daily, that is the daily's pullback and where he wants to enter (Day 34, 0:08:55). | Exact to compute. What to do when they disagree is given three ways. |
| 7. Mark zones | On the 4-hour and 1-hour mark gaps, order blocks, the 50% level and highs and lows that hold liquidity (Day 34, 0:13:40). | Gap and 50% level exact. Order block edges and which highs and lows count are by eye. |
| 8. Session | Enter only in the first hour and a half of the New York open (Day 29, 0:10:52). He gives the open as 9:30 (Day 19, 0:08:49). | Exact. He never names a time zone. |
| 9. Sweep | A prior high (for shorts) or low (for longs) is taken out (Day 30, 0:01:32). | Judgement: which level, how far back, how far through, wick or close. |
| 10. Break | After the sweep, a candle closes beyond the opposing swing point (Day 32, 0:10:24; Day 6, 0:12:57). No break, no trade. | Exact once the swing point is chosen. |
| 11. Entry | At the close of the break candle (Day 38, 0:05:39), or on the pullback into the order block (Day 32, 0:15:11) or the gap (Day 30, 0:04:39), ideally in the favourable half of the move (Day 30, 0:05:40). From Day 41 he says the pullback is required. | Each option is codable except "wait for a reaction". Which option applies is his choice. |
| 12. Stop | Beyond the extreme of the sweep, plus a small buffer for spread, whichever entry was used (Day 38, 0:01:00, 0:05:39). | Exact. |
| 13. Size | Size from balance, 1% risk and stop distance (Day 39, 0:02:02). He personally halves on news days and doubles on "confident" days, and tells viewers never to double (Day 39, 0:14:32). | Formula exact. "Confident" is judgement. |
| 14. Targets | First target is the first swing high or low on the timeframe one above the entry, at least one-to-one "most of the time" (Day 37, 0:03:39, 0:06:10). Then two or three more. | First target exact. The rest, and how much to close at each, by eye. |
| 15. Done | After the one trade, or once the day's risk is lost, walk away (Day 29, 0:19:32). | Exact. |

Further rules a program can follow as stated: the two-candle definition of a high and a low (Day 6, 0:02:04); the three-candle gap, bullish from the first candle's high to the third candle's low and bearish the mirror (Day 16, 0:05:17); gaps used only in the direction of the last break (Day 16, 0:03:13); the 50% level with longs only below it in an uptrend and shorts only above it in a downtrend (Day 26, 0:06:47); order block first, gap second, equilibrium third as the pullback tool (Day 20, 0:07:18); and at the first target, close half and move the stop to break-even, which he states in full once (Day 53, 0:09:16). For indices he enters on the 5-minute and 1-minute charts (Day 35, 0:11:42, from a garbled sentence; Day 38, 0:07:42 agrees).

What a program cannot take from his words: which highs and lows are "prominent" (he calls it arguable, Day 12, 0:05:10); whether a level was really swept (he is unsure himself, Day 32, 0:11:56); whether an order block is one candle or a whole leg, and when it stops being valid; what a "reaction" is; where the 50% measurement starts and ends (he says it three ways in a row, Day 33, 0:19:39); what "good" or "terrible" reward-to-risk means, which decides both the entry type and the stop exception; which news means skip and which means half size; how late is too late; and when a market is too "sloppy" to trade (Day 35, 0:09:40).

### Where the course contradicts itself

| Topic | He says | He also says |
|---|---|---|
| Is sweep plus break enough to enter? | Yes (Day 12, 0:10:48; Day 30, 0:03:05; Day 47, 0:08:30) | No, a pullback entry is required (Day 41, 0:03:03; Day 46, 0:09:39) |
| Entry at a gap or order block | On the touch (Day 32, 0:15:11; Day 26, 0:09:23) | Only after a reaction or a lower-timeframe break (Day 16, 0:07:55; Day 34, 0:16:14) |
| Is a sweep required at all? | Yes, in every listed entry (Day 30; Day 29, 0:20:02) | Two taught examples have none (Day 33, 0:11:02, 0:12:03) |
| Trades per day | One (Day 17, 0:10:37; Day 29, 0:09:20) | One or two (Day 29, 0:08:49); up to three (Day 13, 0:11:20) |
| Risk | 1% to 3% per trade (Day 13, 0:03:36) | 1% to 3% per day (Day 13, 0:10:49); 1% (Day 27); a fixed lot that risks 1% to 3% depending on the stop (Day 39, 0:10:50) |
| Major news | Never trade those days (Day 19, 0:07:14) | Trade them at half size (Day 38, 0:10:16) |
| Wait after other news | 15 to 20 minutes (Day 19, 0:05:41) | 15 to 30 minutes, or 30 (Day 19, 0:09:52, 0:08:49) |
| Daily and 4-hour disagree | Probably do not trade (Day 34, 0:04:13) | It is "ideal" (Day 34, 0:13:40); a 1-hour break is "basically all I need" (Day 36, 0:13:02) |
| The weekly chart | "We don't really care about that" (Day 34, 0:11:32) | It limits how far the daily move runs (Day 36, 0:11:28) |
| First target | One timeframe above the entry (Day 37, 0:03:39) | On the entry timeframe (Day 37, 0:04:40); at daily levels (Day 36, 0:14:03) |
| Stop | Always beyond the sweep (Day 38, 0:03:03) | Beyond the order block if the sweep is far (Day 38, 0:04:38); "it doesn't really matter" (Day 22, 0:21:12) |
| What an order block is | One candle (Day 32, 0:10:54) | The whole leg (Day 32, 0:19:21) |
| Changing the method | Do not change your strategy (Day 41, 0:00:31) | Makes a new entry condition mandatory in the same lesson (Day 41, 0:03:03) |
| Following him | Use everything he says (Day 1, 0:01:00) | Take bits and pieces (Day 7, 0:06:38) |

### His own recorded trades skip steps he calls required

Four trades in the last lessons are described in enough detail to compare with the model. All four entered on a lower-timeframe break of structure. Three of the four had a marked high or low swept first. Agreement with the daily bias was optional in practice: the GBP/USD short went against the daily and weekly trend (Day 52, 0:12:20) and the GBP/JPY long went against the 4-hour and 1-hour (Boot Camp 2.0, 0:09:42). The S&P short that lost $13,000 skipped the third confirmation he had made mandatory in Day 41, and he still called it a trade with "no mistakes" (Boot Camp 2.0, 0:07:10, 0:15:25). He cut size to 15% or 50% of normal when entering without full agreement, which is never stated as a rule.

This matters for building anything from the course. The written model is stricter than the trader. A program can test one fixed reading of his rules; it cannot reproduce him. His method of "backtesting" also differs from a fair test: he means scrolling back through finished charts and spotting examples, with no count of trades, no win rate and no record kept (Day 42, 0:03:07), and looking at finished charts lets hindsight pick the examples.

No verified record of his results was found. A November 2025 review found no audited broker statements ([NYC Daily Mirror](https://nycdailymirror.com/is-tjr-trades-legit-a-look-at-tyler-j-riches-and-his-trading-education-platform/)), and the sharper allegations against him come from a rival's video reported second-hand. The fair summary is "unverified", not "disproven". The same holds for ICT, the teacher whose ideas TJR's resemble, whose own course listings say trades are shown on a demo account only ([ICT mentorship listing](https://www.scribd.com/document/629112317/Inner-Circle-Trader-ICT-Mentorship-Series)).

## Outside the course, almost nothing survives costs on Nasdaq futures

### How far to trust this section

Page fetching was blocked while this research was done. Every outside figure below comes from search-result extracts of the linked page (abstracts, snippets, summaries), not from a full read. Some of the tests of ICT-style ideas were seen only as one-line search summaries or as automated summaries of videos, and are marked as leads. No peer-reviewed paper tests any of these rules on MNQ itself; all micro-contract evidence is from preprints (papers posted before expert review) and hobbyist code repositories.

### Published strategies: real before costs, near zero after

| Idea | Where it comes from | What independent tests found | The Desk's own 15-minute form since 2024 |
|---|---|---|---|
| Opening range breakout (trade the direction of the first 5 minutes) | Working papers on the QQQ fund, not peer-reviewed ([Zarattini and Aziz](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4416622)) | Four tests reproduce the profit before costs and lose it after: +0.002R net on NQ ([Krueger](https://www.mql5.com/en/blogs/post/776235)); none of 225 versions across nine futures markets passed ([Fetna](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7428398)); NQ below zero after costs in every window since 2010 ([Trading Edge Journal](https://tradingedgejournal.com/blog/opening-range-breakout-futures-backtest/)) | +0.175R, t 2.00, but a 43.9R worst losing run and negative over the last 12 months |
| VWAP trend (long above the day's average price, short below) | Working paper that assumed no slippage ([Zarattini and Aziz](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4631351)) | The edge is about one tick wide and breaks even once slippage is added ([Telonics](https://telonicstrading.com/research-vwap.html)) | -0.033R |
| Noise-band momentum (trade only when price has moved more than is normal for that time of day) | Working paper on the SPY fund ([Zarattini, Aziz and Barbon](https://www.alexandria.unisg.ch/handle/20.500.14171/122124)) | On SPY it fell from a strong result to a weak one in a 2024-2026 follow-up ([Paz](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7290621)). On NQ, positive after costs over 2010-2026 (t 2.74), almost all of it after 2018, and not significant since publication ([VigorTas](https://github.com/VigorTas/beat-the-market-replication)); one point of slippage on stops removes 22% of it ([Chuk](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7609644)) | Midday-only form: 0.000R |
| First half-hour predicts last half-hour | Peer-reviewed, SPY 1993-2013 ([Gao and others](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2440866)) | A small effect; blog replications disagree on whether it still exists ([Dead Signals Lab](https://deadsignalslab.substack.com/p/replication-intraday-momentum-eight)) | -0.053R, t -2.49 |
| Overnight drift (2 to 3 AM Eastern) | Peer-reviewed, 1998-2019 | The same authors report it flat since 2021, in NQ as well ([New York Fed](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)) | Not tested |
| Simple price-and-volume signals on 5-minute MNQ | Preprint, 2021-2025 | Fourteen families tested, none passed; typical profit before costs was 0.07 to 1.50 points against about 2 points of cost ([Mesfin](https://arxiv.org/abs/2605.04004)) | Not tested |

The noise-band rule on NQ is the nearest thing to a survivor, and it is unconfirmed: its whole profit sits in one stretch of years on one market. The pattern across the table is that effects measured per trade or per day are small next to the cost of trading a micro. By the notes' arithmetic from published fee and tick figures, a realistic cost is **about 1.2 to 1.4 index points per round trip**, and one published study uses 2 points. Any setup whose average profit before costs is under about 2 NQ points per trade should be assumed to lose after costs.

### Sweeps have some outside support; gaps, blocks and clock windows have none

No peer-reviewed test of fair value gaps, order blocks, sweeps or the "Silver Bullet" time windows was found. The retail tests that include costs or a control group report little or no edge. A video test of 25,000 versions of the Silver Bullet on 16 years of NQ and ES one-minute data, seen as an automated summary, reported that about 1.7% of versions survived, that the special clock hours did no better than other hours, and that requiring a liquidity sweep was the one rule that helped ([video summary](https://videohighlight.com/v/KML09tRtHM8)). A second, separate test on 2011-2026 futures data reached the same view of the clock windows, and a test of order blocks against matched random zones found no reliable difference; both were seen only as search summaries and their details are unchecked ([Silver Bullet script](https://jp.tradingview.com/script/teL2dDvS-Silver-Bullet-GBB/); [order block statistics](https://vn.tradingview.com/script/yFmy3VBi-Order-Block-OB-Statistics-Real-Win-Rate-vs-Random-Levels/)). The favourable tests found were small samples from vendors, without costs.

The idea behind the sweep has a documented basis. Order-level data from a currency dealing bank showed stop-loss orders cluster just beyond obvious price levels and that their execution can drive fast moves ([Osler 2003](https://econpapers.repec.org/RePEc:bla:jfinan:v:58:y:2003:i:5:p:1791-1819); [Osler, price cascades](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr150.pdf)). That evidence is from currencies around 2000, and it predicts price speeding up through the level at least as much as reversing from it. The story that an institution deliberately hunts retail stops is not shown by any of it.

A sweep by itself is close to an everyday event. NQ's regular session breaks the overnight high or low on about 94% of days and reaches the prior day's high or low on about 90% ([TradingStats](https://tradingstats.net/overnight-high-low-breakout-strategy/); [Tradeify](https://tradeify.co/education/ict-trading-concepts-explained)). The first formal test of the ICT sweep model on NQ found its signal fires on 44% of days, with no clear value beyond a simple trend rule on the part of the paper that was visible ([Taylor](https://arxiv.org/abs/2610.35887)). Two small vendor tests found swept levels reverse about as often as ordinary ones. So the sweep needs the confirmation step, and even then the expectation to set is modest.

The same failed-breakout idea has been published for decades under other names. Adam Grimes teaches it free as the "failure test", with crisp entry and stop rules, and says of his related pullback pattern that the edge is real but "not huge" ([Grimes, failure test](https://www.adamhgrimes.com/trading-pattern-the-failure-test/); [Grimes, pullbacks](https://www.adamhgrimes.com/pullback-trade-works/)). The Desk's own results fit this picture. Its sweep setup at the New York open is the best of 14, its sweep and breakout setups in the evening and London windows are flat or negative, and its 15-minute Silver Bullet form is flat (+0.014R).

### The New York open moves four to five times as far as the evening

One vendor table puts the median NQ range at about 150 points in each of the 9 AM and 10 AM Eastern hours, about 91 at noon, and about 32 to 34 points per hour near midnight; the sample period was not visible ([Astreka](https://www.astreka.com/market-insights/the-best-and-worst-times-to-trade-nasdaq-futures)). CME says more than 20% of NQ volume now trades outside US hours ([CME Group](https://x.com/CMEGroup/status/2026658441972912438)), which puts roughly 80% in the US day. Two consequences follow. A stop that suits 9:35 AM is far too wide for 8 PM, so stops should be judged against that window's own recent range. And any setup limited to the open will show bigger moves than an all-day comparison for reasons that have nothing to do with skill, so a fair comparison must use random entries at the same clock times.

TJR calls the Asian session "a terrible session for trading" (Day 29, 0:10:22) and does not take index signals that form in London (Day 34, 0:14:44). You mostly trade the Asia evening. On The Desk's own long test, the evening range breakout is break-even (46.0% of 570 trades, +0.001R).

The Desk's free prices are about 10 minutes late. In the New York morning a 10-minute-old NQ price is, on a rough estimate from the hourly ranges, off by something like 60 points, or $120 per micro, which is larger than most intraday stops. Real-time CME prices cost a non-professional about **$4 to $12 a month** ([Tradovate](https://support.tradovate.com/s/article/How-Can-I-Find-Non-Professional-Monthly-Data-Rates?language=en_US)). After a CPI release the median 30-minute Nasdaq-100 range was 0.72% across 38 releases ([TradingCipher](https://tradingcipher.com/cpi/)), which is consistent with TJR's rule of standing aside on those days.

### Traders with checked records teach process and small size, not setups

Very few teachers have a record that anyone else has checked, and each check is narrow. Kevin Davey finished first or second in a real-money futures contest three years running, 2005 to 2007, as reported from the organiser's standings ([Complete Trader's Edge](https://completetradersedge.com/?p=235275)). Peter Brandt says an independent review covered his 1981 to 2010 record, and an anonymous forum post disputes whether it was a full audit. Linda Raschke was reportedly vetted for a 1992 book, by a method no source describes. Robert Carver and Tom Hougaard publish their own results, which nobody independent has signed off. None of these checks covers day trading Nasdaq futures, and none of these people publishes live intraday Nasdaq trades.

What they give away free is mostly process. Brandt's long-run win rate is "just above 42%", he says the size of wins against losses matters more than the win rate ([Brandt Q&A](https://www.peterlbrandt.com/a-collection-of-member-qas/)), and he risks about 0.6% to 1% of capital per trade ([Brandt](https://www.peterlbrandt.com/evergreen-280-characters-less/)). When his win rate fell to 32% in one stretch and under 20% in another, he cut his risk to a third or less and kept his method ([Brandt, September 2017](https://peterlbrandt.com/wp-content/uploads/2017/09/Factor-Update-September-03-2017-2.pdf)). Davey's free articles set out a pipeline: write the rules, test on data the rules have never seen, shuffle the trades to see how bad a losing run can get, then run it without money for three to six months, because that waiting period "can reveal development mistakes and save significant capital" ([Davey](https://kjtradingsystems.com/WhatHappensAfterOptimization.pdf)). Carver shows that the faster you trade, the more of the edge costs eat ([Carver](https://qoppac.blogspot.com/2020/04/how-fast-should-we-trade.html)). Brett Steenbarger shows with worked arithmetic that taking more trades on a thin edge multiplies the chance of hitting a loss limit ([Steenbarger](http://traderfeed.blogspot.com/2015/10/taking-intelligent-risks-how-to-stay-in.html)). A contest win is also no guide to safe sizing: one four-time winner describes a drawdown near 47% and up to 20% of capital on a single trade ([Unger](https://ungeracademy.com/blog/my-journey-to-winning-the-trading-championships)).

## A 19-trade month cannot outvote 383 trades

Your view is that the last few weeks matter most in futures. Part of it is right. Markets do change: published strategies lose roughly a quarter to a half of their measured performance once they leave the test period, and more after they become widely known ([McLean and Pontiff](https://econpapers.repec.org/RePEc:bla:jfinan:v:71:y:2016:i:1:p:5-32); [Falck, Rej and Thesmar](https://arxiv.org/pdf/2105.01380)). But that fading is measured over years. The question is whether four weeks of one setup can see it.

The arithmetic says it cannot. This is textbook statistics worked out in the research notes, and it assumes independent trades, so real precision is a little worse. With 19 trades, a win rate is accurate only to about **plus or minus 22 points**. A 13-of-19 month (68%) is consistent with a true win rate anywhere from 43% to 87%. Telling a 60% setup from a 50% one takes about 150 to 190 trades. Telling +0.1R from zero takes roughly 600 to 1,800. If all 14 Desk setups had no edge at all and 7 to 20 trades each, the top one would still show **about 74% over four weeks by luck** (69% if each had exactly 19 trades), and a "hot" setup above 70% would appear in about three months out of four. If one setup really were 60% and the other thirteen 50%, the real one would top a 19-trade table only about a quarter of the time.

So the 4-week picture to 25 November (Evening range breakout 63% of 19 trades and +0.43R, your current focus; NY sweep + shift 27% of 11 and -0.25R; Opening range breakout 25% of 20 and -0.43R) is what the same setups with unchanged odds would often produce. Over the long run the Evening range breakout is break-even (46.0% of 570 trades, +0.001R). No published study was found that tests whether a few weeks of one intraday setup predicts the next few weeks. Persistence is documented for baskets of dozens of stock strategies measured over a month to a year, the effect is modest, and in the best-known study the "follow what worked lately" version still did worse than simply holding everything ([Gupta and Kelly](https://www.aqr.com/Insights/Research/Working-Paper/Factor-Momentum-Everywhere)). That is an absence of evidence about your case, and your case can be tested directly on The Desk's own history. The proposal does that.

The long-run numbers also need a discount. The Desk's best result is a t-stat of 2.31 after about 23 variants tried. If none of 23 setups had any edge, the best would be expected to score about 1.96 by luck, and at least one would reach 2.3 in roughly one search in four or five. The accepted bar after many tries is about 3.0 ([Harvey, Liu and Zhu](https://nber.org/papers/w20592)), and reporting the number of variants tried is what lets anyone judge a backtest ([Bailey and others](https://carmamaths.org/jon/backtest.pdf)). In its favour, NY sweep + shift was also positive in the earlier 2019-2023 period (+0.055R), positive in each of 2024, 2025 and 2026, and better than 95% of the runs of The Desk's random-direction benchmark, which keeps the same entries and stops and picks the direction by coin flip (+0.111R against +0.080R). Live results usually come in well under the backtest: across 215 bank-built strategies the typical one kept about a quarter of its backtested performance ([Suhonen and others, via Alpha Architect](https://alphaarchitect.com/beware-of-backtest-overfitting/)), and across 888 trading programs the backtest score barely predicted live results ([Wiecki and others, via Quantpedia](https://quantpedia.com/quantopians-academic-paper-about-in-vs-out-of-sample-performance-of-trading-alg/)). A backtested +0.10R is best planned as +0.03R to +0.05R.

Honest testing, pulled together from these sources, comes to six habits. Write the rules, the costs and the pass marks down before running anything. Count every version you look at. Judge on data the rules were not shaped on. Include commission and slippage. Compare against random entries at the same times of day. And let a new setup run without money for months before trusting it. The Desk already does the first three and charges a 1-point cost; the proposal adds commission and a matched random-entry control. Bar size is a further limit: a 15-minute bar does not record the order in which prices traded inside it, and TJR's patterns form on 5-minute and 1-minute charts, usually inside a single 15-minute bar. A 15-minute version is a different strategy, so its result neither confirms nor refutes his ([NinjaTrader support](https://forum.ninjatrader.com/forum/ninjatrader-8/strategy-development/1262218-handling-of-stop-loss-and-take-profit-levels-in-backtesting)). The Desk's backtest already takes the cautious side by assuming the stop was hit first whenever both stop and target fall inside one bar.

Recent results do have two honest uses. A truly terrible month (5 or fewer wins in 19 for a setup that normally wins 55%) is rare enough to be worth checking for a data or rule error, though across 14 setups at least one will look that bad in about one month in seven with nothing wrong. And all setups pooled give 100 or more trades a month, enough to notice the whole book doing badly. The response the checked traders use for a cold spell is the one Brandt used: cut size, keep the method.

## What I propose to build (nothing is built yet)

This is a proposal, not a finding, and it waits for your approval. It rests on the notes above and on The Desk's own test results. The risk rules are yours to set. The Desk never places orders; every trade is placed by hand on Tradovate, and signals are information, not instructions.

The facts it depends on are these. Your personal rules today are $250 risk per trade, and with under $1,000 of room the account guard already switches to one loss and done for the day. One MNQ micro is $2 per point and is the smallest size, so a 50-point stop on one micro risks $100 and a 125-point stop risks $250. The Desk has 14 setups across four windows (Asia evening, London, New York open, New York midday), each a fixed rule set tested on 15-minute NQ bars from December 2018 to October 2026 with a 1-point cost and judged on 2024 onward. None passed all six rules set in advance, and 23 variants have been tried in total. The best long-run setup, NY sweep + shift (383 trades since 2024, 51.4% wins, +0.111R average, t-stat 2.31), is the 15-minute form of the same idea TJR teaches as his first entry. Its median stop is 107 NQ points, so only 60% of its signals fit $250 risk on one micro and almost none would fit $100. The Desk leads with each setup's win rate over the last 4 weeks, as you asked on 25 November, with the long-run number smaller. Prices are MNQ 5-minute bars from Yahoo, about 10 minutes late; Yahoo keeps about 60 days of 5-minute history and about 7 days of 1-minute, and the long history file is 15-minute bars only. An optional TradingView browser extension can feed live chart bars. As a first-hand check, Days 29, 30 and 32 to 38 were read in full separately from the note-takers, and the rules in the notes for those days match.

### Part 1. Risk first: size for a $683 cushion

This comes first because $250 is 37% of the cushion and three losses in a row end the account. With a small real edge (+0.1R) the chance of breaching before the cushion is back to $2,000 falls from about 51% at $250 to about 33% at $100 and 23% at $68. With no edge it is about 66% at any size, so sizing helps only if the setups have an edge; it cannot create one.

1. Add a "small cushion" risk rule to the account guard: while room to the limit is under $1,500, trade one micro only and cap risk per trade at $100 (a stop of 50 points or less). Above $1,500 of room, return to $250. Both numbers are editable in Settings.
2. Keep "one loss and done for the day" while the cushion is thin.
3. Show "losses until the limit" on the account guard. Today that is 2 full losses at $250, leaving $183, or 6 at $100.
4. Trades whose stop is wider than the cap stay visible, marked as too wide, with what one micro would cost. They are not hidden. You have said you do not want every trade blocked, so here is plainly what this rule does to the existing setups: most signals from the wide-stop setups (median 107 points on NY sweep + shift) would be marked too wide. The 5-minute TJR setups in Part 2 have much tighter stops, because the stop sits just beyond the sweep, and that is the main practical reason to build them now.
5. Add commission to every estimate: about $1.30 to $1.90 per micro per round trip, plus slippage. On a 25-point stop that is about 0.06R per trade, so tight-stop setups must clear a higher bar.

### Part 2. TJR's model, built the way he teaches it, as new setups

The rules are fixed and written into the pre-registration (the record of rules and pass marks made before any test is run) first.

1. Daily bias, shown on The Desk in every window: the direction of the most recent daily close beyond the prior daily swing high or low. Beside it, the 4-hour and 1-hour structure direction, with his reading ("4-hour against the daily = a pullback on the daily"). This is context only; it does not block trades.
2. Liquidity levels marked on the chart and in the levels list: prior day high and low, Asia session high and low, London session high and low, and the most recent 15-minute swing high and low, each marked "swept" once price has traded through it.
3. Setup "TJR sweep + break" (his entry model 1), on 5-minute bars:
   - Window: the first 90 minutes after the 9:30 AM Eastern open (7:30 to 9:00 AM Denver). This is the only session he trades for indices.
   - Direction: with the daily bias only.
   - Trigger: a marked level is swept (price trades beyond it), then a 5-minute candle closes beyond the most recent opposing 5-minute swing point. Enter at that close.
   - Stop: beyond the extreme of the sweep, plus a 2-point buffer (he says a small buffer for spread).
   - Target: the first 15-minute swing high or low in the trade direction that is at least 1R away (his "one timeframe up, at least one to one"). A rule exit at the end of the New York open window if neither is hit.
   - One trade a day.
4. Setup "TJR sweep + break + pullback" (his entry models 2 to 4): the same day rules, but the entry is a resting price: the pullback into the fair value gap or order block left by the break, only if that zone is in the favourable half of the move (his "equilibrium"). Same stop. If price never pulls back, no trade.
5. His news rules, applied to these two setups: no trade on CPI, PPI, FOMC or payrolls days; after any other high-impact US release, no entry for 30 minutes; no trade on US bank holidays; a half-size note the day before a holiday. The Desk already has the calendar and holiday table.
6. The same two rule sets are also run in the other three windows (Asia evening, London, New York midday) and shown with a plain label that this is outside what he teaches. He calls Asia a poor session and does not trade indices in London. You mostly trade the Asia evening, so you should see what the model does there, good or bad.
7. Where TJR leaves a rule to the eye (which swing counts, how far back to look, what a "reaction" is, where an order block starts), one mechanical definition is chosen in advance, written down, and never tuned after seeing results. Every definition tried is counted in the "variants tried" number shown on The Desk (23 today).

The limits of Part 2 are as follows.

- TJR never trades or mentions NQ or MNQ in the course. His examples are an S&P 500 CFD (a broker's contract that tracks the index, not the future), two pound currency pairs and gold. He enters indices on 5-minute and 1-minute charts.
- The Desk's free prices are 5-minute bars about 10 minutes late. So "enter at the close of the break candle" arrives late on The Desk. The pullback setup suffers less from the delay, because its entry price, stop and target are known in advance and you place a resting order on Tradovate. For anything closer to real time, the TradingView bridge or a paid CME data subscription (about $4 to $12 a month) is needed. No 1-minute trigger can be built on the free feed.
- A coded version is a mechanisation of a discretionary method. His own recorded trades skip steps he calls required (daily bias, the third confirmation), so no code reproduces "TJR"; it tests one fixed reading of him.
- The independent tests found so far (retail-published, not peer-reviewed) report little or no edge for mechanical versions of these patterns, with the liquidity sweep the only rule reported to help, and fair value gaps and order blocks no better than placebo levels. The Desk's own best long-run setup is a sweep setup, which is consistent with that. The expectation to set is modest.

### Part 3. Testing the new setups honestly

1. Pre-register first: rules, costs (1 point plus commission), pass rules and the judge period, before running anything.
2. Data: 5-minute history is needed. Yahoo gives about 60 days, enough for roughly 40 to 60 trades per setup, which is too few to separate 50% from 60% (that needs about 150 to 190 trades). I will try to obtain multi-year 1-minute data for the Nasdaq-100 from Dukascopy (an index CFD, so a close proxy and not the future itself), label it as a proxy, and report if it cannot be obtained.
3. Add a matched control: random entries at the same clock times with the same stop and target distances, so the high volatility of the New York open is not mistaken for an edge.
4. Report every setup with trades, win rate, average R, t-stat, drawdown and the number of variants tried, in the same table as the existing 14. If the TJR setups fail, The Desk says so.

### Part 4. Recent results versus long-run results on The Desk

Your view is that the last few weeks matter most in futures. A 19-trade window has a margin of about plus or minus 22 points, and the best of 14 no-edge setups would show about 74% over 4 weeks by luck. The proposal keeps your layout and tests your view on data instead of arguing it.

1. Keep "last 4 weeks" as the leading number, and print its honest range beside it (for example "63% of 19 trades; likely range 41% to 81%").
2. Run one pre-registered check on The Desk's own 2019 to 2026 history: does a setup's result over the previous 4 weeks predict its result over the next 4 weeks? Report the answer on the Playbook. If recent results do carry over, The Desk ranks setups by them with confidence. If they do not, The Desk says so next to the number and leads with a blend of recent and long-run results. Either way you see the evidence.

### Part 5. Process items from the course (small, optional)

1. Journal: add "followed the plan? yes or no", the confluences present (filled in automatically for trades taken with the + button) and a one-line note on state of mind; and a weekly review view. These are TJR's Day 46 journal fields.
2. A "one trade a day" switch in Settings. It is TJR's rule and it matches the thin-cushion rule already in the guard.
3. The pre-session checklist in the Journal tab updated to his order: calendar and holiday, weekly direction, daily bias, 4-hour and 1-hour, marked levels, then wait for the window.

### What would not be built, and why

- Fair value gaps or order blocks as signals by themselves: the only controlled test found shows no difference from placebo levels, and TJR himself says a touch of either is never an entry.
- More clock-window variants of the Silver Bullet: two independent long tests found the windows are not special, and The Desk's own 15-minute form is flat (+0.014R).
- Double size on "confident" days. TJR does this himself and tells viewers not to.
- Copying anyone's calls: no verified track record was found for TJR or ICT, and the verified traders studied do not publish live intraday Nasdaq trades.
- Anything that places orders.

### Decisions needed from you before building

1. The risk cap while the cushion is small: $100 on one micro (proposed), a different number, or keep $250.
2. Build the TJR setups for the New York open only, or also show them in the Asia evening, London and midday windows (proposed: all four, labelled).
3. Whether to run the "do recent results carry over" check and let its answer decide which number leads.
4. Whether to include the Part 5 process items.

## Conclusion

The course and the outside evidence meet at one narrow point: a failed push through an obvious level at the New York open, confirmed by a close back the other way, traded small and at most once a day. That is TJR's first entry, Grimes's failure test and The Desk's best setup, and it is the only member of this family with any support beyond its teachers. Everything stacked on top of it (gaps, order blocks, clock windows, confidence sizing) is where the course contradicts itself most and where the outside tests found nothing.

The research also pushes hardest against three current habits at once: the $250 size on a $683 cushion, the evening session as the main window, and ranking setups on four weeks. None of the three needs to be settled by argument. The first is your decision on a number. The other two can be answered from The Desk's own history, with the rules written down first, a random-entry control beside each result, and the answer shown on the screen whichever way it falls. The practical reason to build TJR's setups now is that their tight stops fit a thin cushion and the test will be fair, and not that the evidence predicts a large edge. What remains unknown is stated plainly: Lucid's exact lock and payout rules, real MNQ slippage by time of day, the two lessons that were not studied, and whether any of this survives a real-time feed and real fills.
