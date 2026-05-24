import type { BigNum } from "./BigNum";
import {
  BN_ZERO,
  BN_ONE,
  fromNumber,
  toNum,
  sub,
  mul,
  div,
  pow,
  gte,
} from "./BigNum";
import type { GameState } from "../types/game";

const finite = (n: number, def: number): number =>
  typeof n === "number" && Number.isFinite(n) ? n : def;

export const cost = (
  base: number,
  owned: number,
  discount: boolean,
  flux: number = 0,
): BigNum => {
  const discountMult = discount ? 0.85 : 1;
  const growth = pow(1.12, owned);
  const shrink = pow(0.95, flux);
  const val = mul(mul(fromNumber(discountMult * base), growth), shrink);
  return gte(val, fromNumber(0.1)) ? val : fromNumber(0.1);
};

export const totalCost = (
  base: number,
  owned: number,
  count: number,
  discount: boolean,
  flux: number = 0,
): BigNum => {
  if (count <= 0) return BN_ZERO;
  const discountMult = discount ? 0.85 : 1;
  const growth = pow(1.12, owned);
  const series = div(sub(pow(1.12, count), BN_ONE), fromNumber(0.12));
  const shrink = pow(0.95, flux);
  let result = mul(mul(fromNumber(discountMult * base), growth), series);
  result = mul(result, shrink);
  return gte(result, fromNumber(0.1)) ? result : fromNumber(0.1);
};

export const fluxCost = (owned: number): BigNum => {
  const val = mul(fromNumber(100), pow(1.25, owned));
  return gte(val, fromNumber(0.1)) ? val : fromNumber(0.1);
};

export const totalFluxCost = (owned: number, count: number): BigNum => {
  if (count <= 0) return BN_ZERO;
  const growth = pow(1.25, owned);
  const series = div(sub(pow(1.25, count), BN_ONE), fromNumber(0.25));
  const val = mul(mul(fromNumber(100), growth), series);
  return gte(val, fromNumber(0.1)) ? val : fromNumber(0.1);
};

export const maxAffordableFlux = (owned: number, money: BigNum): number => {
  const unitCost = fluxCost(owned);
  const ratioVal = div(mul(money, fromNumber(0.25)), unitCost);
  const ratio = toNum(ratioVal);
  if (ratio <= 0) return 0;
  let n = Math.floor(Math.log(1 + ratio) / Math.log(1.25));
  n = Math.min(n, 10000);
  return Math.max(0, n);
};

export const xpForLevel = (level: number) =>
  finite(100 * Math.pow(1.5, level), Number.MAX_VALUE);

export const ascensionMult = (totalLines: BigNum): BigNum => {
  const n = toNum(totalLines);
  const val = 1 + Math.sqrt(Math.max(0, n) / 100_000);
  if (!Number.isFinite(val) || val < 1) return BN_ONE;
  return fromNumber(val);
};

export const SENIOR_PRESTIGE_THRESHOLD = 100_000_000;

export const FRAMEWORK_PRESTIGE_THRESHOLD = 100;

export const frameworkPointsToGain = (totalSeniorPoints: number): number =>
  finite(Math.floor(Math.sqrt(Math.max(0, totalSeniorPoints) / 100)), 0);

export const frameworkCost = (level: number): BigNum =>
  fromNumber(Math.max(0.1, Math.pow(1.5, level)));

export const performFrameworkPrestige = (s: GameState): GameState => {
  const gain = frameworkPointsToGain(s.totalSeniorPoints);
  return {
    ...s,
    lines: BN_ZERO,
    money: BN_ZERO,
    vibeShards: 0,
    edOwned: 0,
    kbOwned: 0,
    lintOwned: 0,
    fluxOwned: 0,
    emCoffee: false,
    emStack: false,
    emDuck: false,
    perkEdTier: 0,
    perkKbTier: 0,
    perkLintTier: 0,
    perkFluxTier: 0,
    premiumHyperThreaded: false,
    premiumCloudCompute: false,
    premiumAIOverlord: false,
    premiumEternalLoop: false,
    premiumQuantumBackup: false,
    premiumRecursiveCompile: false,
    premiumParallelDim: false,
    premiumNeuralLink: false,
    masteryMultiThreaded: false,
    masteryAlgorithm: false,
    masteryCloudCredit: false,
    masteryFocusScroll: false,
    masteryTidyComments: false,
    masteryCodeReview: false,
    masteryPairProgram: false,
    masterySprintSprint: false,
    masteryStandupSync: false,
    masteryAgileRetro: false,
    masteryRefactorPro: false,
    masteryTestDriven: false,
    masteryShipIt: false,
    vibeLevel: 0,
    vibeXP: BN_ZERO,
    spentLevels: 0,
    ascensionMultiplier: BN_ONE,
    ascensionCount: 0,
    lintMilestoneBoost: 1,
    maxLPS: BN_ZERO,
    darkWebMultiplier: 0,
    seniorPoints: 0,
    totalSeniorPoints: 0,
    seniorLines: BN_ZERO,
    retentionLevel: 0,
    sfLevel: 0,
    autoBuyerActive: false,
    frameworkPoints: (s.frameworkPoints ?? 0) + gain,
    totalFrameworkPoints: (s.totalFrameworkPoints ?? 0) + gain,
    frameworkLevel: (s.frameworkLevel ?? 0) + 1,
  };
};

