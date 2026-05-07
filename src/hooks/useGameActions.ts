import type { GameState } from '../types/game';
import { linesPerClick, moneyPerLine } from '../utils/math';
import { writeLines } from './useGameState';

export function useGameActions(
  setState: (s: GameState | ((prev: GameState) => GameState)) => void,
) {
  const handleClick = () => {
    setState(prev => {
      const lpc = linesPerClick(prev);
      const next = writeLines(prev, lpc, moneyPerLine(prev), 1);
      return { ...next, totalClicks: next.totalClicks + 1 };
    });
  };

  const handleCycle = () => {
    setState(prev => ({ ...prev, buyModeIndex: (prev.buyModeIndex + 1) % 4 }));
  };

  return { handleClick, handleCycle };
}
