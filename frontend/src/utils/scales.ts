export type Scale = {
  prefix: string;
  exponent: number;
};

export const IDENTITY: Scale = { prefix: "", exponent: 0 };
export const MILLI: Scale = { prefix: "m", exponent: -3 };
export const KILO: Scale = { prefix: "k", exponent: 3 };
export const MEGA: Scale = { prefix: "M", exponent: 6 };

/**
 * Convert a value from one scale to another.
 * output = value * 10^(storageScale - displayScale)
 */
export function convertScale(
  value: number,
  storageScale: Scale,
  displayScale: Scale,
): number {
  const exponentDiff = storageScale.exponent - displayScale.exponent;
  if (exponentDiff === 0) return value;
  return roundTo3(value * Math.pow(10, exponentDiff));
}

/**
 * Format a value stored at storageScale for display at displayScale,
 * appending the scaled unit label (e.g. "1.5 MW").
 * Returns "-" if value is undefined.
 */
export function formatScaled(
  value: number | undefined,
  unit: string,
  storageScale: Scale,
  displayScale: Scale = storageScale,
): string {
  if (value === undefined) return "-";
  const converted = convertScale(value, storageScale, displayScale);
  const rounded = roundTo3(converted);
  return `${rounded} ${displayScale.prefix}${unit}`;
}

export function roundTo3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
