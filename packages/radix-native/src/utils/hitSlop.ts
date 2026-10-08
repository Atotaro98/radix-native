import type { Insets } from 'react-native'

/**
 * Minimum touch target in dp/pt. Apple HIG asks for 44pt, Material for 48dp;
 * 44 keeps compact Radix sizes visually intact while meeting WCAG 2.5.8 / 2.5.5.
 */
export const MIN_TOUCH_TARGET = 44

/**
 * Returns the `hitSlop` needed to grow a `width × height` control up to the
 * minimum touch target, or `undefined` when it is already large enough.
 */
export function getMinHitSlop(
  width: number,
  height: number,
  min: number = MIN_TOUCH_TARGET,
): Insets | undefined {
  const x = Math.max(0, Math.ceil((min - width) / 2))
  const y = Math.max(0, Math.ceil((min - height) / 2))
  if (x === 0 && y === 0) return undefined
  return { top: y, bottom: y, left: x, right: x }
}
