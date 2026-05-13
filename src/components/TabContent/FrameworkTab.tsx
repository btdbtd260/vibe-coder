import type { GameState } from '../../types/game';
import type { BigNum } from '../../utils/BigNum';
import { formatNum, FRAMEWORK_PRESTIGE_THRESHOLD, frameworkPointsToGain, performFrameworkPrestige, frameworkCost } from '../../utils/math';

const toNum = (v: BigNum): number => v.m * Math.pow(10, v.e);

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

export default function FrameworkTab({ state, setState, addLog }: Props) {
  const s = state.useScientific;
  const canPrestige = state.totalSeniorPoints >= FRAMEWORK_PRESTIGE_THRESHOLD;
  const gain = frameworkPointsToGain(state.totalSeniorPoints);
  const hasFramed = state.totalFrameworkPoints > 0 || state.frameworkLevel > 0;

  const doPrestige = () => {
    if (!canPrestige) return;
    const next = performFrameworkPrestige(state);
    setState(next);
    addLog(`Framework Prestige complete! +${gain} Framework Points.`);
  };

  const buyUpgrade = (key: 'frameworkCodeReview' | 'frameworkDevOps', label: string) => {
    const level = state[key] ?? 0;
    if (level >= 10) return;
    const cost = frameworkCost(level);
    const costNum = toNum(cost);
    if ((state.frameworkPoints ?? 0) < costNum) return;
    const next = { ...state, [key]: level + 1, frameworkPoints: state.frameworkPoints - costNum };
    setState(next);
    addLog(`Framework upgrade: ${label} +1`);
  };

  if (!canPrestige && !hasFramed) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-[0.65rem] text-dark-400 italic">
          The Framework is locked. Accumulate {formatNum(FRAMEWORK_PRESTIGE_THRESHOLD, s)} total Senior Points to unlock Tier 3 prestige.
        </p>
        <p className="text-[0.55rem] text-dark-500 mt-2">// {formatNum(FRAMEWORK_PRESTIGE_THRESHOLD - state.totalSeniorPoints, s)} SP remaining</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="glass-card p-4 text-center">
        <div className="text-[0.65rem] text-dark-300 uppercase tracking-wider mb-1">Framework Points</div>
        <div className="text-2xl font-bold text-neon-300">{formatNum(state.frameworkPoints ?? 0, s)}</div>
        <div className="text-[0.55rem] text-dark-500 mt-1">All-time: {formatNum(state.totalFrameworkPoints ?? 0, s)}</div>
        <div className="text-[0.55rem] text-dark-500">Framework Level: {formatNum(state.frameworkLevel ?? 0, s)}</div>
      </div>

      <button onClick={doPrestige} disabled={!canPrestige || gain <= 0}
        className="w-full py-3 rounded-lg border-2 border-neon-300/60 text-neon-300 font-bold text-xs hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-all">
        {gain > 0 ? `Framework Prestige — Gain ${formatNum(gain, s)} FP` : `Need ${formatNum(FRAMEWORK_PRESTIGE_THRESHOLD, s)} total SP`}
      </button>

      <div className="glass-card p-3">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Framework Upgrades</h3>
        <p className="text-[0.6rem] text-dark-400 mb-3">Spend Framework Points for permanent bonuses.</p>
        <UpgradeRow
          title="Code Reviewer"
          desc="+5% auto speed per level"
          level={state.frameworkCodeReview ?? 0}
          maxLevel={10}
          cost={frameworkCost(state.frameworkCodeReview ?? 0)}
          points={state.frameworkPoints ?? 0}
          onBuy={() => buyUpgrade('frameworkCodeReview', 'Code Reviewer')}
        />
        <UpgradeRow
          title="DevOps Pipeline"
          desc="+5% global production per level"
          level={state.frameworkDevOps ?? 0}
          maxLevel={10}
          cost={frameworkCost(state.frameworkDevOps ?? 0)}
          points={state.frameworkPoints ?? 0}
          onBuy={() => buyUpgrade('frameworkDevOps', 'DevOps Pipeline')}
        />
      </div>
    </div>
  );
}

function UpgradeRow({ title, desc, level, maxLevel, cost, points, onBuy }: {
  title: string;
  desc: string;
  level: number;
  maxLevel: number;
  cost: BigNum;
  points: number;
  onBuy: () => void;
}) {
  const maxed = level >= maxLevel;
  return (
    <div className="glass-card p-3 flex items-center gap-3 mb-2">
      <div className="flex-1">
        <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">{title}</div>
        <div className="text-[0.6rem] text-dark-300">{desc}</div>
        <div className="text-[0.6rem] text-neon-300">Level {level}/{maxLevel}</div>
      </div>
      <div className="text-right">
        <div className="text-[0.55rem] text-dark-400 mb-1">{maxed ? 'MAXED' : `${formatNum(cost, false)} FP`}</div>
        <button onClick={onBuy} disabled={maxed || points < toNum(cost)}
          className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
          {maxed ? 'MAX' : 'Buy'}
        </button>
      </div>
    </div>
  );
}
