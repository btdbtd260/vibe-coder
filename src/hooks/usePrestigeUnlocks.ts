import { useRef } from 'react';
import { toNum } from '../utils/BigNum';
import type { GameState } from '../types/game';

export function usePrestigeUnlocks() {
  const fired = useRef(new Set<string>());

  const check = (state: GameState, onUnlock: (key: string) => void) => {
    const totalLines = toNum(state.totalLinesEver);

    if (totalLines >= 100_000 && !fired.current.has('ascension')) {
      fired.current.add('ascension');
      onUnlock('ascension');
    }
    if (state.seniorPoints > 0 && !fired.current.has('senior')) {
      fired.current.add('senior');
      onUnlock('senior');
    }
    if (state.totalSeniorPoints >= 100 && !fired.current.has('framework')) {
      fired.current.add('framework');
      onUnlock('framework');
    }
  };

  return { check };
}
