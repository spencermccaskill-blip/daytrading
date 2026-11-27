# Academic and quantitative evidence on intraday return patterns in US equity index futures (ES, NQ, MES, MNQ), as of November 2026

**Read this first (method limits).** Page fetching was blocked in this session for every host tried (libertystreeteconomics.newyorkfed.org, www.newyorkfed.org, www.mql5.com, www.cxoadvisory.com, concretumgroup.com, www.skidmore.edu), and the web-search budget ran out before the last query. Every number below therefore comes from search-result extracts of the cited page (abstracts, snippets, README summaries), not from a full read of the PDF. Numbers are reported exactly as the extract gave them. Where the extract did not give a number, it is listed under Gaps and not estimated. Source grade is marked on each line: **[PR]** peer-reviewed journal article, **[WP]** working paper or preprint, **[CB]** central-bank blog/staff note, **[BLOG]** blog, Substack, GitHub repository, forum or vendor page.

---

## 1. "The Overnight Drift" (Boyarchenko, Larsen, Whelan): what is the finding, and has it persisted?

### Takeaway
The published finding is a positive return in E-mini S&P 500 futures concentrated in the 02:00-03:00 ET hour (European open), about 3.7% a year (1.48 bp a day) over 1998-2019, strongest after end-of-day sell-offs. The same authors reported on 1 July 2026 that this hour has averaged close to zero since 2021, in ES, NQ and YM alike, so as of November 2026 it is a decayed effect, not a live one.

