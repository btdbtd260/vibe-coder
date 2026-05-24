import { useCallback, useRef } from "react";
import { setMusicEnabled } from "../utils/MusicManager";
import type { GameState } from "../types/game";

export function useMusic() {
  const enabledRef = useRef(false);

  const syncFromState = useCallback((state: GameState) => {
    const enabled = state.musicEnabled ?? false;
    if (enabled !== enabledRef.current) {
      enabledRef.current = enabled;
      setMusicEnabled(enabled);
    }
  }, []);

  return { syncFromState };
}
