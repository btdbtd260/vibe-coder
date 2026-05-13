import { describe, it, expect } from 'vitest';
import { defaultState, KB_THRESHOLDS, KB_COSTS } from '../types/game';
import {
  cost,
  totalCost,
  fluxCost,
  totalFluxCost,
  maxAffordableFlux,
  xpForLevel,
  ascensionMult,
  seniorPointsToGain,
  getRetentionRate,
  seniorFrameworkBonus,
  availableLevels,
  vibeMult,
  clickMultiplier,
  autoMultiplier,
  linesPerClick,
  automationLPS,
  checkMilestones,
  maxAffordable,
  moneyPerLine,
  formatNum,
  formatMoney,
  getVisiblePerkTier,
  performSeniorPrestige,
} from '../utils/math';
import { writeLines } from '../hooks/useGameState';

const makeState = (overrides: Partial<typeof defaultState> = {}) => ({ ...defaultState, ...overrides });

describe('cost', () => {
  it('returns base cost at owned=0 with no discount/flux', () => {
    expect(cost(100, 0, false, 0)).toBeCloseTo(100 * Math.pow(1.12, 0), 2);
  });

  it('applies 15% discount when discount=true', () => {
    const withDiscount = cost(100, 0, true, 0);
    const withoutDiscount = cost(100, 0, false, 0);
    expect(withDiscount).toBeCloseTo(withoutDiscount * 0.85, 2);
  });

  it('reduces cost with flux', () => {
    const withFlux = cost(100, 0, false, 5);
    const withoutFlux = cost(100, 0, false, 0);
    expect(withFlux).toBeLessThan(withoutFlux);
  });

  it('returns at least 0.10', () => {
    expect(cost(0.01, 0, false, 0)).toBeGreaterThanOrEqual(0.10);
  });

  it('increases with owned count', () => {
    expect(cost(100, 0, false, 0)).toBeLessThan(cost(100, 1, false, 0));
    expect(cost(100, 100, false, 0)).toBeLessThan(cost(100, 101, false, 0));
    expect(cost(100, 1000, false, 0)).toBeLessThan(cost(100, 1001, false, 0));
  });

  it('increases with flux count reducing cost', () => {
    expect(cost(100, 0, false, 0)).toBeGreaterThan(cost(100, 0, false, 1));
    expect(cost(100, 0, false, 100)).toBeGreaterThan(cost(100, 0, false, 101));
  });
});

describe('totalCost', () => {
  it('returns 0 for count <= 0', () => {
    expect(totalCost(100, 0, 0, false)).toBe(0);
    expect(totalCost(100, 0, -1, false)).toBe(0);
  });

  it('calculates series sum correctly for count=1', () => {
    const single = cost(100, 0, false, 0);
    expect(totalCost(100, 0, 1, false, 0)).toBeCloseTo(single, 2);
  });

  it('caps at 1e300 for extreme values', () => {
    const result = totalCost(1e100, 0, 10000, false, 0);
    expect(result).toBe(1e300);
  });

  it('returns at least 0.10', () => {
    expect(totalCost(0.01, 0, 1, false, 0)).toBeGreaterThanOrEqual(0.10);
  });
});

describe('fluxCost', () => {
  it('returns base cost at owned=0', () => {
    expect(fluxCost(0)).toBeCloseTo(100, 2);
  });

  it('grows exponentially with owned', () => {
    expect(fluxCost(1)).toBeCloseTo(100 * Math.pow(1.25, 1), 2);
  });

  it('returns at least 0.10', () => {
    expect(fluxCost(0)).toBeGreaterThanOrEqual(0.10);
  });

  it('increases with owned count', () => {
    expect(fluxCost(0)).toBeLessThan(fluxCost(1));
    expect(fluxCost(100)).toBeLessThan(fluxCost(101));
  });
});

describe('totalFluxCost', () => {
  it('returns 0 for count <= 0', () => {
    expect(totalFluxCost(0, 0)).toBe(0);
    expect(totalFluxCost(0, -1)).toBe(0);
  });

  it('caps at 1e300 for extreme values', () => {
    expect(totalFluxCost(0, 10000)).toBe(1e300);
  });

  it('returns at least 0.10', () => {
    expect(totalFluxCost(0, 1)).toBeGreaterThanOrEqual(0.10);
  });
});

