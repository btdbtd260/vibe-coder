import { describe, it, expect } from 'vitest';
import type { GameState, AscensionUpgradeDef } from '../types/game';
import { defaultState } from '../types/game';
import {
  ASCENSION_UPGRADES,
  ascensionUpgradeCost,
  buyAscensionUpgrade,
  getAscensionUpgradeEffect,
} from '../utils/ascensionUpgrades';

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({ ...defaultState, ...overrides });

// ---------------------------------------------------------------------------
// ascensionUpgradeCost
// ---------------------------------------------------------------------------

describe('ascensionUpgradeCost', () => {
  it('returns base cost at level 0', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const cost = ascensionUpgradeCost(upgrade, 0);
    expect(cost).toBe(upgrade.baseCost);
  });

  it('grows exponentially with level using costScale', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const cost1 = ascensionUpgradeCost(upgrade, 1);
    const cost2 = ascensionUpgradeCost(upgrade, 2);
    expect(cost1).toBe(Math.floor(upgrade.baseCost * upgrade.costScale));
    expect(cost2).toBe(Math.floor(upgrade.baseCost * upgrade.costScale * upgrade.costScale));
  });

  it('returns Infinity when level >= maxLevel', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'quickCycle')!;
    const cost = ascensionUpgradeCost(upgrade, upgrade.maxLevel);
    expect(cost).toBe(Infinity);
  });

  it('returns Infinity for level exceeding maxLevel', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'efficientAscension')!;
    const cost = ascensionUpgradeCost(upgrade, 10);
    expect(cost).toBe(Infinity);
  });

  it('uses Math.floor for fractional costs', () => {
    const upgrade: AscensionUpgradeDef = {
      id: 'test',
      name: 'Test',
      desc: '',
      maxLevel: 5,
      baseCost: 1,
      costScale: 1.5,
      effectPerLevel: 0.1,
    };
    const cost = ascensionUpgradeCost(upgrade, 1);
    // baseCost * costScale^1 = 1 * 1.5 = 1.5, floor = 1
    expect(cost).toBe(1);
  });

  it('handles level 0 for all upgrades correctly', () => {
    for (const upgrade of ASCENSION_UPGRADES) {
      const cost = ascensionUpgradeCost(upgrade, 0);
      expect(cost).toBe(upgrade.baseCost);
    }
  });

  it('cost increases with each level for all upgrades', () => {
    for (const upgrade of ASCENSION_UPGRADES) {
      const cost0 = ascensionUpgradeCost(upgrade, 0);
      const cost1 = ascensionUpgradeCost(upgrade, 1);
      const cost2 = ascensionUpgradeCost(upgrade, 2);
      expect(cost1).toBeGreaterThanOrEqual(cost0);
      expect(cost2).toBeGreaterThanOrEqual(cost1);
    }
  });

  it('costs are finite below maxLevel and Infinity at maxLevel for all upgrades', () => {
    for (const upgrade of ASCENSION_UPGRADES) {
      for (let level = 0; level < upgrade.maxLevel; level++) {
        const cost = ascensionUpgradeCost(upgrade, level);
        expect(cost).toBeGreaterThan(0);
        expect(cost).toBeLessThan(Infinity);
      }
      expect(ascensionUpgradeCost(upgrade, upgrade.maxLevel)).toBe(Infinity);
    }
  });
});

// ---------------------------------------------------------------------------
// buyAscensionUpgrade
// ---------------------------------------------------------------------------

