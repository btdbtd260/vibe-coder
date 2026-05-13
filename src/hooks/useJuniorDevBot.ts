import { useEffect } from 'react';
import type { GameState } from '../types/game';
import { cost as costFn } from '../utils/math';
import { fromNumber, sub, lt, mul } from '../utils/BigNum';

export function useJuniorDevBot(
  state: GameState,
  setState: (s: GameState | ((prev: GameState) => GameState)) => void,
) {
  useEffect(() => {
    if (!state.autoBuyerActive) return;
    const id = setInterval(() => {
      setState(prev => {
        const candidates = [
          { key: 'edOwned' as const, cost: costFn(1, prev.edOwned, prev.masteryCloudCredit, prev.fluxOwned), limit: 5 as const },
          { key: 'kbOwned' as const, cost: costFn(5, prev.kbOwned, prev.masteryCloudCredit, prev.fluxOwned), limit: null },
          { key: 'lintOwned' as const, cost: costFn(20, prev.lintOwned, prev.masteryCloudCredit, prev.fluxOwned), limit: null },
        ].sort((a, b) => lt(a.cost, b.cost) ? -1 : 1);
        const cheapest = candidates[0];
        if (!cheapest || lt(prev.money, mul(cheapest.cost, fromNumber(10)))) return prev;
        if (cheapest.limit != null && (prev as any)[cheapest.key] >= cheapest.limit) return prev;
        const next = { ...prev, money: sub(prev.money, cheapest.cost) };
        (next as any)[cheapest.key] = (prev as any)[cheapest.key] + 1;
        return next;
      });
    }, 5000);
    return () => clearInterval(id);
  }, [state.autoBuyerActive, setState]);
}