describe('maxAffordableFlux', () => {
  it('returns 0 when money is 0', () => {
    expect(maxAffordableFlux(0, 0)).toBe(0);
  });

  it('returns positive count with sufficient money', () => {
    const count = maxAffordableFlux(0, 10000);
    expect(count).toBeGreaterThan(0);
  });

  it('caps at 10000', () => {
    expect(maxAffordableFlux(0, 1e100)).toBeLessThanOrEqual(10000);
  });
});

describe('xpForLevel', () => {
  it('returns 100 at level 0', () => {
    expect(xpForLevel(0)).toBe(100);
  });

  it('grows exponentially', () => {
    expect(xpForLevel(1)).toBeCloseTo(100 * Math.pow(1.5, 1), 2);
    expect(xpForLevel(10)).toBeCloseTo(100 * Math.pow(1.5, 10), 2);
  });
});

describe('ascensionMult', () => {
  it('returns 1 at 0 total lines', () => {
    expect(ascensionMult(0)).toBe(1);
  });

  it('calculates sqrt formula correctly', () => {
    expect(ascensionMult(100_000)).toBeCloseTo(1 + Math.sqrt(1), 2);
    expect(ascensionMult(400_000)).toBeCloseTo(1 + Math.sqrt(4), 2);
    expect(ascensionMult(900_000)).toBeCloseTo(1 + Math.sqrt(9), 2);
  });
});

describe('seniorPointsToGain', () => {
  it('returns 0 below threshold', () => {
    expect(seniorPointsToGain(0)).toBe(0);
    expect(seniorPointsToGain(50_000_000)).toBe(0);
  });

  it('returns 1 at threshold', () => {
    expect(seniorPointsToGain(100_000_000)).toBe(1);
  });

  it('scales with sqrt of ratio', () => {
    expect(seniorPointsToGain(400_000_000)).toBe(2);
    expect(seniorPointsToGain(900_000_000)).toBe(3);
  });
});

describe('getRetentionRate', () => {
  it('returns 0 at level 0', () => {
    expect(getRetentionRate(0)).toBe(0);
  });

  it('scales by 0.02 per level', () => {
    expect(getRetentionRate(1)).toBeCloseTo(0.02, 4);
    expect(getRetentionRate(5)).toBeCloseTo(0.10, 4);
    expect(getRetentionRate(50)).toBeCloseTo(1.0, 4);
  });
});

describe('seniorFrameworkBonus', () => {
  it('returns 1 with 0 points or sfLevel', () => {
    expect(seniorFrameworkBonus(0, 0)).toBe(1);
    expect(seniorFrameworkBonus(10, 0)).toBe(1);
    expect(seniorFrameworkBonus(0, 5)).toBe(1);
  });

  it('calculates 1 + sfLevel * 0.10 * points', () => {
    expect(seniorFrameworkBonus(1, 1)).toBeCloseTo(1.1, 4);
    expect(seniorFrameworkBonus(5, 2)).toBeCloseTo(1 + 2 * 0.10 * 5, 4);
  });
});

describe('availableLevels', () => {
  it('returns vibeLevel - spentLevels', () => {
    expect(availableLevels(makeState({ vibeLevel: 10, spentLevels: 3 }))).toBe(7);
    expect(availableLevels(makeState({ vibeLevel: 5, spentLevels: 5 }))).toBe(0);
    expect(availableLevels(makeState({ vibeLevel: 0, spentLevels: 0 }))).toBe(0);
  });
});

describe('vibeMult', () => {
  it('returns 1 when no available levels', () => {
    expect(vibeMult(makeState({ vibeLevel: 0, spentLevels: 0 }))).toBe(1);
  });

  it('scales by 0.05 per available level', () => {
    expect(vibeMult(makeState({ vibeLevel: 10, spentLevels: 0 }))).toBeCloseTo(1 + 10 * 0.05, 4);
    expect(vibeMult(makeState({ vibeLevel: 10, spentLevels: 5 }))).toBeCloseTo(1 + 5 * 0.05, 4);
  });
});

