import type { GameState } from '../types/game';
import { KB_THRESHOLDS, KB_COSTS, LINT_THRESHOLDS, LINT_COSTS, FLUX_THRESHOLDS, FLUX_COSTS } from '../types/game';
import { fluxCost, availableLevels } from './math';
import { BN_ZERO, mul, sub, fromNumber, gte, gt, lt, eq, type BigNum } from './BigNum';

const MASTERY_COSTS: { key: string; cost: number }[] = [
  { key: 'masteryMultiThreaded', cost: 2 },
  { key: 'masteryAlgorithm', cost: 5 },
  { key: 'masteryCloudCredit', cost: 10 },
  { key: 'masteryFocusScroll', cost: 1 },
  { key: 'masteryTidyComments', cost: 1 },
  { key: 'masteryCodeReview', cost: 2 },
  { key: 'masteryPairProgram', cost: 2 },
  { key: 'masteryStandupSync', cost: 2 },
  { key: 'masteryAgileRetro', cost: 2 },
  { key: 'masteryRefactorPro', cost: 2 },
  { key: 'masteryTestDriven', cost: 1 },
  { key: 'masteryShipIt', cost: 3 },
  { key: 'masterySprintSprint', cost: 3 },
];

interface UpgradeCandidate {
  id: string;
  cost: BigNum;
  resource: 'money' | 'level';
  apply: (s: GameState) => GameState;
}

export function autoBuyUpgrades(s: Readonly<GameState>): GameState {
  const au = s.autoUpgrades;
  if (!au.enabled) return { ...s };

  const spendableMoney = mul(s.money, fromNumber(1 - au.moneyReservePct / 100));
  const spendableLevels = availableLevels(s) * (1 - au.vibeReservePct / 100);

  if (eq(spendableMoney, BN_ZERO) && spendableLevels <= 0) return { ...s };

  const candidates: UpgradeCandidate[] = [];

  if (gt(spendableMoney, BN_ZERO)) {
    if (s.perkEdTier < 1 && s.edOwned >= 3) {
      const rawCost = 500;
      if (gte(spendableMoney, fromNumber(rawCost))) {
        candidates.push({ id: 'perkEdTier1', cost: fromNumber(rawCost), resource: 'money', apply: st => ({ ...st, money: sub(st.money, fromNumber(rawCost)), perkEdTier: 1 }) });
      }
    }

    if (s.perkEdTier < 2 && s.edOwned >= 5) {
      const rawCost = 2000;
      if (gte(spendableMoney, fromNumber(rawCost))) {
        candidates.push({ id: 'perkEdTier2', cost: fromNumber(rawCost), resource: 'money', apply: st => ({ ...st, money: sub(st.money, fromNumber(rawCost)), perkEdTier: 2 }) });
      }
    }

    if (s.perkKbTier < KB_THRESHOLDS.length && s.kbOwned >= KB_THRESHOLDS[s.perkKbTier]) {
      const rawCost = KB_COSTS[s.perkKbTier];
      if (gte(spendableMoney, fromNumber(rawCost))) {
        candidates.push({ id: 'perkKb', cost: fromNumber(rawCost), resource: 'money', apply: st => ({ ...st, money: sub(st.money, fromNumber(rawCost)), perkKbTier: st.perkKbTier + 1 }) });
      }
    }

    if (s.perkLintTier < LINT_THRESHOLDS.length && s.lintOwned >= LINT_THRESHOLDS[s.perkLintTier]) {
      const rawCost = LINT_COSTS[s.perkLintTier];
      if (gte(spendableMoney, fromNumber(rawCost))) {
        candidates.push({ id: 'perkLint', cost: fromNumber(rawCost), resource: 'money', apply: st => ({ ...st, money: sub(st.money, fromNumber(rawCost)), perkLintTier: st.perkLintTier + 1 }) });
      }
    }

    if (s.perkFluxTier < FLUX_THRESHOLDS.length && s.fluxOwned >= FLUX_THRESHOLDS[s.perkFluxTier]) {
      const rawCost = FLUX_COSTS[s.perkFluxTier];
      if (gte(spendableMoney, fromNumber(rawCost))) {
        candidates.push({ id: 'perkFlux', cost: fromNumber(rawCost), resource: 'money', apply: st => ({ ...st, money: sub(st.money, fromNumber(rawCost)), perkFluxTier: st.perkFluxTier + 1 }) });
      }
    }

    if (s.edOwned >= 5) {
      const rawCost = fluxCost(s.fluxOwned);
      if (gte(spendableMoney, rawCost)) {
        candidates.push({ id: 'flux', cost: rawCost, resource: 'money', apply: st => ({ ...st, money: sub(st.money, rawCost), fluxOwned: st.fluxOwned + 1 }) });
      }
    }
  }

  if (spendableLevels > 0) {
    for (const m of MASTERY_COSTS) {
      if ((s as any)[m.key]) continue;
      if (gte(fromNumber(spendableLevels), fromNumber(m.cost))) {
        candidates.push({
          id: m.key,
          cost: fromNumber(m.cost),
          resource: 'level',
          apply: st => {
            const next = { ...st, spentLevels: st.spentLevels + m.cost };
            (next as any)[m.key] = true;
            return next;
          },
        });
      }
    }
  }

  if (candidates.length === 0) return { ...s };

  const pick = au.buyCheapest
    ? candidates.reduce((a, b) => (lt(a.cost, b.cost) ? a : b))
    : candidates[0];

  return pick.apply(s);
}
