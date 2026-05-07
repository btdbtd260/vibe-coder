import { useEffect, useRef } from 'react';
import type { GameState } from '../types/game';

interface HotkeyAction {
  type: 'tab' | 'click' | 'buy' | 'cycle';
  payload?: string;
}

export function useSyncKeyHotkeys(
  state: GameState,
  dispatch: (action: HotkeyAction) => void,
) {
  const hotkeysRef = useRef(state.hotkeys);
  hotkeysRef.current = state.hotkeys;

  useEffect(() => {
    const blur = () => (document.activeElement as HTMLElement)?.blur();

    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      const hk = hotkeysRef.current;

      if (key === hk.click) { e.preventDefault(); blur(); dispatch({ type: 'click' }); return; }
      if (key === hk.cycle_mode) { e.preventDefault(); blur(); dispatch({ type: 'cycle' }); return; }
      if (key === hk.tab_terminal) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'terminal' }); return; }
      if (key === hk.tab_automation) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'automation' }); return; }
      if (key === hk.tab_ascension) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'ascension' }); return; }
      if (key === hk.tab_metrics) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'metrics' }); return; }
      if (key === hk.tab_cloud) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'cloud' }); return; }
      if (key === hk.tab_config) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'config' }); return; }
      if (key === hk.tab_archive) { e.preventDefault(); blur(); dispatch({ type: 'tab', payload: 'archive' }); return; }
      if (key === hk.buy_0) { e.preventDefault(); blur(); dispatch({ type: 'buy', payload: '0' }); return; }
      if (key === hk.buy_1) { e.preventDefault(); blur(); dispatch({ type: 'buy', payload: '1' }); return; }
      if (key === hk.buy_2) { e.preventDefault(); blur(); dispatch({ type: 'buy', payload: '2' }); return; }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch]);
}
