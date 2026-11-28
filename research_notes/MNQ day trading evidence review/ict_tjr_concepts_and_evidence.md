# ICT / TJR "smart money concepts": definitions, TJR's trade model, and independent evidence (as of 27 Nov 2026)

> **Read this first: how each fact was obtained.** The session's network blocked almost every site. WebFetch failed for every host tried (tradingview.com, sozai.app, backtrex.com, pickmytrade, gist.ly, awaketrader.com, luxalgo, SSRN, NY Fed, arXiv, Wikipedia). The shared web-search budget ran out after my first five queries. Three hosts worked by shell: videohighlight.com, raw.githubusercontent.com, pypi.org. Every finding below carries one of these tags:
> - **[VH]** = AI-generated summary on videohighlight.com of the named YouTube video, read in full this session. These are third-party machine summaries, not transcripts; they contain errors (examples flagged below). The path ID is the YouTube video ID.
> - **[SRC]** = source code or README read directly this session.
> - **[SS]** = search-engine result summary only; the page itself could not be opened. Numbers are as the search summary gave them. Treat as leads to verify.
> - **[PK]** = from my prior knowledge of the published literature; link given but not re-opened this session. Verify figures before quoting.
>
> Nothing here is estimated. Where I did arithmetic on published numbers it is under "Inferences" and labelled.

---

## 1. Exact definitions of each concept (ICT, TJR, and coded implementations)

### Takeaway
Only a few concepts have real candle arithmetic (fair value gap, 50% equilibrium, 62–79% OTE band, the Silver Bullet clock windows, close-through break of structure). Most others (liquidity "prominence", displacement, order block, sweep, daily bias, SMT) are defined by narrative, and ICT, TJR and the open-source code disagree on them, so each needs an explicit parameter choice before a backtest.

### Cited Findings

