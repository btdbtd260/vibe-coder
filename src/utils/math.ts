import type { GameState } from '../types/game';
import { KB_THRESHOLDS, KB_COSTS, LINT_THRESHOLDS, LINT_COSTS } from '../types/game';

const capOwned = (n: number) => Math.min(n, 5000);
const capFlux = (n: number) => Math.min(n, 5000);
const capFluxOwned = (n: number) => Math.min(n, 2000);

export const cost = (base: number, owned: number, discount: boolean, flux: number = 0) => {
  const discountMult = discount ? 0.85 : 1;
  const growth = Math.pow(1.12, capOwned(owned));
  const shrink = Math.pow(0.95, capFlux(flux));
  return Math.max(0.10, discountMult * base * growth * shrink);
};

export const totalCost = (base: number, owned: number, count: number, discount: boolean, flux: number = 0) => {
  if (count <= 0) return 0;
  const discountMult = discount ? 0.85 : 1;
  const growth = Math.pow(1.12, capOwned(owned));
  const series = (Math.pow(1.12, Math.min(count, 5000)) - 1) / 0.12;
  const shrink = Math.pow(0.95, capFlux(flux));
  const raw = discountMult * base * growth * series * shrink;
  if (!isFinite(raw) || raw > 1e300) return 1e300;
  return Math.max(0.10, raw);
};

export const fluxCost = (owned: number) =>
  Math.max(0.10, 100 * Math.pow(1.25, capFluxOwned(owned)));

export const totalFluxCost = (owned: number, count: number) => {
  if (count <= 0) return 0;
  const growth = Math.pow(1.25, capFluxOwned(owned));
  const series = (Math.pow(1.25, count) - 1) / 0.25;
  const raw = 100 * growth * series;
  if (!isFinite(raw) || raw > 1e300) return 1e300;
  return Math.max(0.10, raw);
};

export const maxAffordableFlux = (owned: number, money: number) => {
  const unitCost = Math.max(0.10, 100 * Math.pow(1.25, capFluxOwned(owned)));
  const ratio = money * 0.25 / unitCost;
  if (ratio <= 0) return 0;
  let n = Math.floor(Math.log(1 + ratio) / Math.log(1.25));
  n = Math.min(n, 10000);
  return Math.max(0, n);
};

export const xpForLevel = (level: number) => 100 * Math.pow(1.5, level);

export const ascensionMult = (totalLines: number) => 1 + Math.sqrt(totalLines / 100_000);

export const SENIOR_PRESTIGE_THRESHOLD = 100_000_000;

export const seniorPointsToGain = (totalLines: number) =>
  Math.floor(Math.sqrt(totalLines / SENIOR_PRESTIGE_THRESHOLD));

export const getRetentionRate = (level: number) => level * 0.02;

export const seniorFrameworkBonus = (points: number, sfLevel: number) =>
  1 + sfLevel * 0.10 * points;

export const performSeniorPrestige = (s: GameState): GameState => {
  const gain = seniorPointsToGain(s.totalLinesEver);
  const retention = getRetentionRate(s.retentionLevel);
  const retained = Math.floor(s.totalLinesEver * retention);
  return {
    ...s,
    seniorPoints: s.seniorPoints + gain,
    totalSeniorPoints: s.totalSeniorPoints + gain,
    lines: retained,
    money: 0,
    edOwned: 0, kbOwned: 0, lintOwned: 0, fluxOwned: 0,
    perkEdTier: 0, perkKbTier: 0, perkLintTier: 0,
    emCoffee: false, emStack: false, emDuck: false,
    ascensionMultiplier: 1, ascensionCount: 0,
    vibeLevel: 0, vibeXP: 0, spentLevels: 0,
    lintMilestoneBoost: 1, maxLPS: 0,
  };
};

export const availableLevels = (s: GameState) => s.vibeLevel - s.spentLevels;

export const vibeMult = (s: GameState) => 1 + availableLevels(s) * 0.05;

export const clickMultiplier = (s: GameState) => {
  let m = 1;
  if (s.premiumHyperThreaded) m *= 2;
  if (s.masteryMultiThreaded) m *= 2;
  m *= vibeMult(s);
  m *= s.ascensionMultiplier;
  if (s.premiumAIOverlord) m *= (1 + 0.01 * Math.floor(s.totalClicks / 100));
  if (s.premiumEternalLoop) m *= (1 + 0.10 * s.ascensionCount);
  m *= 1 + s.darkWebMultiplier;
  m *= seniorFrameworkBonus(s.seniorPoints, s.sfLevel);
  return m;
};

