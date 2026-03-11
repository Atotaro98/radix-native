export type RadiusToken = 'none' | 'small' | 'medium' | 'large' | 'full'

/** Radius level (1–6) — components choose the level that fits their visual size. */
export type RadiusLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * Base radius values in pixels at token='medium', scaling=1.
 * Final radius = BASE_RADIUS[level] * RADIUS_FACTOR[token]
 */
const BASE_RADIUS: Record<RadiusLevel, number> = {
  1: 3,
  2: 4,
  3: 6,
  4: 8,
  5: 12,
  6: 16,
}

/**
 * Multiplier per radius token.
 * none=0, small=0.75, medium=1, large=1.5, full=1.5
 */
const RADIUS_FACTOR: Record<RadiusToken, number> = {
  none: 0,
  small: 0.75,
  medium: 1,
  large: 1.5,
  full: 1.5,
}

/**
 * Pill radius per token. Only 'full' produces a pill shape (9999); all others are 0.
 */
const RADIUS_FULL: Record<RadiusToken, number> = {
  none: 0,
  small: 0,
  medium: 0,
  large: 0,
  full: 9999,
}

/**
 * Returns the border radius in pixels for a given token and level.
 * Each component picks the level that matches its visual size.
 */
export function getRadius(token: RadiusToken, level: RadiusLevel): number {
  return Math.round(BASE_RADIUS[level] * RADIUS_FACTOR[token])
}

/**
 * Returns the full (pill) radius for a given token.
 * Use this for components that should be fully rounded when token='full'.
 */
export function getFullRadius(token: RadiusToken): number {
  return RADIUS_FULL[token]
}
