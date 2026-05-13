/**
 * BigNum - arbitrary-precision non-negative floating point using { m, e } representation.
 *
 * Normalized form: m in [1, 10) or m === 0 (zero).
 * All operations include finite() guards and normalize after computation.
 * Fallback: BN_ZERO for NaN/Infinity/errors, BN_ONE for identity cases.
 */

export interface BigNum {
  readonly m: number;
  readonly e: number;
}

/** 0 represented as { m: 0, e: 0 } */
export const BN_ZERO: BigNum = Object.freeze({ m: 0, e: 0 });

/** 1 represented as { m: 1, e: 0 } */
export const BN_ONE: BigNum = Object.freeze({ m: 1, e: 0 });

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const finite = (n: number, def: number): number =>
  typeof n === 'number' && Number.isFinite(n) ? n : def;

function isZero(n: BigNum): boolean {
  return n.m === 0;
}

function normalize(n: { m: number; e: number }): BigNum {
  let { m, e } = n;
  if (m === 0 || !Number.isFinite(m) || !Number.isFinite(e)) return BN_ZERO;
  while (m >= 10) { m /= 10; e += 1; }
  while (m < 1 && m !== 0) { m *= 10; e -= 1; }
  m = finite(m, 0);
  e = finite(e, 0);
  if (m === 0) return BN_ZERO;
  if (m === 1 && e === 0) return BN_ONE;
  return { m, e };
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

export function fromNumber(n: number): BigNum {
  if (!Number.isFinite(n) || n <= 0) return BN_ZERO;
  const e = Math.floor(Math.log10(n));
  const m = n / Math.pow(10, e);
  return normalize({ m: finite(m, 0), e: finite(e, 0) });
}

// ---------------------------------------------------------------------------
// Arithmetic
// ---------------------------------------------------------------------------

export function add(a: BigNum, b: BigNum): BigNum {
  if (isZero(a)) return b;
  if (isZero(b)) return a;
  const expDiff = Math.abs(a.e - b.e);
  if (expDiff > 15) return a.e > b.e ? a : b;
  const minExp = Math.min(a.e, b.e);
  const aVal = a.m * Math.pow(10, a.e - minExp);
  const bVal = b.m * Math.pow(10, b.e - minExp);
  const sum = aVal + bVal;
  return fromNumber(finite(sum * Math.pow(10, minExp), 0));
}

export function sub(a: BigNum, b: BigNum): BigNum {
  if (isZero(b)) return a;
  if (gte(b, a)) return BN_ZERO;
  const minExp = Math.min(a.e, b.e);
  const aVal = a.m * Math.pow(10, a.e - minExp);
  const bVal = b.m * Math.pow(10, b.e - minExp);
  const diff = aVal - bVal;
  return fromNumber(finite(Math.max(0, diff) * Math.pow(10, minExp), 0));
}

export function mul(a: BigNum, b: BigNum): BigNum {
  if (isZero(a) || isZero(b)) return BN_ZERO;
  const m = a.m * b.m;
  const e = a.e + b.e;
  return normalize({ m: finite(m, 0), e: finite(e, 0) });
}

export function div(a: BigNum, b: BigNum): BigNum {
  if (isZero(b)) return BN_ZERO;
  if (isZero(a)) return BN_ZERO;
  const m = a.m / b.m;
  const e = a.e - b.e;
  return normalize({ m: finite(m, 0), e: finite(e, 0) });
}

/**
 * Compute base^exp as a BigNum.
 * base is a plain number (e.g. 1.12), exp is a non-negative integer.
 * Uses log-space computation so huge exponents (e.g. 1_000_000) never overflow.
 */
export function pow(base: number, exp: number): BigNum {
  if (!Number.isFinite(base) || !Number.isFinite(exp) || exp < 0) return BN_ZERO;
  if (exp === 0) return BN_ONE;
  if (base === 0) return BN_ZERO;
  const log10Result = Math.log10(base) * exp;
  const e = Math.floor(finite(log10Result, 0));
  const m = Math.pow(10, finite(log10Result - e, 0));
  return normalize({ m: finite(m, 0), e: finite(e, 0) });
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

export function lt(a: BigNum, b: BigNum): boolean {
  if (isZero(a) && isZero(b)) return false;
  if (isZero(a)) return !isZero(b);
  if (isZero(b)) return false;
  if (a.e !== b.e) return a.e < b.e;
  return a.m < b.m;
}

export function gt(a: BigNum, b: BigNum): boolean {
  if (isZero(a) && isZero(b)) return false;
  if (isZero(b)) return !isZero(a);
  if (isZero(a)) return false;
  if (a.e !== b.e) return a.e > b.e;
  return a.m > b.m;
}

export function gte(a: BigNum, b: BigNum): boolean {
  return !lt(a, b);
}

export function eq(a: BigNum, b: BigNum): boolean {
  if (isZero(a) && isZero(b)) return true;
  if (isZero(a) || isZero(b)) return false;
  return a.m === b.m && a.e === b.e;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function toString(n: BigNum): string {
  if (isZero(n)) return '0';
  if (n.e >= 0) {
    if (n.e < 15) return String(Math.round(n.m * Math.pow(10, n.e)));
    return n.m.toFixed(2) + 'e+' + n.e;
  }
  if (n.e > -6) return String(n.m * Math.pow(10, n.e));
  return n.m.toFixed(2) + 'e' + n.e;
}

// ---------------------------------------------------------------------------
// Integer floor
// ---------------------------------------------------------------------------

export function floor(n: BigNum): BigNum {
  if (isZero(n) || n.e < 0) return BN_ZERO;
  if (n.e >= 15) return n;
  const full = n.m * Math.pow(10, n.e);
  return fromNumber(Math.floor(finite(full, 0)));
}

/** Convert a BigNum to a plain JavaScript number (may lose precision for very large/small values) */
export function toNum(n: BigNum): number {
  if (n.m === 0) return 0;
  return n.m * Math.pow(10, n.e);
}
