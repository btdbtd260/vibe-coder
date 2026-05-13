import { useCallback, useRef } from 'react';
import { playClick, playBuy, playAscend, playPrestige, playError, setSoundEnabled } from '../utils/SoundManager';
import type { GameState } from '../types/game';

/**
 * Hook for playing sound effects in response to game actions.
 * Syncs enabled state from GameState so sounds respect the toggle.
 */
export function useSound() {
  const enabledRef = useRef(false);

  const syncFromState = useCallback((state: GameState) => {
    const enabled = state.soundEnabled ?? false;
    if (enabled !== enabledRef.current) {
      enabledRef.current = enabled;
      setSoundEnabled(enabled);
    }
  }, []);

  const click = useCallback(() => { if (enabledRef.current) playClick(); }, []);
  const buy = useCallback(() => { if (enabledRef.current) playBuy(); }, []);
  const ascend = useCallback(() => { if (enabledRef.current) playAscend(); }, []);
  const prestige = useCallback(() => { if (enabledRef.current) playPrestige(); }, []);
  const error = useCallback(() => { if (enabledRef.current) playError(); }, []);

  return { syncFromState, click, buy, ascend, prestige, error };
}