export const seniorPointsToGain = (seniorLines: BigNum): number => {
  const n = toNum(seniorLines);
  return Math.floor(Math.sqrt(Math.max(0, n) / SENIOR_PRESTIGE_THRESHOLD));
};

export const getRetentionRate = (level: number) => level * 0.02;

export const seniorFrameworkBonus = (points: number, sfLevel: number) =>
  1 + sfLevel * 0.1 * points;

export const performSeniorPrestige = (s: GameState): GameState => {
  const gain = seniorPointsToGain(s.seniorLines);
  const retention = getRetentionRate(s.retentionLevel);
  const retained = Math.floor(toNum(s.totalLinesEver) * retention);
  return {
    ...s,
    seniorPoints: s.seniorPoints + gain,
    totalSeniorPoints: s.totalSeniorPoints + gain,
    seniorLines: BN_ZERO,
    lines: fromNumber(retained),
    money: BN_ZERO,
    edOwned: 0,
    kbOwned: 0,
    lintOwned: 0,
    fluxOwned: 0,
    perkEdTier: 0,
    perkKbTier: 0,
    perkLintTier: 0,
    perkFluxTier: 0,
    emCoffee: false,
    emStack: false,
    emDuck: false,
    ascensionMultiplier: BN_ONE,
    ascensionCount: 0,
    vibeLevel: 0,
    vibeXP: BN_ZERO,
    spentLevels: 0,
    lintMilestoneBoost: 1,
    maxLPS: BN_ZERO,
  };
};

export const availableLevels = (s: GameState) => s.vibeLevel - s.spentLevels;

export const vibeMult = (s: GameState) => 1 + availableLevels(s) * 0.05;

function baseMultiplier(s: GameState): number {
  let m = 1;
  m *= vibeMult(s);
  m *= toNum(s.ascensionMultiplier);
  if (s.premiumEternalLoop) m *= 1 + 0.1 * s.ascensionCount;
  m *= 1 + s.darkWebMultiplier;
  m *= seniorFrameworkBonus(s.seniorPoints, s.sfLevel);
  if (s.frameworkDevOps) m *= 1 + s.frameworkDevOps * 0.05;
  return m;
}

export const clickMultiplier = (s: GameState) => {
  let m = baseMultiplier(s);
  if (s.premiumHyperThreaded) m *= 2;
  if (s.masteryMultiThreaded) m *= 2;
  return finite(m, 1);
};

export const autoMultiplier = (s: GameState) => {
  let m = baseMultiplier(s);
  if (s.premiumCloudCompute) m *= 2;
  if (s.frameworkCodeReview) m *= 1 + s.frameworkCodeReview * 0.05;
  return m;
};

const ED_PERK_PCTS = [0, 0.25, 0.5];
const KB_PERK_PCTS = [
  0, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0, 34.0, 55.0,
];
const LINT_PERK_MULTS = [
  0, 0.25, 0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 12.0, 20.0, 34.0, 55.0,
];
const FLUX_PERK_PCTS = [0, 0.5, 1.0, 2.0, 3.5, 5.5, 9.0, 14.5];

