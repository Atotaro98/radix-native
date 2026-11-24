/**
 * Pure Slider behaviour (no React): what a touch at a position means, a drag
 * from grant to release, an accessibility step, and where the thumbs and the
 * range are drawn — for every orientation, `inverted` and layout direction.
 * The helpers in the first half are ported from Radix Primitives `slider.tsx`
 * and keep its names; callers use the interface in the second half.
 */

/** Number of decimals in `step` (avoids float drift when snapping). */
function getDecimalCount(value: number): number {
  return (String(value).split('.')[1] || '').length
}

function roundValue(value: number, decimals: number): number {
  const rounder = Math.pow(10, decimals)
  return Math.round(value * rounder) / rounder
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

/** `round(round((v − min) / step) × step + min, decimals(step))`, clamped to [min, max]. */
function snapToStep(value: number, { min, max, step }: { min: number; max: number; step: number }): number {
  const snapped = roundValue(Math.round((value - min) / step) * step + min, getDecimalCount(step))
  return clamp(snapped, min, max)
}

/** The thumb closest to `value`; ties go to the first. */
function getClosestValueIndex(values: number[], value: number): number {
  if (values.length === 1) return 0
  const distances = values.map((v) => Math.abs(v - value))
  return distances.indexOf(Math.min(...distances))
}

/** Every adjacent gap is at least `minDistance`. */
function hasMinStepsBetweenValues(values: number[], minDistance: number): boolean {
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
function updateValues(
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
function valueFromPosition(
  position: number,
  length: number,
  { min, max, fromEnd }: { min: number; max: number; fromEnd: boolean },
): number {
  if (length <= 0) return min
  const ratio = clamp(position / length, 0, 1)
  return min + (fromEnd ? 1 - ratio : ratio) * (max - min)
}

function percentOf(value: number, min: number, max: number): number {
  return max === min ? 0 : ((value - min) / (max - min)) * 100
}

/**
 * Where a thumb's centre sits along the track: Radix keeps the thumb inside
 * the track, so the centre runs from thumbSize/2 to length − thumbSize/2.
 */
function thumbCenter(percent: number, length: number, thumbSize: number): number {
  return thumbSize / 2 + (percent / 100) * (length - thumbSize)
}

/** Radix's default thumb labels: two thumbs are Minimum / Maximum, more are "Value i of n". */
export function thumbLabel(index: number, count: number): string | undefined {
  if (count > 2) return `Value ${index + 1} of ${count}`
  if (count === 2) return index === 0 ? 'Minimum' : 'Maximum'
  return undefined
}

// ─── Interface ────────────────────────────────────────────────────────────────

/** A slider's rules: its scale and which way it slides. */
export interface SliderConfig {
  min: number
  max: number
  step: number
  /** A move that brings two thumbs closer than this many steps is rejected. */
  minStepsBetweenThumbs: number
  vertical: boolean
  /** Slide from the end: the right, or the top when vertical. */
  inverted: boolean
  /** Right-to-left layout: a horizontal slider starts on the right. */
  rtl: boolean
}

type Edge = 'left' | 'right' | 'top' | 'bottom'
const OPPOSITE: Record<Edge, Edge> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

/**
 * The one place that knows which way a slider runs. Horizontal slides from
 * the left (inverted: right); vertical from the bottom (inverted: top).
 * Styles follow the reading direction (React Native swaps `left` / `right` in
 * RTL), touches are physical — so in RTL only the touch side flips.
 */
function direction(c: SliderConfig) {
  const drawnFromEnd = c.vertical ? !c.inverted : c.inverted
  const startEdge: Edge = c.vertical ? (c.inverted ? 'top' : 'bottom') : (c.inverted ? 'right' : 'left')
  return { drawnFromEnd, touchFromEnd: c.vertical ? drawnFromEnd : drawnFromEnd !== c.rtl, startEdge }
}

/** Where the parts are drawn along a track `length` px long. */
export interface SliderLayout {
  /** The filled range: `start`% from `startEdge` and `end`% from `endEdge` (style keys). */
  range: { startEdge: Edge; endEdge: Edge; start: number; end: number }
  /** Each thumb's centre, in px from the track's `left` (horizontal) or `top` (vertical) style edge. */
  thumbCenters: number[]
}

export function sliderLayout(values: readonly number[], c: SliderConfig, length: number, thumbSize: number): SliderLayout {
  const { drawnFromEnd, startEdge } = direction(c)
  const percents = values.map((v) => percentOf(v, c.min, c.max))
  return {
    range: {
      startEdge,
      endEdge: OPPOSITE[startEdge],
      // One value: from the start edge; several: between the outer thumbs
      start: values.length > 1 ? Math.min(...percents) : 0,
      end: 100 - Math.max(...percents),
    },
    thumbCenters: percents.map((p) => {
      const center = thumbCenter(p, length, thumbSize)
      return drawnFromEnd ? length - center : center
    }),
  }
}

/** A drag in progress: which thumb it moves and where it began. */
export interface SliderDrag {
  /** The thumb being moved; follows it when thumbs cross. */
  index: number
  /** The values when the finger went down: released on other values, the drag commits. */
  start: readonly number[]
  /** The touch's position along the track and on the page when it began. */
  origin: number
  page: number
}

/** Moves thumb `index` to the raw value; the same array when nothing changes or the move is rejected. */
function moveThumb(values: readonly number[], c: SliderConfig, index: number, raw: number): { values: readonly number[]; index: number } {
  const snapped = snapToStep(raw, c)
  if (values[index] === snapped) return { values, index }
  return updateValues([...values], index, snapped, c.minStepsBetweenThumbs * c.step) ?? { values, index }
}

/**
 * The finger goes down at `position` px along the track: the closest thumb
 * jumps there and the drag starts. `values` is the same array when unchanged.
 */
export function beginDrag(
  values: readonly number[], c: SliderConfig, length: number, position: number, page: number,
): { drag: SliderDrag; values: readonly number[] } {
  const raw = valueFromPosition(position, length, { min: c.min, max: c.max, fromEnd: direction(c).touchFromEnd })
  const moved = moveThumb(values, c, getClosestValueIndex([...values], raw), raw)
  return { drag: { index: moved.index, start: values, origin: position, page }, values: moved.values }
}

/**
 * The finger is now at `page`. The position is the grant's plus the page
 * delta: a touch's own location can jump between targets on Android.
 */
export function moveDrag(
  drag: SliderDrag, values: readonly number[], c: SliderConfig, length: number, page: number,
): { drag: SliderDrag; values: readonly number[] } {
  const position = drag.origin + (page - drag.page)
  const raw = valueFromPosition(position, length, { min: c.min, max: c.max, fromEnd: direction(c).touchFromEnd })
  const moved = moveThumb(values, c, drag.index, raw)
  return { drag: moved.index === drag.index ? drag : { ...drag, index: moved.index }, values: moved.values }
}

/** An accessibility increment (+1) or decrement (−1) of thumb `index`, by one step. */
export function stepThumb(values: readonly number[], c: SliderConfig, index: number, by: 1 | -1): readonly number[] {
  return moveThumb(values, c, index, values[index] + by * c.step).values
}

/** Whether a gesture that started on `before` and ended on `after` commits (Radix: only when the value changed). */
export function commits(before: readonly number[], after: readonly number[]): boolean {
  return String(before) !== String(after)
}
