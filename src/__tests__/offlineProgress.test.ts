import { describe, it, expect } from 'vitest';
import type { GameState } from '../types/game';
import { defaultState } from '../types/game';
import { computeOfflineProgress } from '../utils/offlineProgress';
import { autoTick } from '../hooks/useGameState';
import { fromNumber, toNum, BN_ZERO } from '../utils/BigNum';

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  ...defaultState,
  lastSavedAt: Date.now(),
  lintOwned: 10,
  lintMilestoneBoost: 2,
  ...overrides,
});

describe('computeOfflineProgress', () => {
  it('returns unchanged copy when elapsedMs is 0', () => {
    const state = makeState();
    const result = computeOfflineProgress(state, 0);
    expect(result.lines).toStrictEqual(state.lines);
    expect(result.money).toStrictEqual(state.money);
    expect(result.totalPlayedMs).toBe(state.totalPlayedMs);
  });

  it('returns unchanged copy when elapsedMs is negative', () => {
    const state = makeState();
    const result = computeOfflineProgress(state, -1000);
    expect(result.lines).toStrictEqual(state.lines);
  });

  it('returns unchanged copy when lastSavedAt is 0', () => {
    const state = makeState({ lastSavedAt: 0 });
    const result = computeOfflineProgress(state, 5000);
    expect(result.lines).toStrictEqual(state.lines);
    expect(result.money).toStrictEqual(state.money);
  });

  it('1 second matches autoTick exactly', () => {
    const state = makeState({ lines: fromNumber(100), money: fromNumber(50) });
    const result = computeOfflineProgress(state, 1000);
    const ticked = autoTick(state);
    expect(result.lines).toStrictEqual(ticked.lines);
    expect(toNum(result.money)).toBeCloseTo(toNum(ticked.money), 2);
    expect(result.totalLinesEver).toStrictEqual(ticked.totalLinesEver);
    expect(result.vibeXP).toStrictEqual(ticked.vibeXP);
  });

  it('5 seconds produces 5x single-tick production', () => {
    const state = makeState({ lines: BN_ZERO, money: BN_ZERO });
    const oneTick = autoTick(state);
    const result = computeOfflineProgress(state, 5000);
    expect(toNum(result.lines)).toBe(toNum(oneTick.lines) * 5);
    expect(toNum(result.money)).toBeCloseTo(toNum(oneTick.money) * 5, 1);
  });

  it('caps elapsed time at 24 hours', () => {
    const state = makeState();
    const capped = computeOfflineProgress(state, 86_400_001);
    const exact = computeOfflineProgress(state, 86_400_000);
    expect(capped.lines).toStrictEqual(exact.lines);
    expect(toNum(capped.money)).toBeCloseTo(toNum(exact.money), 1);
  });

  it('totalPlayedMs increases by elapsedMs', () => {
    const state = makeState({ totalPlayedMs: 1000 });
    const result = computeOfflineProgress(state, 5000);
    expect(result.totalPlayedMs).toBe(6000);
  });

  it('totalPlayedMs increases by 24h when elapsed exceeds cap', () => {
    const state = makeState({ totalPlayedMs: 0 });
    const result = computeOfflineProgress(state, 100_000_000);
    expect(result.totalPlayedMs).toBe(86_400_000);
  });
});
