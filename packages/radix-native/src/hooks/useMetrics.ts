import { useMemo } from 'react'
import { useThemeContext } from './useThemeContext'
import { resolveMetrics, type Metrics } from '../utils/metrics'
import type { RadiusToken } from '../tokens/radius'

export interface UseMetricsOptions {
  /** Radius token that overrides the Theme's (a component's `radius` prop). */
  radius?: RadiusToken
}

/**
 * Metrics bound to the current Theme: pixel lengths, space tokens and radius
 * with the Theme's scaling and radius factor applied, as in Radix.
 *
 * @example
 * const { px, space, radius } = useMetrics({ radius: radiusProp })
 * const height = px(32)                  // calc(32px * var(--scaling))
 * const gap = space(2)                   // var(--space-2)
 * const borderRadius = radius(2, 'pill') // max(var(--radius-2), var(--radius-full))
 */
export function useMetrics({ radius }: UseMetricsOptions = {}): Metrics {
  const theme = useThemeContext()
  const scaling = theme.scaling
  const token = radius ?? theme.radius
  return useMemo(() => resolveMetrics({ scaling, radius: token }), [scaling, token])
}
