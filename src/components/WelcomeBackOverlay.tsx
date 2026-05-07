import type { OfflineGains } from '../hooks/useGameState';
import { formatNum, formatMoney } from '../utils/math';

interface Props {
  gains: OfflineGains;
  onDismiss: () => void;
}

function formatDuration(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s`;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  if (h < 24) return rm > 0 ? `${h}h ${rm}m` : `${h}h`;
  return `${h >= 24 ? Math.floor(h / 24) : 0}d`;
}

export default function WelcomeBackOverlay({ gains, onDismiss }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="glass-card p-6 w-80 max-w-[90vw] border-neon-300/30">
        <h2 className="text-sm text-neon-300 text-center uppercase tracking-wider mb-4">Welcome Back!</h2>
        <p className="text-[0.65rem] text-dark-300 text-center mb-4">While you were away...</p>
        <div className="space-y-3 text-[0.7rem] mb-4">
          <div className="flex justify-between">
            <span className="text-dark-300">Time Away</span>
            <span className="text-neon-300 font-bold">{formatDuration(gains.elapsedMs)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">Lines Earned</span>
            <span className="text-neon-300 font-bold">+{formatNum(gains.gainedLines, false)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-dark-300">Money Earned</span>
            <span className="text-neon-300 font-bold">+{formatMoney(gains.gainedMoney, false)}</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded border border-neon-300/40 text-neon-300 text-xs hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
