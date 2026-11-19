// Results from the October 2026 backtest on 15-minute NQ (Dec 2018 – Oct 20, 2026, 1,710 trading days,
// 1 point cost per trade, stop assumed first when stop and target fall in the same bar).
// Rules for the NY model were written down before it was run; pass bar judged on 2024 onward.
export const BACKTEST = {
  asOf: '2026-10-20',
  ny: {
    verdict: 'Most promising, not proven',
    detail: 'Positive in both test periods and in 6 of 7 full years, but it missed two of the four pass rules set in advance: worst drawdown was 10.9R (limit 10R), and the last 12 months are close to flat.',
    rows: [
      { label: '2024 – Oct 2026', trades: 383, win: 51.4, expR: 0.111, t: 2.31, maxDD: -10.9 },
      { label: '2019 – 2023', trades: 713, win: 48.2, expR: 0.052, t: 1.42, maxDD: -16.0 },
      { label: 'Last 12 months', trades: 128, win: null, expR: 0.03, t: 0.39, maxDD: -10.2 },
    ],
    years: { 2019: 0.142, 2020: -0.037, 2021: 0.114, 2022: 0.071, 2023: 0.011, 2024: 0.147, 2025: 0.135, 2026: 0.032 },
    note: 'Median stop is about 107 NQ points ($214 per MNQ). On 1 MNQ with $250 risk, about 4 in 10 signals are too wide to take. The trades that fit returned +0.18R from 2024 on, but that cut was made after seeing results.',
  },
  london: {
    verdict: 'Negative: do not trade',
    detail: 'The Asian-range sweep and reclaim lost money in every version tested (1R, 2R, 3R, range target, time exit), in both periods and the last 12 months.',
    rows: [
      { label: '2024 – Oct 2026', trades: 447, win: 37.1, expR: -0.089, t: -1.56, maxDD: null },
      { label: '2019 – 2023', trades: 820, win: 40.6, expR: -0.06, t: -1.45, maxDD: null },
      { label: 'Last 12 months', trades: 156, win: null, expR: -0.164, t: -1.72, maxDD: null },
    ],
  },
};
