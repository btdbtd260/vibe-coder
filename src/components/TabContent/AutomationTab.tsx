import { useState, useEffect } from 'react';
import type { GameState } from '../../types/game';
import { formatNum } from '../../utils/math';

interface Props {
  state: GameState;
  addLog: (msg: string) => void;
}

export default function AutomationTab({ state, addLog }: Props) {
  const s = state.useScientific;
  const hasLinter = state.lintOwned > 0;
  const showPuzzle = state.totalLinesEver >= 50000 && state.lintOwned >= 1;

  return (
    <div>
      <div className="glass-card p-3 mb-3">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Auto-Linter Status</h3>
        {hasLinter ? (
          <div className="space-y-1 text-[0.7rem] text-dark-200">
            <div className="flex justify-between"><span>Level</span><span className="text-neon-300">{state.lintOwned}</span></div>
            <div className="flex justify-between"><span>Milestone Boost</span><span className="text-neon-300">x{state.lintMilestoneBoost}</span></div>
            <MilestoneBar level={state.lintOwned} />
          </div>
        ) : (
          <p className="text-[0.7rem] text-dark-300">Buy an Auto-Linter in the Terminal tab to start automation.</p>
        )}
      </div>

      {showPuzzle && <DarkWebPuzzle state={state} addLog={addLog} />}
    </div>
  );
}

function MilestoneBar({ level }: { level: number }) {
  const thresholds = [10, 25, 100, 200, 300];
  return (
    <div className="flex gap-1 mt-2">
      {thresholds.map(t => (
        <div key={t} className={`flex-1 h-1.5 rounded-full ${level >= t ? 'bg-neon-300' : 'bg-dark-600'}`} title={`Lvl ${t}`} />
      ))}
    </div>
  );
}

function DarkWebPuzzle({ state, addLog }: Props) {
  const [target, setTarget] = useState(0);
  const [choices, setChoices] = useState<number[]>([]);
  const [solved, setSolved] = useState(state.darkWebMultiplier);

  const generate = () => {
    const t = Math.floor(Math.random() * 256);
    const opts = new Set<number>();
    opts.add(t);
    while (opts.size < 4) opts.add(Math.floor(Math.random() * 256));
    setTarget(t);
    setChoices(Array.from(opts).sort(() => Math.random() - 0.5));
  };

  useEffect(() => { generate(); }, []);

  const pick = (val: number) => {
    if (val === target) {
      addLog('Dark Web: Payload decrypted! +5% production.');
      setSolved(s => s + 0.05);
      generate();
    } else {
      addLog('Dark Web: Wrong key. Retrying...');
      generate();
    }
  };

  return (
    <div className="glass-card p-3">
      <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Dark Web Node</h3>
      <p className="text-[0.6rem] text-dark-300 mb-2">Select matching key &gt; {target.toString(16).padStart(2, '0').toUpperCase()}</p>
      <div className="flex gap-2">
        {choices.map(c => (
          <button key={c} onClick={() => pick(c)}
            className="flex-1 py-2 rounded border border-neon-300/30 text-neon-300 text-xs hover:bg-neon-300/10 cursor-pointer transition-all">
            0x{c.toString(16).padStart(2, '0').toUpperCase()}
          </button>
        ))}
      </div>
      <p className="text-[0.55rem] text-dark-400 mt-2">Total bonus: +{formatNum(solved * 100, false)}%</p>
    </div>
  );
}
