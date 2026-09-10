/**
 * Pure statistical helpers. No React, no I/O — trivially testable.
 */

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  let total = 0;
  for (const v of values) total += v;
  return total / values.length;
}

export function sum(values: number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/** Median of an *unsorted* array (does not mutate the input). */
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return quantileSorted(sorted, 0.5);
}

export function quantileSorted(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  const lower = sorted[base];
  const upper = sorted[base + 1];
  return upper === undefined ? lower : lower + rest * (upper - lower);
}

export function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const variance = values.reduce((acc, v) => acc + (v - avg) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export interface OutlierBounds {
  lower: number;
  upper: number;
  iqr: number;
  p25: number;
  p75: number;
}

export function outlierBounds(values: number[]): OutlierBounds {
  const sorted = [...values].sort((a, b) => a - b);
  const p25 = quantileSorted(sorted, 0.25);
  const p75 = quantileSorted(sorted, 0.75);
  const iqr = p75 - p25;
  return { p25, p75, iqr, lower: p25 - 1.5 * iqr, upper: p75 + 1.5 * iqr };
}

/** Pearson correlation coefficient; returns 0 when undefined. */
export function correlation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i += 1) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  const denom = Math.sqrt(dx * dy);
  return denom === 0 ? 0 : num / denom;
}

export interface LinearFit {
  slope: number;
  intercept: number;
  r2: number;
}

/** Ordinary least squares fit of y = slope·x + intercept. */
export function linearRegression(xs: number[], ys: number[]): LinearFit {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return { slope: 0, intercept: ys[0] ?? 0, r2: 0 };
  const mx = mean(xs.slice(0, n));
  const my = mean(ys.slice(0, n));
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - mx) * (ys[i] - my);
    den += (xs[i] - mx) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  let ssRes = 0;
  let ssTot = 0;
  for (let i = 0; i < n; i += 1) {
    const pred = slope * xs[i] + intercept;
    ssRes += (ys[i] - pred) ** 2;
    ssTot += (ys[i] - my) ** 2;
  }
  const r2 = ssTot === 0 ? 0 : Math.max(0, 1 - ssRes / ssTot);
  return { slope, intercept, r2 };
}

/** Simple moving average, edge-safe. */
export function movingAverage(values: number[], window: number): number[] {
  if (window <= 1) return [...values];
  const out: number[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const start = Math.max(0, i - window + 1);
    out.push(mean(values.slice(start, i + 1)));
  }
  return out;
}

/** Percentage change between two numbers, guarding division by zero. */
export function percentChange(from: number, to: number): number {
  if (from === 0) return to === 0 ? 0 : 100;
  return ((to - from) / Math.abs(from)) * 100;
}

/** Z-scores for anomaly detection. */
export function zScores(values: number[]): number[] {
  const avg = mean(values);
  const sd = stdDev(values);
  if (sd === 0) return values.map(() => 0);
  return values.map((v) => (v - avg) / sd);
}

/**
 * Compares the mean of the first and last third of a series.
 * Useful for "is this trending up or down" questions without a date column.
 */
export function trendSplit(values: number[]): { first: number; last: number; change: number } {
  if (values.length < 4) {
    const only = mean(values);
    return { first: only, last: only, change: 0 };
  }
  const third = Math.max(1, Math.floor(values.length / 3));
  const first = mean(values.slice(0, third));
  const last = mean(values.slice(-third));
  return { first, last, change: percentChange(first, last) };
}
