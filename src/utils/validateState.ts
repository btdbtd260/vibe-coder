import type { GameState } from '../types/game';
import type { BigNum } from '../utils/BigNum';
import { fromNumber, BN_ONE, lt } from '../utils/BigNum';

const isFiniteNum = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v);

const isPosOrZero = (v: unknown): v is number =>
  isFiniteNum(v) && v >= 0;

const isPosOrOne = (v: unknown): v is number =>
  isFiniteNum(v) && v >= 1;

const isBool = (v: unknown): v is boolean =>
  typeof v === 'boolean';

const isBigNum = (v: unknown): v is BigNum =>
  typeof v === 'object' && v !== null && !Array.isArray(v) &&
  typeof (v as any).m === 'number' && Number.isFinite((v as any).m) && (v as any).m >= 0 &&
  typeof (v as any).e === 'number' && Number.isInteger((v as any).e) && Number.isFinite((v as any).e);

const NUMERIC_GE0: (keyof GameState)[] = [
  'vibeShards',
  'edOwned', 'kbOwned', 'lintOwned', 'fluxOwned',
  'perkEdTier', 'perkKbTier', 'perkLintTier', 'perkFluxTier',
  'vibeLevel', 'spentLevels',
  'ascensionCount',
  'acceleratedGrowth', 'headStart', 'efficientAscension', 'quickCycle',
  'totalPlayedMs',
  'buyModeIndex', 'darkWebMultiplier',
  'seniorPoints', 'totalSeniorPoints',
  'retentionLevel', 'sfLevel', 'frameworkPoints', 'totalFrameworkPoints', 'frameworkLevel', 'frameworkCodeReview', 'frameworkDevOps', 'lastSavedAt',
];

const NUMERIC_GE1: (keyof GameState)[] = [
  'lintMilestoneBoost',
];

const BIG_NUM_FIELDS: (keyof GameState)[] = [
  'lines', 'money', 'vibeXP', 'totalLinesEver', 'seniorLines', 'currentLPS', 'maxLPS', 'ascensionMultiplier',
];

const BOOLEANS: (keyof GameState)[] = [
  'emCoffee', 'emStack', 'emDuck',
  'premiumHyperThreaded', 'premiumCloudCompute', 'premiumAIOverlord',
  'premiumEternalLoop', 'premiumQuantumBackup', 'premiumRecursiveCompile',
  'premiumParallelDim', 'premiumNeuralLink',
  'masteryMultiThreaded', 'masteryAlgorithm', 'masteryCloudCredit',
  'masteryFocusScroll', 'masteryTidyComments', 'masteryCodeReview',
  'masteryPairProgram', 'masterySprintSprint', 'masteryStandupSync', 'masteryAgileRetro', 'masteryRefactorPro', 'masteryTestDriven', 'masteryShipIt',
  'useScientific', 'autoBuyerActive', 'offlineProgressEnabled', 'onboardingSeen', 'soundEnabled', 'musicEnabled', 'showNotifications'
];

const HOTKEY_NAMES: (keyof GameState['hotkeys'])[] = [
  'tab_terminal', 'tab_automation', 'tab_ascension',
  'tab_metrics', 'tab_framework', 'tab_cloud', 'tab_config', 'tab_archive',
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

  for (const key of BIG_NUM_FIELDS) {
    if (isBigNum(loaded[key])) {
      (result as any)[key] = loaded[key];
    } else if (typeof loaded[key] === 'number') {
      (result as any)[key] = fromNumber(loaded[key] as number);
    }
  }

  // Ensure ascensionMultiplier is at least 1
  if (lt(result.ascensionMultiplier, BN_ONE)) {
    result.ascensionMultiplier = BN_ONE;
  }

  if (isPosOrZero(loaded.version) && Number.isInteger(loaded.version)) {
    result.version = loaded.version as number;
  }

  if (loaded.hotkeys && typeof loaded.hotkeys === 'object' && !Array.isArray(loaded.hotkeys)) {
    const hk = loaded.hotkeys as Record<string, unknown>;
    for (const name of HOTKEY_NAMES) {
      if (typeof hk[name] === 'string') {
        (result.hotkeys as any)[name] = hk[name];
      }
    }
  }

  if (loaded.autoEditors && typeof loaded.autoEditors === 'object' && !Array.isArray(loaded.autoEditors)) {
    result.autoEditors = { ...result.autoEditors };
    const ae = loaded.autoEditors as Record<string, unknown>;
    if (typeof ae.enabled === 'boolean') (result.autoEditors as any).enabled = ae.enabled;
    if (typeof ae.buyCheapest === 'boolean') (result.autoEditors as any).buyCheapest = ae.buyCheapest;
    if (isFiniteNum(ae.moneyReservePct) && (ae.moneyReservePct as number) >= 0 && (ae.moneyReservePct as number) <= 100) {
      (result.autoEditors as any).moneyReservePct = ae.moneyReservePct;
    }
    if (typeof ae.buyMode === 'string' && (ae.buyMode === '1x' || ae.buyMode === 'max')) {
      (result.autoEditors as any).buyMode = ae.buyMode;
    }
    if (isFiniteNum(ae.intervalSec) && (ae.intervalSec as number) >= 0.00001) {
      (result.autoEditors as any).intervalSec = ae.intervalSec;
    }
  }

  if (loaded.autoUpgrades && typeof loaded.autoUpgrades === 'object' && !Array.isArray(loaded.autoUpgrades)) {
    result.autoUpgrades = { ...result.autoUpgrades };
    const au = loaded.autoUpgrades as Record<string, unknown>;
    if (typeof au.enabled === 'boolean') (result.autoUpgrades as any).enabled = au.enabled;
    if (typeof au.buyCheapest === 'boolean') (result.autoUpgrades as any).buyCheapest = au.buyCheapest;
    if (isFiniteNum(au.moneyReservePct) && (au.moneyReservePct as number) >= 0 && (au.moneyReservePct as number) <= 100) {
      (result.autoUpgrades as any).moneyReservePct = au.moneyReservePct;
    }
    if (isFiniteNum(au.vibeReservePct) && (au.vibeReservePct as number) >= 0 && (au.vibeReservePct as number) <= 100) {
      (result.autoUpgrades as any).vibeReservePct = au.vibeReservePct;
    }
    if (isFiniteNum(au.intervalSec) && (au.intervalSec as number) >= 0.00001) {
      (result.autoUpgrades as any).intervalSec = au.intervalSec;
    }
  }

  if (loaded.autoAscension && typeof loaded.autoAscension === 'object' && !Array.isArray(loaded.autoAscension)) {
    result.autoAscension = { ...result.autoAscension };
    const aa = loaded.autoAscension as Record<string, unknown>;
    if (typeof aa.enabled === 'boolean') (result.autoAscension as any).enabled = aa.enabled;
    if (isFiniteNum(aa.thresholdMultiplier) && (aa.thresholdMultiplier as number) >= 1) {
      (result.autoAscension as any).thresholdMultiplier = aa.thresholdMultiplier;
    }
    if (isFiniteNum(aa.minimumRunTimeSec) && (aa.minimumRunTimeSec as number) >= 0) {
      (result.autoAscension as any).minimumRunTimeSec = aa.minimumRunTimeSec;
    }
    if (isFiniteNum(aa.intervalSec) && (aa.intervalSec as number) >= 0.00001) {
      (result.autoAscension as any).intervalSec = aa.intervalSec;
    }
  }

  return result;
}
