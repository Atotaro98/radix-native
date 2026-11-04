export type RadiusToken = 'none' | 'small' | 'medium' | 'large' | 'full'

/** Radius level (1–6) — components choose the level that fits their visual size. */
export type RadiusLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Base radius per level in pixels (Radix `--radius-N: calc(Npx * var(--scaling) * var(--radius-factor))`).
 * Resolve through Metrics (`useMetrics().radius(level)`), which applies the factor and scaling.
 */
export const RADIUS_BASE: Record<RadiusLevel, number> = {
  1: 3,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
}

/** Radix `--radius-factor` per token. */
export const RADIUS_FACTOR: Record<RadiusToken, number> = {
  none: 0,
  small: 0.75,
  medium: 1,
  large: 1.5,
  full: 1.5,
}

/** Radix `--radius-full`: a pill only for `full`. Not scaled. */
export const RADIUS_FULL: Record<RadiusToken, number> = {
  none: 0,
  small: 0,
  medium: 0,
  large: 0,
  full: 9999,
}

/** Radix `--radius-thumb`: a pill for medium/large/full, nearly square otherwise. Not scaled. */
export const RADIUS_THUMB: Record<RadiusToken, number> = {
  none: 0.5,
  small: 0.5,
  medium: 9999,
  large: 9999,
  full: 9999,
}

/**
 * Border radius for a token and level, at 100% scaling.
 * @deprecated Ignores the Theme's scaling. Use `useMetrics().radius(level)`.
 */
export function getRadius(token: RadiusToken, level: RadiusLevel): number {
  return Math.round(RADIUS_BASE[level] * RADIUS_FACTOR[token])
}

/**
 * Pill radius for a token (9999 for `full`, otherwise 0).
 * @deprecated Use `useMetrics().radius(level, 'pill')`.
 */
export function getFullRadius(token: RadiusToken): number {
  return RADIUS_FULL[token]
}

/**
 * Thumb radius for a token (9999 for medium/large/full, otherwise 0.5).
 * @deprecated Use `useMetrics().radius(level, 'thumb')`, or `useMetrics().radiusThumb`.
 */
export function getRadiusThumb(token: RadiusToken): number {
  return RADIUS_THUMB[token]
}
