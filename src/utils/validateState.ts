import type { GameState } from '../types/game';

const isFiniteNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const isPosOrZero = (v: unknown): v is number =>
  isFiniteNum(v) && v >= 0;

const isPosOrOne = (v: unknown): v is number =>
  isFiniteNum(v) && v >= 1;

const isBool = (v: unknown): v is boolean =>
  typeof v === 'boolean';

const NUMERIC_GE0: (keyof GameState)[] = [
  'lines', 'money', 'vibeShards',
  'edOwned', 'kbOwned', 'lintOwned', 'fluxOwned',
  'perkEdTier', 'perkKbTier', 'perkLintTier',
  'vibeLevel', 'vibeXP', 'spentLevels',
  'ascensionCount',
  'totalLinesEver', 'totalClicks', 'totalPlayedMs', 'maxLPS',
  'buyModeIndex', 'darkWebMultiplier',
  'currentLPS', 'seniorPoints', 'totalSeniorPoints',
  'retentionLevel', 'sfLevel',
];

const NUMERIC_GE1: (keyof GameState)[] = [
  'ascensionMultiplier', 'lintMilestoneBoost',
];

const BOOLEANS: (keyof GameState)[] = [
  'emCoffee', 'emStack', 'emDuck',
  'premiumHyperThreaded', 'premiumCloudCompute', 'premiumAIOverlord',
  'premiumEternalLoop', 'premiumQuantumBackup', 'premiumRecursiveCompile',
  'premiumParallelDim', 'premiumNeuralLink',
  'masteryMultiThreaded', 'masteryAlgorithm', 'masteryCloudCredit',
  'masteryFocusScroll', 'masteryTidyComments', 'masteryCodeReview',
  'masteryPairProgram', 'masterySprintSprint',
  'useScientific', 'autoBuyerActive',
];

const HOTKEY_NAMES: (keyof GameState['hotkeys'])[] = [
  'click', 'tab_terminal', 'tab_automation', 'tab_ascension',
  'tab_metrics', 'tab_cloud', 'tab_config', 'tab_archive',
  'buy_0', 'buy_1', 'buy_2', 'cycle_mode',
];

export function validateState(
  loaded: Record<string, unknown> | null | undefined,
  fallback: GameState,
): GameState {
  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) {
    return { ...fallback };
  }

  const result: GameState = { ...fallback };

  for (const key of NUMERIC_GE0) {
    if (isPosOrZero(loaded[key])) {
      (result as any)[key] = loaded[key];
    }
  }

  for (const key of NUMERIC_GE1) {
    if (isPosOrOne(loaded[key])) {
      (result as any)[key] = loaded[key];
    }
  }

  for (const key of BOOLEANS) {
    if (isBool(loaded[key])) {
      (result as any)[key] = loaded[key];
    }
  }

  if (isPosOrZero(loaded.version) && Number.isInteger(loaded.version)) {
    result.version = loaded.version as number;
  }

  if (
    Array.isArray(loaded.clickHistory) &&
    (loaded.clickHistory as unknown[]).every(isFiniteNum)
  ) {
    result.clickHistory = loaded.clickHistory as number[];
  }

  if (loaded.hotkeys && typeof loaded.hotkeys === 'object' && !Array.isArray(loaded.hotkeys)) {
    const hk = loaded.hotkeys as Record<string, unknown>;
    for (const name of HOTKEY_NAMES) {
      if (typeof hk[name] === 'string') {
        (result.hotkeys as any)[name] = hk[name];
      }
    }
  }

  return result;
}
