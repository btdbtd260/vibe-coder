import type { GameState } from '../types/game';
import { ascensionMult } from './math';

export function autoAscend(s: Readonly<GameState>): GameState {
  const aa = s.autoAscension;
  if (!aa.enabled) return { ...s };

  if (s.money < 1_000_000) return { ...s };

  if (s.totalPlayedMs < aa.minimumRunTimeSec * 1000) return { ...s };

  const newMult = ascensionMult(s.totalLinesEver);
  const currentMult = s.ascensionMultiplier;
  const gain = currentMult > 0 ? newMult / currentMult : newMult;
  if (gain < aa.thresholdMultiplier) return { ...s };

  return {
    ...s,
    ascensionMultiplier: newMult,
    ascensionCount: s.ascensionCount + 1,
    lines: 0, money: 0,
    edOwned: 0, kbOwned: 0, lintOwned: 0, fluxOwned: 0,
    vibeLevel: 0, vibeXP: 0, spentLevels: 0,
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
    lintMilestoneBoost: 1, maxLPS: 0,
  };
}
