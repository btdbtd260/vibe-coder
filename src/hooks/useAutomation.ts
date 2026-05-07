import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { autoTick } from './useGameState';

export function useAutomation(
  setState: (s: GameState | ((prev: GameState) => GameState)) => void,
  speed: number,
) {
  useEffect(() => {
    const id = setInterval(() => {
      setState(prev => autoTick(prev));
    }, speed);
    return () => clearInterval(id);
  }, [speed, setState]);
}