describe('clickMultiplier', () => {
  it('returns 1 for default state', () => {
    expect(clickMultiplier(defaultState)).toBe(1);
  });

  it('includes hyperThreaded premium', () => {
    expect(clickMultiplier(makeState({ premiumHyperThreaded: true }))).toBe(2);
  });

  it('includes multiThreaded mastery', () => {
    expect(clickMultiplier(makeState({ masteryMultiThreaded: true }))).toBe(2);
  });

  it('includes vibe multiplier', () => {
    const s = makeState({ vibeLevel: 10, spentLevels: 0 });
    expect(clickMultiplier(s)).toBeCloseTo(1 + 10 * 0.05, 4);
  });

  it('includes ascension multiplier', () => {
    expect(clickMultiplier(makeState({ ascensionMultiplier: 5 }))).toBeCloseTo(5, 4);
  });

  it('includes AI Overlord bonus', () => {
    const s = makeState({ premiumAIOverlord: true, totalClicks: 500 });
    expect(clickMultiplier(s)).toBeCloseTo(1 + 0.01 * 5, 4);
  });

  it('includes Eternal Loop bonus', () => {
    const s = makeState({ premiumEternalLoop: true, ascensionCount: 3 });
    expect(clickMultiplier(s)).toBeCloseTo(1 + 0.10 * 3, 4);
  });

  it('includes darkWebMultiplier', () => {
    const s = makeState({ darkWebMultiplier: 0.5 });
    expect(clickMultiplier(s)).toBeCloseTo(1.5, 4);
  });

  it('includes senior framework bonus', () => {
    const s = makeState({ seniorPoints: 5, sfLevel: 2 });
    expect(clickMultiplier(s)).toBeCloseTo(1 + 2 * 0.10 * 5, 4);
  });
});

describe('autoMultiplier', () => {
  it('returns 1 for default state', () => {
    expect(autoMultiplier(defaultState)).toBe(1);
  });

  it('includes cloudCompute premium', () => {
    expect(autoMultiplier(makeState({ premiumCloudCompute: true }))).toBe(2);
  });

  it('does NOT include hyperThreaded (unlike click)', () => {
    expect(autoMultiplier(makeState({ premiumHyperThreaded: true }))).toBe(1);
  });

  it('includes vibe multiplier', () => {
    const s = makeState({ vibeLevel: 10, spentLevels: 0 });
    expect(autoMultiplier(s)).toBeCloseTo(1 + 10 * 0.05, 4);
  });

  it('includes ascension multiplier', () => {
    expect(autoMultiplier(makeState({ ascensionMultiplier: 3 }))).toBeCloseTo(3, 4);
  });
});

