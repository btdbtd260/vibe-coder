import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { GameState } from './types/game';
import { defaultState } from './types/game';
import { loadState, saveState, debouncedSave } from './hooks/useGameState';
import { useAutomation } from './hooks/useAutomation';
import { useGameLoop } from './hooks/useGameLoop';
import { useSyncKeyHotkeys } from './hooks/useSyncKeyHotkeys';
import { cost as costFn, fluxCost as fluxCostFn, totalFluxCost, maxAffordableFlux, totalCost, maxAffordable } from './utils/math';
import { TooltipProvider } from './components/ui/TooltipManager';
import Sidebar from './components/Sidebar';
import ResourceHero from './components/ResourceHero';
import ResourceBar from './components/ResourceBar';
import XpBar from './components/XpBar';
import TerminalTab from './components/TabContent/TerminalTab';
import UpgradesTab from './components/TabContent/UpgradesTab';
import AutomationTab from './components/TabContent/AutomationTab';
import AscensionTab from './components/TabContent/AscensionTab';
import MetricsTab from './components/TabContent/MetricsTab';
import CloudShopTab from './components/TabContent/CloudShopTab';
import ConfigTab from './components/TabContent/ConfigTab';
import ArchiveTab from './components/TabContent/ArchiveTab';
import DevConsoleTab from './components/TabContent/DevConsoleTab';
import SeniorOfficeTab from './components/TabContent/SeniorOfficeTab';
import { useJuniorDevBot } from './hooks/useJuniorDevBot';
import { useGameActions } from './hooks/useGameActions';

const TAB_COMPONENTS: Record<string, React.FC<any>> = {
  terminal: TerminalTab,
  upgrades: UpgradesTab,
  automation: AutomationTab,
  ascension: AscensionTab,
  senior: SeniorOfficeTab,
  metrics: MetricsTab,
  cloud: CloudShopTab,
  config: ConfigTab,
  archive: ArchiveTab,
  devconsole: DevConsoleTab,
};

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState(defaultState));
  const [activeTab, setActiveTab] = useState('terminal');
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Project started...`,
    `[${new Date().toLocaleTimeString()}] Ready.`,
  ]);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-199), `[${ts}] ${msg}`]);
  }, []);

  const wrappedSetState = useCallback((s: GameState | ((prev: GameState) => GameState)) => {
    if (typeof s === 'function') {
      setState(prev => {
        const next = s(prev);
        debouncedSave(next);
        return next;
      });
    } else {
      setState(s);
      debouncedSave(s);
    }
  }, []);

  useAutomation(wrappedSetState, 1000);
  useGameLoop(setState);
  useJuniorDevBot(state, wrappedSetState);

  const { handleClick, handleCycle } = useGameActions(wrappedSetState);

  const hotkeyDispatch = useCallback((action: { type: string; payload?: string }) => {
    switch (action.type) {
      case 'tab': setActiveTab(action.payload!); break;
      case 'click':
        handleClick();
        break;
      case 'buy': {
        const slot = action.payload!;
        wrappedSetState(prev => {
          const modeIdx = prev.buyModeIndex;
          const mult = modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1;
          if (slot === '0') {
            if (prev.edOwned >= 5) {
              const count = modeIdx === 3 ? maxAffordableFlux(prev.fluxOwned, prev.money) : mult;
              if (count <= 0) return prev;
              const price = totalFluxCost(prev.fluxOwned, count);
              if (prev.money < price) return prev;
              return { ...prev, money: prev.money - price, fluxOwned: prev.fluxOwned + count };
            }
            const limit = 5;
            const owned = prev.edOwned;
            const count = modeIdx === 3
              ? maxAffordable(1, owned, prev.money, limit, prev.fluxOwned)
              : Math.min(mult, limit - owned);
            if (count <= 0) return prev;
            const price = totalCost(1, owned, count, prev.masteryCloudCredit, prev.fluxOwned);
            if (prev.money < price) return prev;
            return { ...prev, money: prev.money - price, edOwned: owned + count };
          }
          if (slot === '1') {
            const count = modeIdx === 3
              ? maxAffordable(5, prev.kbOwned, prev.money, null, prev.fluxOwned)
              : mult;
            if (count <= 0) return prev;
            const price = totalCost(5, prev.kbOwned, count, prev.masteryCloudCredit, prev.fluxOwned);
            if (prev.money < price) return prev;
            return { ...prev, money: prev.money - price, kbOwned: prev.kbOwned + count };
          }
          if (slot === '2') {
            const count = modeIdx === 3
              ? maxAffordable(20, prev.lintOwned, prev.money, null, prev.fluxOwned)
              : mult;
            if (count <= 0) return prev;
            const price = totalCost(20, prev.lintOwned, count, prev.masteryCloudCredit, prev.fluxOwned);
            if (prev.money < price) return prev;
            return { ...prev, money: prev.money - price, lintOwned: prev.lintOwned + count };
          }
          return prev;
        });
        break;
      }
      case 'cycle':
        handleCycle();
        break;
    }
  }, [wrappedSetState]);

  useSyncKeyHotkeys(state, hotkeyDispatch);

  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const tabProps = { state, setState: wrappedSetState, addLog, logs };

  return (
    <TooltipProvider>
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTab={setActiveTab} />
        <main className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full">
          <div className="glass p-4 lg:p-6">
            <ResourceHero lines={state.lines} scientific={state.useScientific} />
            <ResourceBar state={state} />
            <XpBar state={state} />
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <ActiveComponent {...tabProps} />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
