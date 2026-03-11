import { scalingMap, type ScalingMode } from '../tokens/scaling'

/** Applies the scaling multiplier to a base pixel value and rounds to nearest integer. */
export function applyScaling(value: number, scaling: ScalingMode): number {
  return Math.round(value * scalingMap[scaling])
}
