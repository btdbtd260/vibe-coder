import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createInitialPipelineState,
  getTierSpeedMultiplier,
  getTierWorkflowMultiplier,
  getTierDurationMs,
  getUpgradeCost,
  getPromotionCost,
  canBuyTierUpgrade,
  buyTierUpgrade,
  tickPipeline,
  TIER1_BASE_LOC_PER_CYCLE,
} from '../utils/pipelineEngine';
import type {
  PipelineState,
  PipelineTierState,
  PipelineTierId,
} from '../utils/pipelineEngine';
import { BN_ZERO, fromNumber, add, sub, lt, gt, eq, mul, pow } from '../utils/BigNum';

function makeState(overrides?: Partial<PipelineState>): PipelineState {
  const base = createInitialPipelineState();
  return { ...base, ...overrides, tiers: overrides?.tiers ?? base.tiers };
}

function makeTier(overrides?: Partial<PipelineTierState>): PipelineTierState {
  return {
    id: 'documentation',
    name: 'Test Tier',
    baseDurationMs: 5000,
    upgradeLevel: 1,
    workflowLevel: 0,
    currentProgressMs: 0,
    ...overrides,
  };
}

function addLoc(state: PipelineState, amount: number): PipelineState {
  return { ...state, loc: add(state.loc, fromNumber(amount)) };
}

describe('createInitialPipelineState', () => {
  it('creates 3 tiers', () => {
    const state = createInitialPipelineState();
    expect(Object.keys(state.tiers)).toHaveLength(3);
    expect(state.tiers['documentation']).toBeDefined();
    expect(state.tiers['refactoring']).toBeDefined();
    expect(state.tiers['api']).toBeDefined();
  });

  it('each tier has upgradeLevel of 1', () => {
    const state = createInitialPipelineState();
    for (const id of ['documentation', 'refactoring', 'api'] as PipelineTierId[]) {
      expect(state.tiers[id].upgradeLevel).toBe(1);
    }
  });

  it('each tier has workflowLevel of 0', () => {
    const state = createInitialPipelineState();
    for (const id of ['documentation', 'refactoring', 'api'] as PipelineTierId[]) {
      expect(state.tiers[id].workflowLevel).toBe(0);
    }
  });

  it('initial loc is BN_ZERO', () => {
    const state = createInitialPipelineState();
    expect(state.loc).toBe(BN_ZERO);
  });

  it('each tier has correct name and baseDurationMs', () => {
    const state = createInitialPipelineState();
    expect(state.tiers['documentation'].name).toBe('Documentation / Bug Fixes');
    expect(state.tiers['documentation'].baseDurationMs).toBe(5000);
    expect(state.tiers['refactoring'].name).toBe('Feature Refactoring');
    expect(state.tiers['refactoring'].baseDurationMs).toBe(15000);
    expect(state.tiers['api'].name).toBe('API Integration');
    expect(state.tiers['api'].baseDurationMs).toBe(45000);
  });

  it('each tier starts with currentProgressMs of 0', () => {
    const state = createInitialPipelineState();
    for (const id of ['documentation', 'refactoring', 'api'] as PipelineTierId[]) {
      expect(state.tiers[id].currentProgressMs).toBe(0);
    }
  });
});

describe('getTierSpeedMultiplier', () => {
  it('returns upgradeLevel', () => {
    const tier = makeTier({ upgradeLevel: 5 });
    expect(getTierSpeedMultiplier(tier)).toBe(5);
  });

  it('returns 1 for upgradeLevel of 1', () => {
    const tier = makeTier({ upgradeLevel: 1 });
    expect(getTierSpeedMultiplier(tier)).toBe(1);
  });

  it('returns 100 for upgradeLevel of 100', () => {
    const tier = makeTier({ upgradeLevel: 100 });
    expect(getTierSpeedMultiplier(tier)).toBe(100);
  });

  it('clamps minimum to 1', () => {
    const tier = makeTier({ upgradeLevel: 0 });
    expect(getTierSpeedMultiplier(tier)).toBe(1);
  });
});

describe('getTierWorkflowMultiplier', () => {
  it('returns 1 for workflowLevel 0', () => {
    const tier = makeTier({ workflowLevel: 0 });
    expect(getTierWorkflowMultiplier(tier)).toBe(1);
  });

  it('returns 2 for workflowLevel 1', () => {
    const tier = makeTier({ workflowLevel: 1 });
    expect(getTierWorkflowMultiplier(tier)).toBe(2);
  });

  it('returns 8 for workflowLevel 3', () => {
    const tier = makeTier({ workflowLevel: 3 });
    expect(getTierWorkflowMultiplier(tier)).toBe(8);
  });

  it('returns 1024 for workflowLevel 10', () => {
    const tier = makeTier({ workflowLevel: 10 });
    expect(getTierWorkflowMultiplier(tier)).toBe(1024);
  });
});

