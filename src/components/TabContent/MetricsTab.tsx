import type { GameState } from '../../types/game';
import { formatNum, formatMoney, linesPerClick, automationLPS, moneyPerLine, clickMultiplier } from '../../utils/math';

export default function MetricsTab({ state }: { state: GameState }) {
  const s = state.useScientific;
  const ms = state.totalPlayedMs;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const timeStr = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;

  const lifetimeRows: [string, string][] = [
    ['Total Lines Ever', formatNum(state.totalLinesEver, s)],
    ['Total Clicks', formatNum(state.totalClicks, s)],
    ['Total Time Played', timeStr],
    ['All-Time Max LPS', formatNum(state.maxLPS, s)],
  ];

  const efficiencyRows: [string, string][] = [
    ['Lines Per Click', formatNum(linesPerClick(state), s)],
    ['Auto Lines/sec', formatNum(automationLPS(state), s)],
    ['Money Per Line', formatMoney(moneyPerLine(state), s)],
    ['Click Mult', `x${formatNum(clickMultiplier(state), s)}`],
    ['Ascensions', formatNum(state.ascensionCount, s)],
  ];

  const renderRows = (rows: [string, string][]) =>
    rows.map(([label, val]) => (
      <div key={label} className="flex justify-between py-2.5 border-b border-dark-700 last:border-0 text-[0.75rem]">
        <span className="text-dark-300">{label}</span>
        <span className="text-neon-300 font-bold">{val}</span>
      </div>
    ));

  return (
    <div className="glass-card p-4">
      <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">LIFETIME</h3>
      {renderRows(lifetimeRows)}
      <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2 mt-4">EFFICIENCY</h3>
      {renderRows(efficiencyRows)}
    </div>
  );
}
