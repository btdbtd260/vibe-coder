import { useRef } from 'react';
import { formatMoney, formatNum } from '../utils/math';
import type { GameState } from '../types/game';
import { useAnimatedNumber } from '../utils/animatedNumber';
import { useTooltip } from './ui/TooltipManager';
import { UPGRADE_LORE } from '../data/tooltips';

export default function ResourceBar({ state }: { state: GameState }) {
  const s = state.useScientific;
  const moneyTip = useTooltip(UPGRADE_LORE.money ? { title: UPGRADE_LORE.money.title, long: UPGRADE_LORE.money.long, mechanic: UPGRADE_LORE.money.mechanic } : null);
  const shardTip = useTooltip(UPGRADE_LORE.vibeShards ? { title: UPGRADE_LORE.vibeShards.title, long: UPGRADE_LORE.vibeShards.long, mechanic: UPGRADE_LORE.vibeShards.mechanic } : null);
  const lpsTip = useTooltip(UPGRADE_LORE.maxLPS ? { title: UPGRADE_LORE.maxLPS.title, long: UPGRADE_LORE.maxLPS.long, mechanic: UPGRADE_LORE.maxLPS.mechanic } : null);

  const prevMoney = useRef(formatMoney(state.money, s));
  const curMoney = formatMoney(state.money, s);
  const moneyPulse = curMoney !== prevMoney.current;
  if (moneyPulse) prevMoney.current = curMoney;

  const prevLps = useRef(formatNum(state.currentLPS, s));
  const curLps = formatNum(state.currentLPS, s);
  const lpsPulse = curLps !== prevLps.current;
  if (lpsPulse) prevLps.current = curLps;

  const animShards = useAnimatedNumber(state.vibeShards, 200);
  const prevShards = useRef('');
  const curShards = formatNum(Math.round(animShards), s);
  const shardsPulse = curShards !== prevShards.current;
  if (shardsPulse) prevShards.current = curShards;

  return (
    <div className="flex gap-2 mb-3">
      <div className={`flex-1 glass-card px-3 py-2 text-center cursor-help ${moneyPulse ? 'value-pulse' : ''}`} {...(moneyTip.tooltipHandlers)}>
        <span className="text-[0.6rem] text-dark-300 uppercase tracking-[1px]">Money</span>
        <span className="block text-sm font-bold text-neon-300 mt-0.5">{curMoney}</span>
      </div>
      <div className={`flex-1 glass-card px-3 py-2 text-center cursor-help ${shardsPulse ? 'value-pulse' : ''}`} {...(shardTip.tooltipHandlers)}>
        <span className="text-[0.6rem] text-dark-300 uppercase tracking-[1px]">Shards</span>
        <span className="block text-sm font-bold text-neon-300 mt-0.5">{curShards}</span>
      </div>
      <div className={`flex-1 glass-card px-3 py-2 text-center cursor-help ${lpsPulse ? 'value-pulse' : ''}`} {...(lpsTip.tooltipHandlers)}>
        <span className="text-[0.6rem] text-dark-300 uppercase tracking-[1px]">Lines/Sec</span>
        <span className="block text-sm font-bold text-neon-300 mt-0.5">{curLps}</span>
      </div>
    </div>
  );
}
