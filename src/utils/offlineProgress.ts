import type { GameState } from '../types/game';
import { automationLPS, moneyPerLine } from './math';
import { writeLines } from '../hooks/useGameState';

export function computeOfflineProgress(
  state: Readonly<GameState>,
  elapsedMs: number,
): GameState {
  if (elapsedMs <= 0 || state.lastSavedAt === 0) {
    return { ...state };
  }

  const clamped = Math.min(elapsedMs, 86_400_000);
  const seconds = Math.floor(clamped / 1000);

  const result = { ...state };

  if (seconds <= 0) {
    result.totalPlayedMs += clamped;
    return result;
  }

  const lps = automationLPS(state);
  const mpl = moneyPerLine(state);
  const linesProduced = lps * seconds;

  const after = writeLines(state, linesProduced, mpl, 1);
  after.totalPlayedMs = state.totalPlayedMs + clamped;

  return after;
}
