import type { GameState } from '../types/game';
import { ascensionMult } from './math';
import { lt, fromNumber, toNum, BN_ZERO } from './BigNum';

export function autoAscend(s: Readonly<GameState>): GameState {
  const aa = s.autoAscension;
  if (!aa.enabled) return { ...s };

  if (lt(s.money, fromNumber(1_000_000))) return { ...s };

  if (s.totalPlayedMs < aa.minimumRunTimeSec * 1000) return { ...s };

  const newMult = ascensionMult(s.totalLinesEver);
  const currentMult = s.ascensionMultiplier;
  const gain = toNum(currentMult) > 0 ? toNum(newMult) / toNum(currentMult) : toNum(newMult);
  if (gain < aa.thresholdMultiplier) return { ...s };

  return {
    ...s,
    ascensionMultiplier: newMult,
    ascensionCount: s.ascensionCount + 1,
    lines: BN_ZERO, money: BN_ZERO,
    edOwned: 0, kbOwned: 0, lintOwned: 0, fluxOwned: 0,
    vibeLevel: 0, vibeXP: BN_ZERO, spentLevels: 0,
    perkEdTier: 0, perkKbTier: 0, perkLintTier: 0,
    emCoffee: false, emStack: false, emDuck: false,
    masteryMultiThreaded: false, masteryAlgorithm: false, masteryCloudCredit: false,
    masteryFocusScroll: false, masteryTidyComments: false, masteryCodeReview: false,
    masteryPairProgram: false, masterySprintSprint: false, masteryStandupSync: false,
    masteryAgileRetro: false, masteryRefactorPro: false, masteryTestDriven: false,
    masteryShipIt: false,
    premiumHyperThreaded: false, premiumCloudCompute: false, premiumAIOverlord: false,
    premiumEternalLoop: false, premiumQuantumBackup: false, premiumRecursiveCompile: false,
    premiumParallelDim: false, premiumNeuralLink: false,
    vibeShards: 0, darkWebMultiplier: 0,
    lintMilestoneBoost: 1, maxLPS: BN_ZERO,
  };
}
