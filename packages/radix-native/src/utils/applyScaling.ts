import type { ScalingMode } from '../tokens/scaling'
import { resolveMetrics } from './metrics'

/**
 * Applies the scaling multiplier to a base pixel value and rounds to the nearest integer.
 * @deprecated Use `useMetrics().px(value)`.
 */
export function applyScaling(value: number, scaling: ScalingMode): number {
  return resolveMetrics({ scaling, radius: 'medium' }).px(value)
}
