import { describe, it, expect } from 'vitest';
import type { GameState } from '../types/game';
import { defaultState } from '../types/game';
import { autoBuyUpgrades } from '../utils/autoUpgrades';
import { availableLevels } from '../utils/math';

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({ ...defaultState, ...overrides });

describe('autoBuyUpgrades', () => {
  it('disabled returns unchanged copy', () => {
    const s = makeState({ autoUpgrades: { ...defaultState.autoUpgrades, enabled: false } });
    const result = autoBuyUpgrades(s);
    expect(result.money).toBe(s.money);
    expect(result.perkEdTier).toBe(0);
  });

  it('money reserve blocks money upgrade', () => {
    const s = makeState({
      edOwned: 3,
      money: 600,
      autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 100 },
    });
    const result = autoBuyUpgrades(s);
    expect(result.perkEdTier).toBe(0);
  });

  it('vibe reserve blocks mastery upgrade', () => {
    const s = makeState({
      vibeLevel: 2,
      spentLevels: 0,
      autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, vibeReservePct: 100 },
    });
    const result = autoBuyUpgrades(s);
    expect(result.masteryFocusScroll).toBeFalsy();
  });

  it('cheapest mode buys cheapest affordable upgrade', () => {
    const s = makeState({
      edOwned: 3,
      money: 600,
      vibeLevel: 2,
      autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: true, moneyReservePct: 0, vibeReservePct: 0 },
    });
    const result = autoBuyUpgrades(s);
    const lvl = availableLevels(result);
    expect(lvl).toBe(1);
  });

  it('priority mode buys first eligible priority candidate', () => {
    const s = makeState({
      edOwned: 3,
      money: 600,
      vibeLevel: 2,
      autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: false, moneyReservePct: 0, vibeReservePct: 0 },
    });
    const result = autoBuyUpgrades(s);
    expect(result.perkEdTier).toBe(1);
  });

  it('buys ED perk tier 1', () => {
    const s = makeState({ edOwned: 3, money: 600, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkEdTier).toBe(1);
    expect(result.money).toBe(100);
  });

  it('buys ED perk tier 2', () => {
    const s = makeState({ edOwned: 5, perkEdTier: 1, money: 2500, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: false, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkEdTier).toBe(2);
    expect(result.money).toBe(500);
  });

  it('buys KB perk tier', () => {
    const s = makeState({ kbOwned: 10, money: 6000, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkKbTier).toBe(1);
    expect(result.money).toBe(1000);
  });

  it('buys Lint perk tier', () => {
    const s = makeState({ lintOwned: 10, money: 6000, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkLintTier).toBe(1);
    expect(result.money).toBe(1000);
  });

  it('buys Energy Flux', () => {
    const s = makeState({ edOwned: 5, money: 200, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.fluxOwned).toBe(1);
  });

  it('buys Flux perk tier', () => {
    const s = makeState({ fluxOwned: 25, money: 15000, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkFluxTier).toBe(1);
    expect(result.money).toBe(5000);
  });

  it('buys a mastery', () => {
    const s = makeState({ vibeLevel: 2, spentLevels: 0, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: false, vibeReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.masteryMultiThreaded).toBe(true);
    expect(result.spentLevels).toBe(2);
  });

  it('skips already-owned mastery', () => {
    const s = makeState({ vibeLevel: 6, spentLevels: 0, masteryMultiThreaded: true, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: false, vibeReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.masteryMultiThreaded).toBe(true);
    expect(result.masteryAlgorithm).toBe(true);
    expect(result.spentLevels).toBe(5);
  });

  it('skips unmet prerequisites', () => {
    const s = makeState({ edOwned: 2, money: 600, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    expect(result.perkEdTier).toBe(0);
  });

  it('buys exactly one upgrade per call', () => {
    const s = makeState({ edOwned: 3, money: 600, vibeLevel: 2, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, buyCheapest: false, moneyReservePct: 0, vibeReservePct: 0 } });
    const result = autoBuyUpgrades(s);
    let changes = 0;
    if (result.perkEdTier !== s.perkEdTier) changes++;
    if (result.masteryFocusScroll !== s.masteryFocusScroll) changes++;
    if (result.money !== s.money) changes++;
    if (result.spentLevels !== s.spentLevels) changes++;
    expect(changes).toBeLessThanOrEqual(2);
  });

  it('does not mutate input state', () => {
    const s = makeState({ edOwned: 3, money: 600, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true, moneyReservePct: 0 } });
    const before = { money: s.money, perkEdTier: s.perkEdTier };
    autoBuyUpgrades(s);
    expect(s.money).toBe(before.money);
    expect(s.perkEdTier).toBe(before.perkEdTier);
  });

  it('no candidates returns unchanged copy', () => {
    const s = makeState({ money: 0, vibeLevel: 0, autoUpgrades: { ...defaultState.autoUpgrades, enabled: true } });
    const result = autoBuyUpgrades(s);
    expect(result.money).toBe(0);
  });
});
