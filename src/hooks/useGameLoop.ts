import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { automationLPS, manualLPS } from '../utils/math';

export function useGameLoop(setState: (s: GameState | ((prev: GameState) => GameState)) => void) {
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev: GameState) => {
        const total = automationLPS(prev) + manualLPS(prev);
        return {
          ...prev,
          currentLPS: total,
          maxLPS: Math.max(prev.maxLPS, total),
          totalPlayedMs: prev.totalPlayedMs + 100,
        };
      });
    }, 100);
    return () => clearInterval(id);
  }, [setState]);
}
