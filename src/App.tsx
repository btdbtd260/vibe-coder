import { useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { GameState } from './types/game';
import { defaultState } from './types/game';
import { loadState, debouncedSave, getLastOfflineGains } from './hooks/useGameState';
import type { OfflineGains } from './hooks/useGameState';
import { useAutomation } from './hooks/useAutomation';
import { useGameLoop } from './hooks/useGameLoop';
import { useSyncKeyHotkeys } from './hooks/useSyncKeyHotkeys';
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
import FrameworkTab from './components/TabContent/FrameworkTab';
import { useJuniorDevBot } from './hooks/useJuniorDevBot';
import { useGameActions } from './hooks/useGameActions';
import WelcomeBackOverlay from './components/WelcomeBackOverlay';
import OnboardingOverlay from './components/OnboardingOverlay';

const TAB_COMPONENTS: Record<string, React.FC<any>> = {
  terminal: TerminalTab,
  upgrades: UpgradesTab,
  automation: AutomationTab,
  ascension: AscensionTab,
  senior: SeniorOfficeTab,
  framework: FrameworkTab,
  metrics: MetricsTab,
  cloud: CloudShopTab,
  config: ConfigTab,
  archive: ArchiveTab,
  devconsole: DevConsoleTab,
};

export default function App() {
  const gainsRef = useRef<OfflineGains | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [state, setState] = useState<GameState>(() => {
    const s = loadState(defaultState);
    gainsRef.current = getLastOfflineGains();
    return s;
  });
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

  const handleOnboardingDismiss = useCallback(() => {
    wrappedSetState(prev => ({ ...prev, onboardingSeen: true }));
  }, [wrappedSetState]);

  const { handleClick, handleCycle, handleBuy } = useGameActions(wrappedSetState);

  const hotkeyDispatch = useCallback((action: { type: string; payload?: string }) => {
    switch (action.type) {
      case 'tab': setActiveTab(action.payload!); break;
      case 'click':
        handleClick();
        break;
      case 'buy':
        handleBuy(action.payload!);
        break;
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
      {!state.onboardingSeen && (
        <OnboardingOverlay onDismiss={handleOnboardingDismiss} />
      )}
      {state.onboardingSeen && gainsRef.current && !dismissed && (
        <WelcomeBackOverlay gains={gainsRef.current} onDismiss={() => setDismissed(true)} />
      )}
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
