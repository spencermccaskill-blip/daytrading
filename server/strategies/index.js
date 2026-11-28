// The registry: every setup The Desk knows, the window it belongs to, and its rules in plain words.
// Rules here must match research/PREREGISTRATION.md.
import { nySweepShift, asiaSweep } from './sweep.js';
import { nyOrb15, nymidNoise, nymidLast30, nymidVwap, asiaOrb } from './momentum.js';
import { tjr } from './tjr.js';
import { asiaFade, londonSweep, londonBreakout, londonOrb, nyInitialBalance, nySilverBullet, nymidVwapBounce } from './popular.js';

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
  { id: 'asia_fade', code: 'A3', window: 'asia', name: 'Evening range fade', evaluate: asiaFade, targetR: null,
    source: 'Widely taught range-fade setup, no audited source',
    rules: ['Range = the first hour after the 4:00 PM Denver reopen.', 'A bar pokes outside the range but closes back inside before 8:00 PM Denver: fade it.', 'Stop 1 point past the poke. Target the far side of the range. Flat at 10:00 PM Denver.'] },
  { id: 'london_sweep', code: 'L1', window: 'london', name: 'London sweep + reclaim', evaluate: londonSweep, targetR: 2,
    source: 'ICT "Judas swing" / your old London playbook, no audited source',
    rules: ['Asian range = midnight UTC to the London open.', 'After the open price sweeps the Asian high or low.', 'A 15-minute bar closes back inside the range: trade back into it.', 'Stop 1 point past the extreme. Target 2R. Flat at noon London.'] },
  { id: 'london_breakout', code: 'L2', window: 'london', name: 'London breakout', evaluate: londonBreakout, targetR: 2,
    source: 'Widely taught Asian-range breakout, no audited source',
    rules: ['Asian range = midnight UTC to the London open.', 'First 15-minute close outside the range after the open: trade with it.', 'Stop at the middle of the range. Target 2R. Flat at noon London.'] },
  { id: 'london_orb', code: 'L3', window: 'london', name: 'London opening range', evaluate: londonOrb, targetR: 2,
    source: 'Widely taught opening-range breakout, no audited source',
    rules: ['Range = the first 30 minutes after the London open.', 'First 15-minute close outside it in the next two hours: trade with it.', 'Stop 1 point past the other side. Target 2R. Flat at noon London.'] },
  { id: 'ny_ib', code: 'N3', window: 'nyopen', name: 'Initial balance breakout', evaluate: nyInitialBalance, targetR: null,
    source: 'Market-profile setup taught by brokers and prop firms, no audited source',
    rules: ['Initial balance = the 9:30-10:30 ET range.', 'First 15-minute close outside it before noon ET: trade with it.', 'Stop at the middle of the initial balance. Target half the range beyond the edge. Flat at 16:00 ET.'] },
  { id: 'ny_silver_bullet', code: 'N4', window: 'nyopen', name: 'Silver Bullet (15m form)', evaluate: nySilverBullet, targetR: 2,
    source: 'ICT setup, simplified from 1-5 minute charts; no audited source',
    rules: ['A pool (Asian, London or prior day high/low) is swept after 9:30 ET.', 'Three bars leave a fair value gap the other way, complete between 10:00 and 11:00 ET.', 'Enter at that close. Stop 1 point past the first bar. Target 2R. Flat at 12:00 ET.'] },
  { id: 'nymid_vwap_bounce', code: 'M4', window: 'nymid', name: 'VWAP bounce', evaluate: nymidVwapBounce, targetR: 2,
    source: 'Widely taught VWAP pullback, no audited source',
    rules: ['Price has closed on one side of VWAP for three bars.', 'From 12:00 ET a bar touches VWAP and closes back on that side: trade that way.', 'Stop 1 point past the bar. Target 2R. Flat at 16:00 ET.'] },
];
// TJR Boot Camp setups (research of November 2026). One fixed reading of a discretionary method, on 5-minute bars.
// Only the New York open is a session he trades for indices; the other windows are marked `outside`.
const TJR_SOURCE = 'TJR Boot Camp (free course, 55 lessons), one mechanical reading; no audited record';
const TJR_WINDOWS = [['nyopen', 'N', 'first 90 minutes after 9:30 ET', '16:00 ET', false], ['nymid', 'M', '12:00 to 3:00 PM ET', '16:00 ET', true], ['asia', 'A', '4:00 to 9:00 PM Denver', '10:00 PM Denver', true], ['london', 'L', 'first three hours after the London open', 'noon London', true]];
for (const [window, letter, when, flat, outside] of TJR_WINDOWS) {
  const common = ['Daily bias decides the side: longs only when the daily chart last broke structure up, shorts only when down.', `A marked high or low (the last four session ranges) is swept, ${when}.`];
  STRATEGIES.push(
    { id: `tjr1_${window}`, code: `${letter}T1`, window, name: 'TJR sweep + break', evaluate: tjr(1, window), targetR: null, research: 'tjr', outside, barMin: 5, cost: 1.5, source: TJR_SOURCE,
      rules: [...common, 'Within an hour a 5-minute bar closes through the last swing point the other way: enter at that close.', `Stop 2 points beyond the sweep. Target the nearest untouched high or low at least 1R away. Flat at ${flat}. One trade a day.`] },
    { id: `tjr2_${window}`, code: `${letter}T2`, window, name: 'TJR sweep + break + pullback', evaluate: tjr(2, window), targetR: null, research: 'tjr', outside, barMin: 5, cost: 1.5, source: TJR_SOURCE,
      rules: [...common, 'Within an hour a 5-minute bar closes through the last swing point the other way.', 'Entry is a resting order at the fair value gap or order block left by that move, only in the favourable half of it. No pullback, no trade.', `Stop 2 points beyond the sweep. Target the nearest untouched high or low at least 1R away. Flat at ${flat}. One trade a day.`] },
  );
}
export const byId = (id) => STRATEGIES.find(s => s.id === id);
