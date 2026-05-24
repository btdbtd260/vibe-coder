import type { GameState } from '../types/game';
import { totalFluxCost, maxAffordableFlux, totalCost, maxAffordable } from '../utils/math';
import { sub, lt } from '../utils/BigNum';

export function useGameActions(
  setState: (s: GameState | ((prev: GameState) => GameState)) => void,
) {
  const handleCycle = () => {
    setState(prev => ({ ...prev, buyModeIndex: (prev.buyModeIndex + 1) % 4 }));
  };

  const handleBuy = (slot: string) => {
    setState(prev => {
      const modeIdx = prev.buyModeIndex;
      const mult = modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1;
      if (slot === '0') {
        if (prev.edOwned >= 5) {
          const count = modeIdx === 3 ? maxAffordableFlux(prev.fluxOwned, prev.money) : mult;
          if (count <= 0) return prev;
          const price = totalFluxCost(prev.fluxOwned, count);
          if (lt(prev.money, price)) return prev;
          return { ...prev, money: sub(prev.money, price), fluxOwned: prev.fluxOwned + count };
        }
        const limit = 5;
        const owned = prev.edOwned;
        const count = modeIdx === 3
          ? maxAffordable(1, owned, prev.money, limit, prev.fluxOwned)
          : Math.min(mult, limit - owned);
        if (count <= 0) return prev;
        const price = totalCost(1, owned, count, prev.masteryCloudCredit, prev.fluxOwned);
        if (lt(prev.money, price)) return prev;
        return { ...prev, money: sub(prev.money, price), edOwned: owned + count };
      }
      if (slot === '1') {
        const count = modeIdx === 3
          ? maxAffordable(5, prev.kbOwned, prev.money, null, prev.fluxOwned)
          : mult;
        if (count <= 0) return prev;
        const price = totalCost(5, prev.kbOwned, count, prev.masteryCloudCredit, prev.fluxOwned);
        if (lt(prev.money, price)) return prev;
        return { ...prev, money: sub(prev.money, price), kbOwned: prev.kbOwned + count };
      }
      if (slot === '2') {
        const count = modeIdx === 3
          ? maxAffordable(20, prev.lintOwned, prev.money, null, prev.fluxOwned)
          : mult;
        if (count <= 0) return prev;
        const price = totalCost(20, prev.lintOwned, count, prev.masteryCloudCredit, prev.fluxOwned);
        if (lt(prev.money, price)) return prev;
        return { ...prev, money: sub(prev.money, price), lintOwned: prev.lintOwned + count };
      }
      return prev;
    });
  };

  return { handleCycle, handleBuy };
}
