import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { automationLPS, manualLPS } from '../utils/math';
import { fromNumber, gt } from '../utils/BigNum';

export function useGameLoop(setState: (s: GameState | ((prev: GameState) => GameState)) => void) {
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev: GameState) => {
        const total = automationLPS(prev) + manualLPS(prev);
        return {
          ...prev,
          currentLPS: fromNumber(total),
          maxLPS: gt(fromNumber(total), prev.maxLPS) ? fromNumber(total) : prev.maxLPS,
          totalPlayedMs: prev.totalPlayedMs + 100,
        };
      });
    }, 100);
    return () => clearInterval(id);
  }, [setState]);
}
