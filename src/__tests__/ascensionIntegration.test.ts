/**
 * Tests for ascension upgrades integration into game math.
 *
 * Phase 2: Integration — applying ascension upgrade effects to game calculations.
 *
 * TDD Cycle: RED (tests written first) → GREEN → REFACTOR
 */
import { describe, it, expect } from "vitest";
import type { GameState } from "../types/game";
import { defaultState } from "../types/game";
import { BN_ZERO, fromNumber } from "../utils/BigNum";

// Import the integration functions (will be implemented after tests)
import {
  getAscensionThreshold,
  getAscensionMultWithUpgrades,
  getRetainedLines,
  getQuickCycleMultiplier,
  getAscensionEffectDescription,
} from "../utils/ascensionIntegration";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  ...defaultState,
  ...overrides,
});

// ---------------------------------------------------------------------------
// getAscensionThreshold
// ---------------------------------------------------------------------------

describe("getAscensionThreshold", () => {
  const BASE_THRESHOLD = 1_000_000;

  it("returns base threshold when efficientAscension is 0", () => {
    const state = makeState({ efficientAscension: 0 });
    expect(getAscensionThreshold(state)).toBe(BASE_THRESHOLD);
  });

  it("reduces threshold by 5% per level of efficientAscension", () => {
    const state = makeState({ efficientAscension: 1 });
    expect(getAscensionThreshold(state)).toBeCloseTo(BASE_THRESHOLD * 0.95, 0);

    const state2 = makeState({ efficientAscension: 2 });
    expect(getAscensionThreshold(state2)).toBeCloseTo(BASE_THRESHOLD * 0.9, 0);
  });

  it("reduces threshold to 75% at max level (5)", () => {
    const state = makeState({ efficientAscension: 5 });
    expect(getAscensionThreshold(state)).toBeCloseTo(BASE_THRESHOLD * 0.75, 0);
  });

  it("never returns below 0", () => {
    const state = makeState({ efficientAscension: 999 });
    expect(getAscensionThreshold(state)).toBeGreaterThanOrEqual(0);
  });

  it("handles negative efficientAscension level gracefully", () => {
    const state = makeState({ efficientAscension: -1 });
    expect(getAscensionThreshold(state)).toBe(BASE_THRESHOLD);
  });

  it("returns whole number (Math.floor)", () => {
    const state = makeState({ efficientAscension: 1 });
    const threshold = getAscensionThreshold(state);
    expect(Number.isInteger(threshold)).toBe(true);
  });

  it("returns 0 when efficientAscension reduces threshold below 0", () => {
    // Create a scenario with very high efficientAscension
    const state = makeState({ efficientAscension: 30 });
    expect(getAscensionThreshold(state)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getAscensionMultWithUpgrades
// ---------------------------------------------------------------------------

describe("getAscensionMultWithUpgrades", () => {
  it("returns base multiplier when acceleratedGrowth is 0", () => {
    const state = makeState({
      acceleratedGrowth: 0,
      totalLinesEver: fromNumber(100_000),
    });
    const mult = getAscensionMultWithUpgrades(state);
    // Base: 1 + sqrt(100_000 / 100_000) = 1 + 1 = 2
    expect(mult).toBeCloseTo(2, 2);
  });

  it("increases multiplier effectiveness by 10% per acceleratedGrowth level", () => {
    // At level 1: effect = 0.1, so sqrt part gets 1.1x
    const state = makeState({
      acceleratedGrowth: 1,
      totalLinesEver: fromNumber(100_000),
    });
    const mult = getAscensionMultWithUpgrades(state);
    // Expected: 1 + (1 + 0.1*1) * sqrt(100_000 / 100_000) = 1 + 1.1 * 1 = 2.1
    expect(mult).toBeCloseTo(2.1, 2);
  });

  it("scales correctly with level 5", () => {
    const state = makeState({
      acceleratedGrowth: 5,
      totalLinesEver: fromNumber(400_000),
    });
    const mult = getAscensionMultWithUpgrades(state);
    // sqrt(400_000 / 100_000) = sqrt(4) = 2
    // Accelerated growth bonus: 1 + 0.1 * 5 = 1.5
    // Expected: 1 + 1.5 * 2 = 4.0
    expect(mult).toBeCloseTo(4.0, 2);
  });

  it("returns at least 1.0", () => {
    const state = makeState({
      acceleratedGrowth: 0,
      totalLinesEver: BN_ZERO,
    });
    expect(getAscensionMultWithUpgrades(state)).toBeGreaterThanOrEqual(1);
  });

  it("handles negative acceleratedGrowth level gracefully", () => {
    const state = makeState({
      acceleratedGrowth: -1,
      totalLinesEver: fromNumber(100_000),
    });
    const mult = getAscensionMultWithUpgrades(state);
    expect(mult).toBeCloseTo(2, 2);
  });

  it("works correctly with very large totalLinesEver", () => {
    const state = makeState({
      acceleratedGrowth: 10,
      totalLinesEver: fromNumber(1_000_000_000),
    });
    const mult = getAscensionMultWithUpgrades(state);
    expect(Number.isFinite(mult)).toBe(true);
    expect(mult).toBeGreaterThan(1);
  });

  it("is at least as large as base ascensionMult without upgrades", () => {
    const state = makeState({
      acceleratedGrowth: 3,
      totalLinesEver: fromNumber(250_000),
    });
    const upgraded = getAscensionMultWithUpgrades(state);
    // Base would be: 1 + sqrt(250_000 / 100_000) = 1 + sqrt(2.5) ≈ 2.581
    expect(upgraded).toBeGreaterThanOrEqual(2.58);
    // With level 3 (+30% effectiveness): 1 + 1.3 * sqrt(2.5) ≈ 3.055
    expect(upgraded).toBeGreaterThan(2.6);
  });

  it("does not mutate input state", () => {
    const state = makeState({
      acceleratedGrowth: 3,
      totalLinesEver: fromNumber(500_000),
    });
    const originalLevel = state.acceleratedGrowth;
    getAscensionMultWithUpgrades(state);
    expect(state.acceleratedGrowth).toBe(originalLevel);
  });
});

// ---------------------------------------------------------------------------
// getRetainedLines
// ---------------------------------------------------------------------------

describe("getRetainedLines", () => {
  it("returns 0 lines when headStart is 0", () => {
    const state = makeState({
      headStart: 0,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(1_000_000),
    });
    const retained = getRetainedLines(state);
    expect(retained).toBe(0);
  });

  it("retains 5% of totalLinesEver per headStart level", () => {
    const state = makeState({
      headStart: 1,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(1_000_000),
    });
    const retained = getRetainedLines(state);
    // 5% of 1_000_000 = 50_000
    expect(retained).toBeCloseTo(50_000, -2);
  });

  it("retains 25% at headStart level 5", () => {
    const state = makeState({
      headStart: 5,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(200_000),
    });
    const retained = getRetainedLines(state);
    // 25% of 200_000 = 50_000
    expect(retained).toBeCloseTo(50_000, -2);
  });

  it("caps at 100% (headStart level 20+)", () => {
    const state = makeState({
      headStart: 20,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(500_000),
    });
    const retained = getRetainedLines(state);
    // 20 * 0.05 = 1.0 (100%), so cap at 100% = 500_000
    expect(retained).toBeCloseTo(500_000, -2);
  });

  it("never exceeds totalLinesEver", () => {
    const state = makeState({
      headStart: 10,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(50_000),
    });
    const retained = getRetainedLines(state);
    // 10 * 0.05 = 0.5 (50%), 50% of 50_000 = 25_000
    expect(retained).toBeLessThanOrEqual(50_000);
  });

  it("handles negative headStart level gracefully", () => {
    const state = makeState({
      headStart: -1,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(1_000_000),
    });
    expect(getRetainedLines(state)).toBe(0);
  });

  it("does not mutate input state", () => {
    const state = makeState({
      headStart: 3,
      lines: fromNumber(100_000),
      totalLinesEver: fromNumber(500_000),
    });
    const originalLines = state.lines;
    const originalTotal = state.totalLinesEver;
    getRetainedLines(state);
    expect(state.lines).toBe(originalLines);
    expect(state.totalLinesEver).toBe(originalTotal);
  });
});

// ---------------------------------------------------------------------------
// getQuickCycleMultiplier
// ---------------------------------------------------------------------------

describe("getQuickCycleMultiplier", () => {
  it("returns 1.0 when quickCycle is 0", () => {
    expect(getQuickCycleMultiplier(makeState({ quickCycle: 0 }))).toBe(1.0);
  });

  it("reduces duration to 90% at level 1", () => {
    // 1 - 0.1 = 0.9
    expect(getQuickCycleMultiplier(makeState({ quickCycle: 1 }))).toBeCloseTo(
      0.9,
      4,
    );
  });

  it("reduces duration to 50% at level 5", () => {
    // 1 - 0.1 * 5 = 0.5
    expect(getQuickCycleMultiplier(makeState({ quickCycle: 5 }))).toBeCloseTo(
      0.5,
      4,
    );
  });

  it("never goes below 0.1 (90% reduction cap)", () => {
    expect(
      getQuickCycleMultiplier(makeState({ quickCycle: 20 })),
    ).toBeGreaterThanOrEqual(0.1);
  });

  it("handles negative quickCycle level gracefully", () => {
    expect(getQuickCycleMultiplier(makeState({ quickCycle: -1 }))).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// getAscensionEffectDescription
// ---------------------------------------------------------------------------

describe("getAscensionEffectDescription", () => {
  it("describes acceleratedGrowth effect", () => {
    const desc = getAscensionEffectDescription("acceleratedGrowth", 3);
    expect(desc).toContain("30%");
    expect(desc).toContain("acceleratedGrowth");
  });

  it("describes headStart effect", () => {
    const desc = getAscensionEffectDescription("headStart", 4);
    expect(desc).toContain("20%");
    expect(desc).toContain("headStart");
  });

  it("describes efficientAscension effect", () => {
    const desc = getAscensionEffectDescription("efficientAscension", 2);
    expect(desc).toContain("10%");
    expect(desc).toContain("efficientAscension");
  });

  it("describes quickCycle effect", () => {
    const desc = getAscensionEffectDescription("quickCycle", 1);
    expect(desc).toContain("10%");
    expect(desc).toContain("quickCycle");
  });

  it("returns empty string for unknown upgrade id", () => {
    const desc = getAscensionEffectDescription("unknown", 1);
    expect(desc).toBe("");
  });

  it("handles level 0 gracefully", () => {
    const desc = getAscensionEffectDescription("acceleratedGrowth", 0);
    expect(desc).toContain("0%");
  });

  it("describes effect for all known upgrade ids at level 1", () => {
    const ids = [
      "acceleratedGrowth",
      "headStart",
      "efficientAscension",
      "quickCycle",
    ];
    for (const id of ids) {
      const desc = getAscensionEffectDescription(id, 1);
      expect(desc).toContain(id);
      expect(desc).not.toBe("");
    }
  });

  it("describes effect at negative level gracefully", () => {
    expect(getAscensionEffectDescription("acceleratedGrowth", -1)).toContain(
      "0%",
    );
    expect(getAscensionEffectDescription("headStart", -1)).toContain("0%");
  });
});

// ---------------------------------------------------------------------------
// Edge cases: missing state fields (old save compat)
// ---------------------------------------------------------------------------

describe("ascensionIntegration edge cases", () => {
  it("getAscensionThreshold handles undefined efficientAscension", () => {
    const s = { ...defaultState } as any;
    delete s.efficientAscension;
    expect(getAscensionThreshold(s)).toBe(1_000_000);
  });

  it("getAscensionMultWithUpgrades handles NaN totalLinesEver gracefully", () => {
    const s = makeState({
      acceleratedGrowth: 1,
      totalLinesEver: BN_ZERO,
    });
    // NaN path: toNum(BN_ZERO) = 0, so this should be fine
    const mult = getAscensionMultWithUpgrades(s);
    expect(Number.isFinite(mult)).toBe(true);
    expect(mult).toBeGreaterThanOrEqual(1);
  });

  it("getAscensionMultWithUpgrades handles undefined acceleratedGrowth", () => {
    const s = { ...defaultState, totalLinesEver: fromNumber(100_000) } as any;
    delete s.acceleratedGrowth;
    const mult = getAscensionMultWithUpgrades(s);
    expect(mult).toBeCloseTo(2, 1);
  });

  it("getRetainedLines handles undefined headStart", () => {
    const s = { ...defaultState, totalLinesEver: fromNumber(1_000_000) } as any;
    delete s.headStart;
    expect(getRetainedLines(s)).toBe(0);
  });

  it("getQuickCycleMultiplier handles undefined quickCycle", () => {
    const s = { ...defaultState } as any;
    delete s.quickCycle;
    expect(getQuickCycleMultiplier(s)).toBe(1.0);
  });

  it("getAscensionMultWithUpgrades handles state with zero totalLinesEver", () => {
    const s = makeState({ totalLinesEver: BN_ZERO, acceleratedGrowth: 5 });
    expect(() => getAscensionMultWithUpgrades(s)).not.toThrow();
    expect(getAscensionMultWithUpgrades(s)).toBe(1);
  });

  it("getRetainedLines handles state with zero totalLinesEver", () => {
    const s = makeState({ totalLinesEver: BN_ZERO, headStart: 3 });
    expect(getRetainedLines(s)).toBe(0);
  });
});
