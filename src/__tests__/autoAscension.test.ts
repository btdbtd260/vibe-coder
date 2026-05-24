import { describe, it, expect } from 'vitest';
import type { GameState } from '../types/game';
import { defaultState } from '../types/game';
import { autoAscend } from '../utils/autoAscension';
import { ascensionMult } from '../utils/math';
import { fromNumber, toNum, BN_ZERO, BN_ONE } from '../utils/BigNum';

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({ ...defaultState, ...overrides });

describe('autoAscend', () => {
  it('disabled returns copy', () => {
    const s = makeState({ autoAscension: { ...defaultState.autoAscension, enabled: false } });
    const result = autoAscend(s);
    expect(result).not.toBe(s);
    expect(result.ascensionCount).toBe(0);
  });

  it('money below 1M does not ascend', () => {
    const s = makeState({
      money: fromNumber(999999),
      totalLinesEver: fromNumber(1_000_000_000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(0);
  });

  it('run time below minimum does not ascend', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 199999,
      totalLinesEver: fromNumber(1_000_000_000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 200 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(0);
  });

  it('threshold not met does not ascend', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      ascensionMultiplier: fromNumber(100),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 10, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(0);
  });

  it('happy path ascends', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: fromNumber(1_000_000_000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(1);
    expect(result.lines).toStrictEqual(BN_ZERO);
    expect(result.money).toStrictEqual(BN_ZERO);
  });

  it('multiplier and ascensionCount update correctly', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: fromNumber(1_000_000_000),
      ascensionMultiplier: BN_ONE,
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(1);
    expect(result.ascensionMultiplier).toStrictEqual(ascensionMult(fromNumber(1_000_000_000)));
  });

  it('reset fields reset to zero/false/default values', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: fromNumber(1_000_000_000),
      lines: fromNumber(5000),
      edOwned: 5,
      kbOwned: 100,
      lintOwned: 50,
      fluxOwned: 10,
      vibeLevel: 10,
      vibeXP: fromNumber(500),
      spentLevels: 3,
      perkEdTier: 1,
      perkKbTier: 2,
      perkLintTier: 1,
      emCoffee: true,
      emStack: true,
      emDuck: true,
      masteryMultiThreaded: true,
      masteryFocusScroll: true,
      premiumHyperThreaded: true,
      vibeShards: 100,
      darkWebMultiplier: 0.5,
      lintMilestoneBoost: 256,
      maxLPS: fromNumber(5000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.lines).toStrictEqual(BN_ZERO);
    expect(result.money).toStrictEqual(BN_ZERO);
    expect(result.edOwned).toBe(0);
    expect(result.kbOwned).toBe(0);
    expect(result.lintOwned).toBe(0);
    expect(result.fluxOwned).toBe(0);
    expect(result.vibeLevel).toBe(0);
    expect(result.vibeXP).toStrictEqual(BN_ZERO);
    expect(result.spentLevels).toBe(0);
    expect(result.perkEdTier).toBe(0);
    expect(result.perkKbTier).toBe(0);
    expect(result.perkLintTier).toBe(0);
    expect(result.emCoffee).toBe(false);
    expect(result.emStack).toBe(false);
    expect(result.emDuck).toBe(false);
    expect(result.masteryMultiThreaded).toBe(false);
    expect(result.premiumHyperThreaded).toBe(false);
    expect(result.vibeShards).toBe(0);
    expect(result.darkWebMultiplier).toBe(0);
    expect(result.lintMilestoneBoost).toBe(1);
    expect(result.maxLPS).toStrictEqual(BN_ZERO);
  });

  it('persistent fields survive', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: fromNumber(1_000_000_000),
      useScientific: true,
      seniorPoints: 100,
      totalSeniorPoints: 200,
      retentionLevel: 3,
      autoBuyerActive: true,
      sfLevel: 2,
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.totalLinesEver).toStrictEqual(fromNumber(1_000_000_000));
    expect(result.totalPlayedMs).toBe(500_000);
    expect(result.useScientific).toBe(true);
    expect(result.seniorPoints).toBe(100);
    expect(result.totalSeniorPoints).toBe(200);
    expect(result.retentionLevel).toBe(3);
    expect(result.autoBuyerActive).toBe(true);
    expect(result.sfLevel).toBe(2);
  });

  it('input state is not mutated', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: fromNumber(1_000_000_000),
      lines: fromNumber(5000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 0 },
    });
    const before = { lines: s.lines, money: s.money, ascensionCount: s.ascensionCount };
    autoAscend(s);
    expect(s.lines).toStrictEqual(before.lines);
    expect(s.money).toStrictEqual(before.money);
    expect(s.ascensionCount).toBe(before.ascensionCount);
  });

  it('exact threshold boundary ascends', () => {
    const tle = fromNumber(100_000);
    const threshold = 2;
    const currentMult = ascensionMult(tle);
    const currentNum = toNum(currentMult);
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 500_000,
      totalLinesEver: tle,
      ascensionMultiplier: fromNumber(currentNum / threshold),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: threshold, minimumRunTimeSec: 0 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(1);
  });

  it('exact runtime boundary ascends', () => {
    const s = makeState({
      money: fromNumber(2_000_000),
      totalPlayedMs: 300_000,
      totalLinesEver: fromNumber(1_000_000_000),
      autoAscension: { ...defaultState.autoAscension, enabled: true, thresholdMultiplier: 1, minimumRunTimeSec: 300 },
    });
    const result = autoAscend(s);
    expect(result.ascensionCount).toBe(1);
  });
});
