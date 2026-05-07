import type { GameState } from '../../types/game';
import { useTooltip } from '../ui/TooltipManager';
import { UPGRADE_LORE } from '../../data/tooltips';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

const PREMIUM = [
  { key: 'premiumHyperThreaded', cost: 10, label: 'Hyper-Threaded Vibe', tooltipId: 'premiumHyperThreaded' },
  { key: 'premiumCloudCompute', cost: 25, label: 'Cloud Compute', tooltipId: 'premiumCloudCompute' },
  { key: 'premiumAIOverlord', cost: 50, label: 'AI Overlord', tooltipId: 'premiumAIOverlord' },
  { key: 'premiumEternalLoop', cost: 100, label: 'Eternal Loop', tooltipId: 'premiumEternalLoop' },
  { key: 'premiumQuantumBackup', cost: 75, label: 'Quantum Backup', tooltipId: 'premiumQuantumBackup' },
  { key: 'premiumRecursiveCompile', cost: 150, label: 'Recursive Compile', tooltipId: 'premiumRecursiveCompile' },
  { key: 'premiumParallelDim', cost: 200, label: 'Parallel Dimension', tooltipId: 'premiumParallelDim' },
  { key: 'premiumNeuralLink', cost: 250, label: 'Neural Link', tooltipId: 'premiumNeuralLink' },
];

const premiumTooltipData = Object.fromEntries(
  PREMIUM.map(p => [p.key, UPGRADE_LORE[p.tooltipId]])
);

export default function CloudShopTab({ state, setState, addLog }: Props) {
  const buyPremium = (key: string, cost: number, label: string) => {
    if (state.vibeShards < cost || (state as any)[key]) return;
    const next = { ...state, vibeShards: state.vibeShards - cost };
    (next as any)[key] = true;
    setState(next);
    addLog(`Premium: ${label}`);
  };

  return (
    <div className="space-y-2">
      {PREMIUM.map(p => {
        const owned = (state as any)[p.key];
        return (
          <PremiumCard
            key={p.key}
            p={p}
            owned={owned}
            canAfford={state.vibeShards >= p.cost}
            onBuy={() => buyPremium(p.key, p.cost, p.label)}
          />
        );
      })}
    </div>
  );
}

function PremiumCard({ p, owned, canAfford, onBuy }: {
  p: typeof PREMIUM[0]; owned: boolean; canAfford: boolean; onBuy: () => void;
}) {
  const lore = premiumTooltipData[p.key];
  const tip = lore ? { title: lore.title, long: lore.long, mechanic: lore.mechanic } : null;
  const { tooltipHandlers } = useTooltip(tip);

  return (
    <div className="glass-card p-3 flex items-center gap-3 cursor-help" {...(tip ? tooltipHandlers : {})}>
      <div className="flex-1">
        <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">{p.label}</div>
        <div className="text-[0.6rem] text-dark-300">{lore?.long?.slice(0, 80)}…</div>
        <div className="text-[0.6rem] text-neon-300">{owned ? 'OWNED' : `${p.cost} Shards`}</div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onBuy(); }}
        disabled={owned || !canAfford}
        className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
        {owned ? 'OWNED' : 'Buy'}
      </button>
    </div>
  );
}
