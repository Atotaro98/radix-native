import type { MarginToken } from '../tokens/spacing'
import type { ScalingMode } from '../tokens/scaling'
import { resolveMetrics } from './metrics'

/**
 * Pixel value of a space or margin token with scaling applied; negative tokens give negative values.
 * @deprecated Use `useMetrics().space(token)`.
 */
export function resolveSpace(token: MarginToken, scaling: ScalingMode): number {
  return resolveMetrics({ scaling, radius: 'medium' }).space(token)
}
