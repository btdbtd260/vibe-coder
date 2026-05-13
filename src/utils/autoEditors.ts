import type { GameState } from '../types/game';
import { ED_LIMIT } from '../types/game';
import { cost, totalCost, fluxCost, totalFluxCost, maxAffordable, maxAffordableFlux } from './math';
import { BN_ZERO, mul, sub, fromNumber, gte, lt, gt, eq, type BigNum } from './BigNum';

export function autoBuyEditors(s: Readonly<GameState>): GameState {
  const ae = s.autoEditors;
  if (!ae.enabled) return { ...s };

  const spendable = mul(s.money, fromNumber(1 - ae.moneyReservePct / 100));
  if (eq(spendable, BN_ZERO)) return { ...s };

  const edUnitCost = s.edOwned >= ED_LIMIT ? null : cost(1, s.edOwned, s.masteryCloudCredit, s.fluxOwned);
  const kbUnitCost = cost(5, s.kbOwned, s.masteryCloudCredit, s.fluxOwned);
  const lintUnitCost = cost(20, s.lintOwned, s.masteryCloudCredit, s.fluxOwned);
  const fluxUnitCost = fluxCost(s.fluxOwned);

  const candidates: { key: keyof GameState; unitCost: BigNum | null; owned: number; base: number; limit: number | null; isFlux: boolean }[] = [
    { key: 'edOwned', unitCost: edUnitCost, owned: s.edOwned, base: 1, limit: ED_LIMIT, isFlux: false },
    { key: 'kbOwned', unitCost: kbUnitCost, owned: s.kbOwned, base: 5, limit: null, isFlux: false },
    { key: 'lintOwned', unitCost: lintUnitCost, owned: s.lintOwned, base: 20, limit: null, isFlux: false },
    { key: 'fluxOwned', unitCost: fluxUnitCost, owned: s.fluxOwned, base: 0, limit: null, isFlux: true },
  ];

  const affordable = candidates.filter(
    c => c.unitCost !== null && gte(spendable, c.unitCost) && (c.limit === null || c.owned < c.limit),
  );
  if (affordable.length === 0) return { ...s };

  const pick = ae.buyCheapest
    ? affordable.reduce((a, b) => (lt(a.unitCost!, b.unitCost!) ? a : b))
    : affordable[0];

  const count = ae.buyMode === 'max'
    ? (pick.isFlux ? maxAffordableFlux(pick.owned, spendable) : Math.min(maxAffordable(pick.base, pick.owned, spendable, pick.limit, s.fluxOwned), 10000))
    : 1;

  if (count <= 0) return { ...s };

  const price = pick.isFlux ? totalFluxCost(pick.owned, count) : totalCost(pick.base, pick.owned, count, s.masteryCloudCredit, s.fluxOwned);
  if (gt(price, spendable)) return { ...s };

  return { ...s, money: sub(s.money, price), [pick.key]: (s[pick.key] as number) + count };
}
