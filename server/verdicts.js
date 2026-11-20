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

export function loadVerdicts(file = RESULTS_FILE) {
  let res = null;
  try { res = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* not run yet: every setup stays untested */ }
  const byId = new Map((res?.strategies || []).map(s => [s.id, s]));
  const setups = STRATEGIES.map(s => {
    const r = byId.get(s.id);
    const j = r?.judge;
    // Score out of 10 = share of tested trades since 2024 that ended in profit. A win rate, not a forecast.
    return { id: s.id, code: s.code, window: s.window, name: s.name, source: s.source, rules: s.rules, label: r?.label || 'Not tested', result: r || null,
      proven: r?.label === 'Passed', score: j?.win != null ? Math.round(j.win) / 10 : null, winPct: j?.win ?? null, avgR: j?.avgR ?? null, trades: j?.trades ?? 0 };
  });
  return { generated: res?.generated || null, data: res?.data || null, setups: [...setups, ...CARRIED_OVER], variantsTried: 23 };
}
/** Setups allowed to signal in a window. */
export const liveSetups = (verdicts, windowId) => verdicts.setups.filter(s => s.window === windowId && s.label === 'Passed' && !s.carried);

/** Every setup with a live engine for a window, best tested average first. All are shown; only "Passed" ones are proven. */
export const windowSetups = (verdicts, windowId) => verdicts.setups.filter(s => s.window === windowId && !s.carried).sort((a, b) => (b.avgR ?? -9) - (a.avgR ?? -9));