describe('getTierDurationMs', () => {
  it('returns baseDurationMs when speed is 1 (accounting for T2 bonus)', () => {
    const state = makeState();
    const tier = state.tiers['documentation'];
    const duration = getTierDurationMs(tier, state);
    expect(duration).toBeCloseTo(4950.5, 0);
  });

  it('returns halved duration when speed is 2 (accounting for T2 bonus)', () => {
    const state = addLoc(makeState(), 1000);
    const tier = { ...state.tiers['documentation'], upgradeLevel: 2 };
    const result = getTierDurationMs(tier, { ...state, tiers: { ...state.tiers, documentation: tier } });
    expect(result).toBeCloseTo(2487.6, 0);
  });

  it('Tier 1 gets speed bonus from Tier 2', () => {
    const state = addLoc(makeState(), 1000);
    const tier2 = { ...state.tiers['refactoring'], upgradeLevel: 100 };
    const stateWithT2 = { ...state, tiers: { ...state.tiers, refactoring: tier2 } };
    const tier1 = state.tiers['documentation'];
    const duration = getTierDurationMs(tier1, stateWithT2);
    const expectedSpeed = 1 + 100 * 0.01;
    expect(duration).toBeCloseTo(5000 / expectedSpeed, 5);
  });

  it('returns fast time at upgradeLevel 100', () => {
    const state = addLoc(makeState(), 1000);
    const tier = { ...state.tiers['documentation'], upgradeLevel: 100 };
    const result = getTierDurationMs(tier, { ...state, tiers: { ...state.tiers, documentation: tier } });
    expect(result).toBeCloseTo(50, 0);
  });

  it('handles baseDurationMs of 0 without crash', () => {
    const state = makeState();
    const tier = makeTier({ baseDurationMs: 0 });
    const result = getTierDurationMs(tier, state);
    expect(Number.isFinite(result)).toBe(true);
  });
});

describe('getUpgradeCost', () => {
  it('returns base cost at upgradeLevel 1', () => {
    const tier = makeTier({ upgradeLevel: 1 });
    const cost = getUpgradeCost(tier);
    expect(eq(cost, fromNumber(10))).toBe(true);
  });

  it('increases at upgradeLevel 10', () => {
    const tier1 = makeTier({ upgradeLevel: 1 });
    const tier10 = makeTier({ upgradeLevel: 10 });
    const cost1 = getUpgradeCost(tier1);
    const cost10 = getUpgradeCost(tier10);
    expect(lt(cost1, cost10)).toBe(true);
  });

  it('computes correct exponential value', () => {
    const tier = makeTier({ upgradeLevel: 5 });
    const cost = getUpgradeCost(tier);
    const expected = mul(fromNumber(10), pow(1.15, 4));
    expect(eq(cost, expected)).toBe(true);
  });
});

describe('getPromotionCost', () => {
  it('is higher than normal upgrade cost at level 100', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 0 });
    const normalCost = getUpgradeCost(tier);
    const promoCost = getPromotionCost(tier);
    expect(lt(normalCost, promoCost)).toBe(true);
  });

  it('increases with workflowLevel', () => {
    const tier0 = makeTier({ workflowLevel: 0 });
    const tier1 = makeTier({ workflowLevel: 1 });
    const cost0 = getPromotionCost(tier0);
    const cost1 = getPromotionCost(tier1);
    expect(lt(cost0, cost1)).toBe(true);
  });
});

describe('canBuyTierUpgrade', () => {
  it('returns true when loc >= upgrade cost', () => {
    const state = addLoc(makeState(), 10);
    expect(canBuyTierUpgrade(state, 'documentation')).toBe(true);
  });

  it('returns false when loc < upgrade cost', () => {
    const state = addLoc(makeState(), 9);
    expect(canBuyTierUpgrade(state, 'documentation')).toBe(false);
  });

  it('returns false for promotion when loc < promotion cost', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 0 });
    const initial = createInitialPipelineState();
    const state = addLoc({ ...makeState(), tiers: { ...initial.tiers, documentation: tier } }, 5000);
    expect(canBuyTierUpgrade(state, 'documentation')).toBe(false);
  });

  it('returns true for promotion when loc >= promotion cost', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 0 });
    const initial = createInitialPipelineState();
    const promoCost = getPromotionCost(tier);
    const state = { ...makeState(), loc: promoCost, tiers: { ...initial.tiers, documentation: tier } };
    expect(canBuyTierUpgrade(state, 'documentation')).toBe(true);
  });
});

