import { describe, it, expect } from 'vitest';
import type { GameState } from '../types/game';
import { defaultState } from '../types/game';
import {
  FRAMEWORK_PRESTIGE_THRESHOLD,
  frameworkPointsToGain,
  frameworkCost,
  performFrameworkPrestige,
} from '../utils/math';
import { fromNumber, toNum, BN_ZERO } from '../utils/BigNum';

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({ ...defaultState, ...overrides });

describe('frameworkPointsToGain', () => {
  it('returns 0 for totalSeniorPoints below threshold', () => {
    expect(frameworkPointsToGain(50)).toBe(0);
  });

  it('returns 0 for negative values', () => {
    expect(frameworkPointsToGain(-1)).toBe(0);
  });

  it('returns at least 1 at threshold', () => {
    expect(frameworkPointsToGain(FRAMEWORK_PRESTIGE_THRESHOLD)).toBe(1);
  });

  it('scales with sqrt of totalSeniorPoints / 100', () => {
    const gain100 = frameworkPointsToGain(100);
    const gain400 = frameworkPointsToGain(400);
    expect(gain400).toBe(2);
    expect(gain100).toBe(1);
  });

  it('returns integer values (floor)', () => {
    expect(frameworkPointsToGain(199)).toBe(1);
    expect(frameworkPointsToGain(200)).toBe(1);
    expect(frameworkPointsToGain(399)).toBe(1);
    expect(frameworkPointsToGain(400)).toBe(2);
  });

  it('handles NaN gracefully', () => {
    expect(frameworkPointsToGain(NaN)).toBe(0);
  });
});

describe('frameworkCost', () => {
  it('returns base cost at level 0', () => {
    expect(toNum(frameworkCost(0))).toBeCloseTo(1, 2);
  });

  it('grows exponentially with level', () => {
    expect(toNum(frameworkCost(1))).toBeCloseTo(1 * Math.pow(1.5, 1), 2);
    expect(toNum(frameworkCost(2))).toBeCloseTo(1 * Math.pow(1.5, 2), 2);
  });

  it('returns at least 0.10', () => {
    expect(toNum(frameworkCost(-1))).toBeGreaterThanOrEqual(0.10);
  });
});

describe('FRAMEWORK_PRESTIGE_THRESHOLD', () => {
  it('is 100 total senior points', () => {
    expect(FRAMEWORK_PRESTIGE_THRESHOLD).toBe(100);
  });
});

describe('performFrameworkPrestige', () => {
  it('resets lines, money, editors, perks, masteries, levels, senior progress', () => {
    const s = makeState({
      totalSeniorPoints: 400,
      lines: fromNumber(999999),
      money: fromNumber(999999),
      edOwned: 5,
      kbOwned: 100,
      lintOwned: 50,
      fluxOwned: 10,
      vibeLevel: 20,
      spentLevels: 5,
      perkEdTier: 2,
      perkKbTier: 3,
      perkLintTier: 2,
      emCoffee: true,
      masteryMultiThreaded: true,
      premiumHyperThreaded: true,
      seniorPoints: 200,
      retentionLevel: 5,
      sfLevel: 3,
      autoBuyerActive: true,
      vibeShards: 50,
      darkWebMultiplier: 0.5,
      lintMilestoneBoost: 256,
      maxLPS: fromNumber(9999),
    });
    const result = performFrameworkPrestige(s);
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
    expect(result.masteryMultiThreaded).toBe(false);
    expect(result.premiumHyperThreaded).toBe(false);
    expect(result.seniorPoints).toBe(0);
    expect(result.totalSeniorPoints).toBe(0);
    expect(result.retentionLevel).toBe(0);
    expect(result.sfLevel).toBe(0);
    expect(result.autoBuyerActive).toBe(false);
    expect(result.vibeShards).toBe(0);
    expect(result.darkWebMultiplier).toBe(0);
    expect(result.lintMilestoneBoost).toBe(1);
    expect(result.maxLPS).toStrictEqual(BN_ZERO);
  });

  it('grants framework points based on totalSeniorPoints', () => {
    const s = makeState({ totalSeniorPoints: 400, frameworkPoints: 0 });
    const result = performFrameworkPrestige(s);
    expect(result.frameworkPoints).toBe(2);
    expect(result.totalFrameworkPoints).toBe(2);
  });

  it('accumulates framework points across prestiges', () => {
    const s = makeState({ totalSeniorPoints: 400, frameworkPoints: 5, totalFrameworkPoints: 10 });
    const result = performFrameworkPrestige(s);
    expect(result.frameworkPoints).toBe(7);
    expect(result.totalFrameworkPoints).toBe(12);
  });

  it('increments frameworkLevel', () => {
    const s = makeState({ totalSeniorPoints: 400, frameworkLevel: 0 });
    const result = performFrameworkPrestige(s);
    expect(result.frameworkLevel).toBe(1);
  });

  it('null-asserted new fields default to 0', () => {
    const s = makeState({ totalSeniorPoints: 400 });
    const without = { ...s };
    delete (without as any).frameworkPoints;
    delete (without as any).totalFrameworkPoints;
    delete (without as any).frameworkLevel;
    const result = performFrameworkPrestige(without as GameState);
    expect(result.frameworkPoints).toBe(2);
    expect(result.totalFrameworkPoints).toBe(2);
    expect(result.frameworkLevel).toBe(1);
  });

  it('preserves persistent fields', () => {
    const s = makeState({
      totalSeniorPoints: 400,
      totalLinesEver: fromNumber(500_000_000),
      totalPlayedMs: 3600000,
      useScientific: true,
      ascensionCount: 5,
    });
    const result = performFrameworkPrestige(s);
    expect(result.totalLinesEver).toStrictEqual(fromNumber(500_000_000));
    expect(result.totalPlayedMs).toBe(3600000);
    expect(result.useScientific).toBe(true);
    expect(result.ascensionCount).toBe(0);
  });

  it('input state is not mutated', () => {
    const s = makeState({
      totalSeniorPoints: 400,
      lines: fromNumber(5000),
      money: fromNumber(1000),
      frameworkPoints: 0,
    });
    const before = { lines: s.lines, money: s.money, frameworkPoints: s.frameworkPoints };
    performFrameworkPrestige(s);
    expect(s.lines).toStrictEqual(before.lines);
    expect(s.money).toStrictEqual(before.money);
    expect(s.frameworkPoints).toBe(before.frameworkPoints);
  });
});