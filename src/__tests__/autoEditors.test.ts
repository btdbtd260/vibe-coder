import { describe, it, expect } from 'vitest';
import type { GameState } from '../types/game';
import { defaultState, ED_LIMIT } from '../types/game';
import { autoBuyEditors } from '../utils/autoEditors';
import { fromNumber, toNum, BN_ZERO } from '../utils/BigNum';

const makeState = (overrides: Partial<GameState> = {}): GameState =>
  ({ ...defaultState, ...overrides });

describe('autoBuyEditors', () => {
  it('disabled returns unchanged copy', () => {
    const s = makeState({ autoEditors: { ...defaultState.autoEditors, enabled: false } });
    const result = autoBuyEditors(s);
    expect(result.money).toStrictEqual(s.money);
    expect(result.edOwned).toBe(0);
  });

  it('reserve percent blocks reserved money', () => {
    const s = makeState({ money: fromNumber(100), autoEditors: { ...defaultState.autoEditors, enabled: true, moneyReservePct: 100 } });
    const result = autoBuyEditors(s);
    expect(toNum(result.money)).toBe(100);
  });

  it('cheapest mode picks cheapest affordable source', () => {
    const s = makeState({
      edOwned: 5,
      money: fromNumber(100000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyCheapest: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(result.kbOwned).toBe(1);
  });

  it('priority mode uses ED before KB when affordable', () => {
    const s = makeState({
      money: fromNumber(100000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyCheapest: false, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(result.edOwned).toBe(1);
  });

  it('max mode buys multiple', () => {
    const s = makeState({
      money: fromNumber(100000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyMode: 'max', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(result.edOwned).toBeGreaterThan(1);
  });

  it('Flux can be selected and bought', () => {
    const s = makeState({
      edOwned: ED_LIMIT,
      kbOwned: 100,
      lintOwned: 100,
      money: fromNumber(50000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyCheapest: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(result.fluxOwned).toBe(1);
  });

  it('ED cap is respected', () => {
    const s = makeState({
      edOwned: ED_LIMIT,
      money: fromNumber(1000000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyCheapest: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(result.edOwned).toBe(ED_LIMIT);
    expect(result.kbOwned).toBe(1);
  });

  it('input state is not mutated', () => {
    const s = makeState({
      money: fromNumber(100000),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const before = { ...s, money: s.money };
    autoBuyEditors(s);
    expect(s.money).toStrictEqual(before.money);
    expect(s.edOwned).toBe(0);
  });

  it('spendable <= 0 does nothing', () => {
    const s = makeState({ money: fromNumber(0) });
    const result = autoBuyEditors(s);
    expect(result.money).toStrictEqual(BN_ZERO);
  });

  it('no affordable candidate does nothing', () => {
    const s = makeState({
      money: fromNumber(0.01),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(toNum(result.money)).toBeCloseTo(0.01, 4);
    expect(result.edOwned).toBe(0);
  });

  it('maxAffordable = 0 does nothing', () => {
    const s = makeState({
      money: fromNumber(0.05),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyMode: 'max', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(toNum(result.money)).toBeCloseTo(0.05, 4);
  });

  it('price above spendable does nothing', () => {
    const s = makeState({
      money: fromNumber(0.10),
      autoEditors: { ...defaultState.autoEditors, enabled: true, buyMode: '1x', moneyReservePct: 0 },
    });
    const result = autoBuyEditors(s);
    expect(toNum(result.money)).toBeCloseTo(0.10, 4);
  });
});
