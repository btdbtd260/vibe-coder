import { useState } from 'react';
import type { GameState } from '../../types/game';
import { KB_THRESHOLDS, KB_COSTS, LINT_THRESHOLDS, LINT_COSTS } from '../../types/game';
import { formatNum, fluxCost, getVisiblePerkTier } from '../../utils/math';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

const SUB_TABS = ['Mastery', 'Item Perks', 'Future+'] as const;

const MASTERIES = [
  { key: 'masteryMultiThreaded', cost: 2, label: 'Multi-Threaded Scripting', desc: 'x2 click power' },
  { key: 'masteryAlgorithm', cost: 5, label: 'Algorithm Efficiency', desc: 'Linters give 50% XP' },
  { key: 'masteryCloudCredit', cost: 10, label: 'Cloud Credit', desc: '15% shop discount' },
  { key: 'masteryFocusScroll', cost: 1, label: 'Focus Scroll', desc: '+2% click power' },
  { key: 'masteryTidyComments', cost: 1, label: 'Tidy Comments', desc: '+1% money/line' },
  { key: 'masteryCodeReview', cost: 2, label: 'Code Review', desc: '+2% auto speed' },
  { key: 'masteryPairProgram', cost: 2, label: 'Pair Program', desc: '+1% global prod' },
  { key: 'masterySprintSprint', cost: 3, label: 'Sprint Sprint', desc: '+3% click & auto' },
];

