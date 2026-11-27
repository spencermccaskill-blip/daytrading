# Prop-account position sizing, risk of ruin, and base rates of success (as of 27 November 2026)

*Research-method note (read first): in this session the page-fetch tool could not reach `intercom.help`, `topstep.com`, `papers.ssrn.com` or `faculty.haas.berkeley.edu` (hosts outside the session's network allowlist), and the shared web-search budget ran out before the last batch of verification searches. Every "Cited Finding" below therefore rests on search-result extracts of the linked page, not on a full read of it. Where an extract did not make clear which of several returned pages carried a number, that is stated. All numerical tables marked "own calculation" were computed in this session (Python, Monte Carlo with 40,000-100,000 paths per cell, standard error about 0.2-0.5 percentage points) and are inferences, not citations.*

*Concrete case used throughout: Lucid Trading $50,000 funded account; end-of-day (EOD) trailing Max Loss Limit (MLL) of $2,000 that locks at $50,100; balance $50,046; MLL $49,363; cushion $683; MNQ at $2 per index point (tick 0.25 = $0.50, per the assignment brief); stops 25-150 points; current risk $250 per trade; tested win rates 35-60%; expectancy -0.1R to +0.2R per trade.*

---

## 1. Risk of ruin: standard formulas and what they give for a cushion of about 2.7 losing trades versus smaller risk units

### Takeaway
At $250 per trade the cushion is 2.73 risk units, and every standard formula gives a breach probability of roughly 28-63% before the cushion is even restored to $2,000 for edges of +0.05R to +0.2R (about 66% at zero edge, 77-91% at -0.1R); cutting risk to $50-$68 (10-14 units) reduces that, at a 45% win rate, to 14-23% at +0.1R and 4-8% at +0.2R, but does nothing if the true edge is zero and makes the outcome worse (though slower) if the edge is negative. Sizing only helps a trader who actually has a positive edge; it is the edge that decides the destination and the size that decides the variance around it.

### Cited Findings
- Classic equal-payoff risk of ruin (often attributed to Kaufman): define advantage A = p − q; RoR = ((1 − A)/(1 + A))^U, where U is the number of risk units of capital. The closed form assumes independent trades, constant size and a 1:1 payoff; extensions for unequal payoffs exist "but become unwieldy" — [LuxAlgo concept library: Risk of Ruin](https://www.luxalgo.com/library/concept/risk-of-ruin.md); the same form, with Capital_Units = ruin threshold ÷ per-trade risk, is given at [Tradicted](https://www.tradicted.com/learn/risk-of-ruin-in-trading/) and [Trade2Win thread](https://www.trade2win.com/threads/risk-of-ruin.234288/).
- Attribution is inconsistent: some pages attribute the simple formula to Kaufman's *Smarter Trading* rather than *Trading Systems and Methods*, and note that it ignores average winner and loser sizes — [PatternsWizard](https://patternswizard.com/risk-of-ruin/).
- Kaufman's *Trading Systems and Methods* contains a separate section on risk of ruin with unequal wins and losses, defining total capital in units, a cutoff level where ruin occurs and the capital available to risk, and attributing the method to Fred Gehm and to Wolberg's *Expert Trading Systems* — [flipbook copy of the book](https://fliphtml5.com/lnym/jhdm/PERRY_KAUFMAN_-_TRADING_SYSTEMS_AND_METHODS/). A forum transcription of the unequal-payoff formula (cited to p. 616) uses average win, average loss, win percentage and a standard-deviation-style term; the poster questions its behaviour, so it is unverified — [EliteTrader thread](https://www.elitetrader.com/et/threads/anyone-know-the-proper-definition-of-risk-of-ruin.29989/).
- Ralph Vince's *Portfolio Management Formulas* (Wiley, 1990) has a chapter on Risk of Ruin and one on Optimal Fixed Fractional Trading — [Wiley listing](https://www.wiley-vch.de/en/areas-interest/finance-economics-law/portfolio-management-formulas-978-0-471-52756-5). Under a fixed-fractional model the theoretical risk of total ruin is zero because size shrinks in proportion to equity — [FXStreet learning center, money management models](https://learningcenter.fxstreet.com/education/learning-center/unit-3/chapter-3/money-management-models/index.html).
- A fixed-position-size ruin formula built from the mean return and the standard deviation of returns (the "real risk is substituted with the standard deviation") for an infinite number of trades is given at [EarnForex: Risk of Ruin in Trading](https://www.earnforex.com/guides/risk-of-ruin-in-trading/).
- Exact ruin probabilities with asymmetric payoffs: Karl Whelan (University College Dublin) derives them and finds that, for a given edge, higher winning payoffs (i.e., lower win rates with bigger winners) imply higher probabilities of ruin and lower average final wealth — [Whelan, "Ruin Probabilities for Strategies with Asymmetric Risk"](https://www.karlwhelan.com/sports-betting-gamblers-ruin-asymmetric-odds/); [UCD working paper WP2025_03](https://www.ucd.ie/economics/t4media/WP2025_03.pdf).
- Van Tharp: R is the initial risk defined by the stop; an R-multiple is the result divided by R; expectancy is the mean of the system's R-multiple distribution. His sample "marble game" (20% 10R winners, 70% 1R losers, 10% 5R losers) has expectancy 0.8R while winning only 20% of the time; he recommends risking about 1% of equity until the trader knows the system well. Commentary on the game notes that risking 10-20% per marble "could spell ruin fast" — [Scribd: A Short Lesson on R and R-multiple](https://www.scribd.com/document/396639530/A-Short-Lesson-on-R-and-R-multiple); [Stansberry Research on the marble game](https://stansberryresearch.com/articles/these-marbles-determine-your-success-as-a-trader); [blog reproduction of Tharp on position sizing](https://forex-training-blog.blogspot.com/2008/04/position-sizing-continued.html). (The search extract did not say which of these pages carried which sentence.)

### Inferences
All formulas and numbers in this subsection are own derivations/calculations. Trade model: each trade loses 1R with probability q = 1 − p or wins W·R with probability p, independent trades, fixed dollar risk, stop honoured exactly, costs already inside the stated expectancy E. Given p and E, W = (E + 1 − p)/p, and the per-trade standard deviation in R is σ = sqrt(p·W² + q − E²).

**Formula set**

1. Units of cushion: U = C / r, with C = $683 and r = dollar risk per trade. $250 → 2.73; $150 → 4.55; $100 → 6.83; $68 → 10.0; $50 → 13.7; $34 → 20.1.
2. Equal-payoff closed form (cited above): RoR = ((1 − A)/(1 + A))^U, A = p − q. This equals E only when W = 1.
3. Unequal payoffs, infinite horizon, fixed lower barrier (diffusion approximation): RoR ≈ exp(−2·E·U / σ²). Exact version (Cramér-Lundberg): find r* > 0 solving p·e^(−r*·W) + q·e^(r*) = 1; then RoR ≈ e^(−r*·U). For E ≤ 0, RoR = 1.
4. Two barriers (breach at −a units before reaching +b units), θ = 2E/σ²: P(breach first) = (1 − e^(−θb)) / (e^(θa) − e^(−θb)); for E = 0 this reduces to b/(a + b), independent of bet size.
5. Streak check: P(next three trades all lose) = q³ = 27.5% at p = 0.35, 16.6% at p = 0.45, 6.4% at p = 0.60. At $250 risk three straight losses (−$750) breach the $683 cushion; after two losses only $183 remains.

**State of this account.** MLL $49,363 implies a highest EOD balance of $51,363 (MLL + $2,000). The balance is $1,317 below that high-water mark, so the floor is effectively static until an EOD close above $51,363; the cushion is back to the full $2,000 at +$1,317; the floor locks at $50,100 once an EOD balance of $52,100 is reached (+$2,054 from here; lock trigger per third-party descriptions, see section 3).

**Worked example (p = 0.45, E = +0.1R, so W = 1.444R, σ = 1.216R, θ = 0.1353 per R).**
- $250 risk: a = 2.73, b = 1,317/250 = 5.27. Formula 4: (1 − e^(−0.713))/(e^(0.369) − e^(−0.713)) = 0.510/0.957 = 53%. Monte Carlo: 51%.
- $68 risk: a = 10.04, b = 19.4 → 24% (Monte Carlo 23%). $34 risk: 6.6% (Monte Carlo 5.9%).
- Formula 3 (never-ending, static floor): $250 → exp(−2·0.1·2.73/1.479) = 69%; $68 → 26%; $34 → 6.6%.

**Table A. P(MLL breach before the cushion is restored to $2,000, i.e., before +$1,317), own Monte Carlo, static floor at $49,363**

| Win rate / edge | $250 | $150 | $100 | $68 | $50 | $34 |
|---|---|---|---|---|---|---|
| p=0.35, −0.1R | 77% | 84% | 89% | 94% | 97% | 99% |
| p=0.35, 0R | 65% | 66% | 66% | 66% | 66% | 66% |
| p=0.35, +0.05R | 63% | 56% | 56% | 46% | 43% | 32% |
| p=0.35, +0.1R | 56% | 51% | 43% | 34% | 25% | 15% |
| p=0.35, +0.2R | 48% | 40% | 29% | 18% | 10% | 4% |
| p=0.45, −0.1R | 84% | 89% | 95% | 98% | 100% | 100% |
| p=0.45, 0R | 65% | 65% | 66% | 66% | 66% | 66% |
| p=0.45, +0.05R | 56% | 54% | 47% | 39% | 32% | 20% |
| p=0.45, +0.1R | 51% | 43% | 33% | 23% | 14% | 6% |
| p=0.45, +0.2R | 40% | 29% | 17% | 8% | 4% | 1% |
| p=0.60, −0.1R | 91% | 97% | 100% | 100% | 100% | 100% |
| p=0.60, 0R | 63% | 65% | 65% | 65% | 65% | 65% |
| p=0.60, +0.05R | 52% | 43% | 34% | 23% | 15% | 6% |
| p=0.60, +0.1R | 39% | 27% | 17% | 8% | 3% | 1% |
| p=0.60, +0.2R | 28% | 13% | 6% | 1% | 0.3% | 0% |

Zero-edge row check: b/(a + b) = 1,317/2,000 = 65.9% at any size.

**Table B. P(MLL breach within the next 20 trades / next 60 trades), own Monte Carlo (EOD floor update every 2 trades)**

| Win rate / edge | $250 | $150 | $100 | $68 | $50 | $34 |
|---|---|---|---|---|---|---|
| p=0.35, 0R | 63% / 81% | 41% / 65% | 22% / 49% | 8% / 31% | 1% / 18% | 0% / 4% |
| p=0.35, +0.1R | 55% / 71% | 34% / 53% | 19% / 35% | 6% / 19% | 1% / 10% | 0% / 2% |
| p=0.45, −0.1R | 65% / 90% | 41% / 77% | 22% / 64% | 3% / 39% | 0.5% / 24% | 0% / 4% |
| p=0.45, 0R | 52% / 75% | 31% / 57% | 13% / 39% | 3% / 22% | 0.2% / 10% | 0% / 1% |
| p=0.45, +0.1R | 45% / 60% | 25% / 40% | 10% / 24% | 3% / 11% | 0.2% / 4% | 0% / 0.5% |
| p=0.45, +0.2R | 38% / 48% | 19% / 29% | 7% / 15% | 1% / 6% | 0.2% / 2% | 0% / 0.2% |
| p=0.60, 0R | 39% / 63% | 20% / 44% | 5% / 25% | 0.4% / 10% | 0% / 3% | 0% / 0.1% |
| p=0.60, +0.1R | 29% / 42% | 11% / 23% | 3% / 11% | 0.2% / 3% | 0% / 0.7% | 0% / 0% |
| p=0.60, +0.2R | 23% / 30% | 8% / 12% | 2% / 5% | 0.1% / 0.8% | 0% / 0.2% | 0% / 0% |

**Equal-payoff closed form for comparison (formula 2, U = 683/r):** A = 0.05 → 76% / 63% / 51% / 37% / 26% / 13% at $250 / $150 / $100 / $68 / $50 / $34; A = 0.10 → 58% / 40% / 25% / 13% / 6% / 2%; A = 0.20 → 33% / 16% / 6% / 2% / 0.4% / 0%. These are infinite-horizon figures against a fixed floor and are higher than Table A because they have no "safe" upper barrier.

**Readings.**
- With the best-case tested edge (+0.2R) the current $250 size still breaches before recovery in roughly 28-48% of paths, depending on win rate. With +0.1R it is roughly a coin flip (39-56%).
- Consistent with Whelan's cited result, low-win-rate/large-winner profiles are more ruin-prone at the same edge: at +0.1R and $68 risk, breach probability is 34% at p = 0.35 versus 8% at p = 0.60.
- Smaller size takes longer: reaching +$1,317 at +0.1R takes about 1,317/(0.1 × r) trades on average: 53 trades at $250, 132 at $100, 194 at $68, 263 at $50, 387 at $34 (halve these at +0.2R).
- Contract granularity binds: 1 MNQ risks $2 × stop points, so 1 contract is $50 at a 25-point stop, $100 at 50 points, $200 at 100 points and $300 at 150 points. A $68 risk unit (10% of the cushion) is only attainable with stops of 34 points or less; a 100-150 point stop cannot be traded below $200-$300 risk, i.e., 29-44% of the remaining cushion per trade.

### Gaps
- The exact text of Kaufman's unequal-payoff formula (TSM pp. 615-617) and Vince's fixed-fractional risk-of-ruin formula could not be verified from the books; only their existence and attribution were confirmed. Formulas 3 and 4 above are standard gambler's-ruin/diffusion results derived here, not quotations.
- Independence of trades is assumed. Serially correlated losses (regime dependence, tilt) would make all breach probabilities higher than tabulated.
- Stops are assumed to fill at the stop price; MNQ gaps and fast-market slippage are not modelled.

---

## 2. Kelly criterion and fractional Kelly for trades expressed in R; why full Kelly is too aggressive under parameter uncertainty; what practitioners recommend

### Takeaway
For a trade that loses 1R or wins W·R, full Kelly is f* = E/W of bankroll per trade, which for the tested edges is only 2.5-20% of the cushion ($17-$137 on $683); practitioners (Thorp and co-authors, Carver) advise half Kelly or less because edge estimates are noisy and over-betting is punished far more than under-betting. The current $250 is 36.6% of the cushion, which is above twice full Kelly for every tested positive-edge case except the single most favourable one.

### Cited Findings
- Thorp's "The Kelly Criterion in Blackjack, Sports Betting, and the Stock Market" (in the MacLean-Thorp-Ziemba Kelly volume) includes a section on the case for fractional Kelly and a section on the "almost real world" of estimation problems — [Thorp 2006 PDF](https://www.Gwern.net/doc/statistics/decision/2006-thorp.pdf); [RePEc record](https://ideas.repec.org/h/wsi/wschap/9789814293501_0054.html).
- MacLean, Thorp and Ziemba: estimation errors can be reduced by using a fraction of the full Kelly proportion; fractional Kelly is a blend of the Kelly portfolio and cash; betting above Kelly can lead to ruin in bad scenarios even with many favourable bets — [MacLean, Thorp, Ziemba (eScholarship)](https://escholarship.org/content/qt5mr5k8qj/qt5mr5k8qj.pdf); ["Good and bad properties of the Kelly criterion"](https://www.stat.berkeley.edu/~aldous/157/Papers/Good_Bad_Kelly.pdf).
- In the same "Good and bad properties" paper, a blackjack table with a 2% edge shows half Kelly achieving a relative growth rate of 0.75 with a 0.89 probability of doubling before halving — [Good_Bad_Kelly.pdf](https://www.stat.berkeley.edu/~aldous/157/Papers/Good_Bad_Kelly.pdf).
- Robert Carver (*Systematic Trading*): realistic Sharpe ratios above 1.0 are rarely achieved and backtested 2.0-3.0 is likely overfitting; "it's far better to Half-Kelly and set your risk at half the optimal"; negative-skew strategies with strong backtests should run at half the risk of a more benign system; "if you get your estimate of Sharpe ratio wrong and bet more than optimal, you have a large chance of losing your shirt" — [CXO Advisory notes on Systematic Trading](https://www.cxoadvisory.com/big-ideas/a-few-notes-on-systematic-trading); [Carver's blog, Dec 2024](https://qoppac.blogspot.com/2024/12); [Carver thread](https://threadreaderapp.com/thread/1234306875379683328.html).
- A quant write-up shows halving optimal leverage does not halve geometric return (about 17.5% a year falls to about 14.4%), and describes half-Kelly as a crude stand-in for a rigorous treatment of estimation error in the Sharpe ratio — [arXiv 2109.10814, "Fractional Growth Portfolio Investment"](https://pdf.arxiv.org/pdf/2109.10814) (the search extract did not make clear whether this or the Carver blog carried the example).
- Tharp's practitioner default is about 1% of equity per trade until the system is well understood — sources in section 1.

### Inferences
- **Kelly in R (own derivation, standard result).** Growth per trade at fraction f: g(f) = p·ln(1 + f·W) + q·ln(1 − f). Maximising gives f* = p − q/W = (p·W − q)/W = E/W. For small edges and general R-distributions, f* ≈ E/E[R²] ≈ E/σ².
- **Over-betting penalty (own derivation).** With g(f) ≈ E·f − σ²·f²/2, g(k·f*) = g(f*)·(2k − k²): half Kelly keeps 75% of growth (matches the cited 0.75), 2× Kelly gives about zero growth, anything above 2× Kelly shrinks the bankroll on average despite a positive edge.
- **Applied to the case (own calculation; "bankroll" = remaining cushion, because that is the capital that can be lost before the account ends):**

| p, E | W | f* | Full Kelly on $683 | Half Kelly | Quarter Kelly | Full / half Kelly on a full $2,000 cushion |
|---|---|---|---|---|---|---|
| 0.35, +0.05R | 2.00 | 2.5% | $17 | $9 | $4 | $50 / $25 |
| 0.35, +0.1R | 2.14 | 4.7% | $32 | $16 | $8 | $93 / $47 |
| 0.35, +0.2R | 2.43 | 8.2% | $56 | $28 | $14 | $165 / $82 |
| 0.45, +0.05R | 1.33 | 3.75% | $26 | $13 | $6 | $75 / $38 |
| 0.45, +0.1R | 1.44 | 6.9% | $47 | $24 | $12 | $138 / $69 |
| 0.45, +0.2R | 1.67 | 12% | $82 | $41 | $20 | $240 / $120 |
| 0.60, +0.05R | 0.75 | 6.7% | $46 | $23 | $11 | $133 / $67 |
| 0.60, +0.1R | 0.83 | 12% | $82 | $41 | $20 | $240 / $120 |
| 0.60, +0.2R | 1.00 | 20% | $137 | $68 | $34 | $400 / $200 |

- **$250 on $683 is f = 36.6%.** Exact log-growth per trade at that fraction: −6.0% (p = 0.45, +0.1R), −3.6% (p = 0.45, +0.2R), −7.4% (p = 0.35, +0.2R), −2.3% (p = 0.60, +0.1R), +0.5% (p = 0.60, +0.2R; versus +2.0% at full Kelly). In other words, even if the best tested edges are real, the current size is expected to shrink the cushion in every case but one.
- **$250 was not unreasonable on a full cushion** (12.5% of $2,000, near full Kelly for the 0.45/+0.2R and 0.60/+0.1R cases), which is why the same dollar risk becomes over-betting after a drawdown: Kelly sizing is a fraction of current capital, so risk must fall as the cushion falls.
- **Parameter uncertainty in this case.** The tested expectancy range itself spans −0.1R to +0.2R, so the sign of the edge is not established. Kelly for E ≤ 0 is zero. A half-Kelly bet on the midpoint (+0.05R) is $9-$23, below one MNQ contract at any stop wider than about 11 points.
- **Caveat on applying Kelly to a prop cushion.** Kelly assumes continuous resizing and maximises long-run growth of the trader's own capital. In a funded account the trader's personal loss on a breach is the account/reset cost rather than the cushion, which gives the position an option-like payoff; that can make sizing above Kelly rational for someone who values only expected payout net of fees, at the price of a high breach frequency. That is a preference question, not a probability question; the breach probabilities are those in section 1.

### Gaps
- Thorp's exact wording on "2f* gives zero growth" and on his own use of fractional Kelly was not re-read (search budget exhausted); the over-betting result above is derived, not quoted.
- No source was found that derives a Kelly-optimal fraction specifically under a trailing, locking drawdown constraint.

---

## 3. Trailing drawdown specifics: EOD trailing versus a fixed stop-out, the "buffer", published analyses of optimal risk, daily loss limits and consistency rules

### Takeaway
An EOD trailing limit caps the cushion at $2,000 until the lock, so new equity highs buy no extra safety before $52,100; a fresh 50K account with zero edge reaches the lock only about 35-37% of the time, and this account, from $683 of room, about 24%. Published "optimal risk" guidance for prop accounts is almost entirely vendor rules of thumb (commonly 5-12% of the remaining drawdown per trade) and vendor Monte Carlo calculators; no independent peer-reviewed analysis was found.

### Cited Findings
- Lucid (firm help center, vendor source): the Max Loss Limit "is calculated based on their account's highest closing balance using an end-of-day method" and is the maximum a trader can lose before the account is closed — [Lucid help: Max Loss Limit (EOD drawdown)](https://intercom.help/lucid-trading/en/articles/11404720-max-loss-limit-eod-drawdown). A LucidPro-specific article exists at [Lucid support: LucidPro drawdown](https://support.lucidtrading.com/en/articles/12890136-lucidpro-drawdown) (not readable in this session).
- Lucid (firm help center, LucidFlex page): once the account exceeds the Initial Trail Balance, the MLL locks and no longer moves — [Lucid support: LucidFlex drawdown](https://support.lucidtrading.com/en/articles/12945815-lucidflex-drawdown).
- Third-party descriptions of the 50K LucidPro (2026): MLL $2,000, starting at $48,000, trailing the highest closing balance by $2,000; it stops trailing once the balance passes the Initial Trail Balance of $52,100 and then locks at $50,100 (starting balance + $100) — [proea.app: Lucid Trading drawdown](https://proea.app/en/blog/lucid-trading-drawdown); [swissfirmup: Lucid drawdown](https://swissfirmup.com/lucid-trading-drawdown.html); [LuxAlgo: Lucid Trading rules (2026)](https://www.luxalgo.com/prop-firms/lucid-trading/); [copilink: Lucid payout rules (November 2026)](https://copilink.com/prop-firms/lucid-trading). (Extract did not attribute each number to a single page.)
- Conflict: a July 2026 third-party guide states that funded accounts are "always intraday trailing", contradicting the EOD descriptions — [damnpropfirms: Lucid rules and payouts](https://damnpropfirms.com/prop-firms/lucid-trading-rules-payouts/). The assignment brief describes the account as EOD trailing, consistent with the firm's help-center wording.
- Daily loss limit at Lucid is a soft breach: "you do not lose your account for hitting DLL as long as the Max Loss Limit (MLL) has not been reached" — [Lucid help: Daily Loss Limit](https://intercom.help/lucid-trading/en/articles/11404705-daily-loss-limit). Third-party pages describe the DLL as optional on LucidPro/Flex/Daily, $1,200 on the 50K when enabled, and replaced after the account closes above the initial trail balance by a "LucidScale" limit equal to 60% of the highest end-of-day profit — [proea.app: Lucid Trading rules (Oct 2026)](https://proea.app/en/blog/lucid-trading-rules); [tradetanto: Lucid rules explained](https://tradetanto.com/learn/lucid-trading-rules-explained-every-plan-rule-and-limit).
- Consistency rule: Lucid's help center says the largest single-day profit must be less than or equal to a 35% consistency percentage for LucidPro payouts, recalculated after each approved payout — [Lucid help: How do LucidPro payouts work](https://intercom.help/lucid-trading/en/articles/11404650-how-do-lucidpro-payouts-work). Third-party sites list 40% (and 50% in evaluation), and a 90/10 split — [damnpropfirms: Lucid payouts explained](https://damnpropfirms.com/trading-guides/lucid-trading-payouts-explained/); [bestprops: LucidPro rules](https://bestprops.com/lucidpro-rules-payouts/). The numbers conflict; verify in the trader dashboard.
- Trailing versus static in vendor simulators: one calculator states the intraday trailing variant "routinely cuts pass probability by a third versus the static rule at the same limit"; another notes intraday max drawdown is measured from the highest-ever balance so a run-up then reversal counts against the trader even above starting balance; one tool notes that excursions inside a trade are not modelled, "which slightly understates trailing-drawdown risk" — vendor tools returned by the search: [propworld simulator](https://www.propworld.org/tools/prop-firm-simulator); [propfirmpal Monte Carlo](https://propfirmpal.com/calculators/monte-carlo); [edgelock calculator](https://www.edgelock.app/tools/prop-firm-calculator); [tradelens calculator](https://tradelensapp.com/tools/prop-firm-calculator) (exact page per quote not identified; vendor claims, not verified).
- An open-source simulator reports pass probability and expected value against risk per trade and finds the two maxima land on different risk sizes — [winxdevop/prop-firm-sim on GitHub](https://github.com/winxdevop/prop-firm-sim).
- Zero-edge baseline published in a practitioner blog: pass probability = drawdown limit ÷ (profit target + drawdown limit), independent of strategy — [propfirmarmour: challenge math](https://www.propfirmarmour.com/challenge-math) or [grandalgo: prop firm risk of ruin](https://grandalgo.com/blog/prop-firm-risk-of-ruin-guide) (blogs, not peer reviewed).
- Buffer-based sizing rules of thumb (vendor/practitioner): Apex's resource defines risk per trade as dollar risk ÷ available drawdown and shows 10 planned losses at 10%, 20 at 5%, 40 at 2.5% on a $10,000 allowance, suggesting 1% of drawdown or less with trailing drawdowns — [Apex Trader Funding resource](https://apextraderfunding.com/resources/prop-trading/effective-risk-management-strategies-for-prop-firm-funded-accounts/); NexusFi describes the risk fraction as typically 8-12% of the buffer and warns that on a $50,000 account with a $2,500 trailing drawdown, a $1,000 loss removes 40% of the termination buffer — [NexusFi: funded account position sizing](https://nexusfi.com/a/prop-firms/funded-account-position-sizing); one vendor calculator calls 10-25% of max drawdown per trade "a common frame" (rule of thumb, not a tested optimum).

### Inferences
- **How EOD trailing changes the maths (own derivation).** Let D = $2,000 and L = distance from the current high-water mark (HWM) to the lock trigger. While the floor trails, the cushion is min(D, D − drawdown from HWM): gains above the HWM add nothing. For a diffusion with drift μ and variance σ² per trade (in dollars), θ = 2μ/σ², the running maximum reached before the first drawdown of size D is exponentially distributed with rate λ = θ/(e^(θD) − 1) (λ = 1/D at zero drift; a classical result for Brownian motion with drift). Hence P(lock before breach, fresh account) ≈ exp(−λ·L). With L = $2,100 and zero edge: exp(−2,100/2,000) = 35%, i.e., 65% breach, at any bet size.
- **This account (below its HWM).** Two stages: (i) static floor until +$1,317 (section 1 formula 4), then (ii) trailing for the remaining $737 to the lock: P(lock) ≈ P(stage i) × exp(−λ·737). Zero edge: (683/2,000) × exp(−737/2,000) = 0.3415 × 0.692 = 23.6%, i.e., 76% breach before lock.

**Table C. P(MLL breach before the floor locks at $50,100), own Monte Carlo with EOD floor updates (2 trades per day): this account now / a fresh funded 50K for comparison**

| p, E | $250 | $150 | $100 | $68 | $50 | $34 |
|---|---|---|---|---|---|---|
| 0.45, 0R | 76% / 63% | 76% / 63% | 76% / 64% | 76% / 64% | 76% / 64% | 76% / 64% |
| 0.45, +0.05R | 66% / 51% | 61% / 43% | 55% / 34% | 44% / 23% | 36% / 14% | 22% / 5% |
| 0.45, +0.1R | 57% / 39% | 49% / 27% | 37% / 16% | 24% / 6% | 15% / 2% | 6% / 0.2% |
| 0.45, +0.2R | 46% / 25% | 31% / 11% | 19% / 3% | 8% / 0.4% | 4% / 0.1% | 0.8% / 0% |
| 0.35, +0.1R | 65% / 47% | 58% / 37% | 49% / 28% | 38% / 17% | 28% / 9% | 15% / 2% |
| 0.60, +0.1R | 45% / 24% | 30% / 11% | 18% / 3% | 8% / 0.5% | 3% / 0.1% | 0.8% / 0% |

- **EOD versus intraday trailing.** In this simulation, updating the floor after every trade instead of every second trade changed results by less than one percentage point, because breach is checked after every trade in both versions. The real advantage of EOD trailing is that unrealised intraday peaks (open profit that is given back) do not ratchet the floor; that effect requires intratrade path data and is not captured here. Practical consequence under EOD rules: only the closing balance matters for the ratchet, so a day that ends flat after being up costs nothing in cushion, whereas under intraday trailing it would.
- **Daily loss limit.** At Lucid the DLL is a soft breach and the hard constraint is the MLL. With $683 of room the MLL is tighter than the reported $1,200 DLL, so the DLL is not the binding rule in this state.
- **Consistency rule interaction (own reasoning from the cited 35% rule).** If no single day may exceed 35% of cumulative profit in the payout window, at least three profitable days are needed (1/0.35 = 2.86) and one outsized day forces further profit to dilute it. Sizing up to recover quickly therefore works against payout eligibility as well as against survival; smaller, more even days satisfy both.
- **"Buffer" concept (own framing; the cited third-party pages describe a buffer zone but were not readable).** After the lock at $50,100, cushion = balance − $50,100 and finally grows with profits, but each payout withdraws cushion. The practical buffer question is how much balance above $50,100 to leave in the account after a withdrawal; applying section 1, leaving fewer than about 10-20 risk units reintroduces double-digit breach odds even with a real edge.

### Gaps
- Lucid's official LucidPro funded-account page could not be opened; the $52,100 lock trigger, DLL amount, consistency percentage (35% versus 40%), payout caps, minimum profit days and whether the breach test uses intraday equity are confirmed only by search extracts and third-party pages that partly conflict.
- No independent, peer-reviewed analysis of optimal risk per trade under trailing-drawdown prop rules was found (an arXiv search returned only a general drawdown-distribution preprint).
- The quantitative difference between intraday and EOD trailing (vendor claim: about one-third lower pass probability) is unverified.

---

## 4. Published base rates: retail day traders (Taiwan, Brazil, US futures, EU/UK CFDs)

### Takeaway
Across the large-sample studies, the great majority of persistent retail day traders lose money and only a very small minority (well under 5%, and under 1% on the strictest "predictable skill" test) earn reliably positive net returns; the one US futures study from regulatory data finds the median retail futures trader loses a small amount and only the top ~40% break even or better per trading event.

### Cited Findings
- Brazil (Chague, De-Losso, Giovannetti, "Day Trading for a Living?", FGV/USP working paper 2019, SSRN version June 2020): tracked all 19,646 individuals who began day trading mini-Ibovespa futures in 2013-2015 using data from the Brazilian securities regulator (CVM). Of the 1,551 who persisted for more than 300 days, 97% lost money; 17 people (1.1%) earned more than the Brazilian minimum wage (about US$16 per day) and 8 (0.5%) earned more than the starting salary of a bank teller (about US$54 per day; an earlier working-paper abstract says 0.4%); no evidence of learning by day trading — [SSRN abstract 3423101](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101); [Quantpedia summary](https://quantpedia.com/retail-day-trading-is-an-uphill-battle/); [RePEc working paper](https://ideas.repec.org/p/fgv/eesptd/525.html).
- Caveat on generalising the Brazilian result: the sample may not be representative of traders in other countries or assets — [CXO Advisory](https://www.cxoadvisory.com/?p=32819). Follow-up (2025, *Brazilian Review of Finance*): day-trading participation rose abruptly during COVID-19 to around 100,000 active individuals per day — [Chague and Giovannetti, RBFin](https://periodicos.fgv.br/rbfin/article/view/94291).
- Taiwan (Barber, Lee, Liu, Odean, "The cross-section of speculator skill: Evidence from day trading", *Journal of Financial Markets* 18, 2014; data 1992-2006): "Less than 1% of the day trader population is able to predictably and reliably earn positive abnormal returns net of fees"; an earlier draft puts this at about 1,000 day traders in the average year; traders ranked top on prior-year performance go on to earn gross (net) abnormal returns of 49.5 (28.1) basis points per day in one working-paper draft, and 61.3 (37.9) bps per day in the extract of the published version (the figures differ by draft and by how the top group is defined); in aggregate, individuals' losses are material — [RePEc, JFM 2014](https://ideas.repec.org/a/eee/finmar/v18y2014icp1-24.html); [Haas working paper](https://faculty.haas.berkeley.edu/odean/papers/day%20traders/Day%20Trading%20Skill%20110523.pdf); [eScholarship](https://escholarship.org/uc/item/7k75v0qx).
- Taiwan, learning (Barber, Lee, Liu, Odean, Zhang, "Learning Fast or Slow?", *Review of Asset Pricing Studies* 10(1), 2020, pp. 61-93; earlier title "Do Day Traders Rationally Learn About Their Ability?"): the majority of day traders lose money; unprofitable day traders are more likely to quit than profitable ones — [RePEc, RAPS 2020](https://ideas.repec.org/a/oup/rasset/v10y2020i1p61-93..html); [Haas working paper](https://faculty.haas.berkeley.edu/odean/papers/day%20traders/day%20trading%20and%20learning%20110217.pdf).
- US futures (Ferko, Mixon, Onur, "Retail Traders in Futures Markets", CFTC Office of the Chief Economist staff paper No. 2023-002, posted 2024): "In general, we find that retail traders lose money in futures markets"; the median trader has estimated losses of $100-$200 depending on the number of events traded; traders at the 60th percentile of the P&L distribution break even; participants typically appear for a median of 4 trades lasting 4 days each with gains or losses of a few hundred dollars per event; retail traders frequently hold micro equity index contracts such as Micro E-mini S&P and Micro Nasdaq-100; they tend to trade contrarian — [CFTC staff paper PDF](https://www.cftc.gov/sites/default/files/2024-11/Retail_Traders_Futures_V2_new_ada.pdf); [CFTC research papers index](https://www.cftc.gov/About/EconomicAnalysis/ResearchPapers/index.htm). A secondary source describes the sample as 36,538 retail accounts at one large futures commission merchant in the 50 most active CME contracts, February 2021 to November 2022 — [Thor Trade Copier summary](https://thortradecopier.com/blog/what-percentage-of-day-traders-lose-money).
- EU CFDs (ESMA, product intervention agreed 23 March 2018): national regulators' studies found 74-89% of retail accounts typically lose money on CFDs, with average losses per client of €1,600 to €29,000; providers must publish the percentage of their retail CFD accounts that lost money over the last 12 months — [ESMA press release](https://www.esma.europa.eu/node/84933); [ESMA notice of product intervention decisions](https://www.esma.europa.eu/sites/default/files/library/esma35-43-1135_notice_of_pi_decisions_on_cfds_and_binary_options.pdf).
- UK CFDs (FCA, December 2016 proposals): a sample of client accounts showed 82% of clients lost money on CFDs; a later FCA review found 76% of retail customers who bought CFDs on an advisory or discretionary basis lost money — [FCA press release](https://www.fca.org.uk/news/press-releases/fca-proposes-stricter-rules-contract-difference-products); [Professional Adviser on the FCA review](https://www.professionaladviser.com/professional-adviser/news/3024110/fca-uncovers-significant-client-risk-in-retail-cfd-market).

### Inferences
- The CFTC result (about 60% lose or break even per event, small median loss) looks milder than the Brazilian and Taiwanese results because it measures short spells (median four trades) at one broker rather than persistent day traders over hundreds of days; losses compound with persistence, which is what the Brazilian 97% figure captures.
- A prior of "the tested edge is truly positive after costs" should be set low from these base rates: roughly 1-3% of persistent traders in the Brazilian sample earned anything meaningful, and under 1% show predictable skill in Taiwan. The user's own tested expectancy range (−0.1R to +0.2R) straddles zero, which is what the base rates would lead one to expect.

### Gaps
- No current (2025-2026) ESMA or FCA aggregate loss-rate update was found; the 74-89% and 82% figures are from 2016-2018.
- No CFTC or broker disclosure of the share of profitable retail futures accounts comparable to the mandatory forex/CFD disclosures was found; the CFTC staff paper is the only regulatory-data source located. US futures brokers are not required to publish such percentages, to the best of what this search surfaced.
- Earlier Taiwan results (e.g., the share losing in a typical six-month period) and US studies of day-trading firms (Jordan and Diltz; the 1999 NASAA report) could not be verified because the search budget ran out.

---

## 5. Prop-firm statistics: pass rates, payout share, payout size, account lifetime, and how the firms make money

### Takeaway
The best firm-published figures are Topstep's: 16.8% of 2025 Trading Combines were passed and 33.3% of individuals at the funded level received a payout (vendor-reported); industry-wide vendor data put the share of all challenge buyers who ever receive a payout near 7%, and no data on Lucid's or Apex's payout share exist. Firms' revenue comes primarily from evaluation, reset, activation and subscription fees, with FTMO reporting about $422 million of 2025 revenue against roughly $200 million of payouts added in a year.

### Cited Findings
- Topstep (vendor-reported, January-December 2025): "16.8% of all Trading Combines initiated were successfully completed and afforded the opportunity to advance to the Funded Level"; "33.3% of all individual participants at the Funded Level received a payout"; the Funded Level aggregates Express Funded and Live Funded accounts; statistics reflect both simulated and live environments; payout approval rate 99.26% — [Topstep dashboard page](https://www.topstep.com/topstep-dashboard); [Topstep instant payouts page](https://www.topstep.com/instant-payouts).
- Topstep, third-party readings of the same disclosure (2025): 51.8% of people who entered at least one Combine earned a funded account (the gap versus 16.8% per Combine reflects repeat purchases); 0.71% of Express Funded participants were called up to a Live Funded account; a 2024 payout share of 28.3% is quoted in one comparison; guides warn against multiplying 16.8% by 33.3% because the denominators differ — [tradecovex guide](https://tradecovex.com/guides/how-many-combines-passed-express-topstep-2025); [2026 transparency report summary](https://www.rswebsols.com/?p=142805); [Fortunly statistics](https://fortunly.com/statistics/prop-firm-challenge-pass-rate-statistics/); [QuantVPS statistics](https://www.quantvps.com/blog/prop-firm-statistics).
- Industry (vendor dataset, widely quoted; original not opened): about 300,000 accounts across 10 firms showed a 14% challenge pass rate and a 7% payout rate, with average payouts of roughly 4% of funded account size; a separate analysis of FTMO-type economics says the average pass rate is 14% and only half of those, 7% of the total, get a payout — [Trade Informer: What FTMO tells us about prop firm finances](https://tradeinformer.com/prop-weekly/what-ftmo-tells-us-about-prop-firm-finances); [Fortunly statistics](https://fortunly.com/statistics/prop-firm-challenge-pass-rate-statistics/). Track360 frames it as about 45% of funded traders receiving at least one payout and about 7% of all challenge buyers ever being paid — [Track360 industry statistics 2026](https://track360.io/blog/prop-trading-industry-statistics-2026).
- FTMO: no official pass-rate statistics found; one guide estimates 10-12% across both phases and notes that no prop firm publishes exact pass rates — [Traders Second Brain](https://traderssecondbrain.com/guides/prop-firm-pass-rate).
- FTMO financials (Czech filings as reported by trade press): 2025 revenue CZK 8.8 billion (about $422 million), up 31%; paid orders up almost 50% to 1.27 million; returning clients make up close to 80% of revenue; parent 2024 revenue CZK 6.84 billion (about $329 million) with net profit above $62 million — [FX News Group](https://fxnewsgroup.com/forex-news/retail-forex/ftmo-2025-revenues-rise-31-to-422m-paid-422m-for-oanda/); [Finance Magnates on 2024 results](https://www.financemagnates.com/forex/ftmos-parent-netted-over-62-million-on-329m-revenue-in-2024/).
- FTMO payouts (vendor claims): more than $450 million paid out since launch as of its 10th anniversary (September 2025); $200 million added to lifetime payouts in one year with monthly rewards near $15 million; over $650 million cumulative and 4.5 million registered traders by October 2026; median payout and number of unique recipients not disclosed — [Finance Magnates, 10th anniversary](https://www.financemagnates.com/forex/ftmo-announces-over-450-million-paid-out-as-prop-trading-firm-turns-10/); [Finance Magnates, $200 million in one year](https://www.financemagnates.com/forex/ftmo-adds-200-million-to-lifetime-payouts-in-one-year-as-monthly-rewards-near-15-million/); [WikiFX, October 2026](https://www.wikifx.com/en/news/details/202610091034331715.html).
- Goat Funded Trader (vendor-reported, per headline): paid $26 million to 22,279 of 1.2 million traders — [Finance Magnates](https://www.financemagnates.com/forex/prop-firm-goat-funded-trader-says-it-paid-26-million-to-22279-of-12-million-traders/).
- Apex Trader Funding: no official pass rate or share of funded traders paid was found; the only firm figure is cumulative payouts since 2022 of more than $828 million (dashboard, October 2026) or $860.33 million (as of 6 September 2026) depending on the page; a tracker shows 173,783 payouts totalling $293.7 million — [damnpropfirms: Apex payout data](https://damnpropfirms.com/trading-guides/apex-trader-funding-legit-real-payout-data/); [PropFirmsTimes](https://www.propfirmstimes.com/apex-trader-funding-payout-proof/); [PropScorer](https://www.propscorer.com/firms/apex-trader-funding).
- Lucid Trading: no official statistics found. Third-party trackers (unaudited, mutually inconsistent): Pipback shows about $95.5 million over 11 October-9 November 2026 across 48,120 recorded payouts, average $1.9k, median $1,500; Prop Firm Match shows cumulative totals near $697.6 million across 425,563 payouts (figures vary between crawls); QuantCrawler's community-reported data (June 2026) give an average reported payout of $1,025 — [Pipback](https://pipback.com/firms/lucid-trading/payouts); [Prop Firm Match](https://propfirmmatch.com/futures/prop-firms/lucid-trading/payouts?page=1); [QuantCrawler](https://quantcrawler.com/prop-firms/lucid-trading/payouts).
- Industry tracker: Prop Firm Match tracked about $325 million of payouts to traders in 2025 (excluding FTMO and The5ers) — [Finance Magnates](https://financemagnates.com/forex/prop-firm-match-tracked-about-325-million-in-payouts-to-traders-in-2025).
- Business model: prop firms make most of their money from non-refundable evaluation, reset and subscription fees rather than from trader profits; Topstep's income is evaluation fees, resets, data subscriptions, activation fees and a share of funded traders' profits — [damnpropfirms: how do prop firms make money](https://damnpropfirms.com/prop-firms/how-do-prop-firms-make-money/); [Trade Informer: how does FTMO make money](https://tradeinformer.com/prop-weekly/how-does-ftmo-make-money).
- Regulatory record: in August 2023 the CFTC alleged that My Forex Funds had taken at least $310 million in fees from more than 135,000 customers since November 2021, was the counterparty to substantially all customer trades and used devices to minimise customer profits; the complaint was later dismissed with prejudice and the court sanctioned the CFTC for misconduct — [CFTC release 8771-23](https://cftc.gov/node/247111); [CFTC complaint](https://cftc.gov/media/9196/enftradersglobalgroupcomplaint082923/download); [Finance Magnates on the dismissal and sanctions](https://www.financemagnates.com/forex/my-forex-funds-parent-defeats-cftc-in-court-as-judge-imposes-sanctions/amp).

### Inferences
- Rough funnel using the cited figures: per attempt about 14-17% pass; of funded individuals about one-third (Topstep 2025) to under one-half (Track360) ever receive a payout; so on the order of 5-7% of attempts lead to any payout (indicative only: the cited sources warn that Topstep's per-Combine and per-individual figures have different denominators). The user's account is already past the first filter; the relevant base rate is therefore "about one in three funded traders gets paid at all" (Topstep, vendor-reported), before conditioning on being 66% of the way through the drawdown.
- Lucid tracker arithmetic: $697.6 million ÷ 425,563 payouts ≈ $1,640 per payout; with the tracker median of $1,500 and average $1.0-1.9k, a typical payout is of the same order as the $2,000 drawdown allowance. Payout counts are not unique traders and say nothing about the share of accounts paid.
- FTMO's 2025 revenue (about $422 million) compared with roughly $200 million of payouts added in about a year implies payouts are well under half of fee revenue, consistent with the "fees fund the payouts" description; the two periods do not align exactly, so treat the ratio as indicative.
- Goat Funded Trader's headline implies 1.9% of its traders were paid, averaging about $1,170 per paid trader.

### Gaps
- No firm-published or independent data on funded-account lifetime (median days to breach) were found for any firm.
- No Lucid or Apex disclosure of pass rate or share of funded accounts receiving a payout was found; no average-payout figure from Topstep.
- The origin of the "300,000 accounts / 14% / 7% / 4%" dataset (believed to be a prop-technology vendor's data from 2024) was not verified at source.
- The 0.71% Topstep live call-up figure has an ambiguous denominator across secondary sites.

---

## 6. What professional traders and risk managers recommend as risk per trade relative to available drawdown

### Takeaway
Guidance clusters at about 1% of equity per trade for an owned account (Tharp) and, for prop accounts, about 5-12% of the *remaining* drawdown per trade (Apex, NexusFi), with half-Kelly or less as the quantitative ceiling (Thorp and co-authors, Carver); on $683 that is roughly $34-$82, against the current $250.

### Cited Findings
- Tharp: about 1% of equity per trade until the system is well understood — sources in section 1.
- Apex Trader Funding (vendor): size as a percentage of the available drawdown allowance; 10% gives 10 planned losses, 5% gives 20, 2.5% gives 40; with trailing drawdowns or frequent losses consider 1% of drawdown or less — [Apex resource](https://apextraderfunding.com/resources/prop-trading/effective-risk-management-strategies-for-prop-firm-funded-accounts/).
- NexusFi (practitioner community): risk fraction typically 8-12% of the buffer, with a worked example at 10% of a $2,500 buffer — [NexusFi](https://nexusfi.com/a/prop-firms/funded-account-position-sizing).
- More conservative practitioner posts: risk no more than 0.1-0.25% of account per trade; a sizing example using 6% of the daily buffer (about 0.3% of nominal capital) — [TradingView idea: "1% risk per trade is too much"](https://in.tradingview.com/chart/USDJPY/ZQXfbxfW-1-risk-per-trade-is-too-much-try-this-instead); [FXNX: sizing under a daily loss limit](https://fxnx.com/en/blog/prop-firm-lot-size-sizing-trades-under-daily-loss-limit).
- Common challenge advice in blogs: per-trade risk around 0.5-1% of account against 5% daily and 10% maximum drawdown limits (i.e., 5-10% of the maximum drawdown per trade) — [thepropfirmguide](https://thepropfirmguide.com/how-to-pass-a-prop-firm-challenge/); [grandalgo](https://grandalgo.com/blog/prop-firm-risk-of-ruin-guide).
- Quantitative ceiling: half Kelly (Carver; MacLean, Thorp, Ziemba) — sources in section 2.

### Inferences
- Translating to the case: 10% of remaining cushion = $68 (10 losses of room); 5% = $34 (20 losses); half Kelly at the most optimistic tested edges = $41-$68; at +0.05R to +0.1R = $9-$24. The intersection of practitioner rules and Kelly logic is roughly $35-$70 per trade until the cushion is rebuilt, i.e., 1 MNQ with a stop of about 17-35 points, or a pause in trading wide-stop strategies in this account.
- A size that scales with the remaining cushion (e.g., 10% of whatever room is left, rounded down to whole contracts) restores the property that ruin requires many consecutive losses; fixed $250 was 12.5% of the full $2,000 but is 37% of the present $683.
- The reasoning behind all of these rules is the same as section 1: breach probability falls roughly exponentially in the number of risk units, exp(−2·E·U/σ²), so going from about 3 units to 10-20 units is what moves the odds, and only if E > 0.

### Gaps
- No verified statement from a named professional risk manager about sizing specifically against a trailing prop drawdown was found; the prop-specific numbers are from firms and community sites with a commercial interest.
- No published track-record evidence shows which sizing rule funded traders who received payouts actually used.

---

## 7. Costs: MNQ commissions and fees at prop-firm brokers, slippage, and cost in R by stop distance

### Takeaway
All-in MNQ fees at Tradovate-routed prop firms are about $1.30-$1.90 per contract round trip (Lucid's own schedule was not found); adding one tick of slippage per side ($1.00) gives about $2.30-$2.90, which costs about 0.05-0.06R at a 25-point stop but under 0.01R at 150 points, enough to erase a +0.05R edge on tight stops.

### Cited Findings
- Tradovate retail plans (per side, micros): commission $0.39 (Free), $0.29 (Monthly), $0.09 (Lifetime), plus $0.36 exchange/NFA and $0.19 clearing per side for micros — [QuantVPS Tradovate review](https://www.quantvps.com/blog/tradovate-review). NinjaTrader lists the same micro commission tiers ($0.39 down to $0.09 per side, charged on entry and on exit) — [NinjaTrader: futures trading costs](https://ninjatrader.com/futures/blogs/futures-trading-costs/).
- Tradeify (prop firm): MES and MNQ $1.82 round trip including exchange, NFA and clearing — [Tradeify help: trading commission fees](https://intercom.help/tradeify/en/articles/10468315-trading-commission-fees).
- Top One Futures on Tradovate (prop firm): MNQ $1.90 round turn all-in — [Top One Futures help](https://intercom.help/top-one-futures/en/articles/12829687-top-one-futures-commissions-and-fees-on-tradovate-accounts).
- Topstep: its fee pages list MNQ at $1.34 round turn including NFA, clearing and commission in one table and $0.74 in another, with a commission-only component of $0.50 round turn ($0.25 per side) for micros (fees updated 17 February 2025; tables differ by platform) — [Topstep help: TopstepX commissions and fees](https://help.topstep.com/en/articles/8284213-topstepx-commissions-and-fees); [Topstep help: fees](https://intercom.help/topstep-llc/en/articles/8284231).
- Exchange fee component: Interactive Brokers' CME pass-through schedule lists Micro E-mini futures (MES, MNQ, M2K) at $0.353; CME's 2026 fee-schedule PDFs show a Micro E-mini Index column around $0.35; the NFA fee is about $0.04 per round trip — [IBKR CME fees](https://interactivebrokers.com/en/accounts/fees/CME.php); [CME fee schedule, 1 October 2026](https://www.cmegroup.com/company/files/cme-fee-schedule-2026-10-01.pdf); [damnpropfirms: futures commissions explained](https://damnpropfirms.com/trading-guides/futures-commissions-explained-what-you-actually-pay/). Conflict: a third-party explainer puts the MNQ exchange fee at about $0.62 per side ($1.24 round trip) as of April 2026 — [Top One Futures fee explainer mirror](https://ptv-dev.pages.dev/blog/toponefutures-tradovate-fees).

### Inferences
- Tradovate plan arithmetic (own calculation): per side $0.39 + $0.36 + $0.19 = $0.94, so $1.88 round trip (Free); $1.68 (Monthly); $1.28 (Lifetime). Prop-firm all-in figures of $1.82-$1.90 match the Free-plan level.
- **Cost in R (own calculation).** Risk per contract = stop points × $2. Cost in R = c / (2 × stop points), where c is the all-in round-trip cost per contract; it does not depend on the number of contracts.

| All-in cost per contract, round trip | 25 pt stop ($50) | 50 pt ($100) | 75 pt ($150) | 100 pt ($200) | 150 pt ($300) |
|---|---|---|---|---|---|
| $1.82 (fees only, limit fills both sides) | 0.036R | 0.018R | 0.012R | 0.009R | 0.006R |
| $2.32 (fees + 1 tick on one side) | 0.046R | 0.023R | 0.015R | 0.012R | 0.008R |
| $2.82 (fees + 1 tick each side) | 0.056R | 0.028R | 0.019R | 0.014R | 0.009R |

- Effect on expectancy: net E = gross E − cost in R. A gross +0.05R strategy with a 25-point stop and market orders both ways nets about −0.006R; a gross +0.1R strategy nets about +0.044R; at a 100-point stop the same gross +0.1R nets about +0.086R. Tight-stop strategies need roughly 0.05R more gross edge than wide-stop ones to be equivalent.
- Costs also enlarge the realised loss: 5 MNQ with a 25-point stop is $250 of price risk plus about $9-$14 of fees and slippage, so "2.73 units" is really about 2.6.
- If the backtests behind the −0.1R to +0.2R range were computed without fees and slippage, the whole range shifts down by the table values; whether they were is not known here.

### Gaps
- Lucid Trading's own commission schedule for MNQ (by platform) was not found; use the account statement or dashboard for the exact figure.
- The CME non-member exchange fee for MNQ could not be read cleanly from the fee-schedule PDF; sources conflict ($0.35 versus about $0.62 per side).
- One tick per side is the brief's slippage assumption; no measured MNQ slippage distribution (stop orders at the open, news releases) was found.

---

## 8. Reducing size after losses, daily stop rules and "one and done": do they help or just reduce variance?

### Takeaway
There is good evidence that traders take more risk and trade worse after intraday losses, which makes loss-triggered stops plausible, but no rigorous study was found showing that a daily stop or a one-trade-per-day rule improves net performance; mathematically such rules change the speed and variance of outcomes, not the per-trade edge, whereas cutting size as the cushion shrinks does lower breach probability when the edge is positive.

### Cited Findings
- Coval and Shumway, "Do Behavioral Biases Affect Prices?", *Journal of Finance* 60(1), 2005, pp. 1-34 (CBOT Treasury-bond futures floor traders): traders with morning losses are about 15-16% more likely to take above-average afternoon risk than those with morning gains; they place more and larger trades, buy at higher and sell at lower prices than previously prevailed, and the prices they set reverse significantly more quickly, i.e., the market treats these trades as noise — [RePEc record](https://econpapers.repec.org/RePEc:bla:jfinan:v:60:y:2005:i:1:p:1-34); [CFA Institute digest summary](https://rpc.cfainstitute.org/research/cfa-digest/2005/11/do-behavioral-biases-affect-prices-digest-summary); [BYU repository copy](https://scholarsarchive.byu.edu/facpub/9284).
- Linnainmaa (UCLA working paper, "Learning from Experience"): day traders decrease their day-trade size by 5.9% after a loss compared with after a gain, and some quit after losses; the paper does not test whether stopping helps returns — [UCLA Anderson working paper](https://www.anderson.ucla.edu/documents/areas/fac/finance/27-05.pdf).
- Barber, Lee, Liu, Odean, Zhang (2020): unprofitable day traders are more likely to quit, but many persist despite losses — sources in section 4.
- Compliance with self-imposed limits (vendor survey, self-reported): among traders with predefined limits, 34% report continuing to trade after reaching their limit at least once in the previous 90 days — [Traders Union research](https://tradersunion.com/interesting-articles/trading-after-losses-tu-research/).
- Prop-firm rule design: Lucid's daily loss limit is a soft breach that stops trading for the day without failing the account — [Lucid help: Daily Loss Limit](https://intercom.help/lucid-trading/en/articles/11404705-daily-loss-limit). A blog-reported claim that Topstep data show traders with daily limits of 3% or less were more likely to reach funded status is selection-biased and unverified — [Trade That Swing](https://tradethatswing.com/setting-a-daily-loss-limit-when-day-trading/).

### Inferences
- **Daily stop / one-and-done under independent trades (own reasoning).** If trades are independent with the same expectancy, a rule that only limits how many are taken per day leaves expectancy per trade and breach probability per trade count unchanged; it lowers breach probability per calendar day (Table B: at $250 and p = 0.45, +0.1R, breach within 20 trades is 45%, so one trade a day spreads that over about a month instead of a week) and under EOD trailing has no effect on the ratchet.
- **When such rules add value.** They add value only to the extent that post-loss trades are worse than average (the Coval-Shumway mechanism: more size, worse prices) or that later-in-day setups have lower expectancy. That is an empirical property of the individual trader's own trade log (expectancy of first trade of the day versus later trades, and of trades after a loss versus after a win), which can be tested directly.
- **Reducing size after losses is different in kind.** Because breach probability depends on cushion ÷ risk, cutting size as the cushion shrinks (anti-martingale, fixed fraction of remaining room) lowers breach probability whenever the edge is positive (Table A: 51% → 23% → 6% from $250 → $68 → $34 at p = 0.45, +0.1R) and costs time. At zero edge it changes nothing about the destination (66% either way) and at negative edge it only delays the breach. So it is variance and survival control conditional on an edge, not a source of edge.
- **Interaction with the consistency rule.** Smaller per-trade risk and a daily stop both flatten the distribution of daily results, which helps satisfy a 35% largest-day cap.

### Gaps
- No controlled or observational study isolating the effect of a daily loss limit, a maximum-trades-per-day rule or a one-and-done rule on retail futures day-trading results was found; evidence is indirect (behaviour after losses) or vendor/blog material.
- An often-repeated claim attributing such a finding to IG Group could not be traced to a primary source.
- Whether the user's own results deteriorate after a first loss or later in the session is unknown here and is the decisive input for this question.
