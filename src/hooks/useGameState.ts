import type { GameState } from '../types/game';
import { totalCost, automationLPS, xpForLevel, checkMilestones } from '../utils/math';
import { migrateState } from '../utils/migrations';
import { validateState } from '../utils/validateState';

const STORAGE_KEY = 'vibe_coder_save';
const BACKUP_KEY = 'vibe_coder_save_backup';

function backupCurrentSave() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current !== null) {
    localStorage.setItem(BACKUP_KEY, current);
  }
}

export function loadState(defaultState: GameState): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultState };
    const data = JSON.parse(raw);
    return migrateState(validateState(data, defaultState));
  } catch {
    return { ...defaultState };
  }
}

export function saveState(s: GameState) {
  backupCurrentSave();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
export function debouncedSave(s: GameState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    backupCurrentSave();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, 200);
}

export function writeLines(
  s: GameState,
  count: number,
  moneyPerLine: number,
  xpMultiplier: number,
): GameState {
  const next = { ...s };
  next.lines += count;
  next.money += count * moneyPerLine;
  next.totalLinesEver += count;
  next.vibeXP += count * xpMultiplier;
  const needed = xpForLevel(next.vibeLevel);
  while (next.vibeXP >= needed) {
    next.vibeXP -= needed;
    next.vibeLevel++;
  }
  const newBoost = checkMilestones(next.lintOwned);
  if (newBoost !== next.lintMilestoneBoost) {
    next.lintMilestoneBoost = newBoost;
  }
  return next;
}

export function autoTick(s: GameState): GameState {
  const lps = automationLPS(s);
  const xpMult = s.masteryAlgorithm ? 0.5 : 1;
  return writeLines(s, lps, 0.10 + (s.emDuck ? 0.01 : 0), xpMult);
}