describe('buyAscensionUpgrade', () => {
  it('increases upgrade level by 1 and decrements ascensionCount', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState({ ascensionCount: 10 });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.acceleratedGrowth).toBe(1);
    expect(result.ascensionCount).toBe(10 - upgrade.baseCost);
  });

  it('does not buy if already at max level', () => {
    const s = makeState({
      ascensionCount: 999,
      quickCycle: 5, // max level
    });
    const result = buyAscensionUpgrade(s, 'quickCycle');
    expect(result.quickCycle).toBe(5);
    expect(result.ascensionCount).toBe(999);
  });

  it('does not buy if not enough ascensionCount', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState({ ascensionCount: upgrade.baseCost - 1 });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.acceleratedGrowth).toBe(0);
    expect(result.ascensionCount).toBe(upgrade.baseCost - 1);
  });

  it('buys exactly at the cost boundary', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState({ ascensionCount: upgrade.baseCost });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.acceleratedGrowth).toBe(1);
    expect(result.ascensionCount).toBe(0);
  });

  it('returns new state object (immutability)', () => {
    const s = makeState({ ascensionCount: 10 });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result).not.toBe(s);
  });

  it('returns same reference if cannot afford', () => {
    const s = makeState({ ascensionCount: 0 });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result).toBe(s);
  });

  it('returns same reference if at max level', () => {
    const s = makeState({ ascensionCount: 999, quickCycle: 5 });
    const result = buyAscensionUpgrade(s, 'quickCycle');
    expect(result).toBe(s);
  });

  it('handles invalid upgrade id gracefully (returns copy)', () => {
    const s = makeState({ ascensionCount: 10 });
    const result = buyAscensionUpgrade(s, 'nonExistentUpgrade');
    expect(result).not.toBe(s);
    expect(result.ascensionCount).toBe(10);
  });

  it('cost uses current level to determine price', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'headStart')!;
    const s = makeState({ ascensionCount: 100, headStart: 2 });
    const expectedCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, 2));
    const result = buyAscensionUpgrade(s, 'headStart');
    expect(result.headStart).toBe(3);
    expect(result.ascensionCount).toBe(100 - expectedCost);
  });

  it('can buy multiple levels sequentially', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState({ ascensionCount: 100 });
    let state = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(state.acceleratedGrowth).toBe(1);
    state = buyAscensionUpgrade(state, 'acceleratedGrowth');
    expect(state.acceleratedGrowth).toBe(2);
    expect(state.ascensionCount).toBeCloseTo(100 - upgrade.baseCost - Math.floor(upgrade.baseCost * upgrade.costScale));
  });

  it('works for all 4 upgrade types', () => {
    for (const upgrade of ASCENSION_UPGRADES) {
      const s = makeState({ ascensionCount: 100 });
      const result = buyAscensionUpgrade(s, upgrade.id);
      expect((result as any)[upgrade.id]).toBe(1);
      expect(result.ascensionCount).toBe(100 - upgrade.baseCost);
    }
  });

  it('does not mutate the original state', () => {
    const s = makeState({ ascensionCount: 10, acceleratedGrowth: 0 });
    const beforeCount = s.ascensionCount;
    const beforeLevel = s.acceleratedGrowth;
    buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(s.ascensionCount).toBe(beforeCount);
    expect(s.acceleratedGrowth).toBe(beforeLevel);
  });

  it('handles negative ascensionCount gracefully', () => {
    const s = makeState({ ascensionCount: -5 });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.acceleratedGrowth).toBe(0);
    expect(result.ascensionCount).toBe(-5);
  });

  it('preserves all other state fields after purchase', () => {
    const s = makeState({ ascensionCount: 50, lines: defaultState.lines, money: defaultState.money });
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.lines).toStrictEqual(s.lines);
    expect(result.money).toStrictEqual(s.money);
    expect(result.vibeShards).toBe(s.vibeShards);
    expect(result.version).toBe(s.version);
  });

  it('handles missing state field via ?? 0 fallback (old save compat)', () => {
    const s = makeState({ ascensionCount: 10 }) as any;
    delete s.acceleratedGrowth;
    const result = buyAscensionUpgrade(s, 'acceleratedGrowth');
    expect(result.acceleratedGrowth).toBe(1);
    expect(result.ascensionCount).toBe(10 - 3);
  });
});

// ---------------------------------------------------------------------------
// getAscensionUpgradeEffect
// ---------------------------------------------------------------------------

describe('getAscensionUpgradeEffect', () => {
  it('returns 0 at level 0', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState();
    expect(getAscensionUpgradeEffect(s, upgrade)).toBe(0);
  });

  it('returns level * effectPerLevel at max level', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'acceleratedGrowth')!;
    const s = makeState({ acceleratedGrowth: upgrade.maxLevel });
    expect(getAscensionUpgradeEffect(s, upgrade)).toBeCloseTo(upgrade.maxLevel * upgrade.effectPerLevel);
  });

  it('returns correct effect for mid-level upgrade', () => {
    const upgrade = ASCENSION_UPGRADES.find(u => u.id === 'headStart')!;
    const s = makeState({ headStart: 5 });
    expect(getAscensionUpgradeEffect(s, upgrade)).toBeCloseTo(5 * upgrade.effectPerLevel);
  });

  it('works for all upgrade types', () => {
    for (const upgrade of ASCENSION_UPGRADES) {
      const s = makeState({ [upgrade.id]: 3 } as any);
      expect(getAscensionUpgradeEffect(s, upgrade)).toBeCloseTo(3 * upgrade.effectPerLevel);
    }
  });

  it('handles zero effectPerLevel', () => {
    const upgrade: AscensionUpgradeDef = {
      id: 'zeroEffect',
      name: 'Zero',
      desc: '',
      maxLevel: 5,
      baseCost: 1,
      costScale: 1.5,
      effectPerLevel: 0,
    };
    const s = makeState({} as any);
    expect(getAscensionUpgradeEffect(s, upgrade)).toBe(0);
  });

  it('falls back to 0 when state field is undefined', () => {
    const upgrade: AscensionUpgradeDef = {
      id: 'nonExistentField',
      name: 'Ghost',
      desc: '',
      maxLevel: 5,
      baseCost: 1,
      costScale: 1.5,
      effectPerLevel: 0.1,
    };
    const s = makeState({} as any);
    expect(getAscensionUpgradeEffect(s, upgrade)).toBe(0);
  });
});