export const autoMultiplier = (s: GameState) => {
  let m = 1;
  if (s.premiumCloudCompute) m *= 2;
  m *= vibeMult(s);
  m *= s.ascensionMultiplier;
  if (s.premiumAIOverlord) m *= (1 + 0.01 * Math.floor(s.totalClicks / 100));
  if (s.premiumEternalLoop) m *= (1 + 0.10 * s.ascensionCount);
  m *= 1 + s.darkWebMultiplier;
  m *= seniorFrameworkBonus(s.seniorPoints, s.sfLevel);
  return m;
};

const ED_PERK_PCTS = [0, 0.25, 0.50];
const KB_PERK_PCTS = [0, 0.25, 0.50, 1.0, 1.5, 2.0, 3.0, 5.0];
const LINT_PERK_MULTS = [0, 0.25, 0.50, 1.0, 1.5, 2.0, 3.0, 5.0];

export const linesPerClick = (s: GameState) => {
  let base = 1;
  if (s.edOwned > 0) base += s.edOwned * 0.5;
  base += s.fluxOwned * 1.0;
  const kbRaw = s.kbOwned * 1.5;
  const kbPerkBonus = s.perkKbTier > 0 ? kbRaw * (KB_PERK_PCTS[s.perkKbTier] ?? 1.0) : 0;
  base += kbRaw + kbPerkBonus;
  if (s.perkEdTier > 0) base *= (1 + (ED_PERK_PCTS[s.perkEdTier] ?? 0));
  if (s.masteryFocusScroll) base *= 1.02;
  if (s.masteryPairProgram) base *= 1.01;
  if (s.masterySprintSprint) base *= 1.03;
  if (s.emCoffee) base += 0.2;
  return base * clickMultiplier(s);
};

export const automationLPS = (s: GameState) => {
  let base = s.lintOwned * 1 * s.lintMilestoneBoost;
  const lintPerkBonus = s.perkLintTier > 0 ? base * (LINT_PERK_MULTS[s.perkLintTier] ?? 1.0) : 0;
  base += lintPerkBonus;
  if (s.masteryCodeReview) base *= 1.02;
  if (s.masteryPairProgram) base *= 1.01;
  if (s.masterySprintSprint) base *= 1.03;
  if (s.emStack) base += 0.3;
  return base * autoMultiplier(s);
};

export const checkMilestones = (owned: number) => {
  let m = 1;
  if (owned >= 10) m *= 2;
  if (owned >= 25) m *= 2;
  if (owned >= 100) m *= Math.pow(2, Math.min(60, Math.floor((owned - 100) / 100) + 1));
  return m;
};

export const maxAffordable = (base: number, owned: number, money: number, limit: number | null, flux: number = 0) => {
  if (limit != null && owned >= limit) return 0;
  const growth = Math.pow(1.12, capOwned(owned));
  const shrink = Math.pow(0.95, capFlux(flux));
  const unitCost = Math.max(0.10, base * growth * shrink);
  const ratio = money * 0.12 / unitCost;
  if (ratio <= 0) return 0;
  let n = Math.floor(Math.log(1 + ratio) / Math.log(1.12));
  n = Math.min(n, 10000);
  if (limit != null) n = Math.min(n, limit - owned);
  return Math.max(0, n);
};

export const moneyPerLine = (s: GameState) => {
  let base = 0.10;
  if (s.emDuck) base += 0.01;
  if (s.masteryTidyComments) base *= 1.01;
  return Math.max(0.01, base);
};

export const manualLPS = (s: GameState): number => {
  const now = Date.now();
  const recent = s.clickHistory.filter(t => now - t <= 2000);
  return (recent.length * linesPerClick(s)) / 2;
};

export function formatNum(n: number, scientific: boolean): string {
  if (typeof n !== 'number') return String(n);
  if (scientific || n >= 1e15) return n < 100 ? n.toFixed(2) : n.toExponential(2);
  if (n < 100) return n.toFixed(2);
  return Math.round(n).toLocaleString();
}

export function formatMoney(n: number, scientific: boolean): string {
  return '$' + formatNum(n, scientific);
}

export function getVisiblePerkTier(
  owned: number,
  money: number,
  thresholds: number[],
  costs: number[],
): number | null {
  let best: number | null = null;
  for (let i = 0; i < thresholds.length; i++) {
    if (owned < thresholds[i]) break;
    if (money >= costs[i] * 0.9) best = i;
  }
  return best;
}