describe('linesPerClick', () => {
  it('returns base 1 for default state', () => {
    expect(linesPerClick(defaultState)).toBe(1);
  });

  it('adds 0.5 per ed owned', () => {
    expect(linesPerClick(makeState({ edOwned: 2 }))).toBeCloseTo(1 + 2 * 0.5, 4);
  });

  it('adds 1.0 per flux owned', () => {
    expect(linesPerClick(makeState({ fluxOwned: 3 }))).toBeCloseTo(1 + 3 * 1.0, 4);
  });

  it('applies flux perk multiplier', () => {
    const s = makeState({ fluxOwned: 10, perkFluxTier: 1 });
    const raw = 10 * 1.0;
    const perkBonus = raw * 0.5;
    expect(linesPerClick(s)).toBeCloseTo(1 + raw + perkBonus, 4);
  });

  it('applies higher flux perk tiers', () => {
    const s = makeState({ fluxOwned: 100, perkFluxTier: 3 });
    const raw = 100 * 1.0;
    const perkBonus = raw * 2.0;
    expect(linesPerClick(s)).toBeCloseTo(1 + raw + perkBonus, 4);
  });

  it('adds kb bonus and scales with perk', () => {
    const s = makeState({ kbOwned: 2, perkKbTier: 1 });
    const result = linesPerClick(s);
    expect(result).toBeGreaterThan(1 + 2 * 1.5);
  });

  it('scales by ed perk tier', () => {
    const s = makeState({ edOwned: 1, perkEdTier: 1 });
    expect(linesPerClick(s)).toBeCloseTo((1 + 0.5) * (1 + 0.25), 4);
  });

  it('includes mastery bonuses', () => {
    const s = makeState({ masteryFocusScroll: true, masterySprintSprint: true });
    expect(linesPerClick(s)).toBeCloseTo(1 * 1.02 * 1.03, 4);
  });

  it('includes emCoffee', () => {
    expect(linesPerClick(makeState({ emCoffee: true }))).toBeCloseTo(1.2, 4);
  });

  it('includes standupSync mastery', () => {
    const s = makeState({ masteryStandupSync: true });
    expect(linesPerClick(s)).toBeCloseTo(1 * 1.02, 4);
  });

  it('compounds with other masteries', () => {
    const s = makeState({ masteryFocusScroll: true, masteryStandupSync: true, masterySprintSprint: true });
    expect(linesPerClick(s)).toBeCloseTo(1 * 1.02 * 1.02 * 1.03, 4);
  });

  it('includes testDriven mastery', () => {
    const s = makeState({ masteryTestDriven: true });
    expect(linesPerClick(s)).toBeCloseTo(1 * 1.01, 4);
  });

  it('compounds testDriven with other masteries', () => {
    const s = makeState({ masteryFocusScroll: true, masteryTestDriven: true, masterySprintSprint: true });
    expect(linesPerClick(s)).toBeCloseTo(1 * 1.02 * 1.01 * 1.03, 4);
  });
});

describe('automationLPS', () => {
  it('returns 0 for default state', () => {
    expect(automationLPS(defaultState)).toBe(0);
  });

  it('scales with lintOwned and milestone boost', () => {
    const s = makeState({ lintOwned: 10, lintMilestoneBoost: 2 });
    expect(automationLPS(s)).toBeCloseTo(10 * 1 * 2, 4);
  });

  it('includes lint perk tier bonus', () => {
    const s = makeState({ lintOwned: 10, perkLintTier: 1, lintMilestoneBoost: 1 });
    const base = 10 * 1 * 1;
    const expected = base + base * 0.25;
    expect(automationLPS(s)).toBeCloseTo(expected, 4);
  });

  it('includes mastery bonuses', () => {
    const s = makeState({ lintOwned: 10, lintMilestoneBoost: 1, masteryCodeReview: true, masterySprintSprint: true });
    expect(automationLPS(s)).toBeCloseTo(10 * 1.02 * 1.03, 4);
  });

  it('includes emStack', () => {
    const s = makeState({ lintOwned: 0, emStack: true });
    expect(automationLPS(s)).toBeCloseTo(0.3, 4);
  });

  it('includes standupSync mastery', () => {
    const s = makeState({ lintOwned: 10, lintMilestoneBoost: 2, masteryStandupSync: true });
    expect(automationLPS(s)).toBeCloseTo(10 * 1 * 2 * 1.02, 4);
  });

  it('includes refactorPro mastery', () => {
    const s = makeState({ lintOwned: 10, lintMilestoneBoost: 2, masteryRefactorPro: true });
    expect(automationLPS(s)).toBeCloseTo(10 * 1 * 2 * 1.02, 4);
  });

  it('compounds refactorPro with other auto masteries', () => {
    const s = makeState({ lintOwned: 10, lintMilestoneBoost: 1, masteryCodeReview: true, masteryRefactorPro: true });
    expect(automationLPS(s)).toBeCloseTo(10 * 1.02 * 1.02, 4);
  });
});

describe('checkMilestones', () => {
  it('returns 1 below first threshold', () => {
    expect(checkMilestones(0)).toBe(1);
    expect(checkMilestones(9)).toBe(1);
  });

  it('gives x2 at 10', () => {
    expect(checkMilestones(10)).toBe(2);
  });

  it('gives x4 at 25', () => {
    expect(checkMilestones(25)).toBe(4);
  });

  it('scales with pow2 past 100', () => {
    const at100 = checkMilestones(100);
    const at200 = checkMilestones(200);
    expect(at200).toBeGreaterThan(at100);
  });

  it('scales past 1000 with pow2 segment every 500', () => {
    const at1000 = checkMilestones(1000);
    const at1500 = checkMilestones(1500);
    expect(at1500).toBeGreaterThan(at1000);
  });
});

