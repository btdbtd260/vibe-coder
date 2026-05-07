import { formatNum, xpForLevel, availableLevels } from '../utils/math';
import type { GameState } from '../types/game';
import { useTooltip } from './ui/TooltipManager';
import { UPGRADE_LORE } from '../data/tooltips';

export default function XpBar({ state }: { state: GameState }) {
  const s = state.useScientific;
  const needed = xpForLevel(state.vibeLevel);
  const pct = Math.min((state.vibeXP / needed) * 100, 100);
  const tip = useTooltip(UPGRADE_LORE.vibeLevel ? { title: UPGRADE_LORE.vibeLevel.title, long: UPGRADE_LORE.vibeLevel.long, mechanic: UPGRADE_LORE.vibeLevel.mechanic } : null);

  return (
    <div className="glass-card px-3 py-2 mb-3 cursor-help" {...(tip.tooltipHandlers)}>
      <div className="flex items-center gap-3">
        <div className="text-center shrink-0">
          <span className="text-[0.55rem] text-dark-300 uppercase tracking-[1px] block leading-tight">Level</span>
          <span className="text-lg font-bold text-neon-300">{state.vibeLevel}</span>
        </div>
        <div className="flex-1 h-2 bg-dark-700 rounded-full overflow-hidden border border-dark-500">
          <div className="h-full rounded-full bg-gradient-to-r from-neon-400 to-neon-200 transition-all duration-300" style={{ width: pct + '%' }} />
        </div>
        <span className="text-[0.6rem] text-dark-300 whitespace-nowrap">
          {formatNum(state.vibeXP, s)} / {formatNum(needed, s)} XP
        </span>
        <span className="text-[0.6rem] text-dark-300 whitespace-nowrap">
          Mastery: {formatNum(availableLevels(state), s)}
        </span>
      </div>
    </div>
  );
}
