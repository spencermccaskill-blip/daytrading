# NQ / MNQ market microstructure and session behaviour (as of 27 November 2026)

> **Method caveat (read first).** Page fetching was blocked in this session (cmegroup.com and tradingview.com did not resolve), and the shared web-search budget ran out after about 40 searches. Every finding below therefore comes from search-result excerpts, not from reading the full page. Where a search excerpt did not say which of several pages a figure came from, the citation says "one of" and lists the candidates. Figures are reported as the excerpts gave them. Anything I could not source is in Gaps, including some standard facts I know from background but could not confirm here. Vendor, prop-firm and TradingView-script statistics are labelled as such: none is peer-reviewed and most do not disclose roll handling or definitions.
>
> All times are New York (Eastern) unless marked CT (Chicago = ET minus 1 hour).

## 1. Contract facts: specifications, hours, settlement, limits, roll, volume, open interest, session share

### Takeaway
MNQ is $2 x the Nasdaq-100 with a 0.25-point ($0.50) tick, trades Sunday 18:00 to Friday 17:00 ET with a 17:00-18:00 daily break, settles daily at 16:00 ET, and rolls on the Monday before the third Friday of March/June/September/December (next: Monday 14 December 2026). MNQ averaged a record 2.9 million contracts a day in October 2026, about a third of all CME equity index volume; CME says non-US hours now carry over 20% of NQ volume, but I found no Asia-versus-Europe split.

### Cited Findings

