import { useState, useEffect, useRef } from 'react';
import type { GameState } from '../../types/game';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
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

function NumberInputControl({ label, value, onChange, min = 0.00001, max, suffix }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
}) {
  const [draft, setDraft] = useState(String(value));
  const lastValid = useRef(value);

  useEffect(() => {
    lastValid.current = value;
    setDraft(String(value));
  }, [value]);

  const commit = (raw: string) => {
    const parsed = parseFloat(raw);
    if (Number.isFinite(parsed) && parsed >= min && (max === undefined || parsed <= max)) {
      lastValid.current = parsed;
      onChange(parsed);
    }
  };

  return (
    <div className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
      <style>{`
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
      <span className="text-dark-300">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          step="any"
          min={min}
          max={max}
          value={draft}
          onChange={e => {
            setDraft(e.target.value);
            commit(e.target.value);
          }}
          onBlur={() => {
            const parsed = parseFloat(draft);
            if (!Number.isFinite(parsed) || parsed < min || (max !== undefined && parsed > max)) {
              setDraft(String(lastValid.current));
            }
          }}
          className="hide-arrows w-16 text-right bg-dark-600/50 border border-dark-400 rounded px-2 py-0.5 text-neon-300 font-bold text-[0.7rem] focus:outline-none focus:border-neon-300/50"
        />
        {suffix && <span className="text-dark-300 text-[0.6rem]">{suffix}</span>}
      </div>
    </div>
  );
}

export default function AutomationTab({ state, setState }: Props) {
  return (
    <div className="space-y-3">
      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Items</h3>
          <ToggleControl label="" value={state.autoEditors.enabled} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, enabled: v } })} />
        </div>
        <OptionControl label="Buy Mode" options={['1x', 'max']} value={state.autoEditors.buyMode} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, buyMode: v as '1x' | 'max' } })} />
        <NumberInputControl label="Money Reserve" value={state.autoEditors.moneyReservePct} min={0} max={100} suffix="%" onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, moneyReservePct: v } })} />
        <NumberInputControl label="Interval" value={state.autoEditors.intervalSec} min={0.00001} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, intervalSec: v } })} />
        <ToggleControl label="Buy Cheapest" value={state.autoEditors.buyCheapest} onChange={v => setState({ ...state, autoEditors: { ...state.autoEditors, buyCheapest: v } })} />
      </div>

      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Upgrades</h3>
          <ToggleControl label="" value={state.autoUpgrades.enabled} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, enabled: v } })} />
        </div>
        <NumberInputControl label="Money Reserve" value={state.autoUpgrades.moneyReservePct} min={0} max={100} suffix="%" onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, moneyReservePct: v } })} />
        <NumberInputControl label="Vibe Reserve" value={state.autoUpgrades.vibeReservePct} min={0} max={100} suffix="%" onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, vibeReservePct: v } })} />
        <NumberInputControl label="Interval" value={state.autoUpgrades.intervalSec} min={0.00001} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, intervalSec: v } })} />
        <ToggleControl label="Buy Cheapest" value={state.autoUpgrades.buyCheapest} onChange={v => setState({ ...state, autoUpgrades: { ...state.autoUpgrades, buyCheapest: v } })} />
      </div>

      <div className="glass-card p-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider">Auto Ascension</h3>
          <ToggleControl label="" value={state.autoAscension.enabled} onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, enabled: v } })} />
        </div>
        <NumberInputControl label="Threshold Mult" value={state.autoAscension.thresholdMultiplier} min={1} max={1000} suffix="x" onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, thresholdMultiplier: v } })} />
        <NumberInputControl label="Min Run Time" value={state.autoAscension.minimumRunTimeSec} min={0} max={86400} suffix="s" onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, minimumRunTimeSec: v } })} />
        <NumberInputControl label="Interval" value={state.autoAscension.intervalSec} min={0.00001} onChange={v => setState({ ...state, autoAscension: { ...state.autoAscension, intervalSec: v } })} />
      </div>
    </div>
  );
}