describe('maxAffordable', () => {
  it('returns 0 when money is 0', () => {
    expect(maxAffordable(100, 0, 0, null, 0)).toBe(0);
  });

  it('returns 0 when owned >= limit', () => {
    expect(maxAffordable(100, 5, 10000, 5, 0)).toBe(0);
  });

  it('returns positive count with sufficient money', () => {
    const count = maxAffordable(1, 0, 1_000_000, null, 0);
    expect(count).toBeGreaterThan(0);
  });

  it('caps at limit', () => {
    const count = maxAffordable(1, 0, 1e100, 3, 0);
    expect(count).toBeLessThanOrEqual(3);
  });

  it('caps at 10000', () => {
    expect(maxAffordable(1, 0, 1e100, null, 0)).toBeLessThanOrEqual(10000);
  });
});

describe('moneyPerLine', () => {
  it('returns 0.10 for default', () => {
    expect(moneyPerLine(defaultState)).toBeCloseTo(0.10, 4);
  });

  it('adds 0.01 with emDuck', () => {
    expect(moneyPerLine(makeState({ emDuck: true }))).toBeCloseTo(0.11, 4);
  });

  it('applies tidyComments mastery', () => {
    expect(moneyPerLine(makeState({ masteryTidyComments: true }))).toBeCloseTo(0.10 * 1.01, 4);
  });

  it('returns at least 0.01', () => {
    expect(moneyPerLine(makeState({ masteryTidyComments: true }))).toBeGreaterThanOrEqual(0.01);
  });

  it('applies agileRetro mastery', () => {
    const s = makeState({ masteryAgileRetro: true });
    expect(moneyPerLine(s)).toBeCloseTo(0.10 * 1.02, 4);
  });

  it('compounds with tidyComments and agileRetro', () => {
    const s = makeState({ masteryTidyComments: true, masteryAgileRetro: true });
    expect(moneyPerLine(s)).toBeCloseTo(0.10 * 1.01 * 1.02, 4);
  });

  it('applies shipIt mastery', () => {
    const s = makeState({ masteryShipIt: true });
    expect(moneyPerLine(s)).toBeCloseTo(0.10 * 1.03, 4);
  });

  it('compounds shipIt with other money masteries', () => {
    const s = makeState({ masteryTidyComments: true, masteryAgileRetro: true, masteryShipIt: true });
    expect(moneyPerLine(s)).toBeCloseTo(0.10 * 1.01 * 1.02 * 1.03, 4);
  });
});

describe('formatNum', () => {
  it('uses toFixed(2) for n < 100', () => {
    expect(formatNum(50, false)).toBe('50.00');
    expect(formatNum(99.9, false)).toBe('99.90');
  });

  it('uses toLocaleString for medium numbers', () => {
    const result = formatNum(1000, false);
    expect(result).toBe('1,000');
  });

  it('uses exponential for n >= 1e15', () => {
    expect(formatNum(1e15, false)).toBe('1.00e+15');
  });

  it('uses exponential when scientific=true', () => {
    expect(formatNum(100, true)).toBe('1.00e+2');
  });

  it('handles non-number input', () => {
    expect(formatNum(undefined as any, false)).toBe('undefined');
  });
});

describe('formatMoney', () => {
  it('prepends $', () => {
    expect(formatMoney(100, false)).toBe('$100');
  });
});

describe('getVisiblePerkTier', () => {
  it('returns null when owned < first threshold', () => {
    expect(getVisiblePerkTier(0, 10000, KB_THRESHOLDS, KB_COSTS)).toBeNull();
  });

  it('returns best tier where owned >= threshold and money >= 90% of cost', () => {
    const result = getVisiblePerkTier(10, 5000, KB_THRESHOLDS, KB_COSTS);
    expect(result).not.toBeNull();
  });

  it('respects threshold order', () => {
    const result = getVisiblePerkTier(200, 1_000_000, KB_THRESHOLDS, KB_COSTS);
    expect(result).not.toBeNull();
  });
});

