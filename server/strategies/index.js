// The registry: every setup The Desk knows, the window it belongs to, and its rules in plain words.
// Rules here must match research/PREREGISTRATION.md.
import { nySweepShift, asiaSweep } from './sweep.js';
import { nyOrb15, nymidNoise, nymidLast30, nymidVwap, asiaOrb } from './momentum.js';

export const STRATEGIES = [
  { id: 'ny_sweep_shift', code: 'N1', window: 'nyopen', name: 'NY sweep + shift', evaluate: nySweepShift, targetR: 2,
    source: 'Session sweep-reversal (practitioner form, rules fixed Oct 2026)',
    rules: ['Pools set before the open: Asian high/low, London 2-5 ET high/low, prior day high/low.', 'After 9:30 ET price trades through a pool.', 'A 15-minute bar closes through the last 3 bars, between 9:45 and 11:00 ET.', 'Stop 1 point past the session extreme. Target 2R. Flat at 12:00 ET. One trade a day.'] },
  { id: 'ny_orb15', code: 'N2', window: 'nyopen', name: 'Opening range breakout', evaluate: nyOrb15, targetR: 10,
    source: 'Zarattini & Aziz, SSRN 4416622 (15-minute form of a 5-minute study)',
    rules: ['The 9:30 ET bar closes up: long. Closes down: short.', 'Enter at its close (9:45 ET). Stop at its low or high.', 'Target 10R. Flat at 16:00 ET.'] },
  { id: 'nymid_noise', code: 'M1', window: 'nymid', name: 'Noise-band momentum', evaluate: nymidNoise, targetR: null,
    source: 'Zarattini, Aziz & Barbon, SSRN 4824172 (15-minute form, midday entries only)',
    rules: ['Band = the usual move from the open by this time of day (14-day average), around the open and the prior close.', 'A :00 or :30 close outside the band from 12:00 ET: trade that way.', 'Hard stop 3 x the average 15-minute range.', 'Leave when a half-hour close comes back inside the band or through VWAP. Flat at 16:00 ET.'] },
  { id: 'nymid_last30', code: 'M2', window: 'nymid', name: 'Last half-hour momentum', evaluate: nymidLast30, targetR: null,
    source: 'Gao, Han, Li & Zhou, Journal of Financial Economics 2018',
    rules: ['At the 15:30 ET close: up on the day is long, down is short.', 'Hard stop 2 x the average 15-minute range.', 'Out at 16:00 ET.'] },
  { id: 'nymid_vwap', code: 'M3', window: 'nymid', name: 'VWAP trend', evaluate: nymidVwap, targetR: null,
    source: 'Zarattini & Aziz, SSRN 4631351 (one midday decision)',
    rules: ['At the 12:00 ET close: above VWAP is long, below is short.', 'Hard stop 3 x the average 15-minute range.', 'Leave on a 15-minute close through VWAP. Flat at 16:00 ET.'] },
  { id: 'asia_orb', code: 'A1', window: 'asia', name: 'Evening range breakout', evaluate: asiaOrb, targetR: 2,
    source: 'Practitioner setup, no audited source',
    rules: ['Range = first 30 minutes after the 4:00 PM Denver reopen.', 'A 15-minute close outside the range before 8:00 PM Denver: trade that way.', 'Stop 1 point past the other side. Target 2R. Flat at 10:00 PM Denver.'] },
  { id: 'asia_sweep', code: 'A2', window: 'asia', name: 'Evening sweep + shift', evaluate: asiaSweep, targetR: 2,
    source: 'Session sweep-reversal (practitioner form), no audited source',
    rules: ["Pools = today's regular-hours high and low.", 'After 4:00 PM Denver price trades through one.', 'A 15-minute bar closes through the last 3 bars before 8:00 PM Denver.', 'Stop 1 point past the evening extreme. Target 2R. Flat at 10:00 PM Denver.'] },
];
export const byId = (id) => STRATEGIES.find(s => s.id === id);
