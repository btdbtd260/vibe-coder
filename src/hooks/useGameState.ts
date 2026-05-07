import type { GameState } from '../types/game';
import { totalCost, automationLPS, xpForLevel, checkMilestones } from '../utils/math';
import { migrateState, CURRENT_SAVE_VERSION } from '../utils/migrations';
import { validateState } from '../utils/validateState';
import { computeOfflineProgress } from '../utils/offlineProgress';

const STORAGE_KEY = 'vibe_coder_save';
const BACKUP_KEY = 'vibe_coder_save_backup';

function backupCurrentSave() {
  const current = localStorage.getItem(STORAGE_KEY);
  if (current !== null) {
    localStorage.setItem(BACKUP_KEY, current);
  }
}

function tryLoadFromKey(key: string, defaultState: GameState): GameState | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
    return migrateState(validateState(data, defaultState));
  } catch {
    return null;
  }
}

export function loadState(defaultState: GameState, now?: number): GameState {
  const applyOffline = (loaded: GameState): GameState => {
    if (loaded.lastSavedAt <= 0) return loaded;
    const _now = now ?? Date.now();
    if (!loaded.offlineProgressEnabled) {
      return { ...loaded, lastSavedAt: _now };
    }
    const elapsed = _now - loaded.lastSavedAt;
    const result = computeOfflineProgress(loaded, elapsed);
    result.lastSavedAt = _now;
    return result;
  };

  const primary = tryLoadFromKey(STORAGE_KEY, defaultState);
  if (primary !== null) return applyOffline(primary);
  const backup = tryLoadFromKey(BACKUP_KEY, defaultState);
  if (backup !== null) return applyOffline(backup);
  return { ...defaultState };
}

export function saveState(s: GameState) {
  backupCurrentSave();
  const stamped = { ...s, lastSavedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;
export function debouncedSave(s: GameState) {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    backupCurrentSave();
    const stamped = { ...s, lastSavedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamped));
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

export function serializeState(state: GameState): string {
  return JSON.stringify(state, null, 2);
}

export function deserializeState(
  json: string,
  defaultState: GameState,
): GameState | null {
  try {
    const data = JSON.parse(json);
    if (typeof data !== 'object' || data === null || Array.isArray(data)) return null;
    if (typeof data.version === 'number' && data.version > CURRENT_SAVE_VERSION) return null;
    return migrateState(validateState(data, defaultState));
  } catch {
    return null;
  }
}
