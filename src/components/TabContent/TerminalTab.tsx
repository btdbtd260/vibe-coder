import type { GameState } from "../../types/game";
import { linesPerClick, moneyPerLine, formatNum, cost, totalCost, fluxCost, totalFluxCost, maxAffordableFlux, maxAffordable } from "../../utils/math";
import { writeLines } from "../../hooks/useGameState";
import { Terminal as TerminalIcon } from "lucide-react";
import { useTooltip } from "../ui/TooltipManager";
import { UPGRADE_LORE } from "../../data/tooltips";
import { sub, lt, gt } from "../../utils/BigNum";
import { glowButton } from "../../utils/buttonGlow";

interface Props {
  state: GameState;
  setState: (s: GameState | ((prev: GameState) => GameState)) => void;
  logs: string[];
  addLog: (msg: string) => void;
  soundClick?: () => void;
  spawn?: (x: number, y: number, text?: string) => void;
  soundBuy?: () => void;
}

export default function TerminalTab({ state, setState, logs, soundClick, soundBuy, spawn }: Props) {
  const modes = ["1x", "10x", "100x", "MAX"];
  const s = state.useScientific;
  const edMaxed = state.edOwned >= 5;
  const flux = state.fluxOwned;
  const modeIdx = state.buyModeIndex;

  const click = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (soundClick) soundClick();
    if (spawn && e) spawn(e.clientX, e.clientY);
    const lpc = linesPerClick(state);
    const next = writeLines(state, lpc, moneyPerLine(state), 1);
    setState({ ...next, totalClicks: next.totalClicks + 1, clickHistory: [...next.clickHistory, Date.now()].slice(-100) });
  };

  const buy = (key: keyof GameState, base: number, limit: number | null, el?: HTMLElement | null | undefined) => {
    glowButton(el);
    setState(prev => {
      const owned = prev[key] as number;
      const mode = modes[prev.buyModeIndex];
      let c = 1;
      if (mode === "MAX") {
        c = maxAffordable(base, owned, prev.money, limit, prev.fluxOwned);
      } else if (mode === "10x") c = 10;
      else if (mode === "100x") c = 100;
      if (c <= 0) return prev;
      const price = totalCost(base, owned, c, prev.masteryCloudCredit, prev.fluxOwned);
      if (lt(prev.money, price)) return prev;
      if (soundBuy) soundBuy();
      return { ...prev, money: sub(prev.money, price), [key]: owned + c };
    });
  };

  const buyFlux = (el?: HTMLElement | null | undefined) => {
    glowButton(el);
    setState(prev => {
      const mode = modes[prev.buyModeIndex];
      let c = 1;
      if (mode === "MAX") {
        c = maxAffordableFlux(prev.fluxOwned, prev.money);
      } else if (mode === "10x") c = 10;
      else if (mode === "100x") c = 100;
      if (c <= 0) return prev;
      const price = totalFluxCost(prev.fluxOwned, c);
      if (lt(prev.money, price)) return prev;
      if (soundBuy) soundBuy();
      return { ...prev, money: sub(prev.money, price), fluxOwned: prev.fluxOwned + c };
    });
  };

  const edCount = modeIdx === 3
    ? (() => { let n = 0; while (true) { if (state.edOwned + n >= 5) break; if (gt(totalCost(1, state.edOwned, n + 1, state.masteryCloudCredit, flux), state.money)) break; n++; } return n; })()
    : state.edOwned >= 5 ? 0 : (modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1);
  const kbCount = modeIdx === 3
    ? maxAffordable(5, state.kbOwned, state.money, null, flux)
    : modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1;
  const lintCount = modeIdx === 3
    ? maxAffordable(20, state.lintOwned, state.money, null, flux)
    : modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1;
  const fluxCount = modeIdx === 3
    ? maxAffordableFlux(flux, state.money)
    : modeIdx === 1 ? 10 : modeIdx === 2 ? 100 : 1;

  return (
    <div>
      <button onClick={(e) => { glowButton(e.currentTarget); click(e); }}
        data-action="click"
        className="w-full py-4 px-4 rounded-lg border-2 border-neon-300 text-neon-300 font-bold text-sm bg-dark-700/50 hover:bg-dark-600/50 active:scale-[0.98] transition-all cursor-pointer uppercase tracking-wider mb-3">
        Write Line of Code
      </button>

      <div className="flex justify-end mb-2">
        <button onClick={(e) => { glowButton(e.currentTarget); setState({ ...state, buyModeIndex: (modeIdx + 1) % 4 }); }}
          data-action="cycle-mode"
          className="text-[0.65rem] px-3 py-1 rounded border border-dark-400 text-neon-300 bg-dark-700/30 hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider">
          {modes[modeIdx]}
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        {edMaxed ? (
          <UpgradeCard title="Energy Flux" owned={flux}
            cost={formatNum(fluxCost(flux), s)} effect="-5% KB/Lint cost/level"
            count={fluxCount} onBuy={(e) => buyFlux(e?.currentTarget)} tooltipId="fluxOwned" />
        ) : (
          <UpgradeCard title="Energy Drink" owned={state.edOwned}
            cost={formatNum(cost(1, state.edOwned, state.masteryCloudCredit, flux), s)}
            effect="+0.5 click power" maxed={false}
            count={edCount} onBuy={(e) => buy("edOwned", 1, 5, e?.currentTarget)} tooltipId="edOwned" />
        )}
        <UpgradeCard title="Mech Keyboard" owned={state.kbOwned}
          cost={formatNum(cost(5, state.kbOwned, state.masteryCloudCredit, flux), s)}
          effect="+1.5 click power"
          count={kbCount} onBuy={(e) => buy("kbOwned", 5, null, e?.currentTarget)} tooltipId="kbOwned" />
        <UpgradeCard title="Auto-Linter" owned={state.lintOwned}
          cost={formatNum(cost(20, state.lintOwned, state.masteryCloudCredit, flux), s)}
          effect="+1 LoC/sec"
          count={lintCount} onBuy={(e) => buy("lintOwned", 20, null, e?.currentTarget)} tooltipId="lintOwned" />
      </div>

      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <TerminalIcon size={12} className="text-dark-300" />
          <span className="text-[0.6rem] text-dark-300 uppercase tracking-wider">recent.log</span>
        </div>
        <div className="h-28 overflow-y-auto text-[0.7rem] text-dark-200 space-y-0.5">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}

