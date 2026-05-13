import { useState, useRef } from 'react';
import type { GameState } from '../../types/game';
import { defaultState, ALL_HOTKEY_ACTIONS } from '../../types/game';
import { saveState, serializeState, deserializeState } from '../../hooks/useGameState';

interface Props {
  state: GameState;
  setState: (s: GameState) => void;
  addLog: (msg: string) => void;
}

export default function ConfigTab({ state, setState, addLog }: Props) {
  const [rebinding, setRebinding] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleNotation = () => setState({ ...state, useScientific: !state.useScientific });
  const toggleOfflineProgress = () => setState({ ...state, offlineProgressEnabled: !state.offlineProgressEnabled });

  const handleSave = () => {
    saveState(state);
    addLog('Game saved.');
  };

  const handleWipe = () => {
    if (!confirm('Wipe all data?')) return;
    localStorage.removeItem('vibe_coder_save');
    setState({ ...defaultState });
    addLog('Data wiped.');
  };

  const handleExport = () => {
    const json = serializeState(state);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vibe_coder_save_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addLog('Save exported.');
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = deserializeState(reader.result as string, defaultState);
      if (result) {
        setState(result);
        saveState(result);
        addLog('Import successful.');
      } else {
        addLog('Import failed: invalid or incompatible save file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const startRebind = (id: string) => {
    setRebinding(id);
    const handler = (e: KeyboardEvent) => {
      e.preventDefault();
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      setState({ ...state, hotkeys: { ...state.hotkeys, [id]: key } });
      setRebinding(null);
      document.removeEventListener('keydown', handler);
      addLog(`Hotkey ${id} → ${key === ' ' ? 'Space' : key}`);
    };
    document.addEventListener('keydown', handler);
  };

  return (
    <div className="space-y-3">
      <div className="glass-card p-4">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Sync-Key Mapping</h3>
        <div className="space-y-1">
          {ALL_HOTKEY_ACTIONS.map(({ id, label }) => {
            const current = state.hotkeys[id];
            const isListening = rebinding === id;
            return (
              <div key={id} className="flex justify-between items-center py-1.5 border-b border-dark-700 last:border-0 text-[0.7rem]">
                <span className="text-dark-200">{label}</span>
                <button
                  onClick={() => startRebind(id)}
                  className={`text-[0.6rem] px-2.5 py-1 rounded border cursor-pointer transition-all uppercase tracking-wider
                    ${isListening
                      ? 'border-neon-300 text-neon-300 bg-neon-300/10 animate-pulse'
                      : 'border-dark-400 text-dark-200 hover:bg-dark-600/30'}`}
                >
                  {isListening ? 'Press...' : `[${current === ' ' ? 'Space' : current}]`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Notation</h3>
        <button onClick={toggleNotation}
          className="w-full py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">
          {state.useScientific ? 'Scientific' : 'Standard'}
        </button>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Offline Progress</h3>
        <button onClick={toggleOfflineProgress}
          className="w-full py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">
          {state.offlineProgressEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Sound</h3>
        <button onClick={() => setState({ ...state, soundEnabled: !state.soundEnabled })}
          className="w-full py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">
          {state.soundEnabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      <div className="glass-card p-4">
        <h3 className="text-[0.65rem] text-neon-300 uppercase tracking-wider mb-2">Data</h3>
        <div className="flex gap-2 mb-2">
          <button onClick={handleSave}
            className="flex-1 py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">Save</button>
          <button onClick={handleWipe}
            className="flex-1 py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">Wipe</button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex-1 py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">Export</button>
          <button onClick={handleImport}
            className="flex-1 py-2 rounded border border-dark-400 text-dark-200 text-[0.65rem] hover:bg-dark-600/30 cursor-pointer uppercase tracking-wider transition-all">Import</button>
        </div>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      </div>
    </div>
  );
}
