import { describe, it, expect } from "vitest";
import {
  BN_ZERO,
  BN_ONE,
  fromNumber,
  add,
  sub,
  mul,
  div,
  pow,
  lt,
  gt,
  gte,
  eq,
  toString,
  floor,
} from "../utils/BigNum";
describe('fromNumber', () => {
  it('zero becomes BN_ZERO', () => {
    const z = fromNumber(0);
    expect(z.m).toBe(0);
    expect(z.e).toBe(0);
    expect(z).toBe(BN_ZERO);
  });
  it('negative numbers become BN_ZERO', () => {
    expect(fromNumber(-5)).toBe(BN_ZERO);
    expect(fromNumber(-0.001)).toBe(BN_ZERO);
  });
  it('NaN becomes BN_ZERO', () => {
    expect(fromNumber(NaN)).toBe(BN_ZERO);
  });
  it('Infinity becomes BN_ZERO', () => {
    expect(fromNumber(Infinity)).toBe(BN_ZERO);
    expect(fromNumber(-Infinity)).toBe(BN_ZERO);
  });
  it('1 becomes BN_ONE', () => {
    const one = fromNumber(1);
    expect(one.m).toBe(1);
    expect(one.e).toBe(0);
    expect(one).toBe(BN_ONE);
  });
  it('10 becomes { m:1, e:1 }', () => {
    const n = fromNumber(10);
    expect(n.m).toBe(1);
    expect(n.e).toBe(1);
  });
  it('0.1 becomes { m:1, e:-1 }', () => {
    const n = fromNumber(0.1);
    expect(n.m).toBe(1);
    expect(n.e).toBe(-1);
  });
  it('255 becomes { m:2.55, e:2 }', () => {
    const n = fromNumber(255);
    expect(n.m).toBeCloseTo(2.55, 10);
    expect(n.e).toBe(2);
  });
  it('0.0035 becomes m=3.5, e=-3', () => {
    const n = fromNumber(0.0035);
    expect(n.m).toBeCloseTo(3.5, 10);
    expect(n.e).toBe(-3);
  });
  it('1000000 becomes { m:1, e:6 }', () => {
    const n = fromNumber(1_000_000);
    expect(n.m).toBe(1);
    expect(n.e).toBe(6);
  });
  it('1e100 becomes { m:1, e:100 }', () => {
    const n = fromNumber(1e100);
    expect(n.m).toBeCloseTo(1, 5);
    expect(n.e).toBe(100);
  });
  it('very small number becomes normalized', () => {
    const n = fromNumber(1e-50);
    expect(n.m).toBeCloseTo(1, 5);
    expect(n.e).toBe(-50);
  });
});
describe('add', () => {
  it('adding zero returns the other', () => {
    expect(add(BN_ZERO, BN_ONE)).toBe(BN_ONE);
    expect(add(BN_ONE, BN_ZERO)).toBe(BN_ONE);
  });
  it('adds two small BigNums', () => {
    const a = fromNumber(3);
    const b = fromNumber(4);
    const r = add(a, b);
    expect(r.m).toBeCloseTo(7, 10);
    expect(r.e).toBe(0);
  });
  it('adds numbers with same exponent', () => {
    const a = fromNumber(500);
    const b = fromNumber(300);
    const r = add(a, b);
    expect(r.m).toBeCloseTo(8, 10);
    expect(r.e).toBe(2);
  });
  it('adds numbers with different exponents', () => {
    const a = fromNumber(5000);
    const b = fromNumber(3);
    const r = add(a, b);
    expect(r.m).toBeCloseTo(5.003, 5);
    expect(r.e).toBe(3);
  });
  it('negligible second operand is ignored (exp diff > 15)', () => {
    const a = fromNumber(1e100);
    const b = fromNumber(1);
    const r = add(a, b);
    expect(eq(r, a)).toBe(true);
  });
  it('handles fractional addition', () => {
    const a = fromNumber(1.5);
    const b = fromNumber(2.5);
    const r = add(a, b);
    expect(r.m).toBeCloseTo(4, 10);
    expect(r.e).toBe(0);
  });
  it('add produces normalized result', () => {
    const a = fromNumber(9.9);
    const b = fromNumber(0.2);
    const r = add(a, b);
    expect(r.m).toBeCloseTo(1.01, 5);
    expect(r.e).toBe(1);
  });
});
describe('sub', () => {
  it('subtracting zero returns a', () => {
    const a = fromNumber(42);
    expect(eq(sub(a, BN_ZERO), a)).toBe(true);
  });
  it('subtracts equal values gives zero', () => {
    const a = fromNumber(100);
    expect(sub(a, a)).toBe(BN_ZERO);
  });
  it('subtracts smaller from larger', () => {
    const a = fromNumber(100);
    const b = fromNumber(30);
    const r = sub(a, b);
    expect(r.m).toBeCloseTo(7, 10);
    expect(r.e).toBe(1);
  });
  it('returns zero when b > a', () => {
    const a = fromNumber(30);
    const b = fromNumber(100);
    expect(sub(a, b)).toBe(BN_ZERO);
  });
  it('handles fractional subtraction', () => {
    const a = fromNumber(5.5);
    const b = fromNumber(2.2);
    const r = sub(a, b);
    expect(r.m).toBeCloseTo(3.3, 5);
    expect(r.e).toBe(0);
  });
  it('produces normalized result after borrow', () => {
    const a = fromNumber(1000);
    const b = fromNumber(1);
    const r = sub(a, b);
    expect(r.m).toBeCloseTo(9.99, 5);
    expect(r.e).toBe(2);
  });
});
describe('mul', () => {
  it('multiplying by zero gives zero', () => {
    expect(mul(BN_ZERO, fromNumber(100))).toBe(BN_ZERO);
    expect(mul(fromNumber(100), BN_ZERO)).toBe(BN_ZERO);
  });
  it('multiplying by one gives a', () => {
    const a = fromNumber(42);
    expect(eq(mul(a, BN_ONE), a)).toBe(true);
    expect(eq(mul(BN_ONE, a), a)).toBe(true);
  });
  it('multiplies two BigNums', () => {
    const a = fromNumber(5);
    const b = fromNumber(3);
    const r = mul(a, b);
    expect(r.m).toBeCloseTo(1.5, 10);
    expect(r.e).toBe(1);
  });
  it('multiplies large numbers', () => {
    const a = fromNumber(1e50);
    const b = fromNumber(2e30);
    const r = mul(a, b);
    expect(r.m).toBeCloseTo(2, 5);
    expect(r.e).toBe(80);
  });
  it('multiplies very large numbers', () => {
    const a = fromNumber(1e200);
    const b = fromNumber(1e200);
    const r = mul(a, b);
    expect(r.m).toBeCloseTo(1, 5);
    expect(r.e).toBe(400);
  });
  it('multiplies fractional', () => {
    const a = fromNumber(0.5);
    const b = fromNumber(6);
    const r = mul(a, b);
    expect(r.m).toBeCloseTo(3, 10);
    expect(r.e).toBe(0);
  });
  it('normalizes mantissa overflow', () => {
    const a = fromNumber(5);
    const b = fromNumber(4);
    const r = mul(a, b);
    expect(r.m).toBeCloseTo(2, 10);
    expect(r.e).toBe(1);
  });
});
describe('div', () => {
  it('division by zero gives zero', () => {
    expect(div(BN_ONE, BN_ZERO)).toBe(BN_ZERO);
  });
  it('zero divided by any gives zero', () => {
    expect(div(BN_ZERO, fromNumber(42))).toBe(BN_ZERO);
  });
  it('divides two BigNums', () => {
    const a = fromNumber(10);
    const b = fromNumber(2);
    const r = div(a, b);
    expect(r.m).toBeCloseTo(5, 10);
    expect(r.e).toBe(0);
  });
  it('divides large numbers', () => {
    const a = fromNumber(1e60);
    const b = fromNumber(2e30);
    const r = div(a, b);
    expect(r.m).toBeCloseTo(5, 5);
    expect(r.e).toBe(29);
  });
  it('divides fractional', () => {
    const a = fromNumber(1);
    const b = fromNumber(3);
    const r = div(a, b);
    expect(r.m).toBeCloseTo(3.333, 3);
    expect(r.e).toBe(-1);
  });
  it('normalizes mantissa underflow', () => {
    const a = fromNumber(2);
    const b = fromNumber(8);
    const r = div(a, b);
    expect(r.m).toBeCloseTo(2.5, 10);
    expect(r.e).toBe(-1);
  });
});
describe('pow', () => {
  it('base^0 = 1', () => {
    const r = pow(42, 0);
    expect(eq(r, BN_ONE)).toBe(true);
  });
  it('0^positive = 0', () => {
    expect(pow(0, 5)).toBe(BN_ZERO);
  });
  it('negative exponent returns zero', () => {
    expect(pow(2, -1)).toBe(BN_ZERO);
  });
  it('computes 10^6', () => {
    const r = pow(10, 6);
    expect(r.m).toBeCloseTo(1, 10);
    expect(r.e).toBe(6);
  });
  it('computes 2^10 = 1024', () => {
    const r = pow(2, 10);
    expect(r.m).toBeCloseTo(1.024, 3);
    expect(r.e).toBe(3);
  });
  it('computes 1.12^100', () => {
    const r = pow(1.12, 100);
    expect(r.e).toBeGreaterThanOrEqual(4);
    expect(r.e).toBeLessThanOrEqual(5);
    expect(r.m).toBeGreaterThan(1);
    expect(r.m).toBeLessThan(10);
  });
  it('computes 1.12^1000000 (huge exponent, should not overflow)', () => {
    const r = pow(1.12, 1_000_000);
    expect(r.e).toBe(49218);
    expect(r.m).toBeGreaterThan(1);
    expect(r.m).toBeLessThan(10);
  });
  it('NaN base returns zero', () => {
    expect(pow(NaN, 5)).toBe(BN_ZERO);
  });
  it('NaN exponent returns zero', () => {
    expect(pow(5, NaN)).toBe(BN_ZERO);
  });
});
describe('comparison operators', () => {
  it('lt: zero < positive', () => {
    expect(lt(BN_ZERO, BN_ONE)).toBe(true);
  });
  it('lt: positive < zero is false', () => {
    expect(lt(BN_ONE, BN_ZERO)).toBe(false);
  });
  it('lt: zero < zero is false', () => {
    expect(lt(BN_ZERO, BN_ZERO)).toBe(false);
  });
  it('lt: lower exponent is smaller', () => {
    expect(lt(fromNumber(999), fromNumber(1000))).toBe(true);
  });
  it('lt: same exponent, smaller mantissa', () => {
    expect(lt(fromNumber(100), fromNumber(200))).toBe(true);
  });
  it('gt: positive > zero', () => {
    expect(gt(BN_ONE, BN_ZERO)).toBe(true);
  });
  it('gt: zero > positive is false', () => {
    expect(gt(BN_ZERO, BN_ONE)).toBe(false);
  });
  it('gt: larger exponent is bigger', () => {
    expect(gt(fromNumber(1e10), fromNumber(9e9))).toBe(true);
  });
  it('gte: equal values', () => {
    const a = fromNumber(42);
    expect(gte(a, a)).toBe(true);
  });
  it('gte: larger >= smaller', () => {
    expect(gte(fromNumber(100), fromNumber(50))).toBe(true);
  });
  it('gte: smaller >= larger is false', () => {
    expect(gte(fromNumber(50), fromNumber(100))).toBe(false);
  });
  it('eq: same value returns true', () => {
    expect(eq(fromNumber(42), fromNumber(42))).toBe(true);
  });
  it('eq: different values returns false', () => {
    expect(eq(fromNumber(42), fromNumber(43))).toBe(false);
  });
  it('eq: zero and zero', () => {
    expect(eq(BN_ZERO, BN_ZERO)).toBe(true);
    expect(eq(BN_ZERO, fromNumber(0))).toBe(true);
  });
});
describe('toString', () => {
  it('zero displays as 0', () => {
    expect(toString(BN_ZERO)).toBe('0');
  });
  it('small integer displays without exponent', () => {
    expect(toString(fromNumber(42))).toBe('42');
  });
  it('medium integer displays without exponent', () => {
    expect(toString(fromNumber(1234567))).toBe('1234567');
  });
  it('large number uses scientific notation', () => {
    const n = fromNumber(1e20);
    const s = toString(n);
    expect(s).toMatch(/^1.00e\+20$/);
  });
  it('very large number uses scientific notation', () => {
    const n = fromNumber(5.5e100);
    const s = toString(n);
    expect(s).toMatch(/^5.50e\+100$/);
  });
  it('small fraction displays as decimal', () => {
    expect(toString(fromNumber(0.5))).toBe('0.5');
  });
  it('very small fraction uses scientific notation', () => {
    const n = fromNumber(1e-10);
    const s = toString(n);
    expect(s).toMatch(/^1.00e-10$/);
  });
});
describe('floor', () => {
  it('floor of zero is zero', () => {
    expect(floor(BN_ZERO)).toBe(BN_ZERO);
  });
  it('floor of positive integer is itself', () => {
    const n = fromNumber(42);
    expect(eq(floor(n), n)).toBe(true);
  });
  it('floor of fractional value', () => {
    const n = fromNumber(3.7);
    const f = floor(n);
    expect(f.m).toBeCloseTo(3, 10);
    expect(f.e).toBe(0);
  });
  it('floor of value < 1 is zero', () => {
    expect(floor(fromNumber(0.5))).toBe(BN_ZERO);
    expect(floor(fromNumber(0.001))).toBe(BN_ZERO);
  });
  it('floor of large integer is itself', () => {
    const n = fromNumber(1e10);
    expect(eq(floor(n), n)).toBe(true);
  });
  it('floor of large fractional value', () => {
    const n = fromNumber(1.234e6);
    const f = floor(n);
    expect(f.m).toBeCloseTo(1.234, 5);
    expect(f.e).toBe(6);
  });
});
describe('BN constants', () => {
  it('BN_ZERO is frozen/immutable', () => {
    expect(Object.isFrozen(BN_ZERO)).toBe(true);
  });
  it('BN_ONE is frozen/immutable', () => {
    expect(Object.isFrozen(BN_ONE)).toBe(true);
  });
});