**Specifications**
- MNQ contract unit is $2 x the Nasdaq-100 Index; minimum tick is 0.25 index points. — [CME MNQ product page](https://www.cmegroup.com/markets/equities/nasdaq/micro-e-mini-nasdaq-100.html)
- One MNQ tick is worth $0.50; contract months are March, June, September, December. — [NinjaTrader MNQ explainer](https://ninjatrader.com/futures/blogs/what-are-micro-e-mini-nasdaq-100-futures-mnq/)
- CME Globex hours: Sunday 6:00 p.m. to Friday 5:00 p.m. ET, with a daily maintenance period 5:00-6:00 p.m. ET (4:00-5:00 p.m. CT). — [CME Micro E-mini FAQ](https://www.cmegroup.com/articles/faqs/frequently-asked-questions-micro-e-mini-equity-index-futures.html)

**Daily and final settlement**
- CME moved the daily settlement price determination for E-mini and Micro E-mini Nasdaq-100 futures from 4:15 p.m. ET to 4:00 p.m. ET (3:00 p.m. CT); it applies every day including month-end, and trading hours did not change. The excerpt did not give the effective date. — [CME settlement-time FAQ](https://cmegroup.com/education/articles-and-reports/faq-daily-settlement-price-determination-time-change.html)
- NQ daily settlement uses a 30-second VWAP from 2:59:30 to 3:00:00 p.m. CT (3:59:30-4:00:00 p.m. ET). — [NexusFi settlement table](https://nexusfi.com/a/data/futures-settlement-data)
- A CME course page still shows the older 15:14:30-15:15:00 CT window; this conflicts with the FAQ above and appears outdated. — [CME settlement course page](https://www.cmegroup.com/education/courses/introduction-to-equity-index-products/understanding-equity-index-daily-and-final-settlement.html)
- Quarterly NQ contracts are cash-settled to a Special Opening Quotation (SOQ) computed from the opening prices of index constituents. — [CME settlement course page](https://www.cmegroup.com/education/courses/introduction-to-equity-index-products/understanding-equity-index-daily-and-final-settlement.html)

**Price limits and circuit breakers**
- Effective 12 October 2020, overnight limits on US equity index futures widened from +/-5% to +/-7%, plus a 3.5% dynamic circuit breaker. — [CME US equity index price limits FAQ](https://www.cmegroup.com/trading/equity-index/faq-us-based-equity-index-price-limits.html)
- A 7% decline in the S&P 500 (Level 1) before 2:25 p.m. CT (3:25 p.m. ET) triggers an NYSE Rule 7.12 halt in cash equities and in all US equity index futures; trading resumes 10 minutes after the halt began with limits widened to 13% (Level 2). A 13% decline before 2:25 p.m. CT triggers the same kind of halt. A 20% decline (Level 3) ends trading for the day. — [CME price limits FAQ](https://www.cmegroup.com/trading/equity-index/sp-500-price-limits-faq.html)
- Nasdaq-100 products re-open 10 minutes after a market-wide circuit breaker halt during US hours; CME limits apply to both up and down moves relative to the prior day's futures settlement. — [CME price limit guide](https://www.cmegroup.com/trading/equity-index/price-limit-guide.html)

**Roll schedule**
- CME's roll-date convention for equity index futures is the Monday before the third Friday of the expiry month; 15 June 2026 was the June-to-September roll date for ES, NQ, YM and RTY. — [investingLive, 15 June 2026](https://investinglive.com/stock-market-update/us-equity-index-futures-roll-to-september-today-june-contracts-near-expiry-what-you-need-20260615/)
- December 2026: roll date Monday 14 December 2026; the December contract (NQZ6/MNQZ6) expires Friday 18 December 2026 at 9:30 a.m. ET; micros follow the same dates. — [TradeLuma roll guide](https://tradeluma.app/blog/es-nq-december-2026-futures-rollover-expiry-guide); [Affordable Indicators](https://affordableindicators.com/articles/futures-rollover-dates-ninjatrader/); [LP Futures](https://lpfutures.com/how-to-roll-over-index-futures-contracts/)
- An older forum post gives the convention as eight calendar days before expiry (the Thursday of the prior week), and one calendar site refers to a "Thursday liquidity shift" before the roll. These conflict with the Monday convention above. — [MyPivots forum](https://mypivots.com/board/topic/47/8/contract-rollover); [TradeBotics](https://tradeboticsai.com/futures-rollover-dates/)
- Volume migrates gradually, not at one moment; CME publishes an Equity Quarterly Roll Analyzer with pace-of-roll charts each quarter (cmegroup.com/rollpace). — [CME roll analyzer guide](https://www.cmegroup.com/education/files/getting-started-equity-quarterly-roll-analyzer.pdf)

**Volume and open interest**
- October 2026 (CME release dated 3 November 2026): total CME ADV a record 30 million contracts (+15% y/y); Equity Index ADV 8.8 million (+15%); Micro E-mini Nasdaq-100 futures ADV 2.9 million (+74%); Micro E-mini equity index futures and options 4.4 million, half of equity index ADV; E-mini Nasdaq-100 options 131,000 (+32%). — [CME press release, 3 Nov 2026](https://www.cmegroup.com/media-room/press-releases/2026/11/03/cme_group_reportsrecordoctoberadvof30millioncontractsup15yearove.html)
- September 2026: Equity Index ADV 7.7 million (+23%); MNQ ADV 2.6 million. — [CME press release, 2 Oct 2026](https://www.cmegroup.com/media-room/press-releases/2026/10/02/cme_group_reportsrecordaveragedailyvolumeforseptemberandq3driven.html)
- July 2026: micro contracts made up 54% of CME equity index ADV. — [Finance Magnates](https://www.financemagnates.com/institutional-forex/micro-contracts-now-make-up-54-of-cme-equity-index-adv/)
- E-mini NQ, single-day snapshot: estimated volume about 1.06 million contracts and prior-day open interest 313,900 (page last updated 24 November 2026, 8:59 p.m. CT). This is one day, not an average. — [CME NQ settlements page](https://www.cmegroup.com/markets/equities/nasdaq/e-mini-nasdaq-100.settlements.html)
- NQ open interest 268,077 and volume 1.02 million as of 31 October 2026. — [MSN Money quote page](https://www.msn.com/en-us/money/markets/commoditydetails/fi-c1233m)
- NQ open interest (weekly series) ranged roughly 235,000 to 344,000 in the first half of 2026, peaking at 344,441 on 16 June 2026 and standing at 285,086 in early July 2026. — [YCharts](https://ycharts.com/indicators/cme_mini_nasdaq_100_stock_index_futures_open_interest)
- For scale: NQ averaged 492,839 contracts a day in 2018. — [Wikipedia, E-mini](https://en.wikipedia.org/wiki/E-mini)
- A prop-firm glossary says MNQ trades "roughly 250,000-500,000 contracts during active sessions". This is contradicted by CME's 2.9 million ADV for October 2026 and should be treated as stale. — one of [DamnPropFirms](https://damnpropfirms.com/glossary/mnq-futures/) / [TraderVerdict](https://traderverdict.com/blog/micro-emini-futures-prop-firm); contradicted by [CME press release](https://www.cmegroup.com/media-room/press-releases/2026/11/03/cme_group_reportsrecordoctoberadvof30millioncontractsup15yearove.html)

**Share of volume by session**
- CME: NQ futures and options volume during non-US trading hours "has hit a record high, now accounting for over 20% of total ADV". The post is undated in the excerpt and was published on an Nvidia earnings day. — [CME Group on X](https://x.com/CMEGroup/status/2026658441972912438)
- CME defines non-US hours as 5:00 p.m. to 8:00 a.m. ET. — [CME Equity Insights, October 2025](https://www.cmegroup.com/newsletters/quarterly-equity-index-recap/2025-october-equity-index-recap.html)
- For the E-mini S&P 500 (ES, not NQ), the overnight share of volume went from 15% to 16% between the 1998-2020 and 2021-2025 samples. — [NY Fed Liberty Street Economics, 1 July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- CME-wide (all asset classes) October 2026: international ADV 9 million (+9%), EMEA 6.3 million (+7%), APAC 2.3 million (+15%). — [Yahoo Finance copy of CME release](https://finance.yahoo.com/markets/options/articles/cme-group-reports-record-october-123000706.html)
- Record non-US-hours equity futures and options volume was 5.1 million contracts on 5 August 2024. — [CME Equity Insights](https://www.cmegroup.com/newsletters/quarterly-equity-index-recap/2025-october-equity-index-recap.html)

### Inferences
- MNQ at 2.9 million of 8.8 million contracts is about 33% of CME equity index contract volume in October 2026 (arithmetic on the CME figures). In notional terms 2.9 million MNQ equals 290,000 NQ-equivalents, so E-mini NQ (around 1 million contracts on recent single days) still carries most of the Nasdaq-100 futures notional.
- If over 20% of NQ volume trades between 17:00 and 08:00 ET, then roughly 80% trades between 08:00 and 17:00 ET. The reader's evening (18:00-00:00) and London (03:00-07:00) windows together sit inside the roughly-20% slice; the two New York windows sit inside the roughly-80% slice.
- The CME-wide regional split (EMEA 6.3 million vs APAC 2.3 million) suggests European hours carry more volume than Asian hours, but that is all products and by client region, not NQ by clock hour.
- By the Monday roll convention, a trader should expect to be in the March 2027 contract (NQH7/MNQH7) from 14 December 2026.

### Gaps
- E-mini NQ contract unit ($20 x index, $5 per tick) and the MNQ:NQ 1:10 ratio are standard knowledge but no search excerpt stated them; confirm on CME's NQ contract-spec page.
- October 2026 ADV for E-mini NQ futures and open interest for MNQ: not found. The CME Daily Bulletin and monthly volume report would have them.
- Asia-versus-Europe-versus-US share of NQ/MNQ volume by clock hour: not found in any published source.
- Dynamic circuit breaker mechanics for NQ (lookback window, 2-minute halt), current-day limit prices, and the exact final-settlement procedure: not confirmed; CME Rulebook Chapter 359 is the source.
- Position limits, margin and MNQ-specific termination-of-trading text were not retrieved.

## 2. Liquidity and cost by time of day: spread, depth, slippage

### Takeaway
I found no published, measured spread or depth statistics for NQ or MNQ by time of day; everything available is qualitative commentary from broker and prop-firm blogs saying MNQ is usually one tick wide in New York hours and wider and thinner overnight and around news. The one quantitative anchor is a 2026 arXiv falsification study that charges 2 points round trip per MNQ trade and finds that typical simple-signal edges (0.07 to 1.50 points gross) do not cover it.

### Cited Findings
- Blog claim: MES and MNQ are "extremely liquid during RTH. The bid-ask spread sits at one tick almost continuously, and depth on both sides of the book is sufficient for retail-sized orders." One tick is 0.25 points, $0.50 per MNQ contract. — one of [Bookmap](https://bookmap.com/blog/micro-futures-a-short-guide) / [Optimus Futures](https://optimusfutures.com/blog/mnq-trading-strategies/) / [PropScorer](https://www.propscorer.com/academy/mini-vs-micro-futures) (unmeasured, vendor commentary)
- Blog claim: during the extended session, "especially the overnight session between roughly 6 PM and midnight ET, spreads can widen and depth thins out. A market order for 10 MNQ contracts at 2 AM ET might slip more than expected." — one of [TraderVPS](https://www.tradervps.com/blog/mnq-trading-hours-standard-extended) / [Optimus Futures](https://optimusfutures.com/blog/mnq-trading-strategies/) (unmeasured)
- Blog estimates of the overnight MNQ spread disagree: one gives 0.50-2.00 points ($1.00-$4.00 per contract); another says "occasionally 2 ticks overnight or in low-volume periods". — one of [The Forex Scalpers](https://theforexscalpers.com/mnq-scalping-complete-guide/) / [DamnPropFirms](https://damnpropfirms.com/glossary/mnq-futures/) (unmeasured; the two conflict)
- Blog claim: E-mini books are deeper and spreads tighter than micros "especially during off-peak hours", and micro spreads can reach 2 to 3 ticks around news; another says NQ and MNQ both typically trade one tick wide in regular hours. — one of [PropScorer](https://www.propscorer.com/academy/mini-vs-micro-futures) / [TraderVerdict](https://traderverdict.com/blog/micro-emini-futures-prop-firm) (unmeasured)
- Academic, old: on a sample starting May 2003, E-mini S&P 500 and Nasdaq-100 contracts had tighter bid-ask spreads and greater depth than the floor-traded contracts. — [Market Liquidity and Depth on Floor-Traded and E-Mini Index Futures](https://www.researchgate.net/publication/265449645_Market_Liquidity_and_Depth_on_Floor-Traded_and_E-Mini_Index_Futures_An_Analysis_of_the_SP_500_and_Nasdaq_100)
- Academic: a market-microstructure-invariance paper reports average futures depth at the best quotes of 46 contracts and a quoted spread just above the minimum tick. The excerpt did not confirm which contract or period this refers to. — [Trading Costs and Market Microstructure Invariance](https://www.nasdaq.com/docs/2024/02/09/Trading-Costs-and-Market-Microstructure.pdf)
- A 2026 arXiv study of MNQ intraday signals assumes a fixed 2-point round-trip friction per MNQ trade ($4 per contract). Eleven OHLCV signal families failed because their maximum gross return was 0.07 to 1.50 points per trade, below that cost. — [Mesfin, arXiv 2605.04004](https://arxiv.org/abs/2605.04004)
- CME's US CFTC-era data: automated orders are typically smaller than manual orders, rest for less time, and are almost always limit orders (30 contracts, January 2013-December 2018). — [National Law Review summary of CFTC staff report](https://natlawreview.com/article/cftc-staff-issues-research-report-impact-automated-orders-commodity-futures-markets)
- CME has published a 2025 article arguing that liquidity should be assessed beyond displayed order-book depth, using E-mini S&P 500 data (not NQ). — [CME, Reassessing Liquidity](https://www.cmegroup.com/articles/2025/reassessing-liquidity-beyond-order-book-depth.html)
- A NexusFi education article gives volatility multiples and slippage estimates by news-event type, without a visible methodology; the figures were not in the excerpt. — [NexusFi news event risk](https://nexusfi.com/a/risk-management/news-event-risk-management)

### Inferences
- A 1-5 lot MNQ market order is small relative to 2.9 million contracts a day, so in New York hours the plausible cost is the spread (one tick, $0.50 per contract per side) plus occasional extra ticks. This is an inference from volume and blog commentary, not a measurement.
- The arXiv study's 2-point round-trip assumption ($4 per MNQ contract) is a conservative planning number for a manual trader: any setup whose average gross edge is under about 2 NQ points per trade should be assumed unprofitable after costs.
- Because resting depth is mostly short-lived automated limit orders, displayed depth can vanish before a stop triggers. Stop orders that convert to market orders will therefore slip most exactly when the reader is most likely to be stopped: at news releases and in the thin evening and London windows.
- On delayed data the reader cannot see the current spread at all, so limit orders (or stop-limit orders) are the only way to bound entry cost.

### Gaps
- No measured bid-ask spread, top-of-book size, or slippage distribution for NQ or MNQ in any of the four windows (18:00-00:00, 03:00-07:00, 09:30-12:00, 12:00-16:00). CME's Liquidity Tool and paid tick data (for example Databento MBP-1) would answer this; neither was reachable.
- No measured slippage for 1-5 lot market orders or stop orders, in normal conditions or at CPI/NFP/FOMC.
- No measured spread or depth for holiday-shortened sessions.
- CME Globex order-type mechanics that bound slippage (market-with-protection and stop-with-protection ranges, stop-logic and velocity-logic pauses) could not be sourced; the search budget ran out before that query executed.
- Commissions and exchange fees per MNQ contract were out of scope for the searches that ran.

## 3. Volatility by time of day

### Takeaway
One vendor table puts the median NQ hourly range near 150 points in the 09:00 and 10:00 ET hours, about 107 at 11:00, about 91 at noon, and about 32 to 34 points per hour around 23:00 to midnight, so New York morning hours are roughly four to five times as volatile as late evening. Academic work on ES confirms a U-shape within each of the Asian, European and US sessions; the once-reliable positive drift at the European open (02:00-03:00 ET) has been flat since 2021, in NQ as well as ES.

### Cited Findings

**Hourly and short-interval range (vendor data, NQ)**
- Median NQ range by hour: 154.5 points in the 9:00 a.m. ET hour, 149.9 in the 10:00 a.m. hour, 106.9 at 11:00 a.m., 91.2 at noon; 33.5 points in the hour beginning midnight and 32 points in the hour beginning 11:00 p.m. Sample period and publication date were not in the excerpt. — [Astreka, Best and Worst Times to Trade Nasdaq Futures](https://www.astreka.com/market-insights/the-best-and-worst-times-to-trade-nasdaq-futures)
- Over 35 sessions in August-October 2026, the busiest NQ hours were 08:00-11:00 Chicago time (09:00-12:00 ET), the busiest single hour 08:00-09:00 CT, and the average session range about 419 points. — [TestMax NQ backtesting page](https://test-max.com/features/nasdaq-futures-backtesting/)
- A "normal" 5-minute ATR(14) for NQ is 20-45 points (smoothed, not by time of day; date not given). — [Volatility Box](https://volatilitybox.com/research/nq-futures-volatility/)

**Academic evidence on the 24-hour pattern (ES unless stated)**
- Using 1-minute realised volatility for 1998-2020, intraday volatility "displays the well-known U-shaped pattern for Asian, European and US trading hours where volatility is high at the beginning and at the end of each trading period". — [Boyarchenko, Larsen, Whelan, NY Fed Staff Report 917](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr917.pdf)
- Volume, volatility and trade counts in ES all display a U-shape within each individual trading cycle. — [Andersen, Bollerslev, Kyle, Obizhaeva, Intraday Trading Invariance in the E-mini S&P 500](https://pages.nes.ru/aobizhaeva/ABKO-intradayinv.pdf)
- Hourly E-mini index futures returns sampled over 24 hours show a strong seasonal volatility pattern with significant persistence. — [Rossi and Fantazzini, SSRN 1460625](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1460625)
- A 2026 arXiv paper reports evidence of a shift over time towards a larger role for volatility outside US trading hours. — [Interpretable Systematic Risk around the Clock, arXiv 2604.13458](https://arxiv.org/pdf/2604.13458)
- A 2025 study, cited second-hand in a 2026 arXiv paper, is said to confirm volatility peaks at the London and New York opens specifically for NQ and ES. — [Taylor, arXiv 2610.35887](https://arxiv.org/pdf/2610.35887)

**European open (02:00-03:00 ET)**
- 1998-2019: the largest positive ES returns accrued between 2:00 and 3:00 a.m. ET, averaging 3.6% annualised. — [NY Fed Liberty Street Economics, 2021](https://libertystreeteconomics.newyorkfed.org/2021/05/the-overnight-drift-in-us-equity-returns)
- Same working paper, 1998-2018: the US open window 8:30-10:00 a.m. averaged -3.9% annualised gross. — [CXO Advisory summary](https://www.cxoadvisory.com/calendar-effects/middle-of-the-night-stock-market-gains/)
- 2021-2025 (1,245 trading days): returns at the European open were flat; the same disappearance holds in E-mini Nasdaq-100 (NQ) and E-mini Dow (YM). — [NY Fed Liberty Street Economics, 1 July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)

**Midday and the close**
- NQ, after an initial-balance break: a new extension high followed 51% of the time before 11:30 and 34% of the time between 11:30 and 13:30 (1,748 breaks, 1-minute NQ data, June 2019-October 2026; TradingView community script). — [NQ IB Odds script](https://in.tradingview.com/script/SCdiy4ty-NQ-IB-Odds/)
- Across more than 60 futures (equities, bonds, commodities, currencies) from 1974 to 2020, the return in the last 30 minutes before the close is positively predicted by the return from the previous close up to that point; the effect is tied to hedging demand from index options and leveraged ETFs and reverts over the following days. — [Baltussen, Da, Lammers, Martens, JFE 2021](https://www3.nd.edu/~zda/intramom.pdf)
- NYSE closing imbalance publication starts at 3:50 p.m. and updates every second; MOC and LOC orders face a 3:50 p.m. cut-off for entry, modification and cancellation. — [NYSE closing process fact sheet](https://www.nyse.com/publicdocs/nyse/NYSE_Auctions_Closing_Process_Fact_Sheet.pdf)
- Nasdaq's Net Order Imbalance Indicator starts at 3:50 p.m. ET; Nasdaq stops accepting MOC orders at 3:55 p.m., LOC orders can be entered until 3:58 p.m., and between 3:55 and 4:00 p.m. the indicator is disseminated every second. — [Nasdaq Closing Cross FAQ](https://www.nasdaqtrader.com/content/productsservices/Trading/ClosingCrossfaq.pdf)

### Inferences
- On the Astreka medians, the 09:00 and 10:00 hours move about 4.6 times as far as the midnight hour (154.5 / 33.5). The reader's 09:30-12:00 window is the high-volatility window; 12:00-16:00 starts at roughly 60% of the morning's hourly range; 18:00-00:00 is the quietest.
- The 51% versus 34% continuation figures are consistent with a midday lull in follow-through between 11:30 and 13:30, on one unaudited community sample.
- The 02:00-03:00 ET drift is not a tradable regularity any more on the NY Fed's own update. It also sits one hour before the reader's 03:00 start.
- The academic papers place European-open effects at 02:00-03:00 ET, while the reader's London window starts at 03:00 ET. Around clock changes the European open shifts by one hour in New York time (see Gaps).
- The last-half-hour momentum result is about the sign of the return, measured on futures, and is the best-documented time-of-day regularity found here; it is a statistical tendency in a 1974-2020 sample, not a win rate.

### Gaps
- No published hourly realised-volatility table for NQ covering all 23 hours with a stated sample; the Astreka table is the only source and its sample period is unknown. The London window (03:00-07:00) and evening hours before 23:00 have no figures at all.
- No measured size of the typical move at 03:00, at 09:30, at 10:00 data, at the 11:30 European close, at 14:00, or in the last hour for NQ. No published measurement of the NQ reaction to the 15:50 imbalance.
- Daylight-saving offsets (US clocks changed 1 November 2026 and change 14 March 2027; Europe changed 25 October 2026 and changes 28 March 2027, so European opens arrive one hour later in New York time during those gap weeks) are calendar-rule knowledge that I could not source in this session.
- Gao, Han, Li and Zhou's first-half-hour-predicts-last-half-hour result was not retrieved.

## 4. Scheduled events: which releases move NQ, when, and by how much

### Takeaway
Published measurements are thin and mostly not on NQ futures: the best figures are a median 30-minute Nasdaq-100 range of 0.72% after CPI (38 releases), a median first-hour range about twice normal after payrolls (six releases, CFD data), and average NDX one-day moves of about 1.8% on payroll days versus 1.1% on ordinary days. FOMC days were unusually quiet in 2025 (average NDX move 0.39%).

### Cited Findings
- CPI: median 30-minute high-to-low range after the release was 0.72% for the Nasdaq-100 (38 releases) versus 0.53% for the S&P 500 (37 releases). — [TradingCipher CPI reaction page](https://tradingcipher.com/cpi/)
- CPI, NQ futures (single GitHub project): the per-minute move jumps to about 17 basis points one minute after the release, peaks at about 51 basis points two minutes after, and decays to about 5-8 basis points within 15-20 minutes. Sample and definitions not verified. — [zsargeant/cpi-futures-execution](https://github.com/zsargeant/cpi-futures-execution)
- NFP: across six recent payrolls releases, the median first-hour range of the Nasdaq-100 (NAS100 CFD, not the future) was 197 points, about twice a normal weekday's 94 points; individual ranges ran from about 112 to 246 points. Published 5 November 2026. — [FXStreet NFP stress test](https://www.fxstreet.com/analysis/nfp-stress-test-six-payrolls-releases-measured-in-daily-loss-limits-202611050906)
- NFP, one-day: the average NDX move over the previous twelve payroll reports was +/-1.79%, 69 basis points above the +/-1.10% average daily move over the same period (article date not in excerpt). — [Nasdaq, NDX option pricing around FOMC and payrolls](https://www.nasdaq.com/articles/nasdaq-100-index-and-option-pricing-around-fomc-and-payroll-reports)
- FOMC, one-day: average NDX move over the previous twelve FOMC days was +/-0.83% in one article and +/-0.98% in a later one covering a different window; in 2025 only one FOMC-day NDX move exceeded 1% (19 March) and the 2025 average was +/-0.39%. — [Nasdaq, FOMC reactions favour option sellers](https://www.nasdaq.com/articles/recent-fomc-reactions-have-favored-ndx-option-sellers); [Nasdaq, FOMC reactions more like non-reactions](https://www.nasdaq.com/articles/recent-ndx-fomc-reactions-more-non-reactions)
- ES, 2001-2006 (old): non-farm payrolls and similar releases had the greatest impact on volatility, with an average absolute net change of 9.8 basis points compared with the overall average. The measurement window was not in the excerpt. — [CME, Impact of Economic Indicators on CME Group Markets](https://www.cmegroup.com/education/files/Economic-Indicators-WhitePaper.pdf)
- Release-minute volatility was far above normal for CPI, NFP and FOMC in an SPY-based event study (not futures). — [ryzhokhin/cpi-fomc-event-study](https://github.com/ryzhokhin/cpi-fomc-event-study)
- Example: on 14 October 2026 CME reported E-mini Nasdaq-100 futures dropping after a hot CPI print. — [CME video, 14 Oct 2026](https://www.cmegroup.com/videos/2026/10/14/e-mini-nasdaq-100-futures-drop-as-hot-cpi-data-pressures-tech-1.html)
- Earnings after the close: after Nvidia's report on the evening of 17 November 2026, Nasdaq-100 futures were reported up 1.4% in the overnight session by one source and about 0.8% by another, and up 1.11% at 4:30 a.m. ET the next morning; one analysis says NQ traded about 35% more contracts than its recent European-morning average. The sources conflict and may describe different timestamps. — [Yahoo Finance](https://finance.yahoo.com/markets/stocks/articles/futures-climb-nvidia-earnings-boost-101949738.html); [investingLive](https://investinglive.com/stocks/nasdaq-analysis-after-the-much-anticipated-nvidia-earnings/); [MC Markets](https://www.mcmarkets.com/en/insights/nasdaq-futures-rise-nvidia-108-billion-outlook)
- CME itself markets NQ's overnight liquidity around Nvidia earnings released after the US close. — [CME Group on X](https://x.com/CMEGroup/status/2026658441972912438)

### Inferences
- 0.72% of an index near 25,000 is roughly 180 NQ points, or about $360 per MNQ contract, in the 30 minutes after CPI. I have not verified the index level; the point is the order of magnitude: a CPI half-hour is comparable to a full normal morning hour (about 150 points on the Astreka table).
- The GitHub CPI profile, if accurate, means most of the excess volatility is gone within 15-20 minutes. A trader whose data is 10 minutes late sees the release move only after most of it has happened.
- Releases at 08:30 ET fall outside all four of the reader's windows, but their aftermath sets the 09:30 open. FOMC (statement and press conference) and 10:00 releases fall inside the windows.
- Megacap earnings land in the first hours of the reader's evening window, when volume is otherwise lowest; the Nvidia example shows moves of around 1% in thin conditions.

### Gaps
- Exact release times were not sourced in this session. Standard times from background knowledge, to be confirmed against the BLS, BEA, Census, ISM and Federal Reserve calendars: CPI, payrolls, PCE, retail sales and weekly jobless claims at 08:30 ET; ISM at 10:00 ET; FOMC statement at 14:00 ET and press conference at 14:30 ET.
- No published average absolute move for NQ futures in the 1, 5 or 30 minutes after NFP, FOMC statement, FOMC press conference, PCE, ISM, retail sales or jobless claims. A ranking of releases by NQ impact was not found.
- No systematic study of megacap earnings and the NQ evening session; only single-event news reports.
- The arXiv paper "Returns and Order Flow Imbalances: Intraday Dynamics and Macroeconomic News Effects" (arXiv 2508.06788) looked relevant but could not be read.

## 5. Market participants and order flow; stops and "liquidity sweeps"

### Takeaway
CFTC staff work shows index futures are dominated by automated, short-horizon flow: in NQ about half of automated volume executes within 5 seconds and almost 60% of trading within one minute is non-directional. The only peer-reviewed order-level evidence on stop clustering is from currency markets (Osler 2003), and the first formal test of the ICT "manipulation" sweep model on NQ (arXiv, 2026) finds the pattern fires on 44% of days with, on the excerpt available, no clear directional value beyond a trend baseline.

### Cited Findings

**Who trades**
- In the E-mini Nasdaq-100, roughly half of automated volume executes within 5 seconds versus about a quarter of manual volume; almost 60% of trading within one minute is non-directional, meaning positions are more likely than not to be closed within a minute. — [Haynes and Roberts, CFTC, Automated Trading in Futures Markets (2015)](https://www.cftc.gov/sites/default/files/2019-04/ATS_White_Paper_2015_ada.pdf)
- October 2012-October 2014: algorithmic trading systems were present on at least one side in 62% of equity futures volume (CFTC figures cited by the Congressional Research Service). — [CRS report R44443](https://www.everycrsreport.com/reports/R44443.html)
- In the second update (26 March 2019), the E-mini Nasdaq-100 was the only product that showed a decrease in automated trading. — [CFTC, Automated Trading update #2](https://www.cftc.gov/sites/default/files/2019-04/ATS_2yr_Update_Final_2018_ada.pdf)
- A CFTC staff report on 30 futures contracts, January 2013-December 2018, found the share of automated orders rose in all markets studied; automated orders are smaller, rest for less time and are almost always limit orders; it found little impact on longer-term volatility. — [CFTC staff report, March 2019](https://www.cftc.gov/sites/default/files/2019-03/automatedordersreport032719.pdf); [National Law Review summary](https://natlawreview.com/article/cftc-staff-issues-research-report-impact-automated-orders-commodity-futures-markets)
- Secondary blog claim, unverified against the original: for November 2016-October 2018, large automated traders were 56.5% of E-mini Nasdaq-100 volume. — [Pterido Substack](https://pterido.substack.com/p/giants-algorithms-and-ants-who-really)
- Flash-crash audit-trail study of ES (6 May 2010 and the three prior days): 16 accounts classed as high-frequency traders and 179 as intermediaries; HFTs accounted for about 34% of ES volume on the surrounding days (secondary citation); about 46% of HFT volume was aggressively executed; HFTs did not trigger the crash but their response to heavy selling exacerbated volatility. — [Kirilenko, Kyle, Samadi, Tuzun, Journal of Finance 2017](https://www.repository.cam.ac.uk/handle/1810/304244); [CFTC working-paper version](https://www.cftc.gov/idc/groups/public/@economicanalysis/documents/file/oce_flashcrash0314.pdf)
- The CFTC publishes weekly Traders in Financial Futures reports that cover the CME Nasdaq-100 contracts; the 3 November 2026 futures-only file exists. — [CFTC TFF report, 3 Nov 2026](https://www.cftc.gov/files/dea/cotarchives/2026/futures/financial_lf110326.htm)

**Stops, resting orders and sweeps**
- Currency markets, order-level data from a large dealing bank: requested execution rates cluster strongly at round numbers; stop-loss orders cluster just beyond round numbers while take-profit orders cluster at them. This is offered as an explanation for why trends tend to reverse at support/resistance and move unusually fast after crossing it. — [Osler, Journal of Finance 2003](https://econpapers.repec.org/RePEc:bla:jfinan:v:58:y:2003:i:5:p:1791-1819); [NY Fed Staff Report 125](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr125.pdf)
- Stop-loss execution at one level can propel rates to new levels and trigger more stop-loss orders ("price cascades"); the author notes that the statistics cannot prove the link is causal. — [Osler, Stop-Loss Orders and Price Cascades, NY Fed Staff Report 150](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr150.pdf)
- First systematic test of the ICT Accumulation-Manipulation-Distribution model on NQ futures: the "manipulation" signal fires on 44% of trading days; results are robust to breach thresholds of 5-20 NQ points; one excerpt indicates no marginal directional predictive value beyond a simple trend-following baseline, while trending-regime cells survive multiple-testing correction. The headline conclusion was not fully visible. — [Taylor, arXiv 2610.35887](https://arxiv.org/abs/2610.35887); [SSRN version](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7150238)
- Vendor test, 10 years of NQ daily data (2,515 sessions): after a sweep of the previous day's high, the next day closed lower 46.9% of the time versus 43.6% for any day. — one of [RIP Backtest](https://ripbacktest.com/posts/liquidity-sweep-reversal-strategy-nq/) / [Phidias](https://phidiaspropfirm.com/education/liquidity-sweep) (vendor)
- Vendor test, 502 ES/NQ sessions: NQ swing highs that were swept closed back inside 40.32% of the time (25 of 62) versus a 43.21% baseline, so swept highs did not reverse more often than ordinary breaks. — [Tradeify ICT base rates](https://tradeify.co/education/ict-trading-concepts-explained) (vendor, small sample)

### Inferences
- Most of the liquidity resting near prior highs and lows is short-lived automated limit orders, not a visible pool of retail stops. Nothing in the CFTC work identifies who triggers moves through prior extremes.
- Osler's result makes the mechanism behind "liquidity sweeps" plausible (stops do cluster beyond obvious levels and their execution can accelerate price), but it is for 1990s-2000s currency dealing, and it predicts acceleration after the break at least as much as reversal.
- A "sweep" that occurs on 44% of days is close to a base-rate event. The small vendor tests found swept levels reverse no more often than chance, or only about 3 percentage points more often. On current evidence a sweep by itself is not an edge.
- For a manual trader on delayed data, the 5-second execution horizon of automated flow means any reaction to a level break is priced long before a 10-minute-late chart shows it.

### Gaps
- Current (2019-2026) share of NQ or MNQ volume from automated or high-frequency accounts: no CFTC or CME figure found after the 2019 update.
- Trader-category positions in the Nasdaq-100 TFF report for November 2026 (dealer, asset manager, leveraged funds, other reportable, non-reportable): the report was located but its figures were not visible. TFF covers positions held, not who does intraday volume.
- No study of the retail share of MNQ volume, and no order-level study of stop-order placement in index futures.
- CME's own stop-logic and velocity-logic safeguards against stop cascades could not be sourced (search budget exhausted).

## 6. Reference levels: prior-day high/low, overnight high/low, opening range, initial balance, VWAP, round numbers

### Takeaway
Touch rates are very high and therefore uninformative: vendor counts say NQ's regular session breaks the overnight high or low on about 94% of days and reaches a prior-day extreme on about 90%, and the first-hour range is broken on about 96%. What is informative is the conditional detail (both sides broken on roughly a quarter of days; median extension about 56% of the first-hour range). Academic support exists for opening-range and VWAP trend strategies on QQQ, but one replication found net results near zero after costs.

### Cited Findings

**Overnight high/low**
- 2,827 NQ days, 2015-2025: the regular session breaks only the overnight high on about 38.7% of days, only the overnight low on about 32.6%, and both on 22.9%; so at least one side breaks on about 94%. If the overnight high breaks first there is roughly a 1-in-4 chance the session also takes the overnight low, and vice versa. — [TradingStats overnight range study](https://tradingstats.net/overnight-high-low-breakout-strategy/) (vendor)

**Prior-day high/low**
- NQ reaches a prior-day extreme on 89.5% of sessions and ES on 90.8%; the source stresses that reaching a level is not the same as reversing from it. — one of [Tradeify ICT base rates](https://tradeify.co/education/ict-trading-concepts-explained) / [Phidias](https://phidiaspropfirm.com/education/liquidity-sweep) (vendor)
- Reversal after a prior-day-high sweep: next-day lower close 46.9% versus 43.6% baseline (2,515 NQ sessions). — one of [RIP Backtest](https://ripbacktest.com/posts/liquidity-sweep-reversal-strategy-nq/) / [Phidias](https://phidiaspropfirm.com/education/liquidity-sweep) (vendor)

**Initial balance (first hour, 09:30-10:30)**
- 2015-2025 (2,686 ES days, 2,833 NQ days): 97.8% of ES days and 96.2% of NQ days see at least one initial-balance breakout by the close; on NQ the median extension is 55.6% of the initial-balance range; 17.3% of NQ days had no breakout by noon and 21.8% of those stayed unbroken to the close; both sides break on 22.6% of NQ sessions. — [TradingStats initial balance statistics](https://tradingstats.net/initial-balance-breakout-statistics/) (vendor)
- A second site, 2,571 qualifying NQ days: 96.1% breach either side by the close and 82.5% by noon. — [NQStats](https://nqstats.com/ib_breaks) (vendor)
- A third dashboard, 10 years: only 0.6% of days stay inside the initial balance; both sides break on 40.1% of ES days and 23.5% of NQ days. The 0.6% figure conflicts with the 3.8% (NQ) and 2.2% (ES) above. — [Trevor Trades dashboard](https://trevor-trades.vercel.app/analysis); contradicted by [TradingStats](https://tradingstats.net/initial-balance-breakout-statistics/)
- Recent six months (127 New York sessions): a single-sided break of the 60-minute initial balance on 79.53% of NQ days (101 of 127) and 74.02% of ES days. — [Edgeful](https://www.edgeful.com/blog/posts/nq-futures-trading) (vendor)
- 12 years of NQ data (TradingView script): median extension +0.31% above the initial-balance high and -0.38% below the low; 75th percentile about +0.60% and -0.79%. — [Initial Balance Statistical Mapping script](https://www.tradingview.com/script/2iuvi66N-Initial-Balance-Statistical-Mapping/) (community script)
- A forum commenter argues that 1:1 trades in the direction of an initial-balance break lose more than half the time. — [Reddit r/FuturesTrading](https://lr.eu.psf.lt/r/FuturesTrading/comments/1bycosx/this_is_how_ess_price_moves_70_of_the_time) (anecdote)

**Opening range**
- Zarattini and Aziz test a 5-minute opening-range breakout on QQQ for 2016-2023: trade in the direction of the first 5-minute bar from the start of the second bar, no trade if the first bar is flat. One summary reports 33.2% CAGR versus 14.9% for buy-and-hold QQQ (January 2016-February 2023, 1,795 trades, zero slippage assumed). — [SSRN 4416622](https://papers.ssrn.com/abstract=4416622); [CXO Advisory summary](https://www.cxoadvisory.com/technical-trading/day-trading-with-an-opening-range-breakout-strategy)
- The authors' follow-up states the same signals on TQQQ would have earned 1,484% between 2016 and 2023 versus 169% for passive QQQ. — [Concretum Group](https://concretumgroup.com/can-day-trading-really-be-profitable/)
- A replication on five index CFDs reports that gross results reproduced but net results were roughly zero after costs. — [MQL5 blog replication](https://www.mql5.com/en/blogs/post/776235)
- A QuantInsti article says removing a single Monday makes the classic version lose money, suggesting dependence on a few days. — [QuantInsti](https://www.quantinsti.com/articles/opening-range-breakout-strategy/)

**VWAP**
- Zarattini and Aziz: a rule that is long above session VWAP and short below it, on QQQ from January 2018 to September 2023, would have grown $25,000 to $192,656 net of commissions. Authors' own backtest on an ETF, not futures. — [Concretum Group VWAP paper](https://concretumgroup.com/volume-weighted-average-price-vwap-the-holy-grail-for-day-trading-systems/)

**Round numbers**
- The order-level evidence is from currencies: take-profit orders cluster at round numbers and stop-loss orders just beyond them. — [Osler, Journal of Finance 2003](https://econpapers.repec.org/RePEc:bla:jfinan:v:58:y:2003:i:5:p:1791-1819)

### Inferences
- A level that is touched on 90-96% of days cannot by itself be a signal. The usable information is conditional: once one side of the overnight range or initial balance has broken, the other side breaks on only about a quarter of days, which is a base rate against fading the first break back to the opposite extreme.
- The median extension of roughly half the first-hour range gives a realistic size for a target beyond an initial-balance break; the 75th-percentile figures show the distribution has a long tail.
- The opening-range and VWAP papers are trend-following results on QQQ with optimistic or zero slippage assumptions, during a strongly trending 2016-2023 period. The CFD replication's "gross yes, net zero" is the result most relevant to a retail trader paying real costs.
- All vendor statistics above are close-to-close or touch-based counts on continuous contracts; none tells the reader the win rate of a specific entry with a stop.

### Gaps
- No peer-reviewed study of prior-day high/low, overnight high/low or initial balance as support/resistance in NQ or ES futures.
- No study of round numbers (for example 100- or 250-point levels) in NQ futures; the search for index-futures evidence did not execute before the budget ran out.
- No independent test of VWAP "hold" or "reject" rates in futures.
- Hold-versus-break statistics with explicit entry, stop and target rules were not found for any level.

## 7. Market Profile / volume profile concepts with documented statistics

### Takeaway
The "80% rule" does not test at 80%: trader and forum backtests cluster around 60-62%, and one vendor's 589-session ES/NQ test found 25-28%, no better than its base rate. Initial-balance extension frequencies are the best-documented Market Profile statistic (see section 6); I found no independent academic test of any Market Profile rule.

### Cited Findings
- 589-session test on ES and NQ: the 80% rule "hit 25.00% and 28.13%, no better than its base rate". Methodology not verified. — [Tradeify market profile guide](https://tradeify.co/education/market-profile) (vendor)
- A Market Profile dictionary entry says testing on the E-mini S&P 500 suggests the rule works about 60% of the time and "might be better named the 60% rule" (unsourced claim). — [MyPivots 80% rule](https://www.mypivots.com/dictionary/definition/25/80-rule)
- A forum-quoted backtest: 120 days where price opened outside value and closed the first 30 minutes back inside; 75 reached the other side of value (62.5%). The same thread notes another backtest gave different results. — [NexusFi thread](https://nexusfi.com/showthread.php?p=910061)
- A TradeStation test reported completion rates closer to 62%; a separate analysis concludes "the 80% figure dissolves under rigorous testing". — [NexusFi 80% rule concept page](https://nexusfi.com/a/concepts/80-percent-rule)
- Initial-balance extension base rates (NQ: break on about 96% of days, median extension 55.6% of range, both sides on 22.6%). — [TradingStats](https://tradingstats.net/initial-balance-breakout-statistics/) (vendor)
- An older ES study (1,441 days ending October 2017) tabulates the percentage of days the initial balance was extended up or down and how often extensions reached 50% and 100%; the numbers were not visible in the excerpt. — [Linnsoft](https://linnsoft.com/homework)

### Inferences
- Results for the 80% rule range from about 25% to about 62% depending on how "acceptance" inside value and the target are defined. A rule whose measured rate depends that much on definitions should be treated as unproven until the reader tests one fixed definition on NQ.
- None of the tests reports the payoff ratio, so even a 60% completion rate does not establish profitability after the roughly 2-point round-trip cost discussed in section 2.

### Gaps
- No peer-reviewed or otherwise independent test of value-area rules, point of control, single prints or day-type classifications in index futures.
- Linnsoft's ES extension table and the full Tradeify methodology could not be read.

## 8. Practical effect of 10-minute-delayed data; cost of real-time data

### Takeaway
Real-time CME top-of-book data costs a non-professional about $12 a month for the four-exchange bundle (or $4 for CME alone) at Tradovate/NinjaTrader and roughly $7 to $10 a month on TradingView; set against that, a 10-minute-old price in the New York morning is plausibly stale by tens of NQ points (my estimate: around 60 points of range, or $120 per MNQ contract). No published statistic gives the 10-minute NQ move by time of day directly.

### Cited Findings

**Real-time data cost (late 2026)**
- Tradovate (NinjaTrader's brokerage) non-professional rates: CME Group bundle (CME, CBOT, COMEX, NYMEX) $12 a month for Level 1 (top of book) and $48 a month for Level 2 (depth); a single exchange is $4 and $16; professional CME data is $156 a month per exchange. Chart traders typically need only Level 1. — [Tradovate non-professional data rates](https://support.tradovate.com/s/article/How-Can-I-Find-Non-Professional-Monthly-Data-Rates?language=en_US); [Tradovate account and exchange fees](https://support.tradovate.com/s/article/Account-and-Exchange-Fees?language=en_US)
- Third-party sites say a funded Tradovate account on a current plan receives Level 1 CME Group data at no charge (secondary; confirm with the broker). — [QuantVPS Tradovate review](https://www.quantvps.com/blog/tradovate-review)
- TradingView: its CME page lists the CME, CBOT, COMEX and NYMEX real-time package at $7.00 a month, while a review checked on 10 October 2026 gives $9.95 a month for non-professionals. The two conflict. — [TradingView CME page](https://tradingview.com/cme); contradicted by [QuantVPS TradingView pricing](https://www.quantvps.com/blog/tradingview-pricing)
- TradingView exchange fees are not included in any plan, and the free Basic plan cannot add data subscriptions; professionals pay far more. — [QuantVPS TradingView pricing](https://www.quantvps.com/blog/tradingview-pricing)
- A third-party 2026 summary gives CME's own non-professional top-of-book fee as $1.55 a month per exchange and $4.65 for the four-exchange bundle; vendors charge more than this. Unverified against CME's fee list. — one of [NexusFi exchange data fees](https://nexusfi.com/a/data/exchange-data-fees-market-data-costs) / [Thor Trade Copier](https://thortradecopier.com/blog/free-real-time-futures-data); CME's own schedule: [June 2026 market data fee list](https://www.cmegroup.com/market-data/files/june-2026-market-data-fee-list.pdf)

**How far NQ moves (proxies only)**
- Median NQ hourly range: about 150-155 points in the 09:00 and 10:00 ET hours, 107 at 11:00, 91 at noon, 32-34 around 23:00-00:00. — [Astreka](https://www.astreka.com/market-insights/the-best-and-worst-times-to-trade-nasdaq-futures)
- Normal 5-minute ATR(14) for NQ: 20-45 points. — [Volatility Box](https://volatilitybox.com/research/nq-futures-volatility/)
- After CPI the median 30-minute Nasdaq-100 range is 0.72%. — [TradingCipher](https://tradingcipher.com/cpi/)
- Half of automated NQ volume executes within 5 seconds. — [CFTC, Haynes and Roberts 2015](https://www.cftc.gov/sites/default/files/2019-04/ATS_White_Paper_2015_ada.pdf)

### Inferences
- Rough estimate, clearly not a published figure: if range scales with the square root of time, a 10-minute range is about 41% of an hourly range. On the Astreka medians that is about 60-63 NQ points in the 09:00 and 10:00 hours ($120-$126 per MNQ contract), about 37-44 points from 11:00 to noon, and about 13-14 points near midnight ($26-$28). The 5-minute ATR of 20-45 points is consistent with this order of magnitude for New York hours.
- So in the New York morning the price on a 10-minute-delayed chart is typically wrong by an amount larger than most intraday stop distances, and far larger than the 2-point round-trip cost. In the late-evening window the staleness is smaller in points but so are the moves being traded.
- Consequences of delayed data: a level "about to be tested" on the chart has usually already been tested; stops cannot be placed relative to current price with any precision; market orders fill at a price unrelated to the chart; and news reactions (most of which decay within 15-20 minutes on the CPI evidence) are largely over before they appear.
- At $4-$12 a month, real-time data costs less than the expected staleness on a single one-lot MNQ trade in New York hours (about $120 on the estimate above). This is the single cheapest improvement available to the reader.
- Many brokers show real-time prices in the order ticket or DOM even when a separate charting site is delayed; whether the reader's broker does so was not checked.

### Gaps
- No published distribution of 10-minute NQ price changes by time of day; the reader could compute it directly from 1-minute history in an afternoon.
- TradingView's current price ($7.00 vs $9.95) needs checking on the live site, which was unreachable; I also could not confirm the exact delay TradingView applies to CME futures.
- NinjaTrader desktop platform data pricing was only seen via the shared Tradovate support article.
- CME's January 2027 fee list exists ([link](https://www.cmegroup.com/market-data/files/january-2027-market-data-fee-list.pdf)) but could not be read, so any fee change from January 2027 is unknown.

## 9. US holiday hours in late 2026 and evidence on holiday-shortened sessions

### Takeaway
Third-party calendars agree that equity index futures halted at 13:00 ET on Thanksgiving (Thursday 26 November 2026), reopened at 18:00 ET, and close early at 13:15 ET on Friday 27 November; Christmas Eve is an early close (13:15 ET per most sources), Christmas Day and New Year's Day are closed, and New Year's Eve is a normal session. One ten-year NQ study puts day-after-Thanksgiving activity at about half of normal. None of these times could be confirmed on CME's own page in this session.

### Cited Findings

**Hours (CT as published; ET = CT + 1 hour)**
- CME's holiday calendar lists the Thanksgiving period as 26-28 November 2026, notes the schedule is subject to change, and publishes a separate holiday settlement-times PDF. The product hours were not visible in the excerpt. — [CME holiday and trading hours](https://www.cmegroup.com/trading-hours.html); [CME Thanksgiving 2026 settlement times PDF](https://www.cmegroup.com/tools-information/holiday-calendar/files/2026/thanksgiving-holiday-settlement-times-2026.pdf)
- Thursday 26 November 2026 (Thanksgiving): equity index futures halt at 12:00 p.m. CT (1:00 p.m. ET) and reopen at 5:00 p.m. CT (6:00 p.m. ET); no settlement prices that day. — [MarketFramework](https://www.marketframework.com/tools/futures-holiday-hours); [EdgeClear](https://edgeclear.com/exchange-holiday-hours/); [QuantVPS](https://www.quantvps.com/market-hours/thanksgiving)
- Friday 27 November 2026 (day after Thanksgiving): equity index futures close early at 12:15 p.m. CT (1:15 p.m. ET); Globex reopens Sunday 29 November at 5:00 p.m. CT (6:00 p.m. ET). — [EdgeClear](https://edgeclear.com/exchange-holiday-hours/); [MarketFramework](https://www.marketframework.com/tools/futures-holiday-hours); [CalendarHours](https://calendarhours.com/cme-holiday-hours/); [DamnPropFirms](https://damnpropfirms.com/trading-guides/cme-holiday-schedule/)
- Thursday 24 December 2026 (Christmas Eve): equity index and rates close at 12:15 p.m. CT (1:15 p.m. ET). One site hedges this as "likely around 12:15", and another gives an early settlement at 12:00 p.m. CT (1:00 p.m. ET), which may be the settlement time, not the close. — [MarketFramework](https://www.marketframework.com/tools/futures-holiday-hours); [ChartWatch](https://chartwatch.tv/cme-holiday-schedule); [HelloWeekends](https://www.helloweekends.com/hours/cme-holiday-calendar-2026)
- NYSE lists an early close on Thursday 24 December 2026. — [NYSE hours and calendars](https://www.nyse.com/trade/hours-calendars)
- Friday 25 December 2026 (Christmas Day): closed; trading resumes Sunday 27 December at 5:00 p.m. CT (6:00 p.m. ET). — [MarketFramework](https://www.marketframework.com/tools/futures-holiday-hours)
- Thursday 31 December 2026 (New Year's Eve): regular session, normal 4:00 p.m. CT (5:00 p.m. ET) close. — [Discount Trading](https://www.discounttrading.com/futures-holiday-schedule.html)
- Friday 1 January 2027 (New Year's Day): closed; Globex does not reopen that evening and resumes Sunday 3 January at 5:00 p.m. CT (6:00 p.m. ET). — [CrossTrade 2027 calendar](https://crosstrade.io/blog/cme-trading-hours-2027)

**Volume and volatility in holiday sessions**
- Ten years of NQ futures compared with normal days: the day after Thanksgiving is the quietest holiday-adjacent session, with ratios of 0.49x for NQ, 0.40x for ES, 0.44x for YM and 0.62x for RTY; on Thanksgiving Day itself the New York morning runs at 0.23x for both NQ and ES. The excerpt did not define the metric (range or volume). — [Quarter Sequence](https://quartersequence.com/blog/us-market-holidays-ranked/) (vendor)
- Over 11 years the median volume on the day after Thanksgiving was about 37% of the prior 20-day average, mostly within 35-45%; no consistent directional tendency. The excerpt did not say which market. — [KuCoin market note](https://www.kucoin.com/news/flash/u-s-market-sees-low-volume-after-thanksgiving-hong-kong-bounces-but-faces-selling-pressure)

### Inferences
- Today (Friday 27 November 2026) is itself the shortened session: of the reader's four windows, only 03:00-07:00 and 09:30-12:00 are fully open, and the 12:00-16:00 window is cut to 12:00-13:15. On Thanksgiving the 09:30-12:00 window traded in a market running at roughly a quarter of normal.
- On Christmas Eve the same applies: the 12:00-16:00 window ends at about 13:15 ET and there is no evening session; the next evening session is Sunday 27 December. On New Year's Eve all windows trade normally until 17:00, but there is no evening session on 31 December or 1 January.
- Activity at half or a quarter of normal implies thinner books and wider effective spreads, which makes stop slippage and stale delayed quotes worse relative to the size of the moves on offer. This follows from the activity ratios; no direct holiday spread measurement was found.

### Gaps
- None of the holiday times was confirmed on CME's own calendar, because cmegroup.com was unreachable. The 12:15 versus 12:00 CT discrepancy for Christmas Eve is unresolved. CME finalises hours about two weeks before each holiday.
- Whether Thursday 31 December 2026 has a normal 18:00 ET reopen (sources say it does not reopen until Sunday 3 January) should be confirmed on CME's calendar.
- No measured spread, depth or slippage data for holiday-shortened futures sessions; the Quarter Sequence metric needs its definition checked.
