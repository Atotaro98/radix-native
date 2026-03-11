import { space, type SpaceToken, type MarginToken } from '../tokens/spacing'
import { scalingMap, type ScalingMode } from '../tokens/scaling'

/**
 * Returns the resolved pixel value for a SpaceToken or MarginToken with scaling applied.
 * Negative margin tokens return a negative pixel value using the absolute space scale.
 */
export function resolveSpace(token: MarginToken, scaling: ScalingMode): number {
  if (token === 0) return 0
  const sign = token < 0 ? -1 : 1
  const abs = Math.abs(token) as SpaceToken
  return sign * Math.round(space[abs] * scalingMap[scaling])
}