describe('performSeniorPrestige', () => {
  it('gains points and resets progress fields', () => {
    const s = makeState({
      totalLinesEver: 100_000_000,
      seniorLines: 100_000_000,
      lines: 50_000_000,
      money: 1_000_000,
      edOwned: 5,
      kbOwned: 100,
    });
    const result = performSeniorPrestige(s);
    expect(result.seniorPoints).toBeGreaterThan(s.seniorPoints);
    expect(result.totalSeniorPoints).toBeGreaterThan(s.totalSeniorPoints);
    expect(result.seniorLines).toBe(0);
    expect(result.lines).toBeLessThan(s.lines);
    expect(result.money).toBe(0);
    expect(result.edOwned).toBe(0);
    expect(result.kbOwned).toBe(0);
  });

  it('retains some lines based on retention level', () => {
    const s = makeState({ totalLinesEver: 100_000_000, seniorLines: 100_000_000, lines: 50_000_000, retentionLevel: 10 });
    const result = performSeniorPrestige(s);
    const expectedRetained = Math.floor(s.totalLinesEver * getRetentionRate(10));
    expect(result.lines).toBe(expectedRetained);
  });

  it('resets ascension and vibe state', () => {
    const s = makeState({
      totalLinesEver: 100_000_000,
      seniorLines: 100_000_000,
      ascensionMultiplier: 100,
      ascensionCount: 10,
      vibeLevel: 50,
      vibeXP: 500,
      spentLevels: 20,
    });
    const result = performSeniorPrestige(s);
    expect(result.ascensionMultiplier).toBe(1);
    expect(result.ascensionCount).toBe(0);
    expect(result.vibeLevel).toBe(0);
    expect(result.vibeXP).toBe(0);
    expect(result.spentLevels).toBe(0);
  });
});

describe('boundary guards', () => {
  it('xpForLevel guards against Infinity at extreme levels', () => {
    expect(xpForLevel(2000)).toBe(Number.MAX_VALUE);
  });

  it('ascensionMult guards against NaN from negative lines', () => {
    expect(ascensionMult(-1)).toBe(1);
  });

  it('seniorPointsToGain guards against NaN from negative lines', () => {
    expect(seniorPointsToGain(-1)).toBe(0);
  });

  it('cost guards against NaN base', () => {
    expect(cost(NaN, 0, false, 0)).toBe(0.10);
  });

  it('fluxCost guards against NaN owned', () => {
    expect(fluxCost(NaN)).toBe(0.10);
  });

  it('maxAffordableFlux guards against NaN money', () => {
    expect(maxAffordableFlux(0, NaN)).toBe(0);
  });
});

describe('writeLines crash regression', () => {
  it('handles 1e12 vibeXP gain without freeze and produces valid state', () => {
    const s = makeState({ vibeLevel: 0, vibeXP: 0 });
    const start = Date.now();
    const result = writeLines(s, 1e12, 0.10, 1);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(1000);
    expect(Number.isFinite(result.vibeLevel)).toBe(true);
    expect(result.vibeLevel).toBeGreaterThan(0);
    expect(result.vibeXP).toBeLessThan(xpForLevel(result.vibeLevel));
  });

  it('clickMultiplier guards against Infinity from extreme product', () => {
    const s = makeState({
      ascensionMultiplier: 1e200,
      seniorPoints: 1e100,
      sfLevel: 100,
      premiumHyperThreaded: true,
      masteryMultiThreaded: true,
      darkWebMultiplier: 1e100,
      totalClicks: 1e100,
      premiumAIOverlord: true,
      premiumEternalLoop: true,
      ascensionCount: 1e100,
    });
    const cm = clickMultiplier(s);
    expect(Number.isFinite(cm)).toBe(true);
  });

  it('linesPerClick guards against Infinity from extreme product', () => {
    const s = makeState({
      ascensionMultiplier: 1e200,
      seniorPoints: 1e100,
      sfLevel: 100,
      kbOwned: 5000,
      fluxOwned: 2000,
    });
    const lpc = linesPerClick(s);
    expect(Number.isFinite(lpc)).toBe(true);
  });
});