export default function UpgradesTab({ state, setState, addLog }: Props) {
  const [subTab, setSubTab] = useState(0);
  const s = state.useScientific;
  const av = state.vibeLevel - state.spentLevels;

  const buyMastery = (key: string, cost: number, label: string) => {
    if ((state as any)[key] || av < cost) return;
    const next = { ...state, spentLevels: state.spentLevels + cost };
    (next as any)[key] = true;
    if (key === 'masteryAlgorithm') addLog('Mastery: Algorithm Efficiency — linters now give 50% XP');
    setState(next);
    addLog(`Mastery: ${label}`);
  };

  const buyAllMasteries = () => {
    let next = { ...state };
    for (const m of MASTERIES) {
      if ((next as any)[m.key]) continue;
      const a = next.vibeLevel - next.spentLevels;
      if (a < m.cost) continue;
      next.spentLevels += m.cost;
      (next as any)[m.key] = true;
    }
    setState(next);
    addLog('All affordable masteries purchased.');
  };

  const buyFlux = () => {
    const c = fluxCost(state.fluxOwned);
    if (state.edOwned < 5 || state.money < c) return;
    setState({ ...state, money: state.money - c, fluxOwned: state.fluxOwned + 1 });
  };

  const buyPerk = (key: 'perkEdTier' | 'perkKbTier' | 'perkLintTier', tier: number, cost: number) => {
    if ((state as any)[key] >= tier || state.money < cost) return;
    setState({ ...state, money: state.money - cost, [key]: tier });
  };

  const buyAllPerks = () => {
    let next = { ...state };
    // ED perks
    if (next.edOwned >= 3 && next.perkEdTier < 1 && next.money >= 500) {
      next.money -= 500; next.perkEdTier = 1;
    }
    if (next.edOwned >= 5 && next.perkEdTier < 2 && next.money >= 2000) {
      next.money -= 2000; next.perkEdTier = 2;
    }
    // KB perk
    const kbIdx = getVisiblePerkTier(next.kbOwned, next.money, KB_THRESHOLDS, KB_COSTS);
    if (kbIdx !== null && next.money >= KB_COSTS[kbIdx] && next.perkKbTier <= kbIdx) {
      next.money -= KB_COSTS[kbIdx];
      next.perkKbTier = kbIdx + 1;
    }
    // Lint perk
    const lintIdx = getVisiblePerkTier(next.lintOwned, next.money, LINT_THRESHOLDS, LINT_COSTS);
    if (lintIdx !== null && next.money >= LINT_COSTS[lintIdx] && next.perkLintTier <= lintIdx) {
      next.money -= LINT_COSTS[lintIdx];
      next.perkLintTier = lintIdx + 1;
    }
    // Flux
    if (next.edOwned >= 5) {
      while (next.money >= fluxCost(next.fluxOwned)) {
        next.money -= fluxCost(next.fluxOwned);
        next.fluxOwned++;
      }
    }
    setState(next);
    addLog('All affordable perks purchased.');
  };

  return (
    <div>
      <div className="flex gap-1 mb-3">
        {SUB_TABS.map((label, i) => (
          <button key={label} onClick={() => setSubTab(i)}
            className={`flex-1 py-1.5 text-[0.6rem] uppercase tracking-wider rounded-t border-b-2 transition-all cursor-pointer
              ${subTab === i ? 'border-neon-300 text-neon-300' : 'border-transparent text-dark-400 hover:text-dark-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {subTab === 0 && (
        <div>
          <button onClick={buyAllMasteries}
            className="w-full mb-2 py-1.5 rounded border border-neon-300/30 text-neon-300 text-[0.6rem] hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={MASTERIES.every(m => (state as any)[m.key])}>
            Buy All Masteries
          </button>
          <div className="space-y-2">
            {MASTERIES.map(m => {
              const owned = (state as any)[m.key];
              if (owned) return null;
              return (
                <div key={m.key} className="glass-card p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">{m.label}</div>
                    <div className="text-[0.6rem] text-dark-300">{m.desc}</div>
                    <div className="text-[0.6rem] text-neon-300">{m.cost} Level{m.cost > 1 ? 's' : ''}</div>
                  </div>
                  <button onClick={() => buyMastery(m.key, m.cost, m.label)} disabled={av < m.cost}
                    className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
                    Buy
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {subTab === 1 && (
        <div>
          <button onClick={buyAllPerks}
            className="w-full mb-2 py-1.5 rounded border border-neon-300/30 text-neon-300 text-[0.6rem] hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed">
            Buy All Perks
          </button>

          {/* ED Perks */}
          {state.edOwned >= 3 && state.perkEdTier < 1 && (
            <PerkCard title="Double Shot" desc="ED click power +25%" cost={500}
              show={state.money >= 450} onBuy={() => buyPerk('perkEdTier', 1, 500)} />
          )}
          {state.edOwned >= 5 && state.perkEdTier < 2 && (
            <PerkCard title="Caffeine IV" desc="ED click power +50%" cost={2000}
              show={state.money >= 1800} onBuy={() => buyPerk('perkEdTier', 2, 2000)} />
          )}

          {/* KB Perk */}
          {(() => {
            const idx = getVisiblePerkTier(state.kbOwned, state.money, KB_THRESHOLDS, KB_COSTS);
            if (idx === null || state.perkKbTier > idx) return null;
            const names = ['O-Ring Swap', 'Cherry MX', 'Linear Switch', 'Topre Electrostatic', 'Hall Effect', 'Optical Switch', 'Singularity Keyboard'];
            return (
              <PerkCard title={names[idx] || 'Keyboard Perk'} desc={`KB click power +${[25, 50, 100, 150, 200, 300, 500][idx]}%`}
                cost={KB_COSTS[idx]} show={state.money >= KB_COSTS[idx] * 0.9}
                onBuy={() => buyPerk('perkKbTier', idx + 1, KB_COSTS[idx])} />
            );
          })()}

          {/* Lint Perk */}
          {(() => {
            const idx = getVisiblePerkTier(state.lintOwned, state.money, LINT_THRESHOLDS, LINT_COSTS);
            if (idx === null || state.perkLintTier > idx) return null;
            const names = ['Syntax Sensei', 'Parallel Lint', 'Distributed Lint', 'Sentient Linter', 'Autonomous Refactor', 'Quantum Linter', 'Self-Writing Code'];
            return (
              <PerkCard title={names[idx] || 'Linter Perk'} desc={`Linter speed +${[25, 50, 100, 150, 200, 300, 500][idx]}%`}
                cost={LINT_COSTS[idx]} show={state.money >= LINT_COSTS[idx] * 0.9}
                onBuy={() => buyPerk('perkLintTier', idx + 1, LINT_COSTS[idx])} />
            );
          })()}

          {/* Energy Flux */}
          {state.edOwned >= 5 && (
            <PerkCard title="Energy Flux" desc={`Reduces KB/Lint costs by 5%/level`}
              cost={fluxCost(state.fluxOwned)} show={state.money >= fluxCost(state.fluxOwned) * 0.9}
              onBuy={buyFlux} ownedCount={state.fluxOwned} />
          )}
        </div>
      )}

      {subTab === 2 && (
        <div className="glass-card p-6 text-center">
          <p className="text-[0.65rem] text-dark-400 italic">
            Additional upgrade categories will appear here as new features are added.
          </p>
          <p className="text-[0.55rem] text-dark-500 mt-2">// FUTURE EXPANSION SLOT</p>
        </div>
      )}
    </div>
  );
}

function PerkCard({ title, desc, cost, show, onBuy, ownedCount }: {
  title: string; desc: string; cost: number; show: boolean; onBuy: () => void; ownedCount?: number;
}) {
  if (!show) return null;
  return (
    <div className="glass-card p-3 flex items-center gap-3 mb-2 border-l-2 border-neon-300/40">
      <div className="flex-1">
        <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">{title}</div>
        <div className="text-[0.6rem] text-dark-300">{desc}</div>
        <div className="text-[0.6rem] text-neon-300">Cost: ${formatNum(cost, false)}{ownedCount !== undefined ? `  · Owned: ${ownedCount}` : ''}</div>
      </div>
      <button onClick={onBuy}
        className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 cursor-pointer transition-all uppercase tracking-wider">
        Buy
      </button>
    </div>
  );
}
