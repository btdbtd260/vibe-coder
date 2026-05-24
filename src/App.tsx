import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { GameState } from "./types/game";
import { defaultState } from "./types/game";
import {
  loadState,
  debouncedSave,
  getLastOfflineGains,
} from "./hooks/useGameState";
import type { OfflineGains } from "./hooks/useGameState";
import { useAutomation } from "./hooks/useAutomation";
import { useGameLoop } from "./hooks/useGameLoop";
import { useSyncKeyHotkeys } from "./hooks/useSyncKeyHotkeys";
import { TooltipProvider } from "./components/ui/TooltipManager";
import Sidebar from "./components/Sidebar";
import ResourceHero from "./components/ResourceHero";
import ResourceBar from "./components/ResourceBar";
import XpBar from "./components/XpBar";
import TerminalTab from "./components/TabContent/TerminalTab";
import UpgradesTab from "./components/TabContent/UpgradesTab";
import AutomationTab from "./components/TabContent/AutomationTab";
import AscensionTab from "./components/TabContent/AscensionTab";
import MetricsTab from "./components/TabContent/MetricsTab";
import CloudShopTab from "./components/TabContent/CloudShopTab";
import ConfigTab from "./components/TabContent/ConfigTab";
import ArchiveTab from "./components/TabContent/ArchiveTab";
import DevConsoleTab from "./components/TabContent/DevConsoleTab";
import SeniorOfficeTab from "./components/TabContent/SeniorOfficeTab";
import FrameworkTab from "./components/TabContent/FrameworkTab";
import { useJuniorDevBot } from "./hooks/useJuniorDevBot";
import { useGameActions } from "./hooks/useGameActions";
import { useSound } from "./hooks/useSound";
import { useMusic } from "./hooks/useMusic"
import { usePrestigeUnlocks } from "./hooks/usePrestigeUnlocks";
import { useParticles } from "./hooks/useParticles";
import Particles from "./components/ui/Particles";
import { glowButton } from "./utils/buttonGlow";
import { useNotificationToast } from "./hooks/useNotificationToast";
import NotificationToast from "./components/ui/NotificationToast";
import WelcomeBackOverlay from "./components/WelcomeBackOverlay";
import OnboardingOverlay from "./components/OnboardingOverlay";

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
  const [dismissed, setDismissed] = useState(false);
  const [offlineGains] = useState<OfflineGains | null>(() =>
    getLastOfflineGains(),
  );
  const [state, setState] = useState<GameState>(() => loadState(defaultState));
  const [activeTab, setActiveTab] = useState("terminal");
  const [logs, setLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Project started...`,
    `[${new Date().toLocaleTimeString()}] Ready.`,
  ]);

  const addLog = useCallback((msg: string) => {
    const ts = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-199), `[${ts}] ${msg}`]);
  }, []);

  const wrappedSetState = useCallback(
    (s: GameState | ((prev: GameState) => GameState)) => {
      if (typeof s === "function") {
        setState((prev) => {
          const next = s(prev);
          debouncedSave(next);
          return next;
        });
      } else {
        setState(s);
        debouncedSave(s);
      }
    },
    [],
  );

  useAutomation(wrappedSetState, 1000);
  useGameLoop(setState);
  useJuniorDevBot(state, wrappedSetState);

  const handleOnboardingDismiss = useCallback(() => {
    wrappedSetState((prev) => ({ ...prev, onboardingSeen: true }));
  }, [wrappedSetState]);

  const {
    syncFromState,
    click: soundClick,
    buy: soundBuy,
    ascend: soundAscend,
    prestige: soundPrestige,
  } = useSound();
  syncFromState(state);

  const { syncFromState: syncMusic } = useMusic();
  syncMusic(state);

  const { toasts, notify, dismiss } = useNotificationToast();

  const { check: checkUnlocks } = usePrestigeUnlocks();

  const { particles, spawn, spawnBurst, tick } = useParticles();

  // rAF loop for particle physics
  useEffect(() => {
    let lastTime = performance.now();
    let rafId: number;
    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      tick(dt);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [tick]);

  const { handleClick, handleCycle, handleBuy } =
    useGameActions(wrappedSetState);

  // Prestige unlock detection
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => {
    const id = setInterval(() => {
      checkUnlocks(stateRef.current, (key) => {
        if (stateRef.current.showNotifications) {
          notify("New prestige layer unlocked: " + key + "!", "prestige");
        }
      });
    }, 3000);
    return () => clearInterval(id);
  }, [addLog, checkUnlocks]);

  const hotkeyDispatch = useCallback(
    (action: { type: string; payload?: string }) => {
      switch (action.type) {
        case "tab":
          setActiveTab(action.payload!);
          glowButton(
            document.querySelector(`[data-action="tab-${action.payload}"]`),
          );
          break;
        case "click":
          soundClick();
          glowButton(document.querySelector(`[data-action="click"]`));
          spawn(window.innerWidth / 2, window.innerHeight / 2);
          handleClick();
          break;
        case "buy":
          glowButton(
            document.querySelector(`[data-action="buy-${action.payload}"]`),
          );
          handleBuy(action.payload!);
          break;
        case "cycle":
          glowButton(document.querySelector(`[data-action="cycle-mode"]`));
          handleCycle();
          break;
      }
    },
    [wrappedSetState],
  );

  useSyncKeyHotkeys(state, hotkeyDispatch);

  const ActiveComponent = TAB_COMPONENTS[activeTab];
  const tabProps = {
    state,
    setState: wrappedSetState,
    addLog,
    logs,
    soundClick,
    soundBuy,
    soundAscend,
    soundPrestige,
    spawn,
    spawnBurst,
    notify,
  };

  return (
    <TooltipProvider>
      {!state.onboardingSeen && (
        <OnboardingOverlay onDismiss={handleOnboardingDismiss} />
      )}
      {state.onboardingSeen && offlineGains && !dismissed && (
        <WelcomeBackOverlay
          gains={offlineGains}
          onDismiss={() => setDismissed(true)}
        />
      )}
      <Particles particles={particles} />
      <NotificationToast toasts={toasts} onDismiss={dismiss} />
      <div className="flex min-h-screen">
        <Sidebar activeTab={activeTab} onTab={setActiveTab} />
        <main className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full">
          <div className="glass p-4 lg:p-6">
            <ResourceHero
              lines={state.lines}
              scientific={state.useScientific}
            />
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





