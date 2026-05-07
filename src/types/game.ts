export interface AutoEditorSettings {
  enabled: boolean;
  buyCheapest: boolean;
  moneyReservePct: number;
  buyMode: '1x' | 'max';
  intervalSec: number;
}

export interface AutoUpgradeSettings {
  enabled: boolean;
  buyCheapest: boolean;
  moneyReservePct: number;
  vibeReservePct: number;
  intervalSec: number;
}

export interface AutoAscensionSettings {
  enabled: boolean;
  thresholdMultiplier: number;
  minimumRunTimeSec: number;
  intervalSec: number;
}

export interface GameState {
  lines: number;
  money: number;
  vibeShards: number;
  edOwned: number;
  kbOwned: number;
  lintOwned: number;
  fluxOwned: number;
  emCoffee: boolean;
  emStack: boolean;
  emDuck: boolean;
  perkEdTier: number;
  perkKbTier: number;
  perkLintTier: number;
  premiumHyperThreaded: boolean;
  premiumCloudCompute: boolean;
  premiumAIOverlord: boolean;
  premiumEternalLoop: boolean;
  premiumQuantumBackup: boolean;
  premiumRecursiveCompile: boolean;
  premiumParallelDim: boolean;
  premiumNeuralLink: boolean;
  masteryMultiThreaded: boolean;
  masteryAlgorithm: boolean;
  masteryCloudCredit: boolean;
  masteryFocusScroll: boolean;
  masteryTidyComments: boolean;
  masteryCodeReview: boolean;
  masteryPairProgram: boolean;
  masterySprintSprint: boolean;
  masteryStandupSync: boolean;
  masteryAgileRetro: boolean;
  masteryRefactorPro: boolean;
  masteryTestDriven: boolean;
  masteryShipIt: boolean;
  vibeLevel: number;
  vibeXP: number;
  spentLevels: number;
  ascensionMultiplier: number;
  ascensionCount: number;
  lintMilestoneBoost: number;
  totalLinesEver: number;
  totalClicks: number;
  totalPlayedMs: number;
  maxLPS: number;
  useScientific: boolean;
  offlineProgressEnabled: boolean;
  buyModeIndex: number;
  hotkeys: {
    click: string;
    tab_terminal: string; tab_automation: string; tab_ascension: string;
    tab_metrics: string; tab_cloud: string; tab_config: string; tab_archive: string;
    buy_0: string; buy_1: string; buy_2: string;
    cycle_mode: string;
  };
  darkWebMultiplier: number;
  clickHistory: number[];
  currentLPS: number;
  seniorPoints: number;
  totalSeniorPoints: number;
  retentionLevel: number;
  autoBuyerActive: boolean;
  onboardingSeen: boolean;
  sfLevel: number;
  version: number;
  lastSavedAt: number;
  autoEditors: AutoEditorSettings;
  autoUpgrades: AutoUpgradeSettings;
  autoAscension: AutoAscensionSettings;
}

export const defaultState: GameState = {
  lines: 0, money: 0, vibeShards: 0,
  edOwned: 0, kbOwned: 0, lintOwned: 0, fluxOwned: 0,
  emCoffee: false, emStack: false, emDuck: false,
  perkEdTier: 0, perkKbTier: 0, perkLintTier: 0,
  premiumHyperThreaded: false, premiumCloudCompute: false, premiumAIOverlord: false,
  premiumEternalLoop: false, premiumQuantumBackup: false, premiumRecursiveCompile: false,
  premiumParallelDim: false, premiumNeuralLink: false,
  masteryMultiThreaded: false, masteryAlgorithm: false, masteryCloudCredit: false,
  masteryFocusScroll: false, masteryTidyComments: false, masteryCodeReview: false,
  masteryPairProgram: false, masterySprintSprint: false, masteryStandupSync: false, masteryAgileRetro: false, masteryRefactorPro: false, masteryTestDriven: false, masteryShipIt: false,
  vibeLevel: 0, vibeXP: 0, spentLevels: 0,
  ascensionMultiplier: 1, ascensionCount: 0, lintMilestoneBoost: 1,
  totalLinesEver: 0, totalClicks: 0, totalPlayedMs: 0, maxLPS: 0,
  useScientific: false, offlineProgressEnabled: true, buyModeIndex: 0,
  hotkeys: {
    click: ' ',
    tab_terminal: '1', tab_automation: '2', tab_ascension: '3',
    tab_metrics: '4', tab_cloud: '5', tab_config: '6', tab_archive: '7',
    buy_0: 'q', buy_1: 'w', buy_2: 'e',
    cycle_mode: 'r',
  },
  darkWebMultiplier: 0,
  clickHistory: [],
  currentLPS: 0,
  seniorPoints: 0, totalSeniorPoints: 0,
  retentionLevel: 0, autoBuyerActive: false, onboardingSeen: false, sfLevel: 0, version: 8, lastSavedAt: 0,
  autoEditors: { enabled: false, buyCheapest: true, moneyReservePct: 10, buyMode: '1x', intervalSec: 5 },
  autoUpgrades: { enabled: false, buyCheapest: true, moneyReservePct: 25, vibeReservePct: 10, intervalSec: 10 },
  autoAscension: { enabled: false, thresholdMultiplier: 2, minimumRunTimeSec: 300, intervalSec: 30 },
};

export type BuyMode = '1x' | '10x' | '100x' | 'MAX';
export const BUY_MODES: BuyMode[] = ['1x', '10x', '100x', 'MAX'];
export const ED_LIMIT = 5;

export const ALL_HOTKEY_ACTIONS: { id: keyof GameState['hotkeys']; label: string }[] = [
  { id: 'click', label: 'Manual Click' },
  { id: 'tab_terminal', label: 'Tab: Terminal' },
  { id: 'tab_automation', label: 'Tab: Automation' },
  { id: 'tab_ascension', label: 'Tab: Ascension' },
  { id: 'tab_metrics', label: 'Tab: Metrics' },
  { id: 'tab_cloud', label: 'Tab: Cloud Shop' },
  { id: 'tab_config', label: 'Tab: Config' },
  { id: 'tab_archive', label: 'Tab: Archive' },
  { id: 'buy_0', label: 'Buy: Slot 0' },
  { id: 'buy_1', label: 'Buy: Slot 1' },
  { id: 'buy_2', label: 'Buy: Slot 2' },
  { id: 'cycle_mode', label: 'Cycle Buy Mode' },
];

export const KB_THRESHOLDS = [10, 25, 100, 200, 500, 750, 1000];
export const KB_COSTS = [5000, 25000, 100000, 500000, 2000000, 10000000, 50000000];
export const LINT_THRESHOLDS = [10, 25, 100, 200, 500, 750, 1000];
export const LINT_COSTS = [5000, 25000, 100000, 500000, 2000000, 10000000, 50000000];
