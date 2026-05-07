import { vi, describe, it, expect, beforeEach } from 'vitest';
import { defaultState } from '../types/game';
import { loadState, saveState, debouncedSave, serializeState, deserializeState, getLastOfflineGains } from '../hooks/useGameState';
import { CURRENT_SAVE_VERSION } from '../utils/migrations';
import { computeOfflineProgress } from '../utils/offlineProgress';

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
    const mutated = { ...defaultState, lines: 42, money: 999, version: CURRENT_SAVE_VERSION };
    saveState(mutated);
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(42);
    expect(loaded.money).toBe(999);
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
    expect(loaded.lastSavedAt).toBeGreaterThan(0);
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

  it('default loaded state includes current version', () => {
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('saved/loaded state preserves current version', () => {
    const mutated = { ...defaultState, lines: 50 };
    saveState(mutated);
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('old save with no version loads as current version', () => {
    const oldData = { lines: 100, money: 50 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(oldData));
    const loaded = loadState(defaultState);
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
    expect(loaded.lines).toBe(100);
    expect(loaded.money).toBe(50);
  });

  it('default loaded state includes lastSavedAt 0', () => {
    const loaded = loadState(defaultState);
    expect(loaded.lastSavedAt).toBe(0);
  });

  it('old save without lastSavedAt loads with lastSavedAt 0', () => {
    const oldData = { lines: 100 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(oldData));
    const loaded = loadState(defaultState);
    expect(loaded.lastSavedAt).toBe(0);
    expect(loaded.lines).toBe(100);
  });

  it('invalid lastSavedAt falls back to 0', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ lastSavedAt: -5 }));
    const loaded = loadState(defaultState);
    expect(loaded.lastSavedAt).toBe(0);
  });

  it('valid lastSavedAt in stored data is used for offline then stamped to now', () => {
    localStorage.setItem('vibe_coder_save', JSON.stringify({ lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 }));
    const loaded = loadState(defaultState, 6000);
    expect(loaded.lastSavedAt).toBe(6000);
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
    expect(loaded.lines).toBe(0);
    expect(loaded.money).toBe(0);
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
    expect(loaded.lastSavedAt).toBeGreaterThan(0);
  });

  it('saveState stamps lastSavedAt with Date.now()', () => {
    const before = Date.now();
    saveState({ ...defaultState, lines: 5 });
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(5);
    expect(loaded.lastSavedAt).toBeGreaterThanOrEqual(before);
    expect(loaded.lastSavedAt).toBeLessThanOrEqual(Date.now());
  });

  it('debouncedSave stamps lastSavedAt with Date.now()', () => {
    vi.useFakeTimers();
    const before = Date.now();
    debouncedSave({ ...defaultState, lines: 10 });
    vi.advanceTimersByTime(200);
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(10);
    expect(loaded.lastSavedAt).toBeGreaterThanOrEqual(before);
    vi.useRealTimers();
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
    expect(loaded.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('backup fields are validated', () => {
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify({ money: 'bad' }));
    const loaded = loadState(defaultState);
    expect(loaded.money).toBe(0);
  });
});

