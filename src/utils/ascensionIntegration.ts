/**
 * Ascension Integration — applies ascension upgrade effects to game calculations.
 *
 * Pure functions that bridge ascension upgrades (data/purchase layer)
 * with game math (production, thresholds, retention, etc.).
 *
 * Phase 2: Integration layer between ascensionUpgrades.ts and math.ts.
 *
 * Effect values are derived from ASCENSION_UPGRADES definitions in ascensionUpgrades.ts
 * to keep a single source of truth for game balance.
 */
import type { GameState } from "../types/game";
import { toNum } from "./BigNum";
import { ASCENSION_UPGRADES } from "./ascensionUpgrades";

// ---------------------------------------------------------------------------
// Constants (derived from upgrade definitions)
// ---------------------------------------------------------------------------

export const BASE_ASCENSION_THRESHOLD = 1_000_000;

/** Per-level effectiveness bonus for ascension multiplier (from acceleratedGrowth). */
export const ACCELERATED_GROWTH_BONUS =
  ASCENSION_UPGRADES.find((u) => u.id === "acceleratedGrowth")
    ?.effectPerLevel ?? 0.1;

/** Per-level fraction of totalLinesEver retained (from headStart). */
export const HEAD_START_RETENTION =
  ASCENSION_UPGRADES.find((u) => u.id === "headStart")?.effectPerLevel ?? 0.05;

/** Maximum fraction of lines that can be retained (cap at 100%). */
export const HEAD_START_MAX_RETENTION = 1.0;

/** Per-level reduction in ascension threshold fraction (from efficientAscension). */
export const EFFICIENT_ASCENSION_REDUCTION =
  ASCENSION_UPGRADES.find((u) => u.id === "efficientAscension")
    ?.effectPerLevel ?? 0.05;

/** Per-level reduction in minimum run time (from quickCycle). */
export const QUICK_CYCLE_REDUCTION =
  ASCENSION_UPGRADES.find((u) => u.id === "quickCycle")?.effectPerLevel ?? 0.1;

/** Minimum floor for quick cycle multiplier (90% reduction cap). */
export const QUICK_CYCLE_MIN_MULTIPLIER = 0.1;

// ---------------------------------------------------------------------------
// getAscensionThreshold
// ---------------------------------------------------------------------------

/**
 * Returns the money threshold required to ascend, accounting for efficientAscension upgrades.
 *
 * Base threshold is $1,000,000. Each level of efficientAscension reduces it by 5%.
 * Result is floored to a whole number.
 */
export function getAscensionThreshold(state: Readonly<GameState>): number {
  const level = Math.max(0, state.efficientAscension ?? 0);
  const reduction = level * EFFICIENT_ASCENSION_REDUCTION;
  const threshold = BASE_ASCENSION_THRESHOLD * Math.max(0, 1 - reduction);
  return Math.floor(threshold);
}

// ---------------------------------------------------------------------------
// getAscensionMultWithUpgrades
// ---------------------------------------------------------------------------

/**
 * Returns the ascension multiplier including the acceleratedGrowth effectiveness bonus.
 *
 * Formula: 1 + (1 + acceleratedGrowth * ACCELERATED_GROWTH_BONUS) * sqrt(totalLinesEver / 100_000)
 * Falls back to base ascensionMult behavior when acceleratedGrowth is 0.
 */
export function getAscensionMultWithUpgrades(
  state: Readonly<GameState>,
): number {
  const totalLines = Math.max(0, toNum(state.totalLinesEver));
  const baseSqrt = Math.sqrt(totalLines / 100_000);
  const growthLevel = Math.max(0, state.acceleratedGrowth ?? 0);
  const effectivenessBonus = 1 + growthLevel * ACCELERATED_GROWTH_BONUS;
  const mult = 1 + effectivenessBonus * baseSqrt;
  return Number.isFinite(mult) ? Math.max(1, mult) : 1;
}

// ---------------------------------------------------------------------------
// getRetainedLines
// ---------------------------------------------------------------------------

/**
 * Returns the number of lines retained after ascension, based on headStart level.
 *
 * Formula: min(headStartLevel * HEAD_START_RETENTION, HEAD_START_MAX_RETENTION) * totalLinesEver
 * Returns 0 when headStart is 0.
 */
export function getRetainedLines(state: Readonly<GameState>): number {
  const level = Math.max(0, state.headStart ?? 0);
  if (level === 0) return 0;
  const retention = Math.min(
    level * HEAD_START_RETENTION,
    HEAD_START_MAX_RETENTION,
  );
  const totalEver = Math.max(0, toNum(state.totalLinesEver));
  return Math.floor(retention * totalEver);
}

// ---------------------------------------------------------------------------
// getQuickCycleMultiplier
// ---------------------------------------------------------------------------

/**
 * Returns the time multiplier for ascension cycles, based on quickCycle level.
 *
 * Formula: max(1 - level * QUICK_CYCLE_REDUCTION, QUICK_CYCLE_MIN_MULTIPLIER)
 * At level 5: returns 0.5 (50% of original duration).
 * Never goes below 0.1 (90% reduction cap).
 */
export function getQuickCycleMultiplier(state: Readonly<GameState>): number {
  const level = Math.max(0, state.quickCycle ?? 0);
  return Math.max(
    QUICK_CYCLE_MIN_MULTIPLIER,
    1 - level * QUICK_CYCLE_REDUCTION,
  );
}

// ---------------------------------------------------------------------------
// Effect description helpers
// ---------------------------------------------------------------------------

/**
 * Returns the effective percentage bonus for an ascension upgrade at a given level.
 *
 * Not all upgrades are simple "level * effectPerLevel" percentages — some cap
 * (e.g., headStart at 100%), so this applies any necessary caps.
 */
function calculateUpgradePercent(upgradeId: string, level: number): number {
  const safeLevel = Math.max(0, level);
  switch (upgradeId) {
    case "headStart":
      return (
        Math.min(safeLevel * HEAD_START_RETENTION, HEAD_START_MAX_RETENTION) *
        100
      );
    default:
      return (
        safeLevel *
        (ASCENSION_UPGRADES.find((u) => u.id === upgradeId)?.effectPerLevel ??
          0) *
        100
      );
  }
}

/** Human-readable label fragments for each upgrade's effect. */
const EFFECT_LABELS: Record<string, string> = {
  acceleratedGrowth: "ascension multiplier effectiveness bonus",
  headStart: "lines retained after ascension",
  efficientAscension: "lower ascension threshold",
  quickCycle: "shorter minimum run time",
};

/**
 * Returns a human-readable description of an ascension upgrade's effect at a given level.
 * Useful for tooltip rendering.
 * Returns empty string for unknown upgrade ids.
 */
export function getAscensionEffectDescription(
  upgradeId: string,
  level: number,
): string {
  if (!EFFECT_LABELS[upgradeId]) return "";
  const pct = calculateUpgradePercent(upgradeId, level);
  return `${upgradeId}: ${Math.round(pct)}% ${EFFECT_LABELS[upgradeId]}`;
}
