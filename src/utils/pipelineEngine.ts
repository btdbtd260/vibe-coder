import type { BigNum } from './BigNum';
import { BN_ZERO, fromNumber, mul, sub, gte, lt, add, pow } from './BigNum';

export const UPGRADE_BASE_COST = 10;
export const UPGRADE_GROWTH_RATE = 1.15;
export const PROMOTION_BASE_COST = 10;
export const PROMOTION_COST_MULTIPLIER = 5_000_000;
export const PROMOTION_GROWTH_RATE = 5;
export const WORKFLOW_MULT_BASE = 2;
export const TIER2_SPEED_BONUS_FACTOR = 0.01;
export const TIER1_BASE_LOC_PER_CYCLE = 1;
export const BATCH_COMPLETIONS_PER_SEC = 20;
export const MAX_UPGRADE_LEVEL = 100;

export type PipelineTierId = 'documentation' | 'refactoring' | 'api';

export interface PipelineTierState {
  id: PipelineTierId;
  name: string;
  baseDurationMs: number;
  upgradeLevel: number;
  workflowLevel: number;
  currentProgressMs: number;
}

export interface PipelineState {
  loc: BigNum;
  tiers: Record<PipelineTierId, PipelineTierState>;
}

const TIER_CONFIGS: Array<{ id: PipelineTierId; name: string; baseDurationMs: number }> = [
  { id: 'documentation', name: 'Documentation / Bug Fixes', baseDurationMs: 5000 },
  { id: 'refactoring', name: 'Feature Refactoring', baseDurationMs: 15000 },
  { id: 'api', name: 'API Integration', baseDurationMs: 45000 },
];

export function createInitialPipelineState(): PipelineState {
  const tiers = {} as Record<PipelineTierId, PipelineTierState>;
  for (const config of TIER_CONFIGS) {
    tiers[config.id] = {
      id: config.id,
      name: config.name,
      baseDurationMs: config.baseDurationMs,
      upgradeLevel: 1,
      workflowLevel: 0,
      currentProgressMs: 0,
    };
  }
  return { loc: BN_ZERO, tiers };
}

export function getTierSpeedMultiplier(tier: PipelineTierState): number {
  return Math.max(1, tier.upgradeLevel);
}

export function getTierWorkflowMultiplier(tier: PipelineTierState): number {
  return Math.pow(WORKFLOW_MULT_BASE, tier.workflowLevel);
}

export function getTierDurationMs(tier: PipelineTierState, state: PipelineState): number {
  let speed = getTierSpeedMultiplier(tier);
  if (tier.id === 'documentation') {
    const tier2 = state.tiers['refactoring'];
    const bonus = getTierSpeedMultiplier(tier2) * TIER2_SPEED_BONUS_FACTOR;
    speed += bonus;
  }
  const duration = tier.baseDurationMs / speed;
  return Number.isFinite(duration) && duration > 0 ? duration : tier.baseDurationMs;
}

export function getUpgradeCost(tier: PipelineTierState): BigNum {
  const exponent = Math.max(0, tier.upgradeLevel - 1);
  return mul(fromNumber(UPGRADE_BASE_COST), pow(UPGRADE_GROWTH_RATE, exponent));
}

export function getPromotionCost(tier: PipelineTierState): BigNum {
  const base = PROMOTION_BASE_COST * PROMOTION_COST_MULTIPLIER;
  return mul(fromNumber(base), pow(PROMOTION_GROWTH_RATE, tier.workflowLevel));
}

export function canBuyTierUpgrade(state: PipelineState, tierId: PipelineTierId): boolean {
  const tier = state.tiers[tierId];
  if (tier.upgradeLevel < MAX_UPGRADE_LEVEL) {
    return gte(state.loc, getUpgradeCost(tier));
  }
  return gte(state.loc, getPromotionCost(tier));
}

export function buyTierUpgrade(state: PipelineState, tierId: PipelineTierId): PipelineState {
  const tier = state.tiers[tierId];
  if (tier.upgradeLevel < MAX_UPGRADE_LEVEL) {
    const cost = getUpgradeCost(tier);
    if (lt(state.loc, cost)) return state;
    const newTier: PipelineTierState = {
      ...tier,
      upgradeLevel: tier.upgradeLevel + 1,
    };
    console.log(`Tier ${tierId} Upgraded to Level ${newTier.upgradeLevel}`);
    return {
      ...state,
      loc: sub(state.loc, cost),
      tiers: { ...state.tiers, [tierId]: newTier },
    };
  }
  const cost = getPromotionCost(tier);
  if (lt(state.loc, cost)) return state;
  const newTier: PipelineTierState = {
    ...tier,
    upgradeLevel: 1,
    workflowLevel: tier.workflowLevel + 1,
  };
  console.log(`Tier ${tierId} Promoted to Workflow Level ${newTier.workflowLevel}`);
  return {
    ...state,
    loc: sub(state.loc, cost),
    tiers: { ...state.tiers, [tierId]: newTier },
  };
}

export function tickPipeline(state: PipelineState, deltaMs: number): PipelineState {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) return state;

  let newLoc = state.loc;
  const newTiers = { ...state.tiers };

  const tierIds: PipelineTierId[] = ['documentation', 'refactoring', 'api'];

  for (const tierId of tierIds) {
    const tier = state.tiers[tierId];
    const currentState = { loc: newLoc, tiers: { ...state.tiers, ...newTiers } };
    const durationMs = getTierDurationMs(tier, currentState);

    if (!Number.isFinite(durationMs) || durationMs <= 0) {
      newTiers[tierId] = tier;
      continue;
    }

    const totalProgress = tier.currentProgressMs + deltaMs;
    const rawCompletions = totalProgress / durationMs;
    const wholeCompletions = Math.floor(rawCompletions);

    if (wholeCompletions > 0) {
      const remainder = totalProgress - wholeCompletions * durationMs;
      const completionsPerSecond = 1000 / durationMs;

      if (wholeCompletions === 1) {
        console.log(`Tier ${tier.name} completed a cycle`);
      } else if (completionsPerSecond >= BATCH_COMPLETIONS_PER_SEC) {
        console.log(`Tier ${tier.name} completed ${wholeCompletions} cycles in batch`);
      } else {
        console.log(`Tier ${tier.name} completed ${wholeCompletions} cycles`);
      }

      if (tierId === 'documentation') {
        const wfMult = getTierWorkflowMultiplier(currentState.tiers['documentation']);
        const t3Mult = getTierWorkflowMultiplier(currentState.tiers['api']);
        const locPerCompletion = TIER1_BASE_LOC_PER_CYCLE * wfMult * t3Mult;
        const totalLoc = locPerCompletion * wholeCompletions;
        if (Number.isFinite(totalLoc) && totalLoc > 0) {
          newLoc = add(newLoc, fromNumber(totalLoc));
        }
      }

      newTiers[tierId] = { ...tier, currentProgressMs: remainder };
    } else {
      newTiers[tierId] = { ...tier, currentProgressMs: totalProgress };
    }
  }

  return { ...state, loc: newLoc, tiers: newTiers };
}
