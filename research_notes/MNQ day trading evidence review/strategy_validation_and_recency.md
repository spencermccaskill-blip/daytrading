# Strategy validation and recency: telling a real edge from luck, and whether "trade what has been working lately" is supported (as of November 2026)

Research-session limits that affect how to read these notes: page fetching was blocked for every host tried (carmamaths.org, econpapers.repec.org, robotwealth.com, quantpedia.com), and the web-search budget ran out before the last five queries. Every cited figure below therefore comes from search-result extracts of the linked page (abstracts, summaries), not from a full read of the paper. Where a figure came through a secondary summary, that is stated. All "worked numbers" are my own arithmetic from textbook formulas (Python, normal/binomial; simulation where stated) and are placed under Inferences.

## 1. Multiple testing and overfitting: what do the accepted corrections imply when about 23 variants were tried and the best has t = 2.3?

### Takeaway
A best-of-23 t-statistic of 2.3 is roughly what pure luck produces: the expected maximum t among 23 independent zero-edge strategies is about 1.96, and the chance that at least one reaches 2.3 is about 22% (one-sided) to 39% (two-sided). Every standard correction (Bonferroni/Šidák, Harvey-Liu-Zhu's t > 3.0, deflated Sharpe ratio) leaves it short of significance; it is a candidate for forward testing, not an established edge.

### Cited Findings
- Bailey, Borwein, López de Prado and Zhu (Notices of the AMS, 2014) show that high in-sample performance "is easily achievable after backtesting a relatively small number of alternative strategy configurations", and that analysts rarely report the number of configurations tried, so readers cannot judge the degree of overfitting. They define a Minimum Backtest Length that grows with the number of trials N, bounded approximately by 2·ln(N) / E[max_N]² (years, for a target annualised Sharpe E[max_N]). — [Bailey et al., "Pseudo-Mathematics and Financial Charlatanism"](https://carmamaths.org/jon/backtest.pdf)
- A secondary summary of the same paper: testing more than 45 strategy configurations on a five-year sample is almost guaranteed to find one with an in-sample annualised Sharpe of 1 whose expected out-of-sample Sharpe is zero. — [CXO Advisory summary](https://www.cxoadvisory.com/big-ideas/insidiousness-of-overfitting-investment-strategies-via-iterative-backtests)
- The Deflated Sharpe Ratio (Bailey & López de Prado, Journal of Portfolio Management 2014) corrects for two sources of inflation: selection bias under multiple testing and non-normal returns. Its benchmark is the expected maximum Sharpe among N skill-less trials, computed from the Euler-Mascheroni constant, N and the variance of Sharpe estimates across trials; skew and kurtosis enter the standard error. Because trials are usually correlated, the effective N is estimated by clustering similar strategies. — [SSRN abstract 2460551](https://papers.ssrn.com/abstract=2460551); [Wikipedia, Deflated Sharpe ratio](https://en.wikipedia.org/wiki/Deflated_Sharpe_ratio)
- Harvey, Liu and Zhu (Review of Financial Studies 2016): given the number of factors already tried, "a newly discovered factor needs to clear a much higher hurdle, with a t-ratio greater than 3.0"; using the usual t > 2.0 "does not make any economic or statistical sense". They catalogue 316 factor candidates from 313 papers (other citations say 314). — [NBER w20592](https://nber.org/papers/w20592)
- Harvey and Liu give the conversion t-statistic = Sharpe ratio × √(number of years). — [Harvey & Liu, "Backtesting"](https://people.duke.edu/~charvey/Research/Published_Papers/P120_Backtesting.PDF); [Harvey & Liu, "Evaluating Trading Strategies"](https://people.duke.edu/~charvey/Research/Published_Papers/P116_Evaluating_trading_strategies.pdf)
- White's Reality Check, as applied by Sullivan, Timmermann and White (Journal of Finance 1999): a bootstrap that adjusts the best rule's performance for the full universe of rules searched. They expanded Brock-Lakonishok-LeBaron's 26 rules, used 100 years of daily Dow data, and re-tested the BLL rules on the following 10 years (1987-1996). — [Sullivan, Timmermann & White 1999](https://econpapers.repec.org/RePEc:bla:jfinan:v:54:y:1999:i:5:p:1647-1691)
- Hansen's (2005) Superior Predictive Ability test modifies the Reality Check: it is more powerful and less sensitive to the inclusion of poor and irrelevant rules in the tested set. — [description in a futures-market technical-trading study hosted on AgEcon Search, which applies both tests](https://ageconsearch.umn.edu/record/19039/files/cp05pa01.pdf)
- Empirical check on how much backtest statistics are worth: Quantopian's study of 888 algorithms with at least 6 months of true out-of-sample data found that backtest Sharpe ratio and similar metrics "offer little value in predicting out of sample performance (R² < 0.025)"; volatility and maximum drawdown predicted better (machine-learning model on hold-out R² about 0.17); and the more backtesting a developer did, the larger the gap between backtest and out-of-sample results. — [Quantpedia summary of Wiecki, Campbell, Lent & Stauth](https://quantpedia.com/quantopians-academic-paper-about-in-vs-out-of-sample-performance-of-trading-alg/)
- Bank-sponsored "alternative beta" strategies: across 215 strategies, the median Sharpe ratio was 1.20 in backtest versus 0.31 live, a median 73% deterioration; only 18 of 215 (8.4%) had a live Sharpe at or above the backtest and 65 (30%) had a negative live Sharpe; more complex strategies suffered larger haircuts. — [Alpha Architect summary of Suhonen, Lennkh & Perez (JPM 2017)](https://alphaarchitect.com/beware-of-backtest-overfitting/); [Mathematical Investor](https://mathinvestor.org/2017/08/backtest-overfitting-in-smart-beta-investments/)
- Caveat on significance tests in general: when the test has low power, a "significant" estimate carries little information about the true value. — [O'Connor, Econ Journal Watch 2024](https://econjwatch.org/articles/revisiting-hypothesis-testing-with-the-sharpe-ratio)

### Inferences
Own calculations (normal approximation; fine for 200-600 trades):
- Single-test p-value for t = 2.3: 0.0214 two-sided, 0.0107 one-sided.
- Family-wise correction for 23 tests: Bonferroni-adjusted p = 0.49 two-sided (0.25 one-sided); Šidák (independent tests) = 0.39 two-sided (0.22 one-sided). So under "no setup has any edge", a best t of 2.3 or more turns up in roughly one search in four or five.
- t needed for 5% family-wise significance with 23 trials: 3.07 two-sided (2.85 one-sided). With 14 trials: 2.91 two-sided (2.69 one-sided). This lands on Harvey-Liu-Zhu's 3.0.
- Expected maximum of 23 independent standard-normal t-statistics, using the Bailey-López de Prado approximation (1−γ)·Φ⁻¹(1−1/N) + γ·Φ⁻¹(1−1/(N·e)) with γ = 0.5772: 1.96. For 14 trials: 1.74. The observed 2.3 is only 0.34 standard errors above the luck benchmark.
- Deflated Sharpe ratio, assuming the across-trial variance of the per-trade Sharpe equals its sampling variance (1/T): DSR ≈ Φ(2.3 − 1.96) ≈ 0.63, almost independent of whether T is 200, 400 or 600 trades and little changed by moderate skew/kurtosis (0.63-0.64). Reading: about a 63% probability the true Sharpe exceeds the luck benchmark, against the usual 95% requirement. Without the correction the same strategy shows a naive 98.9%.
- Minimum backtest length by the paper's own approximation (E[max_N]² years for a target annual Sharpe of 1): N = 23 trials needs about 3.9 years, N = 45 needs 5.0 years (reproducing the paper's five-year/45 example), N = 14 needs 3.0 years. A 3-year history with 23 variants is therefore already below the minimum length for trusting an in-sample annual Sharpe of 1.
- Direction of the errors in these numbers: the 23 variants are correlated (variants of related setups), which lowers the effective N and helps the strategy; but undocumented choices (stop placement, session filter, timeframe, which setups were coded at all) are extra trials that raise N. The honest count is "every configuration whose results were looked at".
- A deflated estimate is still positive: the right reading is "probably a small edge or none; expected live performance well below backtest", consistent with the 73% median live haircut and R² < 0.025 above.

### Gaps
- I could not open the Bailey et al. paper to quote the "five years / 45 configurations" sentence verbatim; the 45 figure is confirmed only through the CXO summary and my reproduction of the formula.
- The companion "Probability of Backtest Overfitting" paper (combinatorially symmetric cross-validation) and López de Prado's combinatorial purged cross-validation were not retrieved; no figures are reported for them.
- The Sullivan-Timmermann-White universe size (I recall 7,846 rules) and their out-of-sample conclusion were not confirmed by the search; treat as unverified.
- Chordia, Goyal & Saretto's higher t-hurdles and Harvey & Liu's Sharpe "haircut" percentages were queued but the search budget ran out; not reported.
- The reader's actual trial count, trade returns' skew/kurtosis and cross-variant correlations are unknown; the DSR above is illustrative.

## 2. Sample size: how many trades distinguish 50% from 60% win rate, or +0.1R from 0R? What is the standard error of a 4-week win rate on 19 trades?

### Takeaway
About 150-200 trades are needed to separate a 60% from a 50% win rate with conventional error rates, and roughly 600-1,800 trades to separate +0.1R from 0R; a 19-trade window has a standard error of 11.5 percentage points (95% interval about ±22 points), so it cannot distinguish any two plausible setups. This is established statistics, not opinion.

### Cited Findings
- t-statistic = Sharpe ratio × √years; so an annual Sharpe of 1 needs about four years to reach t = 2, and a Sharpe of 1 over one year is not distinguishable from zero. — [Harvey & Liu, "Backtesting"](https://people.duke.edu/~charvey/Research/Published_Papers/P120_Backtesting.PDF); [TraderMath worked example](https://www.tradermath.org/courses/basics-of-quantitative-finance/sharpe-ratio-and-risk-adjusted-metrics)
- Bailey and López de Prado's Probabilistic Sharpe Ratio gives the minimum track-record length needed to reject a Sharpe below a threshold at a given confidence. — [arXiv 1905.08042 discussion](https://ar5iv.labs.arxiv.org/html/1905.08042)
- Practitioner use: Robert Carver applies a plain t-test and Andrew Lo's Sharpe confidence interval to backtest results on his blog and routinely concludes that differences (for example a Sharpe change of 0.03, or a single sub-system's negative Sharpe) are "not statistically significant". — [Carver, breakout rule post](https://qoppac.blogspot.com/2016/05/a-simple-breakout-trading-rule.html); [Carver, "Some more trading rules"](https://qoppac.blogspot.com/2017/06/some-more-trading-rules.html)
- Euan Sinclair: a year or two of poor P&L cannot tell you whether a strategy has stopped working. — [Robot Wealth, "Much Ado About Variance"](https://robotwealth.com/much-ado-about-variance/)

### Inferences
Formulas (textbook; assumptions: independent trades, fixed true win rate p or fixed mean and SD of R).
- Standard error of a win rate: SE = √(p(1−p)/n). 95% interval ≈ ±1.96·SE.
- Trades needed to detect p₁ against p₀: n = [z_α·√(p₀(1−p₀)) + z_β·√(p₁(1−p₁))]² / (p₁−p₀)².
- Standard error of mean R: SE = σ_R/√n; trades needed to detect mean δ against 0: n = [(z_α+z_β)·σ_R/δ]².
- σ_R depends on payoff shape: 1R target/1R stop gives σ ≈ 1.0R; 2R target at 40% wins gives 1.47R; 3R target at 35% wins gives 1.91R.

Win-rate precision (true p = 0.5):

| Trades | SE | 95% half-width | Win rate needed for one-sided 5% significance vs 50% (exact binomial) | Power if truth is 60% | Power if truth is 55% |
|---|---|---|---|---|---|
| 10 | 15.8 pts | ±31 pts | 9/10 (90%) | 5% | 2% |
| 19 | 11.5 pts | ±22 pts | 14/19 (74%) | 16% | 8% |
| 20 | 11.2 pts | ±22 pts | 15/20 (75%) | 13% | 6% |
| 100 | 5.0 pts | ±9.8 pts | 59/100 | 62% | 24% |
| 200 | 3.5 pts | ±6.9 pts | 113/200 (56.5%) | 86% | 36% |
| 400 | 2.5 pts | ±4.9 pts | 217/400 (54.3%) | 99% | 64% |

- Required n for 50% vs 60%: 153 (one-sided 5%, 80% power), 194 (two-sided 5%, 80%), 211 (one-sided, 90%), 259 (two-sided, 90%). For 50% vs 55%: 617, 783, 853, 1,047.
- Required n for +0.1R vs 0R (one-sided 5% / 80% power, then two-sided 5% / 80%): σ = 1.0R: 619 / 785; σ = 1.2R: 891 / 1,131; σ = 1.5R: 1,392 / 1,767; σ = 2.0R: 2,474 / 3,140.

Mean-R precision if the true edge is +0.1R:

| Trades | SE (σ=1.0R) | Expected t | Power (1-sided 5%) | SE (σ=1.5R) | Expected t | Power |
|---|---|---|---|---|---|---|
| 10 | 0.32R | 0.32 | 9% | 0.47R | 0.21 | 8% |
| 20 | 0.22R | 0.45 | 12% | 0.34R | 0.30 | 9% |
| 100 | 0.10R | 1.00 | 26% | 0.15R | 0.67 | 16% |
| 400 | 0.05R | 2.00 | 64% | 0.075R | 1.33 | 38% |
| 600 | 0.041R | 2.45 | 79% | 0.061R | 1.63 | 50% |

- The 19-trade 4-week window specifically: SE 11.5 points. A 13/19 (68%) month has an exact 95% interval of 43%-87% and a one-sided p-value against 50% of 0.08; a 6/19 (32%) month has an interval of 13%-57%. Both intervals contain every plausible true win rate, so the two months are statistically the same setup.
- The 3-year sample (200-600 trades) is roughly 10 to 85 times larger than a 4-week sample (7-20 trades), so its standard error is about 3 to 9 times smaller. Even the 3-year sample only reaches about 40-80% power for a +0.1R edge.
- Ranking 14 setups on 4 weeks (simulation): if all 14 have a true 50% win rate and 7-20 trades each, the top-ranked setup shows 74% on average and the bottom 26%; with 19 trades each, 69% and 31%. A 70%+ "hot" setup appears in about 73% of such months by luck alone.
- Chance the genuinely best setup tops the 4-week table (one setup truly 60%, thirteen at 50%; simulation): 18% with 10 trades each, 25% with 19, 62% with 100, 98% with 400. If the true gap is 55% vs 50%: 12%, 14%, 28%, 62%. Random choice would give 7%. So a 4-week ranking is slightly better than random; a 3-year ranking is far better.
- Expected longest losing streak (approximation log base 1/q of n·p) for a 50% setup: about 3 in 19 trades, 6 in 100, 8 in 400; for a 40% win-rate setup about 4, 7 and 10. Streaks of this length are normal and not evidence of a broken setup.

### Gaps
- Real trades are not independent (several per day, same-day market direction), which makes effective sample sizes smaller than the trade count; the numbers above are optimistic. I found no source quantifying intraday trade clustering for NQ setups.
- The reader's actual σ_R per setup is unknown; plug it into the formula.

## 3. Strategy or factor momentum: do strategies that did well recently keep doing well, and at what horizon?

### Takeaway
There is real published evidence for performance persistence across strategies, but it is measured on monthly returns of diversified equity factors or funds over one-month to one-year formation windows, the effect is modest, and the best documented version still under-performs simply holding all factors equally. I found no published evidence that a 4-week tally of 7-20 intraday trades predicts the next 4 weeks.

### Cited Findings
- Ehsani and Linnainmaa (Journal of Finance 2022): "the average factor earns a monthly return of 1 basis point following a year of losses and 53 basis points following a positive year". Formation window is one year; they argue stock momentum is the sum of factor autocorrelations. — [NBER w25551](https://www.nber.org/papers/w25551)
- Gupta and Kelly ("Factor Momentum Everywhere", 2019), 65 equity factors: timing each factor on its own prior one-month return gives a combined gross annual Sharpe of 0.84; lookbacks out to five years give 0.60-0.70; but a plain equal-weighted portfolio of the 65 raw factors has a Sharpe of 1.07. Sources differ on whether 59 or 61 of 65 factors show positive own-momentum. — [AQR working paper page](https://www.aqr.com/Insights/Research/Working-Paper/Factor-Momentum-Everywhere); [CXO Advisory summary](https://cxoadvisory.com/momentum-investing/ubiquitous-equity-factor-momentum)
- Arnott, Clements, Kalesnik and Linnainmaa ("Factor Momentum", January 2018 draft): rotating 51 factors on prior one-month return, held one month, earns 8.6% annualised (t = 4.09); a later version reported 10.5% (t = 5.01). Factor and industry returns continue at the one-month horizon, whereas individual stocks reverse at that horizon. — [Wharton-hosted draft](https://rodneywhitecenter.wharton.upenn.edu/wp-content/uploads/2018/03/Juhani.pdf); [Alpha Architect summary](https://alphaarchitect.com/momentum-everywhere-including-factors/)
- Counterweight from AQR: Aghassi, Asness, Fattouche and Moskowitz conclude "factor timing is difficult, and a consistent and disciplined exposure to a well-diversified multifactor portfolio is hard to beat", and list as a fiction the idea that you know when you are in a drawdown or recovery and when to cut or add risk. — [AQR, "Fact, Fiction, and Factor Investing" (JPM Quant 2023)](https://www.aqr.com:443/-/media/AQR/Documents/Journal-Articles/AQRJPMQuant23FactFictionandFactorInvesting.pdf?sc_lang=en)
- CTA / managed-futures manager persistence is mixed and small:
  - Brorsen and Townsend: persistence is statistically significant but explains only 2-4% of the variation in returns; earlier studies finding none had low power. — [Brorsen & Townsend, "Performance Persistence for Managed Futures"](https://ageconsearch.umn.edu/record/285724/files/confp23-98.pdf)
  - Gregoriou, Hübner and Kooli (Journal of Futures Markets 2010): many CTAs persist over at least three months, but most persistence fades when only top and bottom quartiles are considered. — [IDEAS record](https://ideas.repec.org/a/wly/jfutmk/v30y2010i8p725-752.html)
  - Blocher, Cooper and Molyboga: good and bad performance both persist for about 12 months, then disappear without reversing. — [CME-hosted paper](https://www.cmegroup.com/education/files/performance-an-persistence-in-commodity-funds.pdf)
  - Krohn, Mende, Moore and Raman (preliminary 2017 working paper): cross-sectional differences persist up to three years. — [AEA conference paper](https://benny.aeaweb.org/conference/2018/preliminary/paper/2GZNbhRy)
- Carver (June 2026) tested for structural breaks in the Sharpe ratios of his trading rules: breaks are "quite rare with only 13% or so of instrument/rules having at least one break", so rule Sharpes are stable enough not to fail tests at a 1% critical value; the average rule on a typical instrument has a Sharpe around 0.15. He cautions the result fits his slow-trading context, "but not in a domain with faster trading, higher SR, and faster alpha decay". — [Carver, This Blog is Systematic, June 2026](https://qoppac.blogspot.com/2026/06/)
- Carver keeps rules with negative backtested Sharpe at positive weight because the uncertainty around backtested Sharpes is large; poor recent or sub-sample performance only tilts weights down slightly. — [Carver, "My trading system" (2021)](https://qoppac.blogspot.com/2021/12/my-trading-system.html)

### Inferences
- Horizon summary: evidence exists for formation windows of one month (Gupta-Kelly, Arnott et al.) and one year (Ehsani-Linnainmaa, CTA studies), measured over decades with dozens of factors. Nothing in the retrieved literature tests windows of "weeks" on single-instrument intraday rule sets.
- The factor-momentum result does not transfer cleanly: (a) a monthly factor return is the average over hundreds of stock positions, not 7-20 trades; (b) the documented effect is small, a correlation of a few percent per period, detectable only with 50+ factors and 50+ years; (c) Gupta-Kelly's own numbers show the momentum-timed portfolio (0.84) below the untimed equal-weight portfolio (1.07), so even where persistence is real, "hold everything that has a long-run edge" was the stronger base policy and timing was an add-on.
- If setups genuinely had persistent month-to-month edge shifts, the reader can measure it directly from the 3-year backtest: split each setup's trades into about 39 non-overlapping 4-week blocks, and (i) compare the variance of block win rates with the binomial variance p(1−p)/n (overdispersion means the edge moves; no overdispersion means the "hot/cold" months are noise); (ii) backtest the switching rule itself: each block, trade only the top-k setups by prior-block result and compare with trading all setups. About 38 transitions × 14 setups gives roughly 530 setup-months, enough to see a meaningful effect. This rule is one more trial and must be counted in the multiple-testing tally.
- How big would real drift need to be for the 4-week window to deserve half the weight? Shrinkage weight on the recent window = τ²/(τ² + p(1−p)/n), where τ is the standard deviation of the true win rate across months. For n = 19, the weight reaches 50% only if τ ≈ 11.5 points (true win rate regularly swinging between about 38% and 62%). If τ = 5 points the weight is 16%; if τ = 3 points, 6%; if τ = 2 points, 3%.

### Gaps
- No study found on persistence of individual intraday setups or discretionary-pattern rules at weekly horizons; absence of evidence, not evidence of absence.
- "Time-series momentum of trading strategies" as a distinct paper title was not located.
- Exact net-of-cost Sharpe for Gupta-Kelly not confirmed.

## 4. Regime change and decay: how fast do edges fade, and does conditioning on regime indicators have out-of-sample support?

### Takeaway
Decay is real and well measured for published strategies (roughly a quarter to a half of in-sample performance lost out of sample, more after publication), which supports "markets change" as a general statement; but the documented decay plays out over years, and the out-of-sample record for regime-timing rules is weak. Volatility dependence of intraday momentum and of short-term reversal is the best-supported conditioning variable.

### Cited Findings
- McLean and Pontiff (Journal of Finance 2016), 97 return predictors: portfolio returns are 26% lower out-of-sample and 58% lower post-publication; the 26% is read as an upper bound on data-mining bias and the further 32% as the effect of investors trading on the published result. (A CFA digest words these as "percentage points"; the paper's framing is percent.) — [RePEc record](https://econpapers.repec.org/RePEc:bla:jfinan:v:71:y:2016:i:1:p:5-32); [CFA Institute digest](https://rpc.cfainstitute.org/research/cfa-digest/2016/06/does-academic-research-destroy-stock-return-predictability-digest-summary)
- Falck, Rej and Thesmar (Quantitative Finance 2022; CFM): published anomalies deliver about 50% of in-sample performance out of sample. In the working-paper version (72 strategies), publication year alone explains 30% of the variance in Sharpe decay, and decay for newly published factors grows about 5 percentage points per year. — [arXiv 2105.01380](https://arxiv.org/pdf/2105.01380); [CFM page](https://cfm.com/why-and-how-systematic-strategies-decay/)
- Carver notes some rules stopped working inside his backtest period, for example faster momentum before costs. — [Carver, This Blog is Systematic, 2024](https://qoppac.blogspot.com/2024/)
- Volatility dependence, intraday momentum: Gao, Han, Li and Zhou (S&P 500 ETF, 1993-2013) find the first half-hour return predicts the last half-hour return, and the effect "is stronger on more volatile days, higher volume days, recession days and some macroeconomic news release days". — [paper copy](https://c.mql5.com/forextsd/forum/173/intraday_momentum_-_the_first_half-hour_return_predicts_the_last_half-hour_return.pdf)
- Zarattini, Aziz and Barbon ("Beat the Market", Swiss Finance Institute paper 24-97): an intraday trend-following rule on SPY, tested on 1-minute data May 2007-April 2024, reports 1,985% total return net of costs, 19.6% annualised, Sharpe 1.33; the authors test whether profitability depends on volatility regime and dealer gamma imbalance. This is an author backtest, not a live record. — [SFI publication page](https://www.sfi.ch/de/publications/n-24-97-beat-the-market-an-effective-intraday-momentum-strategy-for-s-p500-etf-spy)
- Volatility dependence, mean reversion: Nagel (Review of Financial Studies 2012) shows VIX forecasts short-term reversal strategy returns; expected returns and conditional Sharpe ratios of reversal "increase enormously along with the VIX" in turmoil such as 2007-09. — [NBER w17653](https://www.nber.org/papers/W17653)
- Momentum crashes: Daniel and Moskowitz find momentum's large losses occur in "panic" states, after market declines and when volatility is high, coinciding with rebounds, and are partly forecastable. — [NBER w20439](https://www.nber.org/system/files/working_papers/w20439/w20439.pdf)
- Out-of-sample warning on regime conditioning: Cederburg, O'Doherty, Wang and Yan (Journal of Financial Economics 2020) re-tested volatility-managed versions of 103 equity strategies. The managed version beat the unmanaged one in 53 of 103 cases and only 8 showed consistently higher Sharpe; "reasonable out-of-sample versions generally earn lower certainty equivalent returns and Sharpe ratios" than the unmanaged originals, because of structural instability in the fitted relationships, even though Moreira and Muir's in-sample alphas replicate. — [paper](https://www.lehigh.edu/~xuy219/research/COWY.pdf); [Alpha Architect summary](https://alphaarchitect.com/does-portfolio-timing-based-on-volatility-signals-outperform-buy-and-hold/)

### Inferences
- "Markets change" is supported; "therefore 4 weeks beats 3 years" is not. Measured decay rates are on the order of 5 points of Sharpe decay per year of publication vintage and 26-58% over multi-year post-sample periods. A process that drifts over years is best tracked with a window long enough to estimate it, not a window whose noise (±22 points) exceeds any plausible monthly drift.
- The direction of volatility effects is consistent across studies: intraday trend/momentum and breakout-type rules do better on high-volatility, high-volume, news days; reversal/fade rules earn most when VIX is high and liquidity is scarce, with crash risk for momentum in panic rebounds. That suggests conditioning setups on an observable state (prior-day or opening realised range, VIX level, scheduled news) rather than on their own last 19 results. The state variable is known before the trade; the recent tally is mostly noise.
- A regime filter is itself a fitted rule. Cederburg et al. is the template caution: in-sample regime effects that are real on average still failed to improve real-time results in about half of cases. A filter should be few-parameter (for example one volatility tercile split), fixed in advance, tested over the full 3 years, and counted as additional trials.
- Three years of Nasdaq data (roughly late 2023 to late 2026) may not contain every regime (for example a sustained bear market), so the 3-year numbers are themselves regime-limited. That argues for more history, not less.

### Gaps
- No peer-reviewed measurement of how fast intraday discretionary-style edges (opening range breakouts, liquidity sweeps, fair-value-gap entries) decay was retrieved; the search for post-2020 replications of intraday momentum and opening-range results did not run.
- The specific regime results in Zarattini et al. (whether returns are stronger in high VIX) were not confirmed.
- No study retrieved on trend-filter (for example moving-average) conditioning for intraday index-futures setups with out-of-sample results.

## 5. Tools for combining a long history with a short window, and for deciding a strategy has stopped working

### Takeaway
The standard tools (Bayesian shrinkage, exponential weighting, SPRT, CUSUM) all give the same quantitative answer: with 7-20 trades per month, the recent window deserves a small weight (single digits to about 15%) and a statistically principled "it's broken" call takes on the order of 90-130 trades, that is many months per setup. Practitioners therefore use recent results to scale trust gradually and rely on pre-set drawdown limits as kill switches.

### Cited Findings
- Euan Sinclair (Robot Wealth, October 2025; reprinted by Interactive Brokers): for a simulated strategy with 10% annual return and 20% volatility traded five years, a Welch t-test (p = 0.12) and Kolmogorov-Smirnov test (p = 0.37) failed to flag a genuine change; the KS test has less power than the t-test for small mean shifts. He recommends Bayesian updating of the estimated drift and reframing the question from "Has my edge stopped working?" to "Given recent evidence, how much do I trust it now?". — [Robot Wealth](https://robotwealth.com/why-you-cant-tell-if-your-strategy-stopped-working-statistically-speaking/); [IBKR reprint](https://www.interactivebrokers.com/campus/ibkr-quant-news/why-you-cant-tell-if-your-strategy-stopped-working-statistically-speaking/)
- CUSUM for monitoring: Philips, Yashchin and Stein (Journal of Portfolio Management, Fall 2003) show a CUSUM scheme can flag a manager whose performance has gone flat in about 40 months, against the folklore of 40 years, and is optimal in the sense that for a given false-alarm rate no procedure detects faster. Software documentation for the method cites about 41 months to catch a good-to-bad transition versus about 16 years for a t-statistic of 2, with the alarm threshold set for one false alarm per 84 months. — [IBM Research page](https://research.ibm.com/publications/using-statistical-process-control-to-monitor-active-managers); [cusumActMgr documentation](https://rdrr.io/github/kecoli/PCRM/man/cusumActMgr.html)
- A September 2026 arXiv paper on monitoring mined investment factors reports a Monte-Carlo-calibrated CUSUM with a median detection delay of 181-337 days. — [arXiv 2609.27051](https://arxiv.org/pdf/2609.27051)
- Kevin Davey's process, per podcast and book summaries: every strategy gets a predefined stop-trading threshold before going live (one summary's example: stop after a $5,000 drawdown per contract); Monte Carlo resampling of trades sets expected drawdown ranges; position size is set so the bad-luck Monte Carlo drawdown stays within tolerance, with the advice to size for about half the drawdown you think you can stand. — [Algo Advantage podcast 036 summary, IBKR](https://www.interactivebrokers.com/campus/ibkr-quant-news/algo-advantage-036-kevin-davey-part-i-its-all-about-process-in-algo-trading/); [book summary](https://www.financialwisdomtv.com/post/building-winning-algorithmic-trading-systems-kevin-davey-s-complete-framework-for-trading-success)
- Davey has a dedicated interview on the topic. — [Better System Trader ep. 170, "How to detect when a trading strategy is failing"](https://sites.libsyn.com/66295/170-how-to-detect-when-a-trading-strategy-is-failing-kevin-davey)
- Practitioner rule of thumb (opinion): stop and reassess when live drawdown exceeds 1.5 × the historical maximum drawdown (example 1.5 × 20% = 30%). — [StonksCapital](https://stonkscapital.substack.com/p/how-to-avoid-ditching-a-winning-strategy)
- Practitioner framing (opinion): distinguish drawdown from breakdown; unusually long or deep drawdowns should lower the assumed Sharpe rather than trigger a binary verdict. — [Harbourfront Quant](https://harbourfrontquant.substack.com/p/when-trading-systems-break-down-causes)
- Carver's practice: use Sharpe information to tilt forecast weights modestly, keep diversifying rules even with poor measured Sharpe, and treat small performance differences as noise. He has a podcast episode on how traders wrongly kill strategies. — [Carver 2024 posts](https://qoppac.blogspot.com/2024/); [Carver, "My trading system"](https://qoppac.blogspot.com/2021/12/my-trading-system.html); [Better System Trader ep. 180](https://bettersystemtrader.libsyn.com/180-3-ways-traders-kill-trading-strategies-and-how-to-avoid-them-rob-carver)

### Inferences
Textbook methods with my worked numbers.

Bayesian (beta-binomial) shrinkage. Prior Beta(a, b) from history; after k wins in n recent trades the posterior mean is (a + k)/(a + b + n). The prior's "effective sample size" a + b is the dial for how much you believe the past still applies.

| Prior (3-year record 52% wins) | After a hot month 13/19 (68%) | After a cold month 6/19 (32%) |
|---|---|---|
| Full weight, 400 trades | 52.7% | 51.1% |
| Discounted to 100 trades | 54.6% | 48.7% |
| Discounted to 50 trades | 56.5% | 46.4% |
| Discounted to 20 trades | 60.0% | 42.1% |

- Even after throwing away 87% of the history (prior worth 50 trades), a 68% month moves the estimate only to 56.5%. To make the 4-week figure dominate, the prior must be worth fewer than 19 trades, which asserts that 3 years of data are worth less than one month. Section 3 shows that needs true monthly swings of about 11.5 points, which is testable.
- Empirical Bayes across the 14 setups (James-Stein style): shrink each setup's estimate toward the 14-setup average by the factor [sampling variance]/[sampling variance + between-setup variance]. With 19 trades (sampling SD 11.5 points) and true between-setup SD of perhaps 5 points, each 4-week figure should be pulled 84% of the way back to the group average. The same idea applied to the 3-year numbers is the cure for "best of 14" selection bias in Section 1.
- Exponential weighting: weight λ^age per trade; half-life h trades gives λ = 0.5^(1/h) and effective sample size (1+λ)/(1−λ). Half-life 20 trades: about 58 effective trades (SE about 6.6 points); 50: 144 (4.2 points); 100: 289 (2.9 points); 200: 577. A half-life of 50-100 trades (several months to a year per setup) is the shortest that keeps the estimate's noise below a plausible edge size.
- SPRT (Wald) for a kill switch: add ln(p₁/p₀) per win and ln((1−p₁)/(1−p₀)) per loss; stop when the sum crosses ln((1−β)/α) or ln(β/(1−α)). Testing 55% (healthy) against 45% (broken): each win/loss moves the sum ±0.20; with α = β = 10% the bounds are ±2.20 and the average decision takes about 88 trades; with 5%/5%, about 132 trades. For 50% vs 60% the figures are about 87 and 131; for 50% vs 55%, about 350 and 528. For mean R (0 vs +0.1R): about 350-530 trades at σ = 1R and about 790-1,190 at σ = 1.5R. At 7-20 trades per 4 weeks, 88 trades is 4-12 months for one setup.
- CUSUM: accumulate (observed R − expected R) per trade, reset at zero on the good side, alarm when the downside sum passes a threshold calibrated by simulation to an acceptable false-alarm rate (Philips et al. used one per 7 years). With 14 setups monitored at once, per-setup false-alarm rates must be set about 14 times stricter or most alarms will be false.
- What a 4-week result can legitimately do is act as a tripwire for gross failure: for a true 55% setup, 5 or fewer wins in 19 has probability 1.1%, 4 or fewer 0.3%. But across 14 setups, at least one shows 5 or fewer wins of 19 in about 14% of months even when nothing is wrong (36% of months if true win rates are 50%). A result that bad should trigger a check for implementation errors, data problems or changed market microstructure, and a size cut, not a statistical conclusion.
- A design consistent with the evidence:
  1. Long-run estimate per setup from the full history, shrunk toward the 14-setup mean and haircut for selection (Sections 1 and 6 suggest halving).
  2. Eligibility and size from that estimate, optionally conditioned on a pre-specified state variable (Section 4).
  3. Recent results enter only through a slow update (prior worth 50-100 trades or EWMA half-life 50-100 trades) so a month moves size by a few percent.
  4. Kill switch defined before trading: a drawdown limit from Monte Carlo resampling of the backtest trades (Davey), or SPRT/CUSUM bounds, evaluated at portfolio level first because pooling 14 setups gives 100-280 trades a month and far more power.
  5. Test the recency belief directly on the 3-year data (Section 3) before using it.
- Asymmetry worth stating: aggregate recent evidence is much stronger than per-setup evidence. Four weeks of all 14 setups is about 100-280 trades (SE 3-5 points on win rate), enough to notice that the whole book is under-performing, though not which setup is at fault.

### Gaps
- Davey's exact quitting rule was not confirmed from a primary source. My recollection is that his book sets the quit point from Monte Carlo drawdown (commonly paraphrased as about 1.5 × the expected maximum drawdown); the search confirmed only that a predefined threshold exists. Verify in "Building Winning Algorithmic Trading Systems" (the Monte Carlo and incubation chapters).
- No dedicated Carver post titled as a "when to stop trading a system" rule was found; his position is reconstructed from posts on significance and weighting.
- I did not retrieve a source applying SPRT to trade sequences; the numbers are my application of Wald's standard test. López de Prado's CUSUM filter and Bailey & López de Prado's stop-out work were not retrieved.
- Sinclair's article was read only through search extracts; any detection-time figures in the body are not reported.

## 6. Walk-forward analysis, out-of-sample testing, incubation and paper trading: recommendations and backtest-to-live failure rates

### Takeaway
The practitioner sequence is: limited in-sample exploration, walk-forward or held-out testing, Monte Carlo stress, then months of untouched real-time "incubation" before money, with a quit rule written in advance. Large-sample evidence says to expect live results at roughly a quarter to a half of backtest, with backtest Sharpe nearly useless for ranking strategies.

### Cited Findings
- Davey's published process: goals, edge idea, feasibility test, walk-forward analysis, Monte Carlo stress testing, incubation in real time, then live with predefined stop criteria. Incubation is described as mandatory and as a check that live behaviour matches the backtest. — [book summary](https://www.financialwisdomtv.com/post/building-winning-algorithmic-trading-systems-kevin-davey-s-complete-framework-for-trading-success); [Algo Advantage 036 summary, IBKR](https://www.interactivebrokers.com/campus/ibkr-quant-news/algo-advantage-036-kevin-davey-part-i-its-all-about-process-in-algo-trading/)
- Incubation length is reported inconsistently: 6 to 12 months without real money (IBKR summary of the 2025 podcast); a Strategy Factory participant describes 3 months of "instant incubation" before normal real-time incubation; a third-party blog says 4-12 weeks. — [IBKR summary](https://www.interactivebrokers.com/campus/ibkr-quant-news/algo-advantage-036-kevin-davey-part-i-its-all-about-process-in-algo-trading/); [NexusFi thread](https://nexusfi.com/showthread.php?p=355316)
- Backtest-to-live shrinkage, three independent data sets: median Sharpe 1.20 backtest vs 0.31 live, 73% haircut, 30% of strategies negative live (215 bank strategies) — [Alpha Architect on Suhonen et al.](https://alphaarchitect.com/beware-of-backtest-overfitting/); about 50% of in-sample performance retained out of sample (published anomalies) — [Falck, Rej & Thesmar](https://arxiv.org/pdf/2105.01380); 26% lower out of sample, 58% lower post-publication (97 predictors) — [McLean & Pontiff](https://econpapers.repec.org/RePEc:bla:jfinan:v:71:y:2016:i:1:p:5-32)
- Backtest Sharpe does not rank strategies out of sample (R² < 0.025 across 888 algorithms), and more backtest iterations go with a larger backtest-to-live gap. — [Quantpedia on Wiecki et al.](https://quantpedia.com/quantopians-academic-paper-about-in-vs-out-of-sample-performance-of-trading-alg/)
- Minimum backtest length rises with the number of configurations tried; reporting the number of trials is necessary to interpret any backtest. — [Bailey et al.](https://carmamaths.org/jon/backtest.pdf)

### Inferences
- The evidence-based haircut for a freshly backtested rule set is 50-75% of the measured edge, more if many variants were tried and the rules are complex. A backtest +0.10R per trade should be planned as +0.03R to +0.05R.
- Incubation cannot statistically confirm an edge at intraday-setup trade frequencies: 3-6 months gives about 20-130 trades per setup, which Section 2 shows cannot separate +0.1R from zero. Its real functions are to catch implementation errors (look-ahead, fill assumptions, session/time-zone mistakes), to verify that live trade frequency, average win/loss and slippage match the backtest, and to enforce a cooling-off period with no parameter edits. That matches Davey's stated purpose.
- A 4-week rolling tally is in effect a continuously restarted incubation that is too short for any of those purposes except error-catching.
- The out-of-sample test is spent once looked at. Re-selecting setups each month on recent results turns live trading into a repeated in-sample selection with 7-20 observations.

### Gaps
- No verified source for Davey's commonly quoted pass rates (strategies tested per strategy traded) or for Pardo's walk-forward-efficiency threshold; the search budget ran out. From memory, Pardo suggests out-of-sample annualised profit of at least about 50% of in-sample as a robustness bar; unverified.
- No reliable statistic found for the share of retail algorithmic or rule-based intraday strategies that survive from backtest to profitable live trading.
- López de Prado's specific recommendations (purged/embargoed cross-validation, combinatorial purged CV, "backtesting is not a research tool") were not retrieved this session.

## 7. Converting discretionary 1-5 minute chart concepts into rules tested on 15-minute bars: what is lost and what resolution is needed

### Takeaway
A 15-minute OHLC bar does not record the order in which prices traded, so any trade whose stop and target both fall inside one bar's range cannot be resolved without finer data; platform vendors themselves tell users to add 1-minute or tick data for intrabar fills. Academic intraday studies and the large Quantopian sample used 1-minute bars as the working resolution.

### Cited Findings
- NinjaTrader support: with OHLC bars the strategy "has no idea what order things happened" inside the bar; when stop and target are both inside one bar the simulator does not know price direction, and in one reported configuration defaults to a loss. The standard fill engine splits each bar into three virtual bars based on how close the open is to the high and low. Conservative and liberal fill algorithms give different results. The recommended fix is a secondary finer series (for example 1 tick) or High Order Fill Resolution for intrabar fills, which is not compatible with Tick Replay. — [NinjaTrader forum, stop/target handling](https://forum.ninjatrader.com/forum/ninjatrader-8/strategy-development/1262218-handling-of-stop-loss-and-take-profit-levels-in-backtesting); [NinjaTrader forum, same-bar stop and target](https://forum.ninjatrader.com/forum/ninjatrader-8/strategy-development/1087741-stop-and-profit-on-same-daily-bar-during-back-test); [NinjaTrader forum, intrabar granularity](https://forum.ninjatrader.com/forum/ninjatrader-7/strategy-development-aa/96775-backtesting-with-more-intra-bar-granular)
- TradingView: by default the broker emulator has only OHLC values for historical bars and must assume the intrabar path; Bar Magnifier replaces the assumption with lower-timeframe data for more realistic fills, limited to 200,000 lower-timeframe bars, so the earliest trades on long histories may not be magnified. In TradingView's example, fill prices were unchanged but the exit moved into the same bar as the entry. — [TradingView support, Bar Magnifier](https://www.tradingview.com:443/support/solutions/43000669285-what-s-bar-magnifier-backtesting-mode/); [TradingView blog](https://www.tradingview.com/blog/en/accurate-backtesting-with-bar-magnifier-31746)
- Resolution used in formal intraday research: Quantopian ran all 888-algorithm simulations on minute-bar trade prices; Zarattini, Aziz and Barbon used 1-minute OHLCV data (IQFeed) for their SPY intraday study. — [Quantopian paper copy](https://c.mql5.com/forextsd/forum/208/All%20that%20Glitters%20Is%20Not%20Gold%20-%20Comparing%20Backtest%20and%20Out-of-Sample%20Performance%20on%20a%20Large%20Cohort%20o.pdf); [Zarattini et al., SFI page](https://www.sfi.ch/de/publications/n-24-97-beat-the-market-an-effective-intraday-momentum-strategy-for-s-p500-etf-spy)

### Inferences
- What is lost at 15 minutes (reasoning, not sourced):
  - The entry trigger. Patterns defined on 1-5 minute charts (a sweep of a prior low followed by a 1-minute structure shift, a small imbalance/gap retest) usually complete inside one 15-minute bar and are invisible on it. A 15-minute proxy is a different strategy, so its statistics neither confirm nor refute the taught setup.
  - Stop distance and R. Structure-based stops on 15-minute bars are several times wider than on 1-minute structure, so R multiples, win rate and trade count are not comparable.
  - Intrabar ordering. NQ's 15-minute range is frequently larger than an intraday stop, so the share of trades where entry, stop and target interact within one bar is high; those trades are decided by the simulator's assumption.
  - Entry timing and look-ahead. A signal known only at the bar close but filled at a price inside that bar is look-ahead; using the session high/low or a "confirmed" swing before it was confirmable is the same error.
  - Fills. Limit orders at a level touched by a bar's extreme are not guaranteed fills; stop orders slip, most at the open and around news.
- Minimum credible setup: signals on whatever timeframe the rule is defined, but fills, stops and targets simulated on 1-minute data at most (tick or 1-second data if stops are within a few points or if limit-order queue position matters), with explicit slippage and commission in ticks.
- If only 15-minute data is available, report results under the pessimistic convention (stop assumed hit first whenever both levels are inside a bar; no fill when the entry is only touched) alongside the optimistic one, and report the share of trades that were ambiguous. If the edge exists only under the optimistic convention, it has not been demonstrated.
- This is a separate source of error from sampling noise and multiple testing: a t-statistic of 2.3 computed on ambiguous fills may be biased as well as lucky.

### Gaps
- No peer-reviewed study retrieved that quantifies the bias from OHLC-bar stop/target simulation on index futures at 15-minute versus 1-minute resolution.
- TradingView's exact default intrabar path assumption (open-high-low-close versus open-low-high-close depending on proximity) was not confirmed in the extracts.
- No source retrieved on typical NQ/MNQ slippage for stop and market orders.

## 8. How discretionary professionals at proprietary firms (for example SMB Capital) use playbooks and statistics

### Takeaway
SMB's published approach is a personal catalogue of a small number of well-defined setups, archived trade by trade and reviewed daily and weekly, with running statistics per setup and per trade grade used to decide where to size up; the free material gives the process but no audited performance data. The retrieved material does not show setups being switched on short-run win rates.

### Cited Findings
- Bellafiore's "The PlayBook" teaches building a personalised catalogue of high-quality setups that fit the trader's edge; SMB traders share playbooks, review trades together and learn from senior traders. — [TraderLion summary](https://traderlion.com/trading-books/the-playbook-summary/); [Trade That Swing summary](https://tradethatswing.com/key-lessons-for-day-traders-from-the-playbook-by-mike-bellafiore/); [book excerpt, InformIT](https://informit.com/articles/article.aspx?p=2114499)
- SMB's own blog describes traders archiving their best setups of the day as the route to consistency. — [SMB Training blog, "How to Become a Consistently Profitable Trader"](https://www.smbtraining.com/blog/how-to-become-a-consistently-profitable-trader)
- A digest of an SMB Capital video says desks should keep running statistics on win rate, mis-graded trades and P&L per grade, and credits the playbook exercise with higher win rates, without giving numbers. — [Recapio digest of SMB Capital video](https://recapio.com/digest/what-most-prop-desks-don-t-want-you-to-know-by-smb-capital)
- An aggregator site attributes to SMB a monthly review rule of promoting setups with at least a 55% win rate and 1.7R expectancy over a 30-trade minimum. This could not be traced to SMB or Bellafiore and the site is low quality; treat as unconfirmed. — [forex.in.rs](https://www.forex.in.rs/smb-trader-strategy)

### Inferences
- The professional discretionary model is "few setups, deep sample per setup, slow promotion": statistics accumulate over months per setup and determine size, which is the opposite of rotating among 14 setups on a 4-week tally.
- Even the unconfirmed "30-trade minimum" is larger than the reader's 7-20 trade window, and Section 2 shows 30 trades is itself too few to establish a 55% win rate (SE about 9 points).
- Prop-firm playbook statistics are mainly a behavioural and risk-allocation tool (which trades am I executing well, where am I mis-grading), supervised by risk managers and capital limits; they are not presented as statistical proof of edge.

### Gaps
- The site-restricted search of smbtraining.com did not run (search budget exhausted), so there are no direct quotes of SMB's playbook template or review cadence; the points above rest on one SMB blog post and third-party summaries.
- No published data found on SMB traders' setup-level win rates, sample sizes or the share of trainees who become profitable.
- No retrieved source on how other prop firms (for example futures-focused firms) quantify setup statistics.
