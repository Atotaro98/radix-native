/**
 * Pure Slider math ported from Radix Primitives `slider.tsx` (no React).
 */

/** Number of decimals in `step` (avoids float drift when snapping). */
export function getDecimalCount(value: number): number {
  return (String(value).split('.')[1] || '').length
}

function roundValue(value: number, decimals: number): number {
  const rounder = Math.pow(10, decimals)
  return Math.round(value * rounder) / rounder
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** `round(round((v − min) / step) × step + min, decimals(step))`, clamped to [min, max]. */
export function snapToStep(value: number, { min, max, step }: { min: number; max: number; step: number }): number {
  const snapped = roundValue(Math.round((value - min) / step) * step + min, getDecimalCount(step))
  return clamp(snapped, min, max)
}

/** The thumb closest to `value`; ties go to the first. */
export function getClosestValueIndex(values: number[], value: number): number {
  if (values.length === 1) return 0
  const distances = values.map((v) => Math.abs(v - value))
  return distances.indexOf(Math.min(...distances))
}

/** Every adjacent gap is at least `minDistance`. */
export function hasMinStepsBetweenValues(values: number[], minDistance: number): boolean {
  if (minDistance <= 0) return true
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] < minDistance) return false
  }
  return true
}

/**
 * Moves thumb `index` to `value` (already snapped). The result is sorted, so
 * thumbs may cross and swap (Radix's default); `index` follows the moved value.
 * Returns null when the move breaks `minStepsBetweenThumbs` — Radix rejects
 * it (the thumb stops) rather than clamping.
 */
export function updateValues(
  values: number[],
  index: number,
  value: number,
  minDistance: number,
): { values: number[]; index: number } | null {
  const next = [...values]
  next[index] = value
  const sorted = [...next].sort((a, b) => a - b)
  if (!hasMinStepsBetweenValues(sorted, minDistance)) return null
  return { values: sorted, index: sorted.indexOf(value) }
}

/** `[0, length] → [min, max]` along the slide direction. */
export function valueFromPosition(
  position: number,
  length: number,
  { min, max, fromEnd }: { min: number; max: number; fromEnd: boolean },
): number {
  if (length <= 0) return min
  const ratio = clamp(position / length, 0, 1)
  return min + (fromEnd ? 1 - ratio : ratio) * (max - min)
}

export function percentOf(value: number, min: number, max: number): number {
  return max === min ? 0 : ((value - min) / (max - min)) * 100
}

/**
 * Where a thumb's centre sits along the track: Radix keeps the thumb inside
 * the track, so the centre runs from thumbSize/2 to length − thumbSize/2.
 */
export function thumbCenter(percent: number, length: number, thumbSize: number): number {
  return thumbSize / 2 + (percent / 100) * (length - thumbSize)
}

/** Radix's default thumb labels: two thumbs are Minimum / Maximum, more are "Value i of n". */
export function thumbLabel(index: number, count: number): string | undefined {
  if (count > 2) return `Value ${index + 1} of ${count}`
  if (count === 2) return index === 0 ? 'Minimum' : 'Maximum'
  return undefined
}
