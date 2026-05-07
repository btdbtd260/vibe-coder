import { vi, describe, it, expect, beforeEach } from 'vitest';
import { defaultState } from '../types/game';
import { loadState, saveState, debouncedSave } from '../hooks/useGameState';

vi.hoisted(() => {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => store.clear(),
    get length() { return store.size; },
    key: (_index: number) => null,
  };
});

beforeEach(() => {
  localStorage.clear();
});

describe('save/load roundtrip', () => {
  it('empty storage returns default state', () => {
    const loaded = loadState(defaultState);
    expect(loaded).toStrictEqual(defaultState);
    expect(loaded).not.toBe(defaultState);
  });

  it('saveState then loadState roundtrips mutated state', () => {
    const mutated = { ...defaultState, lines: 42, money: 999 };
    saveState(mutated);
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(42);
    expect(loaded.money).toBe(999);
    expect(loaded).toStrictEqual(mutated);
  });

  it('corrupted JSON returns default state', () => {
    localStorage.setItem('vibe_coder_save', '{broken json');
    const loaded = loadState(defaultState);
    expect(loaded).toStrictEqual(defaultState);
  });

  it('partial saved data merges with defaults', () => {
    const partial = { lines: 100 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(partial));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(100);
    expect(loaded.money).toBe(0);
    expect(loaded.vibeLevel).toBe(0);
  });

  it('default loaded state includes version 1', () => {
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(1);
  });

  it('saved/loaded state preserves version 1', () => {
    const mutated = { ...defaultState, lines: 50 };
    saveState(mutated);
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(1);
  });

  it('old save with no version loads as version 1', () => {
    const oldData = { lines: 100, money: 50 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(oldData));
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(1);
    expect(loaded.lines).toBe(100);
    expect(loaded.money).toBe(50);
  });

  it('numeric field loaded as string falls back to default', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ lines: 'hello' }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(0);
  });

  it('negative numeric value falls back to default', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ vibeLevel: -5 }));
    const loaded = loadState(defaultState);
    expect(loaded.vibeLevel).toBe(0);
  });

  it('NaN numeric field falls back to default', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ money: NaN }));
    const loaded = loadState(defaultState);
    expect(loaded.money).toBe(0);
  });

  it('ascensionMultiplier below 1 falls back to default', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ ascensionMultiplier: 0 }));
    const loaded = loadState(defaultState);
    expect(loaded.ascensionMultiplier).toBe(1);
  });

  it('boolean field as string falls back to default', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ emCoffee: 'yes' }));
    const loaded = loadState(defaultState);
    expect(loaded.emCoffee).toBe(false);
  });

  it('hotkey loaded as number falls back for that key', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ hotkeys: { click: 99 } }));
    const loaded = loadState(defaultState);
    expect(loaded.hotkeys.click).toBe(' ');
  });

  it('full defaultState roundtrip preserves all fields', () => {
    saveState(defaultState);
    const loaded = loadState(defaultState);
    expect(loaded).toStrictEqual(defaultState);
  });
});

describe('save backup', () => {
  it('first save does not create a backup', () => {
    saveState({ ...defaultState, lines: 10 });
    const backup = localStorage.getItem('vibe_coder_save_backup');
    expect(backup).toBeNull();
  });

  it('second save backs up previous primary save', () => {
    const first = { ...defaultState, lines: 10 };
    saveState(first);
    saveState({ ...defaultState, lines: 20 });
    const backup = localStorage.getItem('vibe_coder_save_backup');
    expect(backup).not.toBeNull();
    expect(JSON.parse(backup!).lines).toBe(10);
  });

  it('later saves update backup to previous primary', () => {
    saveState({ ...defaultState, lines: 10 });
    saveState({ ...defaultState, lines: 20 });
    saveState({ ...defaultState, lines: 30 });
    const backup = localStorage.getItem('vibe_coder_save_backup');
    expect(JSON.parse(backup!).lines).toBe(20);
  });

  it('debouncedSave backs up previous primary save', () => {
    vi.useFakeTimers();
    const first = { ...defaultState, lines: 10 };
    saveState(first);
    vi.advanceTimersByTime(0);
    expect(localStorage.getItem('vibe_coder_save_backup')).toBeNull();

    debouncedSave({ ...defaultState, lines: 20 });
    vi.advanceTimersByTime(200);

    const backup = localStorage.getItem('vibe_coder_save_backup');
    expect(backup).not.toBeNull();
    expect(JSON.parse(backup!).lines).toBe(10);
    vi.useRealTimers();
  });
});

describe('backup restore on load', () => {
  it('uses backup when primary is missing', () => {
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ lines: 50 }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(50);
  });

  it('uses backup when primary has broken JSON', () => {
    localStorage.setItem('vibe_coder_save', '{broken');
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ lines: 50 }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(50);
  });

  it('uses backup when primary is empty string', () => {
    localStorage.setItem('vibe_coder_save', '');
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ lines: 50 }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(50);
  });

  it('returns defaultState when both primary and backup are corrupted', () => {
    localStorage.setItem('vibe_coder_save', '{broken');
    localStorage.setItem('vibe_coder_save_backup', '{also broken');
    const loaded = loadState(defaultState);
    expect(loaded).toStrictEqual(defaultState);
  });

  it('valid primary ignores backup', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ lines: 100 }));
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ lines: 50 }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(100);
  });

  it('backup goes through migration', () => {
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ lines: 10, version: 0 }));
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(10);
    expect(loaded.version).toBe(1);
  });

  it('backup fields are validated', () => {
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ money: 'bad' }));
    const loaded = loadState(defaultState);
    expect(loaded.money).toBe(0);
  });
});
