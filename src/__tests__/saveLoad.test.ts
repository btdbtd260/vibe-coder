import { vi, describe, it, expect, beforeEach } from 'vitest';
import { defaultState } from '../types/game';
import { loadState, saveState } from '../hooks/useGameState';

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
});
