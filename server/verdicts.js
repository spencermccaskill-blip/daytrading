// Joins the setup registry with the backtest results. A setup may signal only if its label is "Passed".
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATEGIES } from './strategies/index.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const RESULTS_FILE = path.join(root, 'research', 'results.json');

/** London setups tested in October 2026 and not re-run. Shown in the Playbook, never signalled. */
export const CARRIED_OVER = [
  { id: 'london_sweep_reclaim', code: 'L1', window: 'london', name: 'London sweep + reclaim', label: 'Benched', carried: true,
    source: 'Your old playbook', rules: ['Asian range (00:00-07:00 UTC) is swept during London.', 'A 15-minute bar closes back inside the range.', 'Stop 1 point past the extreme. Target 2R.'],
    summary: 'Negative in every version tested (1R, 2R, 3R, range target, time exit).',
    rows: [{ period: '2024 - Oct 2026', trades: 447, win: 37.1, avgR: -0.089, t: -1.56 }, { period: '2019 - 2023', trades: 820, win: 40.6, avgR: -0.06, t: -1.45 }, { period: 'Last 12 months', trades: 156, win: null, avgR: -0.164, t: -1.72 }] },
  { id: 'london_breakout', code: 'L2', window: 'london', name: 'London breakout', label: 'No edge', carried: true, source: 'Practitioner setup', rules: ['Break of the Asian range in the London window.'], summary: 'No positive result after costs.', rows: [] },
  { id: 'london_tjr', code: 'L3', window: 'london', name: 'London TJR', label: 'No edge', carried: true, source: 'Influencer setup, no audited record', rules: ['TJR-style sweep and fair value gap entry in London.'], summary: 'Tested, no edge. With a 20-day trend filter only 2025 was good, and that filter was added after seeing results.', rows: [] },
  { id: 'london_1am_range', code: 'L4', window: 'london', name: '1:00 AM range breakout', label: 'Benched', carried: true, source: 'Practitioner setup', rules: ['Break of the first range after 1:00 AM Denver.'], summary: 'Losing.', rows: [] },
];

export function loadVerdicts(file = RESULTS_FILE) {
  let res = null;
  try { res = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* not run yet: every setup stays untested */ }
  const byId = new Map((res?.strategies || []).map(s => [s.id, s]));
  const setups = STRATEGIES.map(s => {
    const r = byId.get(s.id);
    return { id: s.id, code: s.code, window: s.window, name: s.name, source: s.source, rules: s.rules, label: r?.label || 'Not tested', result: r || null };
  });
  return { generated: res?.generated || null, data: res?.data || null, setups: [...setups, ...CARRIED_OVER], variantsTried: 16 };
}
/** Setups allowed to signal in a window. */
export const liveSetups = (verdicts, windowId) => verdicts.setups.filter(s => s.window === windowId && s.label === 'Passed' && !s.carried);