### Cited Findings
- [PR] Published as Boyarchenko, Larsen, Whelan, "The Overnight Drift," Review of Financial Studies 36(9), September 2023, pp. 3502-47; earlier NY Fed Staff Report 917 (first issued February 2020, revised August 2022) and CEPR DP 14462. — [NY Fed Staff Report 917](https://www.newyorkfed.org/research/staff_reports/sr917); [EconPapers record](https://econpapers.repec.org/RePEc:fip:fednsr:87539)
- [PR/WP] Abstract-level result: the 02:00-03:00 ET return averages 3.7% annualized (1.48 basis points per day); positive in 20 of 23 years since 1998 and statistically significant in 17 of them. — [CEPR DP 14462](https://cepr.org/publications/dp14462); [NY Fed sr917 PDF](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr917.pdf)
- [CB] The 2021 Liberty Street post states the largest positive returns in the 1998-2019 sample accrued between 2 a.m. and 3 a.m. ET (opening of European stock markets) and averaged 3.6 percent annualized. Note the 3.6 vs 3.7 difference between the blog and the paper abstract. — [Liberty Street Economics, May 2021](https://libertystreeteconomics.newyorkfed.org/2021/05/the-overnight-drift-in-us-equity-returns)
- [WP] One abstract version states "almost 100% of the U.S. equity premium is earned during a 1-hour window between 2:00 a.m. and 3:00 a.m. (ET)". — [SSRN 3560269](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3560269)
- [PR] Mechanism: the drift is attributed to overnight resolution of order imbalances left from the end of the previous US trading day (dealer inventory management). There is a strong negative relationship between end-of-day order imbalance and the overnight return. Macro, monetary-policy and earnings announcements do not explain it. — [CBS accepted version](https://research-api.cbs.dk/ws/portalfiles/portal/101311522/nina_boyarchenko_et_al_the_overnight_drift_acceptedversion.pdf); [CBS Research Portal](https://research.cbs.dk/en/publications/the-overnight-drift/)
- [PR] Asymmetry: market sell-offs generate robust positive overnight reversals; reversals after rallies are much more modest. Positive volatility shocks raise the chance that dealer constraints bind, magnifying the effect during sell-offs. — [CBS accepted version](https://research-api.cbs.dk/ws/portalfiles/portal/101311522/nina_boyarchenko_et_al_the_overnight_drift_acceptedversion.pdf)
- [PR] The same staff report notes that negative autocorrelation in e-mini returns is significant for at most 30 minutes and usually lasts only a couple of minutes, because the market is so liquid. — [NY Fed sr917 PDF](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr917.pdf)
- [CB/WP] Post-publication: "The Disappearing Overnight Drift" (Boyarchenko, Larsen, Whelan, Liberty Street Economics and SSRN, dated 1 July 2026) reports returns have been flat at the European open in 2021-25; the 02:00-03:00 window that previously generated roughly 3.7 percent per annum has averaged close to zero since 2021. — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/); [SSRN 7035838](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7035838); [IDEAS record](https://ideas.repec.org/p/fip/fednls/103479.html)
- [CB] The same weakening appears in E-mini Nasdaq-100 (NQ) and E-mini Dow (YM) futures. — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- [CB] Liquidity is not the explanation offered: the overnight share of total E-mini volume moved only from 15 percent to 16 percent. — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- [CB] The authors test three channels: dispersion of closing order imbalances, the level of return variance, and the risk-bearing capacity of liquidity providers. They state that if order-imbalance dispersion widens back toward its pre-2020 range, the drift should reappear in the same window. — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- [BLOG] A Substack summary says the evidence points to the first channel (compression of the inventory shock arriving at the close). This wording was not confirmed against the Fed post. — [Avaneendra Substack](https://avaneendra.substack.com/p/the-stock-market-paid-37-a-year-in)

### Inferences
- The documented hour (02:00-03:00 ET) ends exactly where the reader's London window (03:00-07:00 ET) begins. Even when the effect existed, a trader starting at 03:00 was arriving after it.
- The gross effect was 1.48 bp a day on the unconditional rule. That is small relative to a one-tick-each-way cost on a micro contract (see question 9), so only the conditional version (after a prior-day sell-off with negative closing imbalance) was ever plausibly tradable for a retail account, and that conditional size could not be retrieved here.
- The authors' own conditional statement (drift should return if closing-imbalance dispersion widens) gives a testable regime filter: check the 02:00-03:00 return only on nights following large end-of-day sell-offs, and treat any result on 2021-26 data as the relevant sample.
- European clock time, not New York clock time, anchors the effect (see Bondarenko and Muravyev in question 5), so during the weeks when US and European daylight-saving dates differ the hour shifts in ET.

### Gaps
- The conditional magnitudes (overnight return by closing-order-imbalance bucket, return after sell-offs versus rallies), the paper's trading-strategy Sharpe ratios and its transaction-cost treatment could not be retrieved; the PDFs are at the NY Fed sr917 and CBS links above.
- The exact 2021-25 average return (in bp) and which of the three channels the authors conclude is dominant were not visible in the extracts.
- Whether the paper reports hour-by-hour returns for 18:00-02:00 ET (the reader's evening window) was not confirmed.

---

## 2. Intraday momentum: Gao-Han-Li-Zhou first/last half-hour, Baltussen et al. on futures, and Zarattini-Aziz-Barbon "noise area" momentum

### Takeaway
The first-half-hour-predicts-last-half-hour result (SPY, 1993-2013) and the rest-of-day-predicts-last-30-minutes result (60+ futures, 1974-2020) are peer-reviewed, but the first is statistically small (R-squared about 1.6%) and blog replications disagree on whether it survives after 2013. The Zarattini-Aziz-Barbon noise-area strategy replicates in sample (Sharpe 1.33-1.34) but fell to a Sharpe of 0.39 in the May 2024-March 2026 out-of-sample test on SPY; on NQ futures the independent evidence is positive only after 2018 and fragile to stop slippage.

### Cited Findings
**Gao, Han, Li, Zhou (JFE 2018)**
- [PR] "Market intraday momentum," Journal of Financial Economics 129(2), 2018, pp. 394-414. Sample: S&P 500 ETF (SPY), 1993-2013. Rule tested: the first half-hour return, measured from the previous close, predicts the last half-hour return. Stronger on more volatile days, higher-volume days, recession days and major macro-news days. Also present in ten other heavily traded domestic and international ETFs. — [SSRN 2440866](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2440866); [EconPapers](https://econpapers.repec.org/RePEc:eee:jfinec:v:129:y:2018:i:2:p:394-414)
- [WP] Working-paper figures: predictive R-squared of the first half-hour return for the last half-hour return is 1.6%; adding the twelfth half-hour return raises it to 2.6%; out-of-sample R-squared is 1.2% using the first half-hour return. — [working-paper copy](https://c.mql5.com/forextsd/forum/173/intraday_momentum_-_the_first_half-hour_return_predicts_the_last_half-hour_return.pdf); [Alpha Architect summary](https://alphaarchitect.com/2014/08/attention-prop-traders-the-first-half-hour-of-trading-predicts-the-last-half-hour/)
- [PR] International check: a study of 16 developed markets found significant first-to-last half-hour predictability in 12 of 16 markets. — [Nottingham repository (Li, Sakkas, Urquhart)](https://nottingham-repository.worktribe.com/OutputFile/5273196)
- [BLOG] Replication, post-publication: Dead Signals Lab ("Replication: Intraday Momentum, Eight Years Later") on one-minute bars for SPY, QQQ, IWM, DIA reports that SPY and DIA show a slight intraday reversal (negative, significant coefficient), that SPY, QQQ and DIA do not show the momentum effect in any era, that only IWM shows it, and that the net result is negative in all four. — [Dead Signals Lab](https://deadsignalslab.substack.com/p/replication-intraday-momentum-eight)
- [BLOG] Conflicting replication: a Temperance Capital post is titled "Market intraday momentum replicates on SPY in 2000-2012 and is flat in 2013-2019." Only the title was retrieved. — [Temperance Capital](https://temperancecapital.substack.com/p/market-intraday-momentum-replicates); contradicted on the pre-2013 period by [Dead Signals Lab](https://deadsignalslab.substack.com/p/replication-intraday-momentum-eight)

**Baltussen, Da, Lammers, Martens (JFE 2021)**
- [PR] "Hedging demand and market intraday momentum," Journal of Financial Economics 142(1), October 2021, pp. 377-403. Sample: intraday returns on more than 60 futures (equities, bonds, commodities, currencies), 1974-2020; the S&P 500 futures series runs 1982-04-23 to 2020-05-01. Rule: the return in the last 30 minutes before the close is positively predicted by the return over the rest of the day (previous close to 30 minutes before close). The predictability reverts over the next days. Linked to gamma hedging by option market makers and leveraged-ETF rebalancing. — [SSRN 3760365](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3760365); [author copy](https://academicweb.nd.edu/~zda/intramom.pdf); [EconPapers](https://econpapers.repec.org/RePEc:eee:jfinec:v:142:y:2021:i:1:p:377-403)
- [WP] Related gamma evidence: Dim, Eraker, Vilkov ("0DTEs: Trading, Gamma Risk and Volatility Propagation") find market makers' net gamma is on average positive, negatively related to future intraday volatility, and that positive (negative) market-maker inventory gamma strengthens intraday reversal (momentum). — [SSRN 4692190](https://papers.ssrn.com/sol3/Delivery.cfm/4692190.pdf?abstractid=4692190&mirid=1)
- [WP] Adams et al. ("Do S&P 500 Options Increase Market Volatility? Evidence from 0DTEs") report stronger intraday order-flow reversals, muted momentum returns and lower intraday volatility associated with counter-directional hedging flows. Authorship attribution was inconsistent across the copies found. — [working paper](https://www.jean-sebastienfontaine.com/papers/0dte-options-volatility.pdf); [Quantpedia summary](https://quantpedia.com/do-sp500-0dtes-options-increase-market-volatility/)
- [BLOG, low reliability] A self-published post covering 1,085 SPX sessions (2022-2026) reports the unconditional last-30-minute momentum effect is flat, with a positive slope only on days conditioned on short-gamma. Methodology unverified. — [dev.to post](https://dev.to/firmtape/intraday-momentum-is-dead-in-the-0dte-era-we-measured-it-on-1085-spx-sessions-43g0)
- [WP] Not the same effect, but the same half-hour: Baltussen, Da, Soebhag "End-of-Day Reversal" (SSRN, November 2024) finds individual stocks show cross-sectional reversal in the last 30 minutes; original 1993-2019 sample shows intraday losers beating winners by 3.78 bp a day in value-weighted portfolios (t = 10.69). A 2026 pre-registered arXiv test on S&P 500 stocks finds about 3 bp a day after 2019. This is a single-stock cross-sectional result, not an index-futures rule. — [SSRN 5039009](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=5039009); [arXiv 2611.09286](https://arxiv.org/abs/2611.09286)

**Zarattini, Aziz, Barbon, "Beat the Market" (SPY noise area)**
- [WP] "Beat the Market: An Effective Intraday Momentum Strategy for S&P500 ETF (SPY)," Swiss Finance Institute Research Paper 24-97; first version 10 May 2024, this version 3 February 2025. Not peer-reviewed. — [St. Gallen repository](https://www.alexandria.unisg.ch/handle/20.500.14171/122124); [RePEc rp2497](https://ideas.repec.org/p/chf/rpseri/rp2497.html)
- [WP] Rule: the Noise Area is the space between two time-of-day-dependent boundaries built from the average intraday move recorded over the previous 14 days (volatility multiplier set to 1). Go long when price is above the upper boundary, short when below the lower boundary; boundary checks on the hour and half-hour; VWAP-based trailing stop; flat at the close. — [paper PDF](https://alexandria.unisg.ch/server/api/core/bitstreams/a99aba00-f967-49b3-aceb-f544dc386e0b/content); [Concretum page](https://concretumgroup.com/beat-the-market-an-effective-intraday-momentum-strategy-for-sp500-etf-spy/)
- [BLOG summarising WP] Positions are sized to a 2% daily volatility target, capped at 4x leverage; the paper's slippage assumption is $0.001 per share. — [GitHub: giovannibrusco replication](https://github.com/giovannibrusco/zarattini-2024-momentum-spy)
- [BLOG summarising WP] Reported performance: 19.6% net annualized return, 1.33 Sharpe, -25% maximum drawdown, May 2007-April 2024, with assumed trading frictions. — [CXO Advisory](https://www.cxoadvisory.com/momentum-investing/complex-intraday-time-series-momentum-strategy-applied-to-spy/)
- [WP] Out-of-sample on SPY: Sheimy Paz (Serpa), "Out-of-Sample Evaluation of an Intraday Momentum Strategy for the S&P 500 ETF (SPY)," SSRN, 2 June 2026, IQFeed one-minute data. In-sample replication 2015-2024: 19.8% annualized versus the original 19.6%, Sharpe 1.34 versus 1.33. Out of sample, May 2024-March 2026: about 9.4% total return against roughly 29.5% for SPY buy-and-hold, Sharpe 0.39; the decline in risk-adjusted return is statistically significant (Sharpe test, p < 0.001). — [SSRN 7290621](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7290621); [GitHub repository](https://github.com/PazSheimy/spy-intraday-momentum-oos); [Swedroe write-up](https://larryswedroe.substack.com/p/when-beat-the-market-meets-the-real)
- [BLOG] Futures replication 1 (VigorTas, GitHub): same rules on 16 years of futures data. NQ: +$21,665 per micro contract over 2010-2026 after costs, t-stat 2.74, but almost all of it after 2018; 2010-2017 lost a little. ES: -$867, t-stat -0.20. Post-publication NQ: +$13.90 per day over 585 days, t-stat 1.37 (not significant). Costs assumed: $1.75 commission per round trip plus 1 tick (0.25 points) slippage on every fill. — [GitHub: VigorTas](https://github.com/VigorTas/beat-the-market-replication)
- [WP] Futures replication 2 (Justin Chuk, "Noise-band Intraday Momentum in Nasdaq-100 Futures," SSRN): fixed size of one micro contract. One index point of slippage on stop fills removes 22% of the edge. Three-year block bootstrap 95th-percentile maximum drawdown: $3,406 as backtested, $4,081 under combined lag and slippage. The paper states all intervals are in-sample, no live contract has been traded, and the rule is one of two survivors among 144 preregistered tests on the same archive. — [SSRN 7609644](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7609644)
- [BLOG] Futures replication 3 (Vertex research pull request implementing the Chuk rule): the 2020-2026 window replicates, but the 2005-2019 window is negative (-$3.00 per session, Sharpe -1.46), labelled "DOES NOT HOLD." — [GitHub PR](https://github.com/jeffscottward/vertex-research-public/pull/171)
- [BLOG] Futures replication 4 (giovannibrusco, GitHub): SPY plus Interactive Brokers ES one-minute bars May 2024-July 2026 (nine quarterly contracts, volume-crossover roll); ES-versus-SPY strategy correlation 0.97; a pull-request note states Sharpe 1.02 even at $0.005/share slippage, without making clear which sample that figure refers to. — [GitHub: giovannibrusco](https://github.com/giovannibrusco/zarattini-2024-momentum-spy); partly at odds with the SPY out-of-sample Sharpe of 0.39 in [SSRN 7290621](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7290621)

### Inferences
- For MNQ specifically, the noise-area rule is the only intraday-momentum setup with multiple independent futures replications, and they agree on a pattern: positive on NQ after roughly 2018-2020, zero or negative before, zero on ES. A setup whose whole edge sits in one sub-period of one instrument should be treated as regime-dependent, not structural.
- The published SPY version has now failed a two-year out-of-sample test by a wide margin (Sharpe 1.33 to 0.39). That test covers SPY, not NQ; the NQ post-publication sample (585 days, t = 1.37) is too short to settle the question either way.
- The 0DTE literature gives a plausible reason for decay of late-day momentum at the index level: when dealers are net long gamma, their hedging dampens trends. A gamma-sign filter is the natural conditional test, but the only source showing it works on recent data is a low-reliability blog.
- The first-half-hour signal has an R-squared near 1.6% in the original sample. Even taken at face value this is a tilt, and the two blog replications that exist disagree with each other on the pre-2013 period.

### Gaps
- Gao et al.'s reported timing-strategy return and Baltussen et al.'s strategy Sharpe ratios, coefficients and cost analysis were not visible in any extract; neither paper has peer-reviewed post-2020 out-of-sample evidence that I could find.
- Zarattini-Aziz-Barbon's exact commission assumption, total return, and results by VIX regime and day of week were not retrievable (Concretum's site and the PDF were blocked).
- The Paz out-of-sample maximum drawdown was not in the extracts.
- The Quantitativo ES/NQ implementation (January 2025) was located but its cost-adjusted figures were not retrieved. — [X post](https://twitter.com/quantitativo1/status/1879938515422892233)
- I found no Concretum-authored paper applying the noise area to ES or NQ futures.

---

## 3. Opening range breakout: the Zarattini papers and independent replications on NQ/ES, net of costs

### Takeaway
The 5-minute ORB results come from two non-peer-reviewed working papers on QQQ/TQQQ and on a filtered basket of single stocks (2016-2023). Every independent futures or index replication found in this search reproduces the gross edge and then loses it to costs; the single-stock "Stocks in Play" result depends on the relative-volume filter and does not transfer to an index future.

### Cited Findings
- [WP] Zarattini and Aziz, "Can Day Trading Really Be Profitable? Evidence of Sustainable Long-term Profits from Opening Range Breakout (ORB) Day Trading Strategy vs. Benchmark in the US Stock Market," SSRN 4416622, April 2023. Sample 2016-2023 on QQQ (and TQQQ). Rule: if QQQ rises (falls) during the first 5-minute interval, buy (sell) at the start of the second 5-minute interval. — [SSRN 4416622](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4416622)
- [WP] Reported results: QQQ ORB returned approximately 675% in 7 years net of commissions, annualized alpha 33% net of commissions; a later version states the 5-minute ORB on TQQQ would have earned 1,484% between 2016 and 2023 versus 169% for passive QQQ. — [SSRN 4416622](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4416622); [paper copy](https://static1.squarespace.com/static/5983d931579fb366729580d8/t/643ed6765176b45506e41a01/1681839734183/SSRN-id4416622.pdf)
- [WP] Zarattini, Barbon, Aziz, "A Profitable Day Trading Strategy For The U.S. Equity Market," SSRN 4729284 / Swiss Finance Institute rp2498, 2024. Universe: more than 7,000 US stocks, 2016-2023. "Stocks in Play" = volume in the first 5 minutes today divided by average first-5-minute volume over the previous 14 days. A portfolio of the top 20 Stocks in Play: total net performance over 1,600%, Sharpe 2.81, annualized alpha 36%, versus 198% for passive S&P 500 over the same period. Also compares 15-, 30- and 60-minute opening ranges. — [St. Gallen repository PDF](https://www.alexandria.unisg.ch/server/api/core/bitstreams/3c2989c4-688d-4d78-8a71-f02690990d51/content); [RePEc rp2498](https://ideas.repec.org/p/chf/rpseri/rp2498.html)
- [BLOG] QuantConnect recreation of the Stocks in Play strategy: 2.396 Sharpe and -0.042 beta versus 0.836 Sharpe for buy-and-hold SPY. — [QuantConnect research post](https://www.quantconnect.com/research/18444/opening-range-breakout-for-stocks-in-play/)
- [BLOG] Commentary on the 2024 paper: a plain ORB was weak, and selecting the most unusually active stocks by opening relative volume did almost all the work. — [danfin.net](https://danfin.net/opening-range-breakout-research)
- [BLOG] Index replication (Krueger, MQL5 blog, 25 September 2026): Zarattini-Aziz ORB on five index CFDs (NQ, SPX, Dow, DAX, FTSE), January 2015-June 2026. Gross: +0.131 R on NQ, "as in the paper." Net of costs: NQ +0.002 R; no market distinguishable from zero; four of five negative. — [MQL5 blog](https://www.mql5.com/en/blogs/post/776235); [QuantInsti summary](https://www.quantinsti.com/articles/opening-range-breakout-strategy/)
- [BLOG] QQQ replication (giovannibrusco, GitHub): net PnL crosses zero at about 2.2 cents per share of entry slippage; an NQ confirmation filter is significant per trade (t = 2.05) but 76% of its PnL is 2022 alone. — [GitHub: zarattini-2023-orb-qqq](https://github.com/giovannibrusco/zarattini-2023-orb-qqq)
- [WP] Mulham Fetna, "Opening-Range Breakout Does Not Survive Trading Costs: A Pre-Registered 225-Cell Study on Sixteen Years of Futures Data," SSRN, September 2026. Nine liquid US futures markets including NQ, ES, GC, SI, HG. Zero of 225 cells meet the pre-registered bar (t >= 2.5 at $25 per round trip, sign agreement across sub-periods, year-by-year stability). Gross of costs the grid earns +$1.57M on the confirmation window; at $25 per round trip it loses $6.49M. 155 of 225 cells have a gross edge within two ticks of zero. NQ is the one index whose grid is net positive after stressed costs, but none of its cells clears the bar. — [SSRN 7428398](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7428398); [ResearchGate](https://www.researchgate.net/publication/414294507_Opening-Range_Breakout_Does_Not_Survive_Trading_Costs_A_Pre-Registered_225-Cell_Study_on_Sixteen_Years_of_Futures_Data)
- [BLOG] Trading Edge Journal, ES and NQ from 2010 on one-minute bars, costs of 0.62 points round trip on ES and 0.79 points on NQ (mini contracts): every ES variant (5-, 15-, 30-, 60-minute ranges, several entries, stops and exits) failed its survivor rule after costs; NQ 5-minute ORB net R per trade is below zero in every window. When a 5-minute candle closes through the first hour's range, price was back inside within 60 minutes about 67% of the time on ES and 65% on NQ. — [Trading Edge Journal](https://tradingedgejournal.com/blog/opening-range-breakout-futures-backtest/)
- [BLOG] A pre-registered NQ ORB study posted on QuantConnect is titled "pre-registered, replicated with real orders, failed out of sample." A related GitHub write-up of an NQ 15-minute ORB reports about -0.05 R per trade after costs over 2010-2023 with a small positive 2024-2026 holdout the author calls mixed evidence. — [QuantConnect forum](https://www.quantconnect.com/forum/discussion/21814/opening-range-breakout-on-nasdaq-100-futures-pre-registered-replicated-with-real-orders-failed-out-of-sample); [GitHub: nq-intraday-breakout](https://github.com/giovannibrusco/nq-intraday-breakout)
- [WP] Mathias Mesfin, "Structural Limits of OHLCV-Based Intraday Momentum Signals in MNQ Futures: A Systematic Falsification Study," arXiv 2605.04004 (May 2026). Fourteen signal families on 947 trading days of five-minute MNQ data, 2021-2025, expanding-window walk-forward. None passes all five criteria. Eleven families fail because gross return before friction is 0.07-1.50 points, below the paper's 2.0-point friction floor. Gap-continuation short fails on sample size (N = 22). — [arXiv 2605.04004](https://arxiv.org/abs/2605.04004); [SSRN 6709401](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=6709401)

### Inferences
- On index futures, ORB is best classified as "gross edge real, net edge approximately zero": four independent tests (index CFDs, a 225-cell futures grid, a 16-year ES/NQ backtest, a pre-registered NQ study) converge on that, using different data and cost models.
- NQ is consistently the least-bad index in these tests (only positive net grid in Fetna; +0.002 R net in Krueger). That is weak evidence of a small edge and strong evidence that it is not larger than costs.
- The headline Sharpe of 2.81 belongs to a daily-rebalanced basket of the 20 most unusual-volume single stocks. An MNQ trader cannot reproduce the selection step, which the commentary says is where the result comes from.
- The 65-67% "back inside within 60 minutes" figure for breaks of the first-hour range suggests that fading, not following, first-hour breaks is the more frequent outcome on ES and NQ; frequency alone says nothing about expectancy, so this needs a payoff test.

### Gaps
- The exact stop, target, position-sizing and commission parameters of the two Zarattini ORB papers were not retrievable from extracts. My unverified recollection is that the QQQ paper used a stop at the opening-range extreme, a 10R profit target and 1% risk per trade with a 4x leverage cap, and the 2024 paper a stop at 10% of the 14-day ATR and $0.0035 per share commission; check these against the PDFs before coding anything.
- The plain (unfiltered) ORB result across all stocks in the 2024 paper, and its 15/30/60-minute comparison, were not retrieved.
- Krueger's cost assumptions (spread per index CFD) and Fetna's per-market cell results were not retrieved.
- An older peer-reviewed-style study, "Assessing the Profitability of Timely Opening Range Breakout on Index Futures Markets" (2019), was located but not read. — [ResearchGate](https://www.researchgate.net/publication/331076454_Assessing_the_Profitability_of_Timely_Opening_Range_Breakout_on_Index_Futures_Markets)

---

## 4. VWAP-based trend following (Zarattini and Aziz, "VWAP: The Holy Grail for Day Trading Systems")

### Takeaway
The paper reports a 671% net-of-commission return and Sharpe 2.1 on QQQ (January 2018-September 2023) from a long-above/short-below-VWAP rule, but it assumes zero slippage. Independent reproductions get the zero-cost result and find the edge is about one tick wide: with one cent of slippage per fill the QQQ result falls to roughly +1% with a Sharpe of 0.10.

### Cited Findings
- [WP] Zarattini and Aziz, "Volume Weighted Average Price (VWAP) The Holy Grail for Day Trading Systems," SSRN 4631351, 2023. Instruments QQQ and TQQQ, 2 January 2018 to 28 September 2023. Not peer-reviewed. — [SSRN 4631351](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4631351)
- [WP] Rule: long when price closes above VWAP, short when it closes below (one-minute bars). $25,000 in QQQ grows to $192,656 net of commissions, a 671% return, with maximum drawdown 9.4% and Sharpe ratio 2.1. In TQQQ, $25,000 grows to $2,085,417 net of commissions. The paper states "we assumed no slippage in our order fills." — [SSRN 4631351](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4631351); [Telonics replication page quoting the paper](https://telonicstrading.com/research-vwap.html)
- [BLOG] Telonics replication: reproduces the result on six years of one-minute QQQ/TQQQ data (zero-cost Sharpe 1.91 on QQQ versus the paper's 2.1), then adds one tick of slippage. The edge is smaller than a single tick: break-even at one tick on QQQ and at under half a tick on TQQQ. Its stated conclusion is that the published return measures the cost the model left out, not an edge a trader could keep. It treats data after November 2023 as a clean out-of-sample window. — [Telonics](https://telonicstrading.com/research-vwap.html)
- [BLOG] QuantifiedStrategies summary of the Telonics work: about 15 direction reversals per day, more than 40,000 fills, average gross edge about 2.5 cents per share per trade; with one cent of slippage per fill QQQ is roughly +1% with a Sharpe of 0.10, and TQQQ goes from roughly +4,643% to -99%. The TQQQ figure conflicts with Telonics' own "breaks even under half a tick" wording. — [X post](https://x.com/QuantifiedStrat/status/2098764314605732202); in tension with [Telonics](https://telonicstrading.com/research-vwap.html)
- [BLOG] A separate reproduction attempt on a retail platform obtained +1,077% on TQQQ over 2018-2023 and attributed the gap from the paper to data-feed differences. — [Kai Yasuda Substack](https://kaiyasuda.substack.com/p/i-tried-reproducing-the-holy-grail)
- [BLOG] A published critique exists under the title "Bear Bull Traders' paper on 'The Holy Grail' - not so fast." Only the title was retrieved. — [LinkedIn article](https://www.linkedin.com/pulse/bear-bull-traders-paper-holy-grail-so-fast-seth-lingafeldt-2o3cf)

### Inferences
- A rule that flips about 15 times a day with a gross edge of about 2.5 cents per QQQ share per trade is a cost measurement problem, not a signal: on MNQ one tick per fill plus commission would be charged roughly 15 times a day.
- VWAP as a stop or a regime filter inside a lower-frequency rule (as in the noise-area paper, question 2) is a different use from VWAP-cross as the entry trigger; only the second has been tested and shown to fail net of slippage.

### Gaps
- The Telonics post-publication (after November 2023) table values were not visible in the extract.
- I found no replication of the VWAP-cross rule on NQ or MNQ futures.
- An unsourced educational page claims an independent replication fell to a Sharpe of about 0.7 out of sample; I could not trace this to a primary source and do not rely on it. — [eltraderfinanciado.com](https://www.eltraderfinanciado.com/en/blog/vwap-trading)

---

## 5. Overnight versus intraday return decomposition: where index returns accrue across the 24-hour session

### Takeaway
Through 2018-2019, peer-reviewed work agrees that US equity index returns accrued overnight and specifically in the few hours around the European open, with the remaining roughly 20 hours averaging about zero. The 2026 Fed follow-up says the European-open return has been flat since 2021, so the session-level map built on pre-2020 data should not be assumed to hold today.

### Cited Findings
- [WP] Cooper, Cliff, Gulen, "Return Differences between Trading and Non-Trading Hours: Like Night and Day," SSRN 1004081 (2008): the US equity premium over the prior decade was solely due to overnight returns; night returns strongly positive, day returns near zero or negative. Holds for individual stocks, equity indexes and index futures, and across days of the week, days of the month and months of the year. — [SSRN 1004081](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1004081); [ResearchGate](https://www.researchgate.net/publication/228461243_Return_Differences_between_Trading_and_Non-Trading_Hours_Like_Night_and_Day)
- [PR] Lou, Polk, Skouras, "A tug of war: Overnight versus intraday expected returns" (JFE 2019), a cross-section-of-stocks result: momentum profits accrue overnight (average excess overnight return 0.95% per month, t = 2.95; intraday 0.04% per month, t = 0.17), while profits on other strategies studied accrue intraday; more than 100% of the profitability premium is intraday. — [author PDF](https://personal.lse.ac.uk/polk/research/TugOfWar.pdf)
- [PR] Bondarenko and Muravyev, "Market Return Around the Clock: A Puzzle," Journal of Financial and Quantitative Analysis 58(3), 2023, pp. 939-967. E-mini S&P 500 futures; sample described as 2004-2018 in one summary and 2006-2018 for trade data in another. The four hours around the Asian close and the European open account for essentially all of the average market return: 7.6% annualized with a Sharpe ratio of 1.67. The remaining 20 hours average about zero. The European-open hour has a Sharpe ratio several times higher than any other one-hour period. — [Cambridge / JFQA](https://www.cambridge.org/core/journals/journal-of-financial-and-quantitative-analysis/article/abs/market-return-around-the-clock-a-puzzle/089E33AC0B4D3B9A02CBA31EDF6505B3); [Alpha Architect summary](https://alphaarchitect.com/market-return-around-the-clock/); [MSU Broad news](https://broad.msu.edu/news/sweet-dreams-broad-research-reveals-best-times-for-overnight-market-returns/)
- [PR] Daylight-saving test: returns stay tied to the European open when clocks change but shift for Asia. VIX-futures-implied uncertainty rises overnight and falls around the European open. — [Alpha Architect summary](https://alphaarchitect.com/market-return-around-the-clock/)
- [PR, with conflicting secondary figures] Strategy: buy futures just before the European open and close after it; described as profitable net of conservative trading costs. The SSRN/Semantic Scholar abstracts give a 1.6 Sharpe that stays high after costs; Alpha Architect gives 1.2 after costs. Not reconciled. — [SSRN 3596245](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3596245); [Alpha Architect summary](https://alphaarchitect.com/market-return-around-the-clock/)
- [CB] Post-2020: the European-open hour has averaged close to zero in 2021-25 in ES, NQ and YM (see question 1). — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- [BLOG] A Quantpedia analysis reports that night and day sessions have converged: night still outperforms, but the spread is no longer statistically significant. Sample dates were not visible. — [Quantpedia](https://quantpedia.com/market-sentiment-and-an-overnight-anomaly/)
- [WP] A 2025 arXiv paper, "Does Overnight News Explain Overnight Returns?", describes the Cooper-Cliff-Gulen S&P 500 sample as 1993-2003 and says the pattern has continued since. — [arXiv 2507.04481](https://arxiv.org/pdf/2507.04481)

### Inferences
- Mapped onto the reader's four windows using the pre-2020 literature: the evening window (18:00-00:00 ET) sits in the "about zero" bucket or at its edge; the documented return sat before and around 03:00 ET; the regular session (09:30-16:00 ET) had a near-zero or negative average drift. None of the four windows was where the unconditional premium was earned.
- The practical consequence for a day trader is that there is no documented long bias to lean on inside regular hours; any intraday long-only tilt has to be earned from a conditional signal.
- Lou-Polk-Skouras is about which stocks earn returns at night versus day. It does not give an index-futures rule and is cited here only because it is often misread as one.

### Gaps
- The exact clock hours of Bondarenko-Muravyev's four-hour window, and the per-hour table for 18:00-00:00 ET, were not in the extracts.
- Cooper-Cliff-Gulen's basis-point-per-day figures were not retrieved.
- I found no peer-reviewed hour-by-hour decomposition for NQ specifically, nor one covering 2020-2026 other than the Fed blog post.
- Knuteson, "Strikingly Suspicious Overnight and Intraday Returns" (arXiv 2010.01727) was located but not read. — [arXiv](https://arxiv.org/pdf/2010.01727)

---

## 6. Calendar and event effects with intraday relevance: pre-FOMC drift, macro-release days, turn of the month, day of the week, options expiration, holiday sessions

### Takeaway
The pre-FOMC drift (49 bp in the 24 hours before the announcement, 1994-2011) is peer-reviewed but contested after 2015: one peer-reviewed study says it essentially disappeared, a Fed note says it survives only on press-conference meetings, and blog tests through 2024 say it persists. Macro-announcement premia are documented at the daily and pre-release level; turn-of-the-month and day-of-the-week effects look decayed; I found no usable intraday evidence on options expiration or holiday-shortened sessions.

### Cited Findings
**Pre-FOMC drift**
- [PR] Lucca and Moench, "The Pre-FOMC Announcement Drift," Journal of Finance 70(1), February 2015, pp. 329-371. Since 1994, US stock returns have on average been more than thirty times larger on FOMC announcement days than on other days; excess returns in the 24 hours before scheduled announcements account for more than 80 percent of the equity premium over the prior seventeen years. No such effect in Treasuries or money-market futures; similar pre-FOMC returns in other major equity indices. — [NY Fed Staff Report 512](https://www.newyorkfed.org/research/staff_reports/sr512.html); [SSRN 1923197](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1923197)
- [PR, cited secondhand] The drift is cited as on average 49 basis points during the 24-hour window before FOMC announcements; original sample September 1994 to March 2011. The working paper also reports 57 bp for SPY and 56 bp for the E-mini over shorter samples. — [Applied Economics 2024 article](https://www.tandfonline.com/doi/full/10.1080/00036846.2024.2322573); [working-paper copy](https://www.bostonfed.org/-/media/Documents/conference/PDF/Lucca_preFOMCDrift.pdf)
- [PR] Conditioning in the original paper: pre-FOMC returns are higher when the Treasury yield-curve slope is low, implied equity volatility is high, and past pre-FOMC returns have been high. — [NY Fed Staff Report 512](https://www.newyorkfed.org/research/staff_reports/sr512.html)
- [PR] Kurov, Wolfe, Gilbert, "The disappearing pre-FOMC announcement drift," Finance Research Letters 40, 2021 (sample to December 2019): after first becoming concentrated in press-conference meetings, the drift essentially disappeared after 2015 for meetings both with and without press conferences; explained by reduced uncertainty. The paper notes Ben Dor and Rosa (2019) find no change after 2015. — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1544612320315956); [author copy](https://www.skidmore.edu/economics/documents/KurovWolfeGilbert-TheDisappearingPre-FOMC-Announce-Drift-200914.pdf)
- [CB] Lucca and Moench's own update: continued large excess returns appear only for FOMC meetings featuring a press conference by the Chair. — [Liberty Street: "The Pre-FOMC Announcement Drift: More Recent Evidence"](https://ideas.repec.org/p/fip/fednls/87294.html)
- [WP] A 0DTE-options paper documents the disappearance of the pre-announcement drift over 2016-2023 and dates it to a single announcement. — [AFA paper (Song)](https://afajof.org/management/viewp.php?n=260400)
- [PR] A 2024 Applied Economics study of stock and VIX changes finds the drift lasts at least until the close of the announcement day. — [Applied Economics 2024](https://www.tandfonline.com/doi/full/10.1080/00036846.2024.2322573)
- [BLOG] A SPY test through December 2024 reports the drift "remains persistent." — [Quantseeker](https://www.quantseeker.com/p/trading-the-fed-the-pre-fomc-drift); contradicted by [Kurov, Wolfe, Gilbert](https://www.sciencedirect.com/science/article/abs/pii/S1544612320315956)

**Macro-release days**
- [PR, cited secondhand] Savor and Wilson: average announcement-day excess return of 11.4 bp versus 1.1 bp on all other days, 1958-2009; announcement days are 13% of the sample and account for over 60% of the cumulative annual equity risk premium. The premium is documented for inflation and employment announcements as well as FOMC. This sample predates 2020. — [Wachter and Zhu, "The Macroeconomic Announcement Premium"](https://jacobslevycenter.wharton.upenn.edu/wp-content/uploads/2019/04/The-Macroeconomic-Announcement-Premium.pdf); [Savor and Wilson paper record](https://www.semanticscholar.org/paper/How-Much-Do-Investors-Care-About-Macroeconomic-Risk-Savor-Wilson/80d71a46eb56ad3461cf264b55a5c472c5793468)
- [PR] Hu, Pan, Wang, Zhu, "Premium for heightened uncertainty: Explaining pre-announcement market returns," Journal of Financial Economics 145(3), 2022, pp. 909-936: large overnight pre-announcement returns with no abnormal variance before nonfarm payrolls, ISM and GDP releases, similar to pre-FOMC returns. — [IDEAS record](https://ideas.repec.org/a/eee/jfinec/v145y2022i3p909-936.html)
- [WP draft of the above, July 2021] With the four macro announcements combined, pre-announcement returns average 12.86 bp; in the high-uncertainty group the average pre-announcement return is 85.97 bp and highly significant, while the low-uncertainty group shows no significant effect. These are draft figures and may differ in the published version. — [draft PDF](https://en.saif.sjtu.edu.cn/junpan/PreAnn_20210728.pdf)
- [WP, cited secondhand] Options-implied equity premium measures are elevated on macro announcement days, and the NFP effect is smaller than the FOMC effect. — [Knox, Londono, Samadi, "Equity Premium Events"](https://westernfinance-portal.org/viewpaper?n=987840)
- [PR] Gao et al. report intraday momentum is stronger on major macro-news days (see question 2). — [SSRN 2440866](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2440866)

**Turn of the month**
- [PR] "The disappearing turn-of-month effect" (Finance Research Letters): the turn-of-the-month effect disappears entirely after 2001, linked to the sharp fall in transaction costs. — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S1544612324014909)
- [BLOG] A SPY study covering 2006-2026 found the turn of the month led in 8 of 29 windows (27.6%). — [Quanterlab](https://quanterlab.com/research/in-search-of-the-market-s-payday)
- [BLOG] A vendor analysis reports the narrow window no longer delivers a statistically reliable edge (t = 1.18) and argues the effect now starts a few days before month-end. — [seasonalpha.ai](https://seasonalpha.ai/en/blog/turn-of-month-effect-still-alive/); in tension with [Quanterlab](https://quanterlab.com/research/in-search-of-the-market-s-payday)
- [BLOG summarising older paper] Quantpedia describes turn-of-the-month in S&P 500 futures as the only calendar effect that is statistically and economically significant and persistent; this predates the decay findings. — [Quantpedia](https://quantpedia.com/strategies/turn-of-the-month-in-equity-indexes)

**Day of the week**
- [PR] A VIX/S&P 500 study finds no significant deterministic seasonal patterns in daily S&P 500 returns and no Monday effect in its sample. — [ScienceDirect](https://www.sciencedirect.com/science/article/abs/pii/S106294081200054X)
- [PR, old] A 1973-1997 study found highest and lowest returns on Wednesday and Monday and highest and lowest volatility on Friday and Wednesday. Predates 2020; not confirmed on later data. — [Berument and Kiymaz, Journal of Economics and Finance 2001](https://berument.bilkent.edu.tr/jef01.pdf)
- [WP] Cooper, Cliff, Gulen report the night-minus-day gap was consistent across days of the week, days of the month and months of the year. — [SSRN 1004081](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1004081)

### Inferences
- The pre-FOMC drift is the one calendar effect that fits a day-trading window cleanly (it ends at the 14:00 ET announcement, inside the reader's midday window), but the peer-reviewed post-2015 evidence is against it and the supportive evidence is a blog. Treat it as "contested, probably much weaker," and test it on 2016-2026 FOMC days split by press-conference status before using it.
- The macro pre-announcement return in Hu et al. accrues overnight before 08:30 or 10:00 ET releases, which is mostly outside all four of the reader's windows. Its usable implication is a volatility one: uncertainty resolves at the release, not a directional rule for 09:30 onward.
- Turn-of-the-month and day-of-the-week are best labelled folklore for intraday purposes as of 2026: the peer-reviewed evidence says decayed or absent, and nothing found gives an intraday rule.

### Gaps
- No source was found on options-expiration-week or triple-witching effects on intraday index-futures returns, or on holiday-shortened sessions; the final planned searches on these did not run because the search budget was exhausted.
- No peer-reviewed study of CPI-day or NFP-day intraday (09:30-16:00) drift in ES or NQ was found; the evidence is daily or pre-release.
- Lucca and Moench's exact window definition (2 p.m. to 2 p.m.) and Sharpe ratio, and the Kurov-Wolfe-Gilbert sub-period numbers, were not in the extracts.
- No peer-reviewed pre-FOMC study with data past 2023 was found.

---

## 7. Intraday volatility and volume seasonality, and what it implies for stop distances by time of day

### Takeaway
The academic sources retrieved confirm the qualitative shape (a pronounced diurnal pattern in ES, overnight variation much smaller than regular-hours variation, highest volatility in the US session, and discrete announcement effects) but none of the extracts gave the hour-by-hour multipliers needed to set stop distances. Those have to be measured from the trader's own MNQ data.

### Cited Findings
- [WP/PR] Andersen, Bondarenko, Kyle, Obizhaeva, "Intraday Trading Invariance in the E-mini S&P 500 Futures Market": the diurnal pattern is pronounced and overnight variation is substantially smaller than intraday variation; morning macro releases make the announcement window a hard test for the invariance relation. — [AEA conference copy](https://www.aeaweb.org/conference/2017/preliminary/paper/bNFQsR3f); [author copy](https://pages.nes.ru/aobizhaeva/ABKO-intradayinv.pdf)
- [PR] A study of round-the-clock futures finds E-mini volatility is highest during the American session, unlike yen and euro futures, which peak in the European-American overlap. — [International Review of Economics and Finance](https://www.sciencedirect.com/science/article/abs/pii/S1059056011000797)
- [PR] Stroud and Johannes, "Bayesian Modeling and Forecasting of 24-Hour High-Frequency Volatility," Journal of the American Statistical Association 109(508), 2014, pp. 1368-1384: models around-the-clock 5-minute index-futures returns with seasonal time-of-day components, jumps and explicit announcement effects; case study on 2007-2009 data with forecasts for 2009-2012. Predates 2020. — [Taylor and Francis](https://www.tandfonline.com/doi/abs/10.1080/01621459.2014.937003)
- [WP] The E-mini is described as almost exclusively affected by major macroeconomic announcements, not firm-specific news. — [arXiv 1408.3650](https://arxiv.org/pdf/1408.3650)
- [CB] Overnight share of total E-mini volume: 15 percent earlier, 16 percent in the recent period. — [Liberty Street Economics, July 2026](https://libertystreeteconomics.newyorkfed.org/2026/07/the-disappearing-overnight-drift/)
- [PR] Bondarenko and Muravyev: VIX-futures-implied uncertainty rises overnight and falls around the European open. — [Alpha Architect summary](https://alphaarchitect.com/market-return-around-the-clock/)
- [WP] Dim, Eraker, Vilkov: market-maker net gamma is negatively related to future intraday volatility. — [SSRN 4692190](https://papers.ssrn.com/sol3/Delivery.cfm/4692190.pdf?abstractid=4692190&mirid=1)
- [WP] The noise-area paper operationalises time-of-day volatility directly: its bands are the average absolute move from the open by time of day over the previous 14 sessions. — [paper PDF](https://alexandria.unisg.ch/server/api/core/bitstreams/a99aba00-f967-49b3-aceb-f544dc386e0b/content)

### Inferences
- A fixed-point stop is mis-sized across the reader's four windows: with about 84-85% of volume in regular hours and overnight variation "substantially smaller," a stop that is appropriate at 09:35 ET is far too wide at 20:00 ET and vice versa. Stops should be expressed in units of that window's own recent range.
- The simplest evidence-consistent method is the one the noise-area paper already uses: for each time of day, take the average absolute move over the previous 14 sessions and set the stop as a multiple of it. This also handles scheduled 08:30 and 10:00 ET releases, because they inflate the same-time-of-day average only when included deliberately.
- Because volume is thin overnight while the tick size is fixed, the one-tick slippage assumption used for regular hours is likely optimistic in the 18:00-00:00 and 03:00-07:00 windows. This is an inference; no source retrieved quantifies overnight MNQ slippage.

### Gaps
- No extract gave volatility-by-hour or volume-by-hour numbers for ES or NQ (the U-shape, the European-open bump, the 08:30 and 10:00 ET spikes) with a sample period. The classic references (Andersen and Bollerslev on intraday periodicity; CME volume-by-hour pages) were not retrievable.
- No source was found on MNQ-specific spread or depth by time of day.

---

## 8. Mean reversion versus momentum at the 5-15 minute horizon in index futures

### Takeaway
I found no peer-reviewed study that directly measures 5-15 minute momentum versus reversal in ES or NQ by volatility regime. What exists says very short-horizon reversal in ES is real but lasts minutes, that dealer gamma tilts the sign (long gamma favours reversal, short gamma favours momentum), and that on 2021-2025 MNQ five-minute bars no price-and-volume-only signal cleared costs.

### Cited Findings
- [PR] In e-mini returns, negative autocorrelation is significant for at most 30 minutes and usually lasts only a couple of minutes. — [NY Fed sr917 PDF](https://www.newyorkfed.org/medialibrary/media/research/staff_reports/sr917.pdf)
- [WP, stocks not futures] Very-high-frequency return autocorrelations tend to become positive following periods of market closure and during times of high volatility. — [CESA Working Paper 14, "The Term Structure of Intraday Return Autocorrelations"](https://www.fernuni-hagen.de/igas/docs/cesa_wp_14.pdf)
- [WP] Positive market-maker gamma strengthens intraday reversal; negative gamma strengthens intraday momentum. — [Dim, Eraker, Vilkov, SSRN 4692190](https://papers.ssrn.com/sol3/Delivery.cfm/4692190.pdf?abstractid=4692190&mirid=1)
- [PR] Gao et al.: half-hour-scale intraday momentum is stronger on more volatile days, higher-volume days, recession days and macro-news days. — [SSRN 2440866](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2440866)
- [WP] Mesfin (arXiv, May 2026): fourteen OHLCV signal families on five-minute MNQ bars, 2021-2025; none passes; eleven have gross returns of 0.07-1.50 points per trade, below a 2.0-point friction floor. The author's reading is that publicly observable OHLCV patterns in a liquid market are arbitraged until gross edge equals the marginal participant's friction. — [arXiv 2605.04004](https://arxiv.org/abs/2605.04004)
- [BLOG] After a 5-minute close through the first hour's range, price was back inside within 60 minutes about 67% of the time on ES and 65% on NQ (2010 onward). — [Trading Edge Journal](https://tradingedgejournal.com/blog/opening-range-breakout-futures-backtest/)
- [WP] Fetna: 155 of 225 breakout cells across nine futures markets have a gross edge within two ticks of zero. — [SSRN 7428398](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7428398)

### Inferences
- The evidence supports a regime statement, not a winner: in calm, long-gamma conditions the 5-15 minute bias leans to reversal; on high-volatility, macro-news or short-gamma days it leans to continuation. The noise-area rule is consistent with this because it only trades when price has already moved more than its normal time-of-day range.
- Both sides of the trade are small relative to cost at this horizon. The MNQ falsification study puts typical gross edge at under 1.5 points against 2 points of friction, so at 5-15 minutes the cost model decides the result more than the signal choice does.
- A testable design that follows from this: classify each session at a fixed time (for example by whether the move from the open exceeds its 14-day time-of-day average, or by a VIX threshold) and run breakout rules only on the "expanded" days and fade rules only on the others, then compare both against the unconditional versions on post-2020 data.

### Gaps
- No peer-reviewed source was found giving 5-, 10- or 15-minute return autocorrelations for ES or NQ, split by volatility regime, on any sample period. This is the weakest-evidenced question in the set.
- No source was found on mean reversion specifically in the 12:00-14:00 ET lunch period for index futures; a Quantpedia page titled "Lunch Effect in the U.S. Stock Market Indices" was located but not read. — [Quantpedia](https://quantpedia.com/lunch-effect-in-the-u-s-stock-market-indices/)

---

## 9. Realistic round-trip cost for MNQ (commission plus one-tick slippage) and whether each effect survives it

### Takeaway
MNQ is $2 per index point with a 0.25-point ($0.50) tick. Published cost assumptions used in NQ replications range from $1.75 commission plus one tick per fill (about 1.4 points round trip) to a 2.0-point friction floor. At that cost, none of the single-instrument intraday rules reviewed here has clean, post-publication, net-of-cost evidence on MNQ; the noise-area rule on NQ is the nearest thing to a survivor and it is not yet statistically confirmed out of sample.

### Cited Findings
- [Exchange] Micro E-mini Nasdaq-100 futures are $2 x the Nasdaq-100 Index with a minimum tick of 0.25 index points. — [CME Group contract specs](https://cmegroup.com/trading/equity-index/us-index/micro-e-mini-nasdaq-100_contractSpecs_futures.html)
- [Broker page] One tick (0.25 points) is worth $0.50 per contract. — [TradeStation contract specifications](https://www.tradestation.com/learn/market-basics/futures/micro-e-mini-futures/micro-e-mini-futures-contract-specifications/)
- [BLOG/vendor] Non-member exchange fee for micro equity index futures including MNQ is listed at $0.35 per side, and the NFA fee at $0.02 per side. A different table on the same site shows about $0.64 per side for MNQ, so the figure should be confirmed on CME's current fee schedule. — [NexusFi: exchange fees](https://nexusfi.com/a/exchanges/futures-exchange-fees); [NexusFi: commissions and fees](https://nexusfi.com/a/brokers/futures-commissions-and-fees); [CME fee schedule, August 2026](https://www.cmegroup.com/company/files/cme-fee-schedule-2026-08-24.pdf)
- [Broker page] Broker commissions range roughly $0.25 to $5.00+ per side; one all-in broker lists $0.29 per side on micro contracts inclusive of clearing. — [NexusFi: commissions and fees](https://nexusfi.com/a/brokers/futures-commissions-and-fees); [MetroTrade fee schedule](https://www.metrotrade.com/pricing/futures-fee-schedule/)
- [BLOG] Cost model used in the NQ noise-area replication: $1.75 commission per round trip plus 1 tick (0.25 points) slippage on every fill. — [GitHub: VigorTas](https://github.com/VigorTas/beat-the-market-replication)
- [WP] Cost model used in the MNQ falsification study: a 2.0-point friction floor per trade. — [arXiv 2605.04004](https://arxiv.org/abs/2605.04004)
- [BLOG] Cost model used in a 16-year NQ ORB backtest (mini contract): 0.79 points per round trip on NQ, 0.62 points on ES. — [Trading Edge Journal](https://tradingedgejournal.com/blog/opening-range-breakout-futures-backtest/)
- [WP] Cost model used in the 225-cell futures ORB study: $25 per round trip. — [SSRN 7428398](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7428398)
- [WP] Stop-fill sensitivity on NQ: one index point of slippage on stop fills removes 22% of the noise-band edge. — [SSRN 7609644](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=7609644)

### Inferences
- **Round-trip cost arithmetic (mine, from the cited inputs).** One tick of slippage each way is 2 x $0.50 = $1.00. Adding the VigorTas commission of $1.75 gives $2.75 per round trip per MNQ contract, which is 1.375 index points. Using instead $0.35 exchange + $0.02 NFA + $0.29 commission per side gives $1.32 in fees plus $1.00 slippage = $2.32, or 1.16 points. A working range of about 1.2 to 1.4 points per round trip is consistent with the cited inputs; Mesfin's 2.0 points ($4.00) is a more conservative published figure. Micro fees are proportionally heavier than on the mini: Trading Edge Journal's all-in 0.79 points on NQ is roughly half of this in index-point terms.
- **Converting to basis points.** Cost in bp = points / index level x 10,000. This matters for the academic effects quoted in bp: the overnight drift's 1.48 bp per day is a gross figure per trade, and a 1.2-1.4 point round trip is of the same order as that at any plausible index level, so the unconditional drift never cleared a retail micro-contract cost by a useful margin even before it decayed. I have not stated a current NQ level because none was sourced.
- **Survival table (my classification from the evidence above).**

| Effect | Evidence grade | Net of realistic MNQ cost | Status as of Nov 2026 |
|---|---|---|---|
| Overnight drift, 02:00-03:00 ET long | Peer-reviewed (RFS 2023), 1998-2019 | Gross 1.48 bp/day; same order as cost | Decayed: flat 2021-25 per authors |
| European-open window long (Bondarenko-Muravyev) | Peer-reviewed (JFQA 2023), to 2018 | Paper says profitable net of conservative costs | No post-2018 confirmation; Fed follow-up says flat |
| First half-hour predicts last half-hour | Peer-reviewed (JFE 2018), 1993-2013 | Not shown net on futures | Marginal: blog replications say absent or reversed on SPY/QQQ |
| Rest-of-day predicts last 30 minutes | Peer-reviewed (JFE 2021), to 2020 | Not retrieved | Unconfirmed after 2020; likely gamma-dependent |
| Noise-area momentum (SPY) | Working paper | Net Sharpe 1.33 in sample | Decayed on SPY out of sample (Sharpe 0.39, May 2024-Mar 2026) |
| Noise-area momentum (NQ futures) | GitHub and SSRN preprints | Positive after $1.75 + 1 tick/fill, t = 2.74 full sample | Marginal: all post-2018; post-publication t = 1.37; fragile to stop slippage |
| 5-minute ORB on index | Working papers | Gross reproduced, net about zero in four independent tests | Does not survive costs |
| VWAP-cross trend following | Working paper | Breaks even at about one tick | Does not survive costs |
| Pre-FOMC drift | Peer-reviewed (JF 2015), 1994-2011 | 49 bp per event is large relative to cost | Contested: peer-reviewed study says gone after 2015 |
| Macro pre-announcement return | Peer-reviewed (JFE 2022) | Not tested as a futures rule | Accrues overnight before the release; outside the four windows |
| Turn of month / day of week | Mixed, mostly old | Not tested intraday | Folklore for intraday use |
| Generic OHLCV signals on 5-minute MNQ | arXiv preprint, 2021-2025 | Gross 0.07-1.50 points vs 2.0-point friction | Does not survive costs |

- The pattern across the table is that effects measured per event (pre-FOMC, post-sell-off overnight reversal) are large relative to cost but rare and contested, while effects measured per day or per trade are small relative to cost. For a micro-contract day trader the realistic research targets are conditional, low-frequency versions of these rules rather than every-day versions.

### Gaps
- CME's current non-member Globex fee for MNQ was not confirmed from CME's own schedule (the page was located but not readable), and the two vendor figures found ($0.35 and about $0.64 per side) conflict.
- No source was found measuring actual MNQ slippage by time of day or by order type (market versus stop); one tick is the convention used in replications, not a measured value.
- No peer-reviewed paper tests any of these rules on MNQ or MES micro contracts specifically; all micro-contract evidence is from preprints and repositories.
- Sources that must be opened directly to close the gaps in this file, once the hosts are allowed in the session's network settings: libertystreeteconomics.newyorkfed.org, www.newyorkfed.org, concretumgroup.com, www.cxoadvisory.com, www.mql5.com, www.skidmore.edu, plus papers.ssrn.com, github.com, alexandria.unisg.ch and telonicstrading.com (not attempted after the first six failures).
