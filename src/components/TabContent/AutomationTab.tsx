import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../../types/game';
import { formatNum } from '../../utils/math';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

function StepperControl({ label, value, min, max, step, suffix, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
      <span className="text-dark-300">{label}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="text-[0.6rem] px-2 py-0.5 rounded border border-dark-400 text-dark-200 hover:bg-dark-600/30 cursor-pointer transition-all uppercase tracking-wider"
        >−</button>
        <span className="text-neon-300 font-bold w-8 text-center">{value}{suffix}</span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="text-[0.6rem] px-2 py-0.5 rounded border border-dark-400 text-dark-200 hover:bg-dark-600/30 cursor-pointer transition-all uppercase tracking-wider"
        >+</button>
      </div>
    </div>
  );
}

function ToggleControl({ label, value, onChange }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const btn = (active: boolean, text: string) => (
    <button
      onClick={() => onChange(active)}
      className={`text-[0.6rem] px-2 py-0.5 rounded border cursor-pointer transition-all uppercase tracking-wider ${active === value ? 'border-neon-300 text-neon-300 bg-neon-300/10' : 'border-dark-400 text-dark-200'}`}
    >
      {text}
    </button>
  );
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
      <span className="text-dark-300">{label}</span>
      <div className="flex items-center gap-1">
        {btn(true, 'Yes')}
        {btn(false, 'No')}
      </div>
    </div>
  );
}

function OptionControl({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
      <span className="text-dark-300">{label}</span>
      <div className="flex items-center gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`text-[0.6rem] px-2 py-0.5 rounded border cursor-pointer transition-all uppercase tracking-wider ${opt === value ? 'border-neon-300 text-neon-300 bg-neon-300/10' : 'border-dark-400 text-dark-200'}`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function IntervalInputControl({ label, value, onChange, min = 1 }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
}) {
  const [draft, setDraft] = useState(String(value));
  const lastValid = useRef(value);

  useEffect(() => {
    lastValid.current = value;
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed >= min) {
      lastValid.current = parsed;
      onChange(parsed);
    }
  };

  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
      <span className="text-dark-300">{label}</span>
      <input
        type="number"
        step="any"
        min={min}
        value={draft}
        onChange={e => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => {
          const parsed = parseFloat(draft);
          if (!Number.isFinite(parsed) || parsed < min) {
            setDraft(String(lastValid.current));
          }
        }}
        className="w-16 text-right bg-dark-600/50 border border-dark-400 rounded px-2 py-0.5 text-neon-300 font-bold text-[0.7rem] focus:outline-none focus:border-neon-300/50"
      />
    </div>
  );
}

export default function AutomationTab({ state, setState, addLog }: Props) {
  const hasLinter = state.lintOwned > 0;
  const showPuzzle = state.totalLinesEver >= 50000 && state.lintOwned >= 1;

  return (
    <div className="space-y-3">
      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Editors</h3>
          <ToggleControl label="" value={state.autoEditors.enabled} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, enabled: v } })} />
        </div>
        <OptionControl label="Buy Mode" options={['1x', 'max']} value={state.autoEditors.buyMode} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, buyMode: v as '1x' | 'max' } })} />
        <StepperControl label="Money Reserve" value={state.autoEditors.moneyReservePct} min={0} max={100} step={5} suffix="%" onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, moneyReservePct: v } })} />
        <IntervalInputControl label="Interval" value={state.autoEditors.intervalSec} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, intervalSec: v } })} />
        <ToggleControl label="Buy Cheapest" value={state.autoEditors.buyCheapest} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, buyCheapest: v } })} />
      </div>

      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Upgrades</h3>
          <ToggleControl label="" value={state.autoUpgrades.enabled} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, enabled: v } })} />
        </div>
        <StepperControl label="Money Reserve" value={state.autoUpgrades.moneyReservePct} min={0} max={100} step={5} suffix="%" onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, moneyReservePct: v } })} />
        <StepperControl label="Vibe Reserve" value={state.autoUpgrades.vibeReservePct} min={0} max={100} step={5} suffix="%" onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, vibeReservePct: v } })} />
        <IntervalInputControl label="Interval" value={state.autoUpgrades.intervalSec} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, intervalSec: v } })} />
        <ToggleControl label="Buy Cheapest" value={state.autoUpgrades.buyCheapest} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, buyCheapest: v } })} />
      </div>

      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Ascension</h3>
          <ToggleControl label="" value={state.autoAscension.enabled} onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, enabled: v } })} />
        </div>
        <StepperControl label="Threshold Mult" value={state.autoAscension.thresholdMultiplier} min={1} max={100} step={1} suffix="x" onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, thresholdMultiplier: v } })} />
        <StepperControl label="Min Run Time" value={state.autoAscension.minimumRunTimeSec} min={30} max={3600} step={30} suffix="s" onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, minimumRunTimeSec: v } })} />
        <IntervalInputControl label="Interval" value={state.autoAscension.intervalSec} onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, intervalSec: v } })} />
      </div>

      <div className="glass-card p-3">
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

function DarkWebPuzzle({ state, addLog }: { state: GameState; addLog: (msg: string) => void }) {
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
