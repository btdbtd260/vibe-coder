import type { GameState } from '../../types/game';
import { formatNum, seniorPointsToGain, performSeniorPrestige, SENIOR_PRESTIGE_THRESHOLD } from '../../utils/math';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

export default function SeniorOfficeTab({ state, setState, addLog }: Props) {
  const s = state.useScientific;
  const gain = seniorPointsToGain(state.totalLinesEver);
  const canPrestige = gain >= 1;

  const doPrestige = () => {
    if (!canPrestige) return;
    const next = performSeniorPrestige(state);
    setState(next);
    addLog(`Senior Prestige complete! +${gain} Senior Points.`);
  };

  const sfCost = Math.ceil(1 * Math.pow(1.5, state.sfLevel));
  const retCost = Math.ceil(2 * Math.pow(2.5, state.retentionLevel));

  const buySF = () => {
    if (state.seniorPoints < sfCost) return;
    setState({ ...state, seniorPoints: state.seniorPoints - sfCost, sfLevel: state.sfLevel + 1 });
    addLog('Standardized Framework upgraded.');
  };

  const buyJunior = () => {
    if (state.autoBuyerActive || state.seniorPoints < 5) return;
    setState({ ...state, seniorPoints: state.seniorPoints - 5, autoBuyerActive: true });
    addLog('Junior Dev Hire — auto-buyer activated.');
  };

  const buyRetention = () => {
    if (state.seniorPoints < retCost) return;
    setState({ ...state, seniorPoints: state.seniorPoints - retCost, retentionLevel: state.retentionLevel + 1 });
    addLog('Legacy Documentation upgraded.');
  };

  if (!canPrestige && state.totalSeniorPoints === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <p className="text-[0.65rem] text-dark-400 italic">
          The Senior Office is locked. Generate {formatNum(SENIOR_PRESTIGE_THRESHOLD, s)} total lines of code to unlock Tier 2 prestige.
        </p>
        <p className="text-[0.55rem] text-dark-500 mt-2">// {formatNum(SENIOR_PRESTIGE_THRESHOLD - state.totalLinesEver, s)} lines remaining</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="glass-card p-4 text-center">
        <div className="text-[0.65rem] text-dark-300 uppercase tracking-wider mb-1">Senior Points</div>
        <div className="text-2xl font-bold text-neon-300">{formatNum(state.seniorPoints, s)}</div>
        <div className="text-[0.55rem] text-dark-500 mt-1">All-time: {formatNum(state.totalSeniorPoints, s)}</div>
      </div>

      <button onClick={doPrestige} disabled={!canPrestige}
        className="w-full py-3 rounded-lg border-2 border-neon-300/60 text-neon-300 font-bold text-xs hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-all">
        {canPrestige ? `Senior Prestige — Gain ${formatNum(gain, s)} SP` : `Need ${formatNum(SENIOR_PRESTIGE_THRESHOLD, s)} total lines`}
      </button>

      {state.autoBuyerActive && (
        <div className="glass-card p-3 border border-neon-300/30">
          <p className="text-[0.6rem] text-neon-300 uppercase tracking-wider text-center">Auto-Buyer: ACTIVE</p>
          <p className="text-[0.55rem] text-dark-400 text-center mt-1">Buys cheapest Terminal upgrade every 5s if money &gt; 10× cost</p>
        </div>
      )}

      <div className="glass-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">Standardized Framework</div>
          <div className="text-[0.6rem] text-dark-300">+10% production per Senior Point per level</div>
          <div className="text-[0.6rem] text-neon-300">{sfCost} SP · Level {state.sfLevel}</div>
        </div>
        <button onClick={buySF} disabled={state.seniorPoints < sfCost}
          className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
          Buy
        </button>
      </div>

      <div className="glass-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">Junior Dev Hire</div>
          <div className="text-[0.6rem] text-dark-300">Unlock auto-buyer (buys cheapest every 5s)</div>
          <div className="text-[0.6rem] text-neon-300">{state.autoBuyerActive ? 'PURCHASED' : '5 SP'}</div>
        </div>
        <button onClick={buyJunior} disabled={state.autoBuyerActive || state.seniorPoints < 5}
          className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
          {state.autoBuyerActive ? 'OWNED' : 'Buy'}
        </button>
      </div>

      <div className="glass-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <div className="text-[0.7rem] text-dark-100 uppercase tracking-wider">Legacy Documentation</div>
          <div className="text-[0.6rem] text-dark-300">+2% lines retained on Senior Prestige</div>
          <div className="text-[0.6rem] text-neon-300">{retCost} SP · Level {state.retentionLevel}</div>
        </div>
        <button onClick={buyRetention} disabled={state.seniorPoints < retCost}
          className="text-[0.65rem] px-3 py-1.5 rounded border border-neon-300/40 text-neon-300 hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-all uppercase tracking-wider">
          Buy
        </button>
      </div>
    </div>
  );
}
