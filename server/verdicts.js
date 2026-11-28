// Joins the setup registry with the backtest results. A setup may signal only if its label is "Passed".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATEGIES } from './strategies/index.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const RESULTS_FILE = path.join(root, 'research', 'results.json');

/** London setups tested in October 2026 and not re-run. Shown in the Playbook, never signalled. */
export const CARRIED_OVER = [
  { id: 'london_tjr', code: 'old', window: 'london', name: 'London TJR', label: 'No edge', carried: true, source: 'Influencer setup, no audited record', rules: ['TJR-style sweep and fair value gap entry in London.'], summary: 'Tested in October 2026: no edge. With a 20-day trend filter only 2025 was good, and that filter was added after seeing results.', rows: [] },
  { id: 'london_1am_range', code: 'old', window: 'london', name: '1:00 AM range breakout', label: 'Benched', carried: true, source: 'Practitioner setup', rules: ['Break of the first range after 1:00 AM Denver.'], summary: 'Tested in October 2026: losing.', rows: [] },
];

/** Share of wins with its 95% range (Wilson interval), in whole percent. */
export function winRange(wins, n) {
  if (!n) return null;
  const z = 1.96, p = wins / n, d = 1 + (z * z) / n, mid = (p + (z * z) / (2 * n)) / d, half = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / d;
  return { lo: Math.max(0, Math.round(100 * (mid - half))), hi: Math.min(100, Math.round(100 * (mid + half))) };
}
/** A tested average shrunk for small samples, used only to decide which of two equally active setups leads. */
export const rankR = (avgR, trades) => (avgR == null ? null : (avgR * trades) / (trades + 50));

export function loadVerdicts(file = RESULTS_FILE) {
  let res = null;
  try { res = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* not run yet: every setup stays untested */ }
  const byId = new Map((res?.strategies || []).map(s => [s.id, s]));
  const setups = STRATEGIES.map(s => {
    const r = byId.get(s.id);
    const j = r?.judge, trades = j?.trades ?? 0, wins = j?.win != null ? Math.round((j.win * trades) / 100) : 0;
    // Score out of 10 = share of tested trades that ended in profit. A win rate, not a forecast.
    return { id: s.id, code: s.code, window: s.window, name: s.name, source: s.source, rules: s.rules, label: r?.label || 'Not tested', result: r || null,
      proven: r?.label === 'Passed', score: j?.win != null ? Math.round(j.win) / 10 : null, winPct: j?.win ?? null, avgR: j?.avgR ?? null, trades, range: winRange(wins, trades), rankR: rankR(j?.avgR ?? null, trades),
      // Setups from the November 2026 research: on 5-minute bars, tested on about 48 days only. "On trial" ones are tracked but not suggested.
      research: s.research || null, outside: !!s.outside, barMin: s.barMin || 15, trial: s.research ? !r?.shown : false, period: r?.period || null };
  });
  return { generated: res?.generated || null, data: res?.data || null, five: res?.five || null, checks: res?.checks || null, setups: [...setups, ...CARRIED_OVER], variantsTried: 31 };
}
/** Setups allowed to signal in a window. */
export const liveSetups = (verdicts, windowId) => verdicts.setups.filter(s => s.window === windowId && s.label === 'Passed' && !s.carried);

/** Every setup suggested in a window, best tested average first (small samples count for less). All are shown; only "Passed" ones are proven. */
export const windowSetups = (verdicts, windowId, prefs = {}) => verdicts.setups.filter(s => s.window === windowId && !s.carried && !s.trial && !(prefs.off || []).includes(s.id)).sort((a, b) => (b.rankR ?? -9) - (a.rankR ?? -9));