**Swing high / swing low**
- ICT: "A swing high is formed when there is a high with lower highs on both sides"; a swing low is "a low with higher lows on both sides" (three-bar fractal: `high[i] > high[i-1] and high[i] > high[i+1]`). — [VH: ICT Core Content Month 05, Defining Institutional Swing Points](https://videohighlight.com/v/xRjKtUEKkSE)
- ICT also grades swings as short-term / long-term by "nesting", and takes bias from the highest of three timeframes; no numeric rule is given in the summary. — [VH: Essentials To ICT Market Structure](https://videohighlight.com/v/xGFCIUFxsbw)
- TJR: a high is an up candle followed by a down candle, and "the highest wick between these two candles represents the high point"; a low is a down candle followed by an up candle, lowest wick of the two (a two-candle colour-change pivot). "Only the most recent high or low is relevant." Highs/lows formed "within consolidation periods do not count as valid" (no rule given for what is consolidation). — [VH: TJR Boot Camp Day 6](https://videohighlight.com/v/PmhuPbY8ZHo)
- smart-money-concepts Python package v0.0.27: swing high = bar whose high is the highest of `swing_length` bars before and after (default 50); consecutive same-type swings are pruned to keep the extreme. The code uses `shift(-N)`, so a swing is known only N bars later. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)

**Break of structure (BOS), change of character (CHoCH), market structure shift (MSS)**
- TJR: "A break of structure refers to a shift in the trend." BOS up = "closure of a candle above a previous high. The candle body must be above the wick of the high"; BOS down = close below the wick of the most recent low. "Wicks going above highs or below lows do not indicate a break of structure." In an uptrend watch only the most recent low; in a downtrend the most recent high. — [VH: Boot Camp Day 6](https://videohighlight.com/v/PmhuPbY8ZHo)
- TJR 2026: "A break of structure down is not valid if already in a downtrend; it must first show an upward break." So TJR's BOS is always a reversal signal. — [VH: My UPDATED Day Trading Strategy (2026)](https://videohighlight.com/v/8PYgFVB0GHE)
- ICT: "A break below a short-term low indicates a shift in market structure", looked for on 1–3 minute charts after a run on stops. — [VH: 2022 ICT Mentorship Episode 2](https://videohighlight.com/v/tmeCWULSTHc)
- ICT-concepts educator TTrades: an MSS needs "energetic moves ... that break through previous structures" (displacement). — [VH: Intro to MSS, FVG and Displacement](https://videohighlight.com/v/PePk1V0Q4QQ)
- smc package: uses the last four alternating swings. Bullish BOS = low, high, higher low, higher high (`L[-4] < L[-2] < L[-3] < L[-1]`), i.e. continuation. Bullish CHoCH = high, low, lower low, then higher high (`L[-1] > L[-3] > L[-4] > L[-2]`), i.e. reversal. The level is the prior swing high (`L[-3]`); the break is confirmed by the first later bar whose close (default `close_break=True`) or high exceeds it. Bearish mirrors. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)
- [PK] "CHoCH" is SMC-community vocabulary; ICT's own term is market structure shift. Not re-verified this session. — no source opened

**Liquidity: buy-side, sell-side, equal highs/lows, session levels, internal vs external**
- ICT: liquidity = resting stops; price runs "to 'knock out' resting orders like buy stops above previous highs or sell stops below previous lows". — [VH: ICT Core Content Month 1, Liquidity Runs](https://videohighlight.com/v/22XkhpJR5eA)
- ICT's named draws on liquidity: previous day high/low, prior session highs/lows, relative equal highs/lows, current or old week opening gaps, unfilled fair value gaps. — [VH: 2023 ICT Mentorship, Silver Bullet](https://videohighlight.com/v/tRq1hyGGtl4)
- Internal range liquidity "defined as a fair value gap"; external range liquidity = "swing highs or lows"; price is said to alternate between them. — [VH: TTrades, Internal & External Liquidity](https://videohighlight.com/v/3OivsP1j_UE)
- TJR: "Liquidity refers to resting orders in the market, including stop orders and limit orders." It sits above "prominent highs" and below "prominent lows"; "prominence varies based on the time frame"; "not every high and low in the market can be used as liquidity". — [VH: Boot Camp Day 8](https://videohighlight.com/v/Lxnu7InGhGE); [VH: Day 12](https://videohighlight.com/v/KtC2SbemF6w)
- TJR 2026 names the levels: "session highs/lows" and "hourly highs". — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- smc package "liquidity" = two or more swing highs (or lows) within `range_percent` (default 1%) of the whole dataset's high-low range; level = their average; swept at the first later bar trading beyond level ± that tolerance. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)
- A community-coded TJR script lists targets as "PDH/PDL, PWH/PWL, Asia/London/NY session highs & lows, EQH/EQL". — [SS: TradingView "TJR v4 Strategy"](https://in.tradingview.com/script/xXrbltSH-TJR-v4-Strategy/)

**Liquidity sweep / stop hunt / Judas swing**
- TJR: "When prominent highs and lows are taken out, it indicates a liquidity sweep"; a wick beyond a level without a close beyond is a sweep, not a BOS. No minimum penetration or time limit is given. — [VH: Boot Camp Day 12](https://videohighlight.com/v/KtC2SbemF6w); [VH: Day 6](https://videohighlight.com/v/PmhuPbY8ZHo)
- ICT Judas swing (forex): hunted "at midnight New York time"; "between midnight New York time and 5:00 a.m." the day's high or low forms. Bullish day: tight Asian range, then a drop below the midnight opening price and below the Asian range low ("sweep 10 20 pips or so"), which becomes the low of day. Direction comes from higher-timeframe bias. — [VH: ICT Forex, Understanding The ICT Judas Swing](https://videohighlight.com/v/xJMbva8SjzE)
- ICT 2022 model sequence: stop run above a short-term high (or below a low), then break of a short-term low (high) on a 1–3 minute chart, then entry in the fair value gap left by that break. — [VH: 2022 ICT Mentorship Episode 2](https://videohighlight.com/v/tmeCWULSTHc)

**Fair value gap (FVG)**
- ICT-concepts (TTrades): "a three-candlestick pattern where the first candle's low does not overlap with the third candle's high, or vice versa". Bullish: `low[3] > high[1]`; bearish: `high[3] < low[1]`. "Consequent encroachment refers to 50% of a fair value gap." — [VH: TTrades, Inversion Fair Value Gaps](https://videohighlight.com/v/uDJI2AbyyCs)
- ICT says he introduced the term in 2016. — [VH: 2022 ICT Mentorship Episode 2](https://videohighlight.com/v/tmeCWULSTHc)
- TJR: three-candle pattern; "the area of fair value is measured from the top of the first candle's wick to the bottom of the third candle's wick" (bullish). He treats "fair value gaps, liquidity voids, and imbalances" as "essentially similar concepts" and says FVGs "are retracement tools, not reversals". — [VH: Boot Camp Day 16](https://videohighlight.com/v/S1kY3Fw6JUQ); [VH: Day 14](https://videohighlight.com/v/d0AxLACYaqU)
- TJR "prefers using them primarily as retracement tools rather than direct entry points"; imbalances "serve as confirmation tools for entries based on other factors". — [VH: Boot Camp Day 18](https://videohighlight.com/v/qecF411R83s)
- smc package: bullish FVG at bar i if `high[i-1] < low[i+1]` and bar i closes up; zone bottom = `high[i-1]`, top = `low[i+1]`. Bearish if `low[i-1] > high[i+1]` and bar i closes down. "Mitigated" at the first bar from i+2 whose low ≤ top (bullish). No minimum size. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)

**Inverse / inversion fair value gap (iFVG)**
- TTrades: "An inversion occurs when a fair value gap ... gets closed over or disrespected"; a candle closing above a bearish FVG inverts it and price "may retrace into this zone or continue moving higher". — [VH: TTrades, Inversion Fair Value Gaps](https://videohighlight.com/v/uDJI2AbyyCs)
- TJR 2026: "An inverse fair value gap signifies that price has closed beneath expected levels"; he uses it, like a BOS, as trend-change confirmation. — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)

**Order block (OB)**
- ICT (2016 core content): "A bullish order block is the lowest candle or price bar with a down close that has the most range between open to close and is near a support level." It is validated when "the high of the lowest down candle ... [is] traded through by a later formed candle". Entry when price returns to the OB candle's high; stop at the OB low or "just below 50% of the total range of the order block". — [VH: ICT Core Content Month 04, Orderblocks](https://videohighlight.com/v/PIYh0CxoY9c)
- TJR: an OB is "a price range where significant orders were filled"; "the single block within a trend that forms after a liquidity sweep"; identified by "the leg down prior to the liquidity sweep"; "There is only one order block per trend." — [VH: Boot Camp Day 20](https://videohighlight.com/v/qhuFg_OXdmE)
- TJR: OBs are "price movements prior to liquidity sweeps or breaks in market structure" and "must consider the entire movement leading up to changes in market direction". — [VH: Boot Camp Day 22](https://videohighlight.com/v/RQSVIKddFHI)
- TJR ranks entries: "liquidity sweeps and break structures as primary entry points, followed by fair value gaps, equilibrium, and finally order blocks for retracement plays". — [VH: Boot Camp Day 20](https://videohighlight.com/v/qhuFg_OXdmE)
- smc package: when a close first crosses above the last swing high, the bullish OB is the bar with the lowest low between that swing high and the breaking bar (no down-close requirement); zone = that bar's low to high. Bearish mirrors. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)
- Vendor guides give yet other definitions ("a candle or zone preceding a strong directional move"; "the last bearish candle before the move"). — [SS: CMC Markets](https://www.cmcmarkets.com/en/trading-strategies/order-block-trading-explained); [SS: Tradeify](https://tradeify.co/education/order-blocks-in-trading)

**Breaker block and mitigation block**
- ICT breaker: price makes a low, then a short-term high, then runs the old low (a "turtle soup" stop run), then breaks the short-term high; the old high then acts as support on the return. Bearish: "a down close candle at the most recent swing low before an old high is violated". — [VH: ICT Core Content Month 04, Breaker Block](https://videohighlight.com/v/UrS-mtGHtAA)
- ICT mitigation block: a failure swing ("M pattern") without a new extreme; after the break of the short-term low, "the last down candle near the short-term low" is the level to sell on the return, as longs "mitigate". — [VH: ICT Core Content Month 04, Mitigation Blocks](https://videohighlight.com/v/FOUzW0QmsfI)
- smc package flags an OB as `breaker` internally once price trades through it, but does not output breaker blocks. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)

**Displacement**
- ICT: explained by analogy (an elephant falling into a pool); "a significant break ... followed by an energetic movement". TTrades: "an energetic move ... that breaks through previous structures" and leaves an FVG. No numeric threshold. — [VH: 2022 ICT Mentorship Episode 5](https://videohighlight.com/v/N29ZJ-o31xs); [VH: TTrades intro](https://videohighlight.com/v/PePk1V0Q4QQ)
- One community-coded rule: "a strong candle (body larger than half an ATR) closes past the last 8-bar swing in the opposite direction, within 40 bars of the sweep". The search summary did not make clear whether this came from the TradingView script or the PickMyTrade article. — [SS: TJR v4 Strategy](https://in.tradingview.com/script/xXrbltSH-TJR-v4-Strategy/); [SS: PickMyTrade](https://blog.pickmytrade.trade/tjr-trading-strategy-asia-sweep-backtest/)

**Premium / discount / equilibrium**
- ICT: "Equilibrium refers to the halfway point (50%) of an impulse swing"; above is premium (sell), below is discount (buy); anchor the fib on the swing's high and low. — [VH: ICT Core Content Month 1, Equilibrium Vs. Premium](https://videohighlight.com/v/YuefjnUKQdM)
- TJR: "Equilibrium is ... a retracement tool"; settings are levels 0, 0.5 and 1 on a Gann box or fib tool; when a new high forms in an uptrend, drag from the low to the high; buy in the discount half; wait "for breaks of structure after hitting equilibrium". — [VH: Boot Camp Day 28](https://videohighlight.com/v/-E7plUbSJUk)

**Optimal trade entry (OTE)**
- ICT: "Optimal trade entry is defined between 62% and 79% retracement level"; the "sweet spot" is 0.705. — [VH: OTE Primer (2017)](https://videohighlight.com/v/Cg0-CFJOJvg)
- ICT repeats "optimal trade entries at specific retracement levels (62% to 79%)". — [VH: ICT Core Content Month 1](https://videohighlight.com/v/YuefjnUKQdM)
- TJR's Boot Camp summaries show no OTE band; he advises take-profits at "high confluence areas rather than arbitrary levels (like Fibonacci)". — [VH: Boot Camp 2.0 Day 11](https://videohighlight.com/v/6zXKK3Wrusg)

**SMT divergence**
- ICT (2017, FX): compare correlated markets on the same timeframe. Example with inverse correlation: if AUD makes a lower low but the dollar index "fails to make a higher high", that is a crack in correlation signalling accumulation. — [VH: ICT Forex, The ICT Smart Money Technique or SMT](https://videohighlight.com/v/isXicdayBwA)
- TJR (2025 interview): a previous strategy "focused on divergences between indexes like the S&P 500 and NASDAQ, where one index lags while the other leads"; he now focuses "on leading indexes (like NASDAQ)". — [VH: TJR interview, Sep 2025](https://videohighlight.com/v/YrILeI7WvVg)
- TJR 2026: uses index agreement as a filter. "If they do not align on the five-minute chart, trades should be avoided." Example: "At 11:05, NASDAQ broke structure to the upside while ES did not", so no long until ES also breaks. — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)

**Kill zones (New York local time)**

| Zone | ICT's stated time | Source |
|---|---|---|
| Asian | "hours prior to midnight" NY; Asian session "opens around 8 PM" | [VH: Asian Killzone](https://videohighlight.com/v/ley5HZs4bUM); [VH: Month 08](https://videohighlight.com/v/-cXnnHjy9s0) |
| London open | "2:00 a.m. to 5:00 a.m." (2017 video); "typically between 2 AM – 4 AM" (2016 core content) | [VH: London Killzone](https://videohighlight.com/v/G8OEsUAoIWE); [VH: Month 08](https://videohighlight.com/v/-cXnnHjy9s0) |
| New York open (FX) | "7:00 a.m. to 9:00 a.m." | [VH: New York Killzone](https://videohighlight.com/v/plNN9n7nrxc) |
| NY AM, index futures | trade "from 8:30 AM until around 11 AM" | [VH: 2022 Mentorship Ep. 5](https://videohighlight.com/v/N29ZJ-o31xs) |
| NY PM, index futures | setups "after 1:30 PM" | [VH: 2022 Mentorship Ep. 5](https://videohighlight.com/v/N29ZJ-o31xs) |
| London close | "10 a.m. to noon" | [VH: London Close Killzone](https://videohighlight.com/v/3OEUIkkcmLE) |
| London lunch (avoid) | "5 AM – 7 AM NY time" | [VH: Month 08](https://videohighlight.com/v/-cXnnHjy9s0) |

- smc package defaults are fixed UTC: Asian kill zone 00:00–04:00, London open 06:00–09:00, New York 11:00–14:00, London close 14:00–16:00. — [SRC: smc.py](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/smartmoneyconcepts/smc.py)

**Silver Bullet**
- ICT: "a time-based algorithmic trading model"; three windows in New York local time: 3–4 AM, 10–11 AM, 2–3 PM. An FVG forms in the window in the direction of the draw on liquidity; entry inside the gap; the trade may run past the window. Minimum framework: 10 points / 40 ticks for index futures, 15 pips for FX ("at least five handles" profit is also mentioned). — [VH: 2023 ICT Mentorship, ICT Silver Bullet](https://videohighlight.com/v/tRq1hyGGtl4)
- Third-party variant A: mark the 9:00–10:00 hourly candle high/low; between 10:00 and 11:00 wait for a sweep of either side; enter on a breaker or FVG after displacement on the 1-minute chart. — [VH: "ICT Silver Bullet Strategy – No Daily Bias | With Backtest!"](https://videohighlight.com/v/o0v4KQxZbpU)
- Third-party variant B: sweep of Asia/London high/low, then MSS, displacement, pullback to FVG/OB, target opposite liquidity. — [VH: "The ICT Silver Bullet Strategy They Don't Want You To See"](https://videohighlight.com/v/rU0vQUTNXVE)

**Power of Three / AMD**
- ICT: "looking for accumulation, waiting for manipulation, and then looking for a period of distribution", applicable to any interval with an open, high, low and close. On a bullish day, longs accumulate around the opening price; the manipulation is "a run below the opening"; "we want to be buying at that opening price or below it". — [VH: ICT Forex, Accumulation – Manipulation – Distribution](https://videohighlight.com/v/dIT4HTFYGGo)

**Daily bias**
- ICT: before each week decide whether the weekly candle will expand higher or lower, toward which unbroken high/low. — [VH: 2022 ICT Mentorship Episode 2](https://videohighlight.com/v/tmeCWULSTHc)
- TJR: weekly, then daily, then 4-hour market structure; "Use the daily market structure to determine your daily bias"; conflict between daily and 4-hour lowers odds; trade "within bias until proven wrong". — [VH: Boot Camp Day 34](https://videohighlight.com/v/sjuWqKDsQtI); [VH: Day 49](https://videohighlight.com/v/__fKQR5RR08)

### Inferences
- TJR's "break of structure" is what ICT calls a market structure shift and what the SMC community and the smc package call CHoCH. A coder using the package's `BOS` column to implement TJR would be coding the opposite (continuation) event.
- The smc package cannot be used as-is in a backtest: `swing_highs_lows` looks `swing_length` bars ahead, `liquidity` scales its tolerance by the full sample's range, and the session clocks are fixed UTC, so they shift an hour against New York across daylight-saving changes. My conversion of its defaults: Asian 19:00–23:00 EST / 20:00–00:00 EDT; London open 01:00–04:00 EST / 02:00–05:00 EDT; New York 06:00–09:00 EST / 07:00–10:00 EDT; London close 09:00–11:00 EST / 10:00–12:00 EDT.
- Free parameters that the teachers leave open and the backtest must fix: swing lookback; what makes a high "prominent"; sweep depth and how many bars may pass before the close back inside; displacement size; FVG minimum size; which leg defines the dealing range for the 50% line; how long an FVG or OB stays valid; SMT reference swing and synchronisation window.
- The Silver Bullet summary says the setup forms "within a specific 16-minute interval" and later "a specific 60-minute window"; the first is almost certainly a transcription error for 60.
- TJR Day 16's line that "the first candle's wicks do not fill the second candle's body" is a loose rendering; the measurable rule in the same lesson is candle-1 wick to candle-3 wick.

### Gaps
- LuxAlgo's documentation and Pine source could not be opened (docs.luxalgo.com and tradingview.com blocked). From memory only, and unverified: its Smart Money Concepts script uses a 50-bar swing length and 5-bar internal structure, flags equal highs/lows with a 3-bar confirmation and a 0.1×ATR threshold, and offers an automatic FVG size threshold. Do not cite these without checking.
- ICT's own wording for bearish OB, liquidity void versus FVG, "balanced price range", the 90-minute macros and the 9:30 index Judas swing was not captured.
- No ICT source read this session applies SMT to NQ versus ES specifically; the NQ/ES form (one index sweeps a swing low while the other holds a higher low) is community practice I could not source.
- All ICT and TJR wording comes through AI summaries, not transcripts; exact quotes should be checked against the videos.

---

## 2. TJR's complete trade model, as far as written sources document it

### Takeaway
TJR's documented model is: higher-timeframe bias, mark session/prominent highs and lows, wait for a wick sweep ("manipulation"), wait for a candle-close break of structure or inverse FVG ("confirmation"), enter on a lower-timeframe retrace (FVG, 50% equilibrium or order-block leg), stop beyond the recent swing, target the next opposite liquidity. He has not published a mechanical rule set, and day-by-day coverage of his Boot Camp is incomplete (about 16 of the 54+ lessons were not found).

### Cited Findings

**The stated sequence**
- Boot Camp "Execution" lesson lists the building blocks: "Liquidity sweeps: Show potential for orders to get filled. Break of structure: Confirms that orders were filled ... Order blocks: Price range where orders were filled. Fair value gaps: Price range with a lack of liquidity. Equilibrium: Finding discounted price between highs and lows." Entry combinations: (1) sweep + BOS; (2) sweep + BOS + order block "if risk-reward is not favorable"; (3) sweep + BOS + FVG fill; (4) FVG fill if the OB entry is missed. — [VH: Boot Camp Day 30](https://videohighlight.com/v/ESsy0uoFAz4)
- 2026 version, four steps: (1) "Identifying Draws and Liquidity: Look for session highs/lows"; price "pushes above/below these levels to fill orders before reversing"; (2) confirmation "via breaks in structure or fair value gaps indicating a change in trend"; (3) continuation signals "such as equilibrium or filled fair value gaps"; (4) "Scale down to lower time frames (like one minute) for precise entries". — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- Same video: "A five-minute retrace must occur after confirming a one-minute break"; "stops should be placed strategically below recent lows with targets set at previous highs"; entry and exit both keyed to "liquidity draws ... session lows or hourly highs". — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- His shorthand for beginners: "manipulation (to fill orders), confirmation (of new trends), and retracement (to enter trades)"; also "manipulation, break, and retrace". — [VH: Teaching My Friend How To Day Trade, Aug 2026](https://videohighlight.com/v/9Bdwg_XfFV8)
- Community descriptions match: "price raids liquidity, shifts market structure, then returns to the fair value gap for entry"; stop "a few ticks/pips beyond the wick" of the sweep. One article states TJR "hasn't published one official coded ruleset". — [SS: TJR v4 Strategy](https://in.tradingview.com/script/xXrbltSH-TJR-v4-Strategy/); [SS: forex.in.rs](https://www.forex.in.rs/tjr-trader-strategy); [SS: PickMyTrade](https://blog.pickmytrade.trade/tjr-trading-strategy-asia-sweep-backtest/)

**Timeframes he names**
- Bias: weekly, daily, 4-hour, 1-hour ("focusing on the daily, four-hour, and hourly time frames"). — [VH: Boot Camp Day 34](https://videohighlight.com/v/sjuWqKDsQtI)
- Setup: example "liquidity sweep occurs on a 30-minute chart followed by a break of structure to the downside on a five-minute chart"; BOS also taken on 15-minute and 1-hour. — [VH: Boot Camp Day 4](https://videohighlight.com/v/viuGHEuv0nw); [VH: Day 18](https://videohighlight.com/v/qecF411R83s)
- Entry: "a five-minute break of structure and a one-minute entry point"; "entry was based on a one-minute candle close". — [VH: Boot Camp Day 37](https://videohighlight.com/v/FjSiLFrg5fo); [VH: Boot Camp 2.0 Day 5](https://videohighlight.com/v/IY9NJbaNyqA)
- 2026: 5-minute chart for ES/NQ alignment and the retrace; 1-minute for the break. — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)

**Instruments and sessions**
- 2023 Boot Camp: S&P 500, GBP/USD, GBP/JPY, gold; "focusing on one or two pairs is emphasized". — [VH: Boot Camp Day 49](https://videohighlight.com/v/__fKQR5RR08); [VH: Day 4](https://videohighlight.com/v/viuGHEuv0nw)
- 2025–2026: S&P 500 and NASDAQ indices, leaning to NASDAQ as the "leading" index. — [VH: TJR interview](https://videohighlight.com/v/YrILeI7WvVg); [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- New York session is the execution session; "trades should only be considered post-market open"; optimal timing "at market open when new money enters". — [VH: Boot Camp Day 18](https://videohighlight.com/v/qecF411R83s); [VH: Day 25](https://videohighlight.com/v/4moWbfm6smw)
- "First 10–15 minutes post-market open often involve manipulation designed to mislead traders." — [VH: Teaching My Friend](https://videohighlight.com/v/9Bdwg_XfFV8)
- London and Asian session highs/lows are the liquidity he marks; his "Forex strategy" is built on sweeps of London highs/lows; one stop example was "above Asian session highs". — [VH: Boot Camp 2.0 Day 3](https://videohighlight.com/v/G7eq6U8e3yw); [VH: Boot Camp Day 52](https://videohighlight.com/v/-rYGugTIsbU)
- News: avoid "CPI, PPI, FOMC meetings, and NFP"; otherwise "wait 15–20 minutes after major news releases"; on one 8:30 release day he waited "until 10:30 AM". — [VH: Boot Camp Day 19](https://videohighlight.com/v/w5sUCqFH3Lg)
- Frequency: taking "multiple trades throughout the day ... reduces probability"; notes from a longer session say one or two trades a day at most. — [VH: Boot Camp Day 25](https://videohighlight.com/v/4moWbfm6smw); [SS: coconote student notes](https://coconote.app/notes/a8c18fb8-bdea-4a28-acf4-20ce7ecbfab7)

**Risk, reward and trade management**
- "Risking only 1% to 3% of account size per trade", plus a self-set daily trade limit. — [VH: Boot Camp Day 13](https://videohighlight.com/v/RkMBoqbeUq8)
- Half normal risk when a second trade may follow; one day's net result was −0.25%. — [VH: Boot Camp 2.0 Day 8](https://videohighlight.com/v/5v4G4xJVKIQ)
- "A risk-reward ratio of 1:1 or 1:1.5 is often used for initial take profits"; "set take profits at a minimum one-to-one ratio". He preferred a 1.5:1 setup over a 0.7:1 one. — [VH: Boot Camp Day 37](https://videohighlight.com/v/FjSiLFrg5fo); [VH: Boot Camp 2.0 Day 8](https://videohighlight.com/v/5v4G4xJVKIQ)
- Targets: "scale up to a higher time frame and find the first draw in liquidity in the trade direction"; also order blocks and FVGs. Multiple take-profits; in one trade "50% of the position was closed with stops moved to break even" at TP1. — [VH: Boot Camp Day 37](https://videohighlight.com/v/FjSiLFrg5fo); [VH: Day 53](https://videohighlight.com/v/Oi_mK1Lt-iQ)
- Stops: beneath "recent lows" for longs; a 4-hour BOS "requires wider stop losses". — [VH: Boot Camp 2.0 Day 8](https://videohighlight.com/v/5v4G4xJVKIQ); [VH: Boot Camp Day 22](https://videohighlight.com/v/RQSVIKddFHI)
- Self-reported 2026 results (journal software screenshots, not audited): about $874,782 January–June 2026; "daily win rate ... around 64%"; "average risk-to-reward ratio of 1:1.23"; average win about $22,000, average loss about $16,000; no losing month. — [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- His video descriptions carry affiliate links to futures prop firms, a journal vendor and a broker, and a paid "Blueprint" mentorship. — [VH: Boot Camp Day 25 page, description](https://videohighlight.com/v/4moWbfm6smw)

**How he tells students to backtest**
- He "critiques bar replay" and "advocates for scrolling back through full charts", finding "one or two good trades daily from past data". — [VH: Boot Camp Day 42](https://videohighlight.com/v/NPG_BZ_83fo)

**Boot Camp lesson list (original series, 2023)**

| Day | Title | Date | Type |
|---|---|---|---|
| 1 | Take Action | May 26 | mindset |
| 2 | Candlesticks | May 27 | technical |
| 3 | Discipline | May 28 | mindset |
| 4 | Trends | May 29 | technical |
| 5 | Goal Setting | May 30 | mindset |
| 6 | Break of Structure | May 31 | technical |
| 7 | Individuality | Jun 1 | mindset |
| 8 | Liquidity Pt 1 | Jun 2 | technical |
| 9 | Check In | Jun 3 | check-in |
| 10 | Liquidity Pt 2 | Jun 4 | technical |
| 11 | How to take a Loss | Jun 5 | mindset |
| 12 | Liquidity Pt 3 | Jun 6 | technical |
| 13 | Risk Management | Jun 7 | risk |
| 14 | Fair Value Gaps Pt 1 | Jun 8 | technical |
| 15 | Identifying problems | Jun 9 | mindset |
| 16 | FVG Pt 2 | Jun 11 | technical |
| 17 | Patience | Jun 11 | mindset |
| 18 | FVG Pt 3 | Jun 12 | technical |
| 19 | How to Read News Data | Jun 13 | technical |
| 20 | Order Blocks | Jun 14 | technical |
| 21 | How to Take a Win & Life Lessons | Jun 16 | mindset |
| 22 | Order Blocks pt 2 | Jun 17 | technical |
| 23 | Check In / Be my boy | Jun 18 | check-in |
| 24 | Order Blocks pt 3 | Jun 20 | technical (not summarised) |
| 25 | Over Confidence | Jun 21 | mindset |
| 27 | Fear | Jun 23 | mindset |
| 28 | Equilibrium pt 2 | Jun 23 | technical |
| 29 | Trading Plan | not captured | plan |
| 30 | Execution | Jun 25 | technical |
| 31 | Hard Work | Jun 25 | mindset |
| 34 | Daily Bias | Jun 29 | technical |
| 37 | Taking Profits | Jul 2 | technical |
| 42 | How to Backtest | Jul 7 | method |
| 44 | Try not to Trade | Jul 10 | mindset |
| 45 | Over Complicating | Jul 10 | mindset |
| 48 pt 2 | Live Daily Bias Analysis on PPI | Jul 13 | recap |
| 49 | Daily Bias/Backtesting + $9k Loss SPX Trade Recap | Jul 14 | recap |
| 50 | Weekly Analysis | Jul 15 | recap |
| 51 | Sunday Motivation | Jul 17 | mindset |
| 52 | Daily Bias + Break Even Trading Recap | Jul 17 | recap |
| 53 | Daily Bias + $19k Profit GBPJPY Recap | Jul 19 | recap |
| 54 | Daily Bias + No Trades Today | Jul 20 | recap |

- Days 1–25 are from the playlist page; later days from site search. — [VH: Boot Camp playlist](https://videohighlight.com/playlist/PLKE_22Jx497twaT62Qv9DAiagynP4dAYV); [VH: site search "Boot Camp Day"](https://videohighlight.com/videos?q=Boot%20Camp%20Day)
- Day 29 "trading plan" stresses "sticking to a tested plan" and tailoring risk to the trader. — [SS: opentools.ai](https://opentools.ai/youtube-summary/boot-camp-day-29-trading-plan)
- In Day 12 he gives the planned order: liquidity, then "fair value gap, order block, and equilibrium". — [VH: Boot Camp Day 12](https://videohighlight.com/v/KtC2SbemF6w)

**Boot Camp 2.0 (from 24 Aug 2023)**
- Lessons found: intro "Boot Camp 2.0" (Aug 24); Day 2 How to handle emotions (Aug 24); Day 3 Risk (Aug 25); Day 5 How to find Trade Bias (Aug 28); Day 8 How to split positions (Aug 31); Day 11 Where to Take Profit (Sep 8). — [VH: site search "Boot Camp 2.0"](https://videohighlight.com/videos?q=Boot%20Camp%202.0)
- What changes: "nothing will change from the original boot camp format"; he will "merge trade recaps with raw trading content", with recaps "featured prominently in each session". He mentions Wyckoff's method "alongside other strategies like ICT". — [VH: Boot Camp 2.0 intro](https://videohighlight.com/v/o_SdawM3DIE)
- New practical content: half-size first entries on the structure break, choosing between two setups by reward-to-risk and bias alignment, multiple take-profits with stop to break-even, a weekly news plan. — [VH: 2.0 Day 8](https://videohighlight.com/v/5v4G4xJVKIQ); [VH: 2.0 Day 11](https://videohighlight.com/v/6zXKK3Wrusg); [VH: 2.0 Day 5](https://videohighlight.com/v/IY9NJbaNyqA)
- He remarks that "many smart money concept setups may lack high confluences lately". — [VH: 2.0 Day 8](https://videohighlight.com/v/5v4G4xJVKIQ)

### Inferences
- A literal mechanical reading for MNQ: (1) bias from daily and 4-hour structure, with ES and NQ agreeing on the 5-minute chart; (2) levels = Asia high/low, London high/low, prior hourly highs/lows; (3) after 9:30 ET, a bar wicks through a level and price closes back inside; (4) a 1-minute or 5-minute bar closes beyond the most recent opposing swing (TJR's BOS), or closes through an opposing FVG (iFVG); (5) enter on the retrace into the FVG, the 50% of the break leg, or the pre-sweep leg; (6) stop beyond the sweep extreme or most recent swing; (7) first target at least 1R at the nearest opposing session or hourly level, with half off and stop to break-even. Every bracketed choice (which swing, which retrace level, time cut-off) is my reading, not his stated rule.
- His stated win size and loss size ($22,000 / $16,000) give 1.375, not the stated 1:1.23; the summary notes fees and break-even trades blur the figures. The 64% is a win rate by day, not by trade, so a per-trade expectancy cannot be derived from it.
- His recommended backtest method (scrolling completed charts for examples) exposes the tester to hindsight; it is not an out-of-sample test.

### Gaps
- Not found: Boot Camp Days 26, 32, 33, 35, 36, 38–41, 43, 46, 47 and any day after 54; Day 24 has no summary; most Boot Camp 2.0 days. Day 26 is presumably "Equilibrium pt 1" (inferred from Day 28's title only).
- Written transcripts of his main strategy videos exist on sozai.app ("Path to Profitability: TJR's Strategy Explained"; "My UPDATED Day Trading Strategy (2026)") and student notes on coconote.app and Google Docs, but those hosts were blocked. They are the best next sources for exact wording.
- No source gives his exact time cut-off for entries, a maximum stop size, or a fixed daily loss limit.
- No audited or third-party-verified record of his trading results was found.

---

## 3. Where TJR's version differs from ICT's

### Takeaway
TJR teaches a simplified subset of ICT-style ideas with different vocabulary and looser definitions: reversal-only "break of structure", order block as a whole leg, a 50% line instead of the 62–79% band, session levels instead of clock-minute windows, and index agreement as a filter rather than SMT divergence as a signal.

### Cited Findings
- Origin: TJR says he was "unaware of ICT ... until after becoming profitable", called his early setup a "London fake out", and does "not consider [himself] a clone or follower". — [VH: Boot Camp Day 1](https://videohighlight.com/v/Xq6-oO2n6-U)
- Structure: TJR's BOS is a candle-close reversal through the most recent swing; ICT's equivalent is the market structure shift after a stop run. — [VH: Boot Camp Day 6](https://videohighlight.com/v/PmhuPbY8ZHo); [VH: 2022 ICT Mentorship Ep. 2](https://videohighlight.com/v/tmeCWULSTHc)
- Swings: TJR two-candle pivot; ICT three-bar swing. — [VH: Boot Camp Day 6](https://videohighlight.com/v/PmhuPbY8ZHo); [VH: ICT Month 05](https://videohighlight.com/v/xRjKtUEKkSE)
- Order block: ICT a specific validated down-close candle with entry at its high and stop at its low or 50%; TJR the whole leg before the sweep, "one order block per trend", ranked last among his tools. — [VH: ICT Month 04 Orderblocks](https://videohighlight.com/v/PIYh0CxoY9c); [VH: Boot Camp Day 20](https://videohighlight.com/v/qhuFg_OXdmE)
- FVG: ICT's 2022 model enters in the FVG; TJR lumps FVG, liquidity void and imbalance together and prefers the FVG as retracement confirmation. — [VH: 2022 ICT Mentorship Ep. 5](https://videohighlight.com/v/N29ZJ-o31xs); [VH: Boot Camp Day 14](https://videohighlight.com/v/d0AxLACYaqU); [VH: Day 18](https://videohighlight.com/v/qecF411R83s)
- Retracement: ICT 62–79% with 70.5% sweet spot; TJR only 0 / 0.5 / 1. — [VH: OTE Primer](https://videohighlight.com/v/Cg0-CFJOJvg); [VH: Boot Camp Day 28](https://videohighlight.com/v/-E7plUbSJUk)
- Time: ICT fixes clock windows (kill zones; Silver Bullet 3–4, 10–11, 14–15 NY). TJR's documented rules are session-based (after the open; session highs/lows; news waits) with no minute windows. — [VH: ICT Silver Bullet](https://videohighlight.com/v/tRq1hyGGtl4); [VH: Boot Camp Day 18](https://videohighlight.com/v/qecF411R83s)
- Correlated markets: ICT trades the divergence; TJR 2026 stands aside until ES and NQ agree. — [VH: ICT SMT](https://videohighlight.com/v/isXicdayBwA); [VH: 2026 strategy video](https://videohighlight.com/v/8PYgFVB0GHE)
- Shared narrative: both say large players push price into stops to fill orders. TJR: "Banks seek liquidity to move the market"; market makers "exploit retail traders' behavior". ICT: algorithms run buy stops so "smart money" can sell into them. — [VH: Boot Camp Day 8](https://videohighlight.com/v/Lxnu7InGhGE); [VH: Teaching My Friend](https://videohighlight.com/v/9Bdwg_XfFV8); [VH: 2022 ICT Mentorship Ep. 2](https://videohighlight.com/v/tmeCWULSTHc)

### Inferences
- A backtest labelled "ICT" and one labelled "TJR" can differ in almost every component even though both read "sweep, shift, FVG"; results for one should not be assumed to transfer to the other.
- TJR's version has fewer clock rules and fewer named patterns, which reduces the parameter count, but its key inputs ("prominent" level, "consolidation") are more discretionary than ICT's clock windows.

### Gaps
- Whether TJR's paid "Blueprint" course adds rules (for example SMT or time windows) is unknown; paid material was out of reach.
- I found no statement from ICT about TJR, or a side-by-side by either teacher.

---

## 4. Independent quantitative tests found

### Takeaway
I found no peer-reviewed test of fair value gaps, order blocks, sweeps, kill zones, the Silver Bullet or SMT. The retail-published tests that disclose costs or a control group report small or no edge (profit factor near 1, win rates near 50%, no difference from placebo levels, ICT clock windows no better than other hours); the favourable ones are small samples from vendors without costs.

### Cited Findings

| # | Test (author / venue) | Rules | Market, period, sample | Costs / OOS / benchmark | Result as published | Tag |
|---|---|---|---|---|---|---|
| 1 | "Claude Tested Over 25,000 ICT Strategies" (presenter "Brendan"; promotes an AI-trading community) | ICT Silver Bullet turned into parameter "dials"; about 258 million possible configurations; random sample of 25,000 plus named popular versions | NQ and ES, 16 years of 1-minute futures data, "over 10 million simulated trades" | "commissions and slippage" included (amounts not in summary); "luck corrections"; compared ICT hours with other hours | "only about 1.7% survived"; top setups "around 52%" win rate versus claimed 70–80%; ICT hours "performed similarly or worse than average hours"; requiring a liquidity sweep was "an edge-giving rule"; survivors resembled "mean reversion" | [VH](https://videohighlight.com/v/KML09tRtHM8); [SS](https://gist.ly/youtube-summarizer/i-backtested-25000-ict-silver-bullet-trades) |
| 2 | "Silver Bullet [GBB]" TradingView script | Rules-based Silver Bullet | ES, NQ, YM, GC; 1-minute futures 2011–2026 | 2 ticks slippage, $4.50 commission per round trip | Best stop placement "did not make the model profitable"; author: "the Silver Bullet hours are not special, and the model is not a profitable strategy on its own" | [SS](https://jp.tradingview.com/script/teL2dDvS-Silver-Bullet-GBB/) |
| 3 | "Order Block (OB) Statistics: Real Win Rate vs Random Levels" TradingView script | Order blocks versus matched control ("placebo") zones | not in summary | placebo-controlled; costs not stated | "no tested configuration showed a reliable difference between real order blocks and their placebo levels"; combined estimates "slightly below zero" with a range that "still included zero" | [SS](https://vn.tradingview.com/script/yFmy3VBi-Order-Block-OB-Statistics-Real-Win-Rate-vs-Random-Levels/) |
| 4 | Backtrex "Does the ICT fair value gap strategy work on the Nasdaq?" | 1-hour FVG zone, 15-minute engulfing trigger, 4-hour trend filter, 3:1 target | NAS100 (not NQ futures), 10 years, 852 trades | win rate quoted "before costs"; buy-and-hold benchmark | 27% win rate (break-even 25%); profit factor 1.08; total return +37.7% versus buy and hold +527.2% | [SS](https://backtrex.com/en/backtests/ict-fair-value-gap-nasdaq) |
| 5 | PickMyTrade "TJR Trading Strategy: Asia Session Sweep Backtest on NQ" | Asia-range sweep, displacement break, FVG entry | NQ futures | not in summary | "reports a large drawdown on NQ futures" (no figure in summary) | [SS](https://blog.pickmytrade.trade/tjr-trading-strategy-asia-sweep-backtest/) |
| 6 | AwakeTrader kill-zone study (app vendor) | not clearly specified | NQ, 2024–2026 ("500 sesiones" in title) | costs unclear; no benchmark | New York kill zone 59% win rate (84 wins / 58 losses), profit factor 1.74; Asia 41%, profit factor 0.86; London lower than New York | [SS](https://www.awaketrader.com/educacion/ict-killzones-backtest-500-sesiones-nq-2024-2026) |
| 7 | "ICT NAS" TradingView script | 15-minute NAS100 setup, 2R target | 144 out-of-sample trades | costs not stated | 70% / 69% win, profit factor 4.4, +331R / +153R; author concedes the live version's trailing exits make results look like "~89% win" | [SS](https://de.tradingview.com/script/r83gPQKF-ICT-NAS/) |
| 8 | "ICT Silver Bullet Strategy – No Daily Bias" (manual replay) | 9:00–10:00 candle sweep between 10 and 11, breaker/FVG entry | NQ, July to mid-August 2023, 15 trades in 45 days | manual, no costs, no OOS | +23.5% July, +16.93% August, 44.4% overall; author says the sample is too short | [VH](https://videohighlight.com/v/o0v4KQxZbpU) |
| 9 | TakeProfit app article (vendor) | New York Silver Bullet | EURUSD 5-minute, 2024–2025, 134 setups | costs not stated | 81 wins (60.4%), average R:R 1:2.3, profit factor 2.81 | [SS](https://takeprofitapp.com/en/learn/ict-silver-bullet-strategy) |
| 10 | Tradeify guide (prop-firm vendor) | Order block retests | ES/NQ, 48 sessions | descriptive only | "two of three order blocks were retested, usually within 15 minutes" | [SS](https://tradeify.co/education/order-blocks-in-trading) |
| 11 | dev.to Pine Script post | OB + FVG | crypto and forex | not stated | early versions taking every order block had a 35% win rate; improved only after filters | [SS](https://dev.to/isabelle_dubuis_d858453d7/ict-order-block-fvg-strategy-in-pine-script-v5-backtest-results-full-code-l5c) |

- Unverified marketing claims seen in video titles only (no method examined): "EBP – 88% Proven Win Rate" daily-bias strategy; "CRT + SMT 93% efectivo" on gold; "Silver Bullet win-rate to 89%". — [VH: site search results](https://videohighlight.com/videos?q=daily%20bias)

### Inferences
- Tests 1 and 2 are independent of each other and agree on two points: the Silver Bullet clock windows carry no special edge, and the mechanical model is not profitable on its own after costs. Both are retail publications without released trade lists, so they are suggestive, not conclusive.
- Test 1's survivor rate (1.7% of 25,000, about 425 configurations) is the kind of result multiple-testing produces by chance; the presenter says a "luck correction" was applied but the method is not documented. Any survivor needs fresh out-of-sample data.
- My arithmetic on test 4: 27% wins at 3R is +0.08R per trade before costs, consistent with the published profit factor of 1.08; on MNQ a fraction of a tick of extra slippage could erase it.
- My arithmetic on test 9: 60.4% wins at an average 2.3R would imply a profit factor near 3.5, not the published 2.81, so "average R:R" there is probably planned, not realised.
- No test found compares entries against a time-of-day-matched random-entry benchmark except tests 1 and 3 (other hours; placebo zones). That is the missing control for most claims.
- Nothing found tests TJR's own full model with his discretionary filters; test 5 is a third-party mechanisation of one variant.

### Gaps
- The full pages for tests 2–7 and 9–11 were not opened; exact rules, periods, drawdowns and cost assumptions are missing wherever the table says "not in summary". None of these figures should be quoted in a final report without opening the page.
- No GitHub repository with published ICT/SMC backtest results could be searched (github.com and its API were blocked); the smart-money-concepts repository contains indicators only, no performance results. — [SRC: README](https://raw.githubusercontent.com/joshyattridge/smart-money-concepts/master/README.md)
- No academic paper testing FVG, order blocks, SMT or kill zones was found. With the search budget exhausted after five queries I cannot say none exists.
- No test of SMT divergence between NQ and ES was found.

---

## 5. Critiques from quantitative traders and microstructure research

### Takeaway
Critics accept that stops cluster at obvious levels and that price often runs them, but dispute the causal story (that institutions deliberately hunt retail stops, or that an order block marks institutional orders) and note that the concepts are older ideas renamed and too vague to test without added rules. The published research supports stop clustering and cascades in currency markets; it does not show that chart-drawn zones identify institutional orders.

### Cited Findings
- A critical review video argues: no verifiable evidence that Huddleston is profitable ("all claims lack third-party audits"); ICT terms "rebrand older concepts from ... Dow Theory and Wyckoff analysis"; liquidity sweeps describe a real tendency "but lack a systematic approach"; identifying an FVG "does not guarantee profitability; specific entry and exit criteria are essential"; the speaker has "not encountered anyone using ICT concepts successfully outside funded trader accounts". The same video reports Huddleston's claim that he was taken by Wall Street executives to program a market algorithm, which the speaker calls absurd. (Channel not identified in the summary; the creator discloses a paid brokerage partnership.) — [VH: "ICT is a Fraud, But Do His Trading Concepts Actually Work?", Aug 2026](https://videohighlight.com/v/jZ5-j7Q4GzY)
- A sceptical video on stop hunting argues it "would require a significant number of orders" to push price to stops, that traders could counter it "by placing limit orders at stop-loss grab levels", that unbiased sources are scarce, and that charts examined show "no clear evidence". — [VH: "The TRUTH about stop loss hunting"](https://videohighlight.com/v/MAwc1e3zU5o)
- CMC Markets: SMC's "theoretical foundations remain largely unverified by independent research", and the claim that retail traders can reliably identify institutional footprints on charts "lacks empirical support". — [SS: CMC Markets](https://www.cmcmarkets.com/en/trading-strategies/order-block-trading-explained)
- An MQL5 developer post: labels such as order block, sweep, FVG and BOS "do not automatically become trading rules". — [SS: MQL5 blog](https://www.mql5.com/en/blogs/post/779413)
- TJR himself tells students not to trade a sweep alone: "Trading based on liquidity sweeps and breaks of structure alone may not yield high probability trades", and says roughly "99.9%" of people cannot be profitable day traders. — [VH: Boot Camp Day 4](https://videohighlight.com/v/viuGHEuv0nw); [VH: Boot Camp 2.0 intro](https://videohighlight.com/v/o_SdawM3DIE)
- [PK] Osler (2003, Journal of Finance): using about 9,655 stop-loss and take-profit orders worth over $55 billion at a large bank (1999–2000, three currency pairs), take-profit orders cluster at round numbers while stop-loss orders cluster just beyond them; this explains reversals at round levels and fast trends after they break. — [DOI link, not re-opened](https://doi.org/10.1111/1540-6261.00588)
- [PK] Osler (2005, Journal of International Money and Finance; NY Fed Staff Report 150): exchange rates trend rapidly on reaching stop-loss cluster levels; the effect is larger and longer-lasting than at take-profit clusters, consistent with stop-driven "price cascades" lasting hours. — [DOI link, not re-opened](https://doi.org/10.1016/j.jimonfin.2004.12.002)
- [PK] Brunnermeier and Pedersen (2005, Journal of Finance), "Predatory Trading": a model in which traders profit by trading ahead of others' forced liquidations, causing price overshooting. It is theory about distressed large traders, not evidence of routine retail stop hunting. — [DOI link, not re-opened](https://doi.org/10.1111/j.1540-6261.2005.00781.x)
- [PK] Kavajecz and Odders-White (2004, Review of Financial Studies): chart support and resistance levels coincide with peaks in limit-order-book depth on the NYSE. — [DOI link, not re-opened](https://doi.org/10.1093/rfs/hhg057)

### Inferences
- "Stops cluster at prior highs/lows and round numbers, and price accelerates through them" is supported for currencies by Osler. "A specific institution engineers the move to harvest retail stops" is not something that evidence establishes; a cascade needs no single hunter.
- A cascade through stops predicts continuation after the level breaks. The sweep-and-reverse trade is the opposite bet. Both happen; the research above does not say which dominates on NQ after a session high or low is taken, so that is an empirical question for the backtest.
- "Order blocks are institutional orders" cannot be confirmed from price bars. The closest published evidence (order-book depth near support/resistance) concerns visible resting limit orders, and the one placebo-controlled retail test (section 4, test 3) found no difference from random levels.
- On a central-limit-order-book futures market, resting stop orders are not displayed to other participants, so no one "sees" retail stops directly; their likely location is inferred from the same public chart levels everyone can see. (Stated from general knowledge of exchange order handling; not sourced this session.)

### Gaps
- No microstructure study specific to stop-order clustering or stop-run reversals in E-mini or Micro E-mini Nasdaq-100 futures was found.
- I could not open the investigative videos the review cites (attributed there to "Iman Trading") or any regulator record concerning ICT or TJR.
- Academic citations in this section are from memory; sample sizes and wording must be checked against the papers.

---

## 6. Which parts have a plausible, documented basis

### Takeaway
Three building blocks rest on documented market behaviour: stop and limit-order clustering at obvious prices, liquidity-seeking by large traders, and strong time-of-day patterns in volume and volatility. The specific ICT/TJR pattern definitions built on top of them (FVG, order block, clock windows, SMT) have no comparable published support.

### Cited Findings
- [PK] Order clustering and its price effects: Osler 2003 and 2005 (above). — [DOI](https://doi.org/10.1111/1540-6261.00588); [DOI](https://doi.org/10.1016/j.jimonfin.2004.12.002)
- [PK] Time of day: trading volume and volatility are U-shaped across the session, concentrated at the open and close (theory: Admati and Pfleiderer 1988, Review of Financial Studies). — [DOI link, not re-opened](https://doi.org/10.1093/rfs/1.1.3)
- [PK] Intraday momentum: Gao, Han, Li and Zhou (2018, Journal of Financial Economics) find the first half-hour return predicts the last half-hour return in SPY, 1993–2013. — [DOI link, not re-opened](https://doi.org/10.1016/j.jfineco.2018.05.009)
- [PK] Technical rules generally: Park and Irwin (2007) count 56 of 95 modern studies reporting positive results but warn of data snooping and understated costs; Marshall, Cahan and Cahan (2008) test 7,846 intraday rules on SPY and find none profitable after a data-snooping adjustment. — [DOI, not re-opened](https://doi.org/10.1111/j.1467-6419.2007.00519.x); [DOI, not re-opened](https://doi.org/10.1016/j.jempfin.2006.05.003)
- [PK] Retail day-trader outcomes: Barber, Lee, Liu and Odean (2014) find fewer than 1% of Taiwanese day traders reliably profitable net of fees; Chague, De-Losso and Giovannetti (2020) find 97% of Brazilians who day-traded futures for more than 300 days lost money. — [DOI, not re-opened](https://doi.org/10.1016/j.finmar.2013.05.006); [SSRN, not re-opened](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3423101)
- [PK] Backtest overfitting: Bailey, Borwein, López de Prado and Zhu (2014) show that testing many variants and reporting the best inflates performance. — [DOI link, not re-opened](https://doi.org/10.1090/noti1105)
- From the retail tests: requiring a liquidity sweep was the one ICT rule reported as adding edge, and survivors looked like mean reversion; the clock windows were not special. — [VH: 25,000-strategy test](https://videohighlight.com/v/KML09tRtHM8); [SS: Silver Bullet GBB](https://jp.tradingview.com/script/teL2dDvS-Silver-Bullet-GBB/)
- ICT's kill zones and TJR's timing sit on scheduled high-activity periods: London open, 8:30 ET data releases, the 9:30 ET cash open. — [VH: 2022 ICT Mentorship Ep. 10](https://videohighlight.com/v/S9ORTYmXwdE); [VH: Boot Camp Day 25](https://videohighlight.com/v/4moWbfm6smw)

### Inferences
- The most defensible hypothesis to test first on MNQ is the simplest: a failed break of a prior session or prior-day extreme during the first 90 minutes after 9:30 ET, fading back into the range, compared against random entries at the same clock times. It isolates the one component with outside support (stop clustering, sweep rule) from the unsupported ones.
- Because volume and range are highest after the open, any strategy restricted to those hours will show bigger moves than an all-day benchmark. A fair control must match time of day, or "kill zone" results will look good for reasons unrelated to ICT.
- FVG, order block, OTE band, SMT and the Silver Bullet windows should be tested as optional filters added one at a time to that base, with the number of variants tried recorded, since each adds parameters and overfitting risk.

### Gaps
- No published evidence was found for or against FVG "fill" tendencies, the 62–79% retracement band, or NQ/ES divergence as a reversal signal.
- The academic items above were not re-opened; they are listed so the report writer can verify them, not as checked quotations.
- Research on stop clustering is from currency dealers around 2000; whether it holds in today's electronic index futures is not established by anything read here.
