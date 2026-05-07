import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';
import { autoTick, autoBuyEditors, autoBuyUpgrades, autoAscend } from './useGameState';

export function useAutomation(
  setState: (s: GameState | ((prev: GameState) => GameState)) => void,
  speed: number,
) {
  const lastAutoEditorRef = useRef(Date.now());
  const lastAutoUpgradeRef = useRef(Date.now());
  const lastAutoAscensionRef = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();

      setState(prev => {
        let next = autoTick(prev);

        if (next.autoEditors.enabled) {
          const elapsed = now - lastAutoEditorRef.current;
          if (elapsed >= next.autoEditors.intervalSec * 1000) {
            lastAutoEditorRef.current = now;
            next = autoBuyEditors(next);
          }
        }

        if (next.autoUpgrades.enabled) {
          const elapsed = now - lastAutoUpgradeRef.current;
          if (elapsed >= next.autoUpgrades.intervalSec * 1000) {
            lastAutoUpgradeRef.current = now;
            next = autoBuyUpgrades(next);
          }
        }

        if (next.autoAscension.enabled) {
          const elapsed = now - lastAutoAscensionRef.current;
          if (elapsed >= next.autoAscension.intervalSec * 1000) {
            lastAutoAscensionRef.current = now;
            next = autoAscend(next);
          }
        }

        return next;
      });
    }, speed);
    return () => clearInterval(id);
  }, [speed, setState]);
}