describe('buyTierUpgrade', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('increases upgradeLevel by 1 when below 100', () => {
    const state = addLoc(makeState(), 100);
    const result = buyTierUpgrade(state, 'documentation');
    expect(result.tiers['documentation'].upgradeLevel).toBe(2);
  });

  it('deducts upgrade cost from loc', () => {
    const initialLoc = 100;
    const state = addLoc(makeState(), initialLoc);
    const cost = getUpgradeCost(state.tiers['documentation']);
    const result = buyTierUpgrade(state, 'documentation');
    expect(eq(result.loc, sub(fromNumber(initialLoc), cost))).toBe(true);
  });

  it('does nothing if loc < cost', () => {
    const state = makeState();
    const result = buyTierUpgrade(state, 'documentation');
    expect(result).toBe(state);
  });

  it('triggers promotion at upgradeLevel 100', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 0 });
    const initial = createInitialPipelineState();
    const promoCost = getPromotionCost(tier);
    const state = { ...makeState(), loc: promoCost, tiers: { ...initial.tiers, documentation: tier } };
    const result = buyTierUpgrade(state, 'documentation');
    expect(result.tiers['documentation'].upgradeLevel).toBe(1);
    expect(result.tiers['documentation'].workflowLevel).toBe(1);
  });

  it('promotion resets upgradeLevel to 1', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 5 });
    const initial = createInitialPipelineState();
    const promoCost = getPromotionCost(tier);
    const state = { ...makeState(), loc: promoCost, tiers: { ...initial.tiers, documentation: tier } };
    const result = buyTierUpgrade(state, 'documentation');
    expect(result.tiers['documentation'].upgradeLevel).toBe(1);
  });

  it('promotion increases workflowLevel by 1', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 5 });
    const initial = createInitialPipelineState();
    const promoCost = getPromotionCost(tier);
    const state = { ...makeState(), loc: promoCost, tiers: { ...initial.tiers, documentation: tier } };
    const result = buyTierUpgrade(state, 'documentation');
    expect(result.tiers['documentation'].workflowLevel).toBe(6);
  });

  it('does not mutate input state on upgrade', () => {
    const state = addLoc(makeState(), 100);
    const originalUpgradeLevel = state.tiers['documentation'].upgradeLevel;
    const originalLoc = state.loc;
    buyTierUpgrade(state, 'documentation');
    expect(state.tiers['documentation'].upgradeLevel).toBe(originalUpgradeLevel);
    expect(state.loc).toBe(originalLoc);
  });

  it('does not mutate input state on promotion', () => {
    const tier = makeTier({ upgradeLevel: 100, workflowLevel: 3 });
    const initial = createInitialPipelineState();
    const promoCost = getPromotionCost(tier);
    const state = { ...makeState(), loc: promoCost, tiers: { ...initial.tiers, documentation: tier } };
    const originalWf = state.tiers['documentation'].workflowLevel;
    buyTierUpgrade(state, 'documentation');
    expect(state.tiers['documentation'].workflowLevel).toBe(originalWf);
  });
});