function UpgradeCard({ title, owned, maxed, cost, effect, count, onBuy, tooltipId }: {
  title: string; owned: number; maxed?: boolean; cost: string; effect: string; count: number; onBuy: (e?: React.MouseEvent<HTMLElement> | null) => void; tooltipId: string;
}) {
  const lore = UPGRADE_LORE[tooltipId];
  const tip = lore ? { title: lore.title, long: lore.long, mechanic: lore.mechanic } : null;
  const { tooltipHandlers } = useTooltip(tip);

  return (
    <div className="flex-1 glass-card p-2.5 text-center flex flex-col" {...(tip ? tooltipHandlers : {})}>
      <h3 className="text-[0.6rem] text-dark-300 uppercase tracking-wider mb-1">{title}</h3>
      <div className="text-[0.65rem] text-dark-200 mb-1">{effect}</div>
      <div className="text-[0.6rem] text-neon-300 mb-1">{maxed ? "MAXED" : `Cost: ${cost}`}</div>
      <div className="mt-auto text-[0.6rem] text-neon-300 mb-1">{owned}</div>
      <button onClick={(e) => onBuy(e)} disabled={count <= 0}
        data-action={`buy-${tooltipId}`}
        className="text-[0.65rem] px-3 py-1.5 rounded border border-dark-400 text-dark-200 hover:bg-dark-600/30 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all">
        {count > 0 && count !== 1 ? `Buy ${count}` : "Buy"}
      </button>
    </div>
  );
}
