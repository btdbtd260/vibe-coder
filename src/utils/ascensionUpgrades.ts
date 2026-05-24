/**
 * Ascension Upgrades — permanent upgrades bought with ascensionCount.
 *
 * Each upgrade has a max level, cost scaling, and effect.
 * All functions are pure (no side effects, no mutation).
 */

import type { GameState, AscensionUpgradeDef } from '../types/game';

// ---------------------------------------------------------------------------
// Upgrade Definitions
// ---------------------------------------------------------------------------

export const ASCENSION_UPGRADES: readonly AscensionUpgradeDef[] = [
  {
    id: 'acceleratedGrowth',
    name: 'Accelerated Growth',
    desc: '+10% ascension multiplier effectiveness per level',
    maxLevel: 10,
    baseCost: 3,
    costScale: 1.5,
    effectPerLevel: 0.1,
  },
  {
    id: 'headStart',
    name: 'Head Start',
    desc: 'Start with 5% of lines retained after ascension per level',
    maxLevel: 10,
    baseCost: 2,
    costScale: 1.6,
    effectPerLevel: 0.05,
  },
  {
    id: 'efficientAscension',
    name: 'Efficient Ascension',
    desc: '-5% ascension threshold needed per level',
    maxLevel: 5,
    baseCost: 5,
    costScale: 1.5,
    effectPerLevel: 0.05,
  },
  {
    id: 'quickCycle',
    name: 'Quick Cycle',
    desc: '-10% minimum run time per level',
    maxLevel: 5,
    baseCost: 4,
    costScale: 1.6,
    effectPerLevel: 0.1,
  },
];

// ---------------------------------------------------------------------------
// Cost Calculation
// ---------------------------------------------------------------------------

/**
 * Returns the cost in ascensionCount to buy the next level of an upgrade.
 * Returns Infinity if the upgrade is already at max level.
 */
export function ascensionUpgradeCost(
  upgrade: AscensionUpgradeDef,
  currentLevel: number,
): number {
  if (currentLevel >= upgrade.maxLevel) return Infinity;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, currentLevel));
}

// ---------------------------------------------------------------------------
// Buy Logic
// ---------------------------------------------------------------------------

/**
 * Attempts to buy one level of an ascension upgrade.
 * Returns a new GameState if the purchase succeeded, or the original state
 * if the upgrade is maxed or the player cannot afford it.
 */
export function buyAscensionUpgrade(
  state: Readonly<GameState>,
  upgradeId: string,
): GameState {
  const upgrade = ASCENSION_UPGRADES.find(u => u.id === upgradeId);
  if (!upgrade) return { ...state };

  const currentLevel = (state as unknown as Record<string, number>)[upgradeId] ?? 0;
  if (currentLevel >= upgrade.maxLevel) return state;

  const cost = ascensionUpgradeCost(upgrade, currentLevel);
  if (state.ascensionCount < cost) return state;

  return {
    ...state,
    ascensionCount: state.ascensionCount - cost,
    [upgradeId]: currentLevel + 1,
  };
}

/**
 * Returns the total effect value for a given ascension upgrade.
 * This is level * effectPerLevel (e.g., level 3 of +0.1 = 0.3).
 */
export function getAscensionUpgradeEffect(
  state: Readonly<GameState>,
  upgradeDef: AscensionUpgradeDef,
): number {
  const level = (state as unknown as Record<string, number>)[upgradeDef.id] ?? 0;
  return level * upgradeDef.effectPerLevel;
}


