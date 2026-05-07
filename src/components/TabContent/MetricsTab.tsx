import type { GameState } from '../../types/game';
import { formatNum } from '../../utils/math';

export default function MetricsTab({ state }: { state: GameState }) {
  const s = state.useScientific;
  const ms = state.totalPlayedMs;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const sec = totalSec % 60;
  const timeStr = `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`;

  const rows = [
    ['Total Lines Ever', formatNum(state.totalLinesEver, s)],
    ['Total Clicks', formatNum(state.totalClicks, s)],
    ['Total Time Played', timeStr],
    ['All-Time Max LPS', formatNum(state.maxLPS, s)],
  ];

  return (
    <div className="glass-card p-4">
      {rows.map(([label, val]) => (
        <div key={label} className="flex justify-between py-2.5 border-b border-dark-700 last:border-0 text-[0.75rem]">
          <span className="text-dark-300">{label}</span>
          <span className="text-neon-300 font-bold">{val}</span>
        </div>
      ))}
    </div>
  );
}
