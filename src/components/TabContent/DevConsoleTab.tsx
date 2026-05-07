import { useState } from 'react';
import type { GameState } from '../../types/game';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

export default function DevConsoleTab({ state, setState, addLog }: Props) {
  const [moneyInput, setMoneyInput] = useState('');
  const [shardInput, setShardInput] = useState('');

  const addMoney = () => {
    const amt = parseFloat(moneyInput);
    if (isNaN(amt)) return;
    setState({ ...state, money: state.money + amt });
    addLog(`DEV: Injected $${amt}`);
    setMoneyInput('');
  };

  const grantShards = () => {
    const amt = parseInt(shardInput);
    if (isNaN(amt)) return;
    setState({ ...state, vibeShards: state.vibeShards + amt });
    addLog(`DEV: Granted ${amt} Shards`);
    setShardInput('');
  };

  const levelSkip = () => {
    setState({ ...state, vibeLevel: state.vibeLevel + 5 });
    addLog('DEV: +5 Levels');
  };

  const infMoney = () => {
    setState({ ...state, money: Number.MAX_VALUE });
    addLog('DEV: Infinite Money');
  };

  const levelBoost50 = () => {
    setState({ ...state, vibeLevel: state.vibeLevel + 50 });
    addLog('DEV: +50 Levels');
  };

  const instant100 = () => {
    const next = { ...state, edOwned: Math.max(state.edOwned, 100), kbOwned: Math.max(state.kbOwned, 100), lintOwned: Math.max(state.lintOwned, 100) };
    setState(next);
    addLog('DEV: All items → 100');
  };

  return (
    <div className="space-y-3">
      <div className="glass-card p-4 border border-red-500/30">
        <h3 className="text-[0.65rem] text-red-400 uppercase tracking-wider mb-3">Currency Injector</h3>
        <div className="flex gap-2 mb-2">
          <input type="number" value={moneyInput} onChange={e => setMoneyInput(e.target.value)}
            placeholder="Amount..."
            className="flex-1 bg-dark-800 border border-dark-500 rounded px-3 py-1.5 text-[0.7rem] text-dark-100 outline-none focus:border-red-500/50" />
          <button onClick={addMoney}
            className="px-4 py-1.5 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">Add $</button>
        </div>
        <div className="flex gap-2">
          <input type="number" value={shardInput} onChange={e => setShardInput(e.target.value)}
            placeholder="Shards..."
            className="flex-1 bg-dark-800 border border-dark-500 rounded px-3 py-1.5 text-[0.7rem] text-dark-100 outline-none focus:border-red-500/50" />
          <button onClick={grantShards}
            className="px-4 py-1.5 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">Grant</button>
        </div>
      </div>

      <div className="glass-card p-4 border border-red-500/30">
        <h3 className="text-[0.65rem] text-red-400 uppercase tracking-wider mb-3">Level & Skip</h3>
        <div className="flex gap-2">
          <button onClick={levelSkip}
            className="flex-1 py-2 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">+5 Levels</button>
          <button onClick={levelBoost50}
            className="flex-1 py-2 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">+50 Levels</button>
          <button onClick={instant100}
            className="flex-1 py-2 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">Lvl 100</button>
        </div>
      </div>

      <div className="glass-card p-4 border border-red-500/30">
        <h3 className="text-[0.65rem] text-red-400 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <DevBtn onClick={() => addLog('DEV: +1Q $') || setState({ ...state, money: state.money + 1e15 })} label="+1Q $" />
          <DevBtn onClick={infMoney} label="Inf $" />
          <DevBtn onClick={() => addLog('DEV: Unlock All')} label="Unlock All" />
        </div>
      </div>
    </div>
  );
}

function DevBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick}
      className="px-3 py-1.5 rounded border border-red-500/40 text-red-300 text-[0.6rem] hover:bg-red-500/10 cursor-pointer uppercase tracking-wider transition-all">
      {label}
    </button>
  );
}
