import { space as SPACE, type MarginToken, type SpaceToken } from '../tokens/spacing'
import { scalingMap, type ScalingMode } from '../tokens/scaling'
import {
  RADIUS_BASE,
  RADIUS_FACTOR,
  RADIUS_FULL,
  RADIUS_THUMB,
  type RadiusLevel,
  type RadiusToken,
} from '../tokens/radius'

/**
 * The radius shapes Radix uses:
 * - `'box'`: `var(--radius-N)` (Card, TextArea, Checkbox…)
 * - `'pill'`: `max(var(--radius-N), var(--radius-full))` (Button, Badge, Avatar, TextField)
 * - `'thumb'`: `max(var(--radius-N), var(--radius-thumb))` (Switch)
 */
export type RadiusShape = 'box' | 'pill' | 'thumb'

export interface MetricsInput {
  scaling: ScalingMode
  radius: RadiusToken
}

/**
 * Metrics: the pixel values a component derives from the Theme, with scaling
 * and the radius factor applied the way Radix applies them.
 */
export interface Metrics {
  /** A pixel length scaled by the Theme (Radix `calc(Npx * var(--scaling))`), rounded. */
  px(value: number): number
  /** A space token in pixels (Radix `var(--space-N)`), rounded; negative tokens give negative values. */
  space(token: MarginToken): number
  /** Radix `--radius-N` in the given shape. */
  radius(level: RadiusLevel, shape?: RadiusShape): number
  /** Raw Radix `--scaling`, for `calc()` formulas that px / space don't cover. */
  scaling: number
  /** Raw Radix `--radius-factor`, for `calc()` formulas relative to the text size or the height. */
  radiusFactor: number
  /** Raw Radix `--radius-thumb`. */
  radiusThumb: number
}

/** Pure Metrics for a scaling and a radius token. `useMetrics` binds it to the Theme. */
export function resolveMetrics({ scaling: scalingMode, radius: token }: MetricsInput): Metrics {
  const scaling = scalingMap[scalingMode]
  const radiusFactor = RADIUS_FACTOR[token]
  const radiusThumb = RADIUS_THUMB[token]

  const px = (value: number) => Math.round(value * scaling)

  return {
    px,
    space(tokenValue) {
      if (tokenValue === 0) return 0
      const sign = tokenValue < 0 ? -1 : 1
      return sign * px(SPACE[Math.abs(tokenValue) as SpaceToken])
    },
    radius(level, shape = 'box') {
      const base = Math.round(RADIUS_BASE[level] * radiusFactor)
      if (shape === 'pill') return Math.max(base, RADIUS_FULL[token])
      if (shape === 'thumb') return Math.max(base, radiusThumb)
      return base
    },
    scaling,
    radiusFactor,
    radiusThumb,
  }
}