describe('tickPipeline', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('returns unchanged state for deltaMs of 0', () => {
    const state = makeState();
    const result = tickPipeline(state, 0);
    expect(result).toBe(state);
  });

  it('returns unchanged state for NaN deltaMs', () => {
    const state = makeState();
    const result = tickPipeline(state, NaN);
    expect(result).toBe(state);
  });

  it('returns unchanged state for negative deltaMs', () => {
    const state = makeState();
    const result = tickPipeline(state, -100);
    expect(result).toBe(state);
  });

  it('returns unchanged state for Infinity deltaMs', () => {
    const state = makeState();
    const result = tickPipeline(state, Infinity);
    expect(result).toBe(state);
  });

  it('progresses currentProgressMs for all tiers', () => {
    const state = addLoc(makeState(), 1000);
    const result = tickPipeline(state, 1000);
    for (const id of ['documentation', 'refactoring', 'api'] as PipelineTierId[]) {
      expect(result.tiers[id].currentProgressMs).toBeGreaterThan(state.tiers[id].currentProgressMs);
    }
  });

  it('does not mutate input state', () => {
    const state = addLoc(makeState(), 1000);
    const originalProgress = state.tiers['documentation'].currentProgressMs;
    tickPipeline(state, 100);
    expect(state.tiers['documentation'].currentProgressMs).toBe(originalProgress);
  });

  it('tier completes a cycle and resets progress when duration is reached', () => {
    const state = addLoc(makeState(), 1000);
    const result = tickPipeline(state, 5000);
    expect(result.tiers['documentation'].currentProgressMs).toBeLessThan(5000);
  });

  it('generates LoC when documentation tier completes', () => {
    const state = addLoc(makeState(), 1000);
    const result = tickPipeline(state, 5000);
    expect(gt(result.loc, state.loc)).toBe(true);
  });

  it('generates correct LoC for single completion', () => {
    const state = addLoc(makeState(), 1000);
    const result = tickPipeline(state, 5000);
    const expectedLoc = TIER1_BASE_LOC_PER_CYCLE * 1 * 1;
    expect(eq(result.loc, add(state.loc, fromNumber(expectedLoc)))).toBe(true);
  });

  it('handles multiple completions in one tick', () => {
    const tier = makeTier({ id: 'documentation', baseDurationMs: 100, upgradeLevel: 100 });
    const initial = createInitialPipelineState();
    const state = addLoc({
      ...makeState(),
      tiers: { ...initial.tiers, documentation: tier },
    }, 1000);
    const result = tickPipeline(state, 500);
    expect(gt(result.loc, state.loc)).toBe(true);
  });

  it('batch mode handles very fast completions without crash', () => {
    const tier = makeTier({ id: 'documentation', baseDurationMs: 1, upgradeLevel: 100 });
    const initial = createInitialPipelineState();
    const state = addLoc({
      ...makeState(),
      tiers: { ...initial.tiers, documentation: tier },
    }, 1000);
    const result = tickPipeline(state, 10000);
    expect(gt(result.loc, state.loc)).toBe(true);
  });

  it('Tier 3 workflow multiplier increases LoC output', () => {
    const docTier = makeTier({ id: 'documentation', baseDurationMs: 1000, upgradeLevel: 10, workflowLevel: 0 });
    const initial = createInitialPipelineState();
    const apiTierLow = { ...initial.tiers['api'], workflowLevel: 0 };
    const apiTierHigh = { ...initial.tiers['api'], workflowLevel: 3 };
    const stateLow = addLoc({
      ...makeState(),
      tiers: { ...initial.tiers, documentation: docTier, api: apiTierLow },
    }, 1000);
    const stateHigh = addLoc({
      ...makeState(),
      tiers: { ...initial.tiers, documentation: docTier, api: apiTierHigh },
    }, 1000);
    const resultLow = tickPipeline(stateLow, 500);
    const resultHigh = tickPipeline(stateHigh, 500);
    const locGainedLow = sub(resultLow.loc, stateLow.loc);
    const locGainedHigh = sub(resultHigh.loc, stateHigh.loc);
    expect(gt(resultLow.loc, stateLow.loc)).toBe(true);
    expect(gt(resultHigh.loc, stateHigh.loc)).toBe(true);
    expect(gt(locGainedHigh, locGainedLow)).toBe(true);
  });

  it('no LoC generated when documentation tier does not complete', () => {
    const state = addLoc(makeState(), 1000);
    const result = tickPipeline(state, 100);
    expect(result.loc).toBe(state.loc);
  });

  it('handles concurrent tier progression correctly', () => {
    const docTier = makeTier({ id: 'documentation', baseDurationMs: 5000, upgradeLevel: 1 });
    const initial = createInitialPipelineState();
    const refTier = { ...initial.tiers['refactoring'], baseDurationMs: 15000, upgradeLevel: 1 };
    const apiTier = { ...initial.tiers['api'], baseDurationMs: 45000, upgradeLevel: 1 };
    const state = addLoc({
      ...makeState(),
      tiers: { documentation: docTier, refactoring: refTier, api: apiTier },
    }, 1000);
    const result = tickPipeline(state, 5000);
    expect(result.tiers['documentation'].currentProgressMs).toBeLessThan(5000);
    expect(result.tiers['refactoring'].currentProgressMs).toBeGreaterThan(0);
    expect(result.tiers['api'].currentProgressMs).toBeGreaterThan(0);
  });
});