export const linesPerClick = (s: GameState) => {
  let base = 1;
  if (s.edOwned > 0) base += s.edOwned * 0.5;
  const fluxRaw = s.fluxOwned * 1.0;
  const fluxPerkBonus =
    s.perkFluxTier > 0 ? fluxRaw * (FLUX_PERK_PCTS[s.perkFluxTier] ?? 0) : 0;
  base += fluxRaw + fluxPerkBonus;
  const kbRaw = s.kbOwned * 1.5;
  const kbPerkBonus =
    s.perkKbTier > 0 ? kbRaw * (KB_PERK_PCTS[s.perkKbTier] ?? 1.0) : 0;
  base += kbRaw + kbPerkBonus;
  if (s.perkEdTier > 0) base *= 1 + (ED_PERK_PCTS[s.perkEdTier] ?? 0);
  if (s.masteryFocusScroll) base *= 1.02;
  if (s.masteryPairProgram) base *= 1.01;
  if (s.masterySprintSprint) base *= 1.03;
  if (s.masteryStandupSync) base *= 1.02;
  if (s.masteryTestDriven) base *= 1.01;
  if (s.emCoffee) base += 0.2;
  return finite(base * clickMultiplier(s), 1);
};

export const automationLPS = (s: GameState) => {
  let base = s.lintOwned * 1 * s.lintMilestoneBoost;
  const lintPerkBonus =
    s.perkLintTier > 0 ? base * (LINT_PERK_MULTS[s.perkLintTier] ?? 1.0) : 0;
  base += lintPerkBonus;
  if (s.masteryCodeReview) base *= 1.02;
  if (s.masteryPairProgram) base *= 1.01;
  if (s.masterySprintSprint) base *= 1.03;
  if (s.masteryStandupSync) base *= 1.02;
  if (s.masteryRefactorPro) base *= 1.02;
  if (s.emStack) base += 0.3;
  return base * autoMultiplier(s);
};

export const checkMilestones = (owned: number) => {
  let m = 1;
  if (owned >= 10) m *= 2;
  if (owned >= 25) m *= 2;
  if (owned >= 100)
    m *= Math.pow(2, Math.min(60, Math.floor((owned - 100) / 100) + 1));
  if (owned >= 1000)
    m *= Math.pow(2, Math.min(60, Math.floor((owned - 1000) / 500) + 1));
  return m;
};

export const maxAffordable = (
  base: number,
  owned: number,
  money: BigNum,
  limit: number | null,
  flux: number = 0,
): number => {
  if (limit != null && owned >= limit) return 0;
  const growth = pow(1.12, owned);
  const shrink = pow(0.95, flux);
  const unitCost = mul(mul(fromNumber(base), growth), shrink);
  const unitCostClamped = gte(unitCost, fromNumber(0.1))
    ? unitCost
    : fromNumber(0.1);
  const ratioBN = div(mul(money, fromNumber(0.12)), unitCostClamped);
  const ratio = toNum(ratioBN);
  if (ratio <= 0) return 0;
  let n = Math.floor(Math.log(1 + ratio) / Math.log(1.12));
  n = Math.min(n, 10000);
  if (limit != null) n = Math.min(n, limit - owned);
  return Math.max(0, n);
};

export const moneyPerLine = (s: GameState) => {
  let base = 0.1;
  if (s.emDuck) base += 0.01;
  if (s.masteryTidyComments) base *= 1.01;
  if (s.masteryAgileRetro) base *= 1.02;
  if (s.masteryShipIt) base *= 1.03;
  return finite(Math.max(0.01, base), 0.01);
};

export const manualLPS = (_s: GameState): number => {
  return 0;
};

export function formatNum(n: BigNum | number, scientific: boolean): string {
  if (typeof n === "object" && n !== null) {
    if (n.e < 15) return String(Math.round(n.m * Math.pow(10, n.e)));
    return n.m.toFixed(2) + "e+" + n.e;
  }
  if (typeof n !== "number") return String(n);
  if (scientific || n >= 1e15)
    return n < 100 ? n.toFixed(2) : n.toExponential(2);
  if (n < 100) return n.toFixed(2);
  return Math.round(n).toLocaleString();
}

export function formatMoney(n: BigNum | number, scientific: boolean): string {
  return "$" + formatNum(n, scientific);
}

export function getVisiblePerkTier(
  owned: number,
  money: BigNum,
  thresholds: number[],
  costs: number[],
): number | null {
  let best: number | null = null;
  for (let i = 0; i < thresholds.length; i++) {
    if (owned < thresholds[i]) break;
    if (gte(money, fromNumber(costs[i] * 0.9))) best = i;
  }
  return best;
}