describe('export/import', () => {
  it('serializeState produces valid JSON', () => {
    const json = serializeState(defaultState);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('serializeState includes version field', () => {
    const json = serializeState(defaultState);
    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(CURRENT_SAVE_VERSION);
  });

  it('deserializeState roundtrips mutated state', () => {
    const mutated = { ...defaultState, lines: 42, money: 999 };
    const json = serializeState(mutated);
    const result = deserializeState(json, defaultState);
    expect(result).not.toBeNull();
    expect(result!.lines).toBe(42);
    expect(result!.money).toBe(999);
  });

  it('rejects non-JSON string', () => {
    expect(deserializeState('not json', defaultState)).toBeNull();
  });

  it('rejects JSON array', () => {
    expect(deserializeState('[1,2,3]', defaultState)).toBeNull();
  });

  it('rejects null JSON', () => {
    expect(deserializeState('null', defaultState)).toBeNull();
  });

  it('rejects future version', () => {
    const future = { ...defaultState, version: CURRENT_SAVE_VERSION + 1 };
    const json = serializeState(future as any);
    expect(deserializeState(json, defaultState)).toBeNull();
  });

  it('sanitizes bad fields', () => {
    const json = JSON.stringify({ money: 'bad' });
    const result = deserializeState(json, defaultState);
    expect(result).not.toBeNull();
    expect(result!.money).toBe(0);
  });

  it('deserialized state can be saved and loaded', () => {
    const mutated = { ...defaultState, lines: 77 };
    const json = serializeState(mutated);
    const result = deserializeState(json, defaultState);
    expect(result).not.toBeNull();
    saveState(result!);
    const loaded = loadState(defaultState);
    expect(loaded.lines).toBe(77);
  });
});

describe('offline progress on load', () => {
  it('lastSavedAt > 0 applies offline gains', () => {
    const saved = { ...defaultState, lastSavedAt: 0, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 5000);
    const expected = computeOfflineProgress(saved, 5000);
    expect(loaded.lines).toBe(expected.lines);
    expect(loaded.money).toBeCloseTo(expected.money, 1);
  });

  it('lastSavedAt = 0 skips offline gains', () => {
    const saved = { ...defaultState, lastSavedAt: 0, lintOwned: 10, lintMilestoneBoost: 2, lines: 42 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 5000);
    expect(loaded.lines).toBe(42);
    expect(loaded.lastSavedAt).toBe(0);
  });

  it('lastSavedAt stamped to provided now after load', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 6000);
    expect(loaded.lastSavedAt).toBe(6000);
  });

  it('backup restore also applies offline gains', () => {
    localStorage.removeItem('vibe_coder_save');
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify(saved));
    const loaded = loadState(defaultState, 7000);
    const expected = computeOfflineProgress(saved, 6000);
    expect(loaded.lines).toBe(expected.lines);
    expect(loaded.lastSavedAt).toBe(7000);
  });

  it('empty storage returns defaultState unchanged', () => {
    localStorage.clear();
    const loaded = loadState(defaultState, 50000);
    expect(loaded).toStrictEqual(defaultState);
    expect(loaded.lastSavedAt).toBe(0);
  });

  it('24h cap enforced through load', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 100_000_000_000);
    const expected = computeOfflineProgress(saved, 86_400_000);
    expect(loaded.lines).toBe(expected.lines);
    expect(loaded.money).toBeCloseTo(expected.money, 1);
  });

  it('old save without offlineProgressEnabled defaults to true', () => {
    const saved = { ...defaultState, offlineProgressEnabled: undefined as any };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState);
    expect(loaded.offlineProgressEnabled).toBe(true);
  });

  it('non-boolean offlineProgressEnabled falls back to true', () => {
    const saved = { ...defaultState, offlineProgressEnabled: 'yes' as any };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState);
    expect(loaded.offlineProgressEnabled).toBe(true);
  });

  it('disabled skips offline gains but stamps lastSavedAt', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, offlineProgressEnabled: false, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 6000);
    expect(loaded.lines).toBe(0);
    expect(loaded.lastSavedAt).toBe(6000);
  });

  it('enabled still applies offline gains', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, offlineProgressEnabled: true, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    const loaded = loadState(defaultState, 6000);
    const expected = computeOfflineProgress(saved, 5000);
    expect(loaded.lines).toBe(expected.lines);
    expect(loaded.money).toBeCloseTo(expected.money, 1);
  });

  it('toggle false survives save/load roundtrip', () => {
    const saved = { ...defaultState, offlineProgressEnabled: false };
    saveState(saved);
    const loaded = loadState(defaultState);
    expect(loaded.offlineProgressEnabled).toBe(false);
  });
});

describe('offline gains capture', () => {
  it('captures positive gains when enabled and lastSavedAt > 0', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    loadState(defaultState, 6000);
    const gains = getLastOfflineGains();
    expect(gains).not.toBeNull();
    expect(gains!.gainedLines).toBeGreaterThan(0);
    expect(gains!.gainedMoney).toBeGreaterThan(0);
    expect(gains!.elapsedMs).toBe(5000);
  });

  it('returns null when offline progress is disabled', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, offlineProgressEnabled: false, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    loadState(defaultState, 6000);
    expect(getLastOfflineGains()).toBeNull();
  });

  it('returns null when lastSavedAt is 0', () => {
    const saved = { ...defaultState, lastSavedAt: 0 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    loadState(defaultState, 6000);
    expect(getLastOfflineGains()).toBeNull();
  });

  it('second call to getLastOfflineGains returns null', () => {
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    loadState(defaultState, 6000);
    expect(getLastOfflineGains()).not.toBeNull();
    expect(getLastOfflineGains()).toBeNull();
  });

  it('backup restore captures gains', () => {
    localStorage.removeItem('vibe_coder_save');
    const saved = { ...defaultState, lastSavedAt: 1000, lintOwned: 10, lintMilestoneBoost: 2 };
    localStorage.setItem('vibe_coder_save_backup', JSON.stringify(saved));
    loadState(defaultState, 6000);
    const gains = getLastOfflineGains();
    expect(gains).not.toBeNull();
    expect(gains!.gainedLines).toBeGreaterThan(0);
  });

  it('returns null when elapsed time yields zero gains', () => {
    const saved = { ...defaultState, lastSavedAt: 5000 };
    localStorage.setItem('vibe_coder_save', JSON.stringify(saved));
    loadState(defaultState, 5000);
    expect(getLastOfflineGains()).toBeNull();
  });
});

describe('onboardingSeen', () => {
  it('default onboardingSeen is false', () => {
    expect(defaultState.onboardingSeen).toBe(false);
  });

  it('migration v3 sets onboardingSeen true', () => {
    const v3Save = { ...defaultState, version: 3, onboardingSeen: undefined as any };
    localStorage.setItem('vibe_coder_save', JSON.stringify(v3Save));
    const loaded = loadState(defaultState);
    expect(loaded.onboardingSeen).toBe(true);
  });

  it('onboardingSeen roundtrips', () => {
    const withFalse = { ...defaultState, onboardingSeen: false };
    saveState(withFalse);
    const loadedFalse = loadState(defaultState);
    expect(loadedFalse.onboardingSeen).toBe(false);

    const withTrue = { ...defaultState, onboardingSeen: true };
    saveState(withTrue);
    const loadedTrue = loadState(defaultState);
    expect(loadedTrue.onboardingSeen).toBe(true);
  });
});
