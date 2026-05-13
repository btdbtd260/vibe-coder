import { useState } from 'react';
import type { GameState } from '../../types/game';
import { formatNum, ascensionMult } from '../../utils/math';
import { toNum, BN_ZERO } from '../../utils/BigNum';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
  soundAscend?: () => void;
}

export default function AscensionTab({ state, setState, addLog, soundAscend }: Props) {
  const [show, setShow] = useState(false);
  const s = state.useScientific;
  const newMult = ascensionMult(state.totalLinesEver);
  const canAscend = toNum(state.money) >= 1000000;

  const ascend = () => {
    const next: GameState = {
      ...state,
      ascensionMultiplier: newMult,
      ascensionCount: state.ascensionCount + 1,
      lines: BN_ZERO, money: BN_ZERO,
      edOwned: 0, kbOwned: 0, lintOwned: 0, fluxOwned: 0,
      vibeLevel: 0, vibeXP: BN_ZERO, spentLevels: 0,
      perkEdTier: 0, perkKbTier: 0, perkLintTier: 0,
      emCoffee: false, emStack: false, emDuck: false,
      masteryMultiThreaded: false, masteryAlgorithm: false, masteryCloudCredit: false,
      masteryFocusScroll: false, masteryTidyComments: false, masteryCodeReview: false,
      masteryPairProgram: false, masterySprintSprint: false, masteryStandupSync: false, masteryAgileRetro: false, masteryRefactorPro: false, masteryTestDriven: false, masteryShipIt: false,
      premiumHyperThreaded: false, premiumCloudCompute: false, premiumAIOverlord: false,
      premiumEternalLoop: false, premiumQuantumBackup: false, premiumRecursiveCompile: false,
      premiumParallelDim: false, premiumNeuralLink: false,
      vibeShards: 0, darkWebMultiplier: 0,
      lintMilestoneBoost: 1, maxLPS: BN_ZERO,
    };
    setState(next);
    setState(next);
    setShow(false);
    if (soundAscend) soundAscend();
    document.body.classList.add("screen-shake");
    setTimeout(() => document.body.classList.remove("screen-shake"), 500);
    addLog(`Ascended! Multiplier now x${formatNum(newMult, s)}`);
  };

  return (
    <div>
      <div className="glass-card p-4 text-center mb-3">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-3">Graduation</h3>
        <div className="space-y-2 text-[0.7rem] text-dark-200 mb-4">
          <div className="flex justify-between"><span>Current Multiplier</span><span className="text-neon-300">x{formatNum(state.ascensionMultiplier, s)}</span></div>
          <div className="flex justify-between"><span>New Multiplier</span><span className="text-neon-300">x{formatNum(newMult, s)}</span></div>
          <div className="flex justify-between"><span>Total Lines Ever</span><span className="text-neon-300">{formatNum(state.totalLinesEver, s)}</span></div>
        </div>
        <button onClick={() => setShow(true)} disabled={!canAscend}
          className="w-full py-3 rounded-lg border-2 border-neon-300 text-neon-300 font-bold text-xs hover:bg-neon-300/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer uppercase tracking-wider transition-all">
          Preview Ascension
        </button>
      </div>

      {show && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50" onClick={() => setShow(false)}>
          <div className="glass p-6 w-80 max-w-[90vw]" onClick={e => e.stopPropagation()}>
            <h2 className="text-sm text-neon-300 text-center uppercase tracking-wider mb-4">Ascension Preview</h2>
            <div className="space-y-2 text-[0.7rem] text-dark-200 mb-4">
              <div className="flex justify-between"><span>Current Mult</span><span className="text-neon-300">x{formatNum(state.ascensionMultiplier, s)}</span></div>
              <div className="flex justify-between"><span>New Mult</span><span className="text-neon-300">x{formatNum(newMult, s)}</span></div>
              <div className="flex justify-between"><span>Bonus Mastery</span><span className="text-neon-300">{Math.floor(Math.sqrt(toNum(state.totalLinesEver) / 1000000))}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={ascend} className="flex-1 py-2.5 rounded border border-neon-300 text-neon-300 text-xs hover:bg-neon-300/10 cursor-pointer uppercase tracking-wider transition-all">Confirm</button>
              <button onClick={() => setShow(false)} className="flex-1 py-2.5 rounded border border-dark-400 text-dark-200 text-xs hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
