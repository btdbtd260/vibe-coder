import type { GameState } from '../types/game';
import { KB_THRESHOLDS, KB_COSTS, LINT_THRESHOLDS, LINT_COSTS, FLUX_THRESHOLDS, FLUX_COSTS } from '../types/game';
import { fluxCost, availableLevels } from './math';

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
  cost: number;
  resource: 'money' | 'level';
  apply: (s: GameState) => GameState;
}

export function autoBuyUpgrades(s: Readonly<GameState>): GameState {
  const au = s.autoUpgrades;
  if (!au.enabled) return { ...s };

  const spendableMoney = s.money * (1 - au.moneyReservePct / 100);
  const spendableLevels = availableLevels(s) * (1 - au.vibeReservePct / 100);

  if (spendableMoney <= 0 && spendableLevels <= 0) return { ...s };

  const candidates: UpgradeCandidate[] = [];

  if (spendableMoney > 0) {
    if (s.perkEdTier < 1 && s.edOwned >= 3) {
      const cost = 500;
      if (cost <= spendableMoney) {
        candidates.push({ id: 'perkEdTier1', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, perkEdTier: 1 }) });
      }
    }

    if (s.perkEdTier < 2 && s.edOwned >= 5) {
      const cost = 2000;
      if (cost <= spendableMoney) {
        candidates.push({ id: 'perkEdTier2', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, perkEdTier: 2 }) });
      }
    }

    if (s.perkKbTier < KB_THRESHOLDS.length && s.kbOwned >= KB_THRESHOLDS[s.perkKbTier]) {
      const cost = KB_COSTS[s.perkKbTier];
      if (cost <= spendableMoney) {
        candidates.push({ id: 'perkKb', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, perkKbTier: st.perkKbTier + 1 }) });
      }
    }

    if (s.perkLintTier < LINT_THRESHOLDS.length && s.lintOwned >= LINT_THRESHOLDS[s.perkLintTier]) {
      const cost = LINT_COSTS[s.perkLintTier];
      if (cost <= spendableMoney) {
        candidates.push({ id: 'perkLint', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, perkLintTier: st.perkLintTier + 1 }) });
      }
    }

    if (s.perkFluxTier < FLUX_THRESHOLDS.length && s.fluxOwned >= FLUX_THRESHOLDS[s.perkFluxTier]) {
      const cost = FLUX_COSTS[s.perkFluxTier];
      if (cost <= spendableMoney) {
        candidates.push({ id: 'perkFlux', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, perkFluxTier: st.perkFluxTier + 1 }) });
      }
    }

    if (s.edOwned >= 5) {
      const cost = fluxCost(s.fluxOwned);
      if (cost <= spendableMoney) {
        candidates.push({ id: 'flux', cost, resource: 'money', apply: st => ({ ...st, money: st.money - cost, fluxOwned: st.fluxOwned + 1 }) });
      }
    }
  }

  if (spendableLevels > 0) {
    for (const m of MASTERY_COSTS) {
      if ((s as any)[m.key]) continue;
      if (m.cost <= spendableLevels) {
        candidates.push({
          id: m.key,
          cost: m.cost,
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
    ? candidates.reduce((a, b) => (a.cost < b.cost ? a : b))
    : candidates[0];

  return pick.apply(s);
}
