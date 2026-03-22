import {
  tomato, red, ruby, crimson, pink, plum, purple, violet,
  iris, indigo, blue, cyan, teal, jade, green, grass,
  bronze, gold, brown, orange, amber, yellow, lime, mint, sky,
  gray, mauve, slate, sage, olive, sand,
} from '../tokens/colors'
import type { AccentColor, GrayColor, ColorScaleWithModes } from '../tokens/colors/types'
import type { ThemeColor, ColorOverrides } from '../theme/theme.types'

const colorMap: Record<string, ColorScaleWithModes> = {
  tomato, red, ruby, crimson, pink, plum, purple, violet,
  iris, indigo, blue, cyan, teal, jade, green, grass,
  bronze, gold, brown, orange, amber, yellow, lime, mint, sky,
  gray, mauve, slate, sage, olive, sand,
}

/**
 * Resolves a ThemeColor token to a hex string.
 *
 * - `'accent-9'`        → step 9 of the active accent color
 * - `'accent-a9'`       → alpha step a9 of the active accent color
 * - `'accent-contrast'` → contrast color (text over step 9 background)
 * - `'accent-surface'`  → translucent tinted surface
 * - `'gray-9'`          → step 9 of the resolved gray color
 * - `'blue-9'`          → step 9 of the blue scale (exact, not aliased)
 * - `'#ff0000'`         → returned as-is (escape hatch)
 */
export function resolveColor(
  color: ThemeColor,
  appearance: 'light' | 'dark',
  accentColor: AccentColor,
  resolvedGrayColor: GrayColor,
  colorOverrides?: ColorOverrides,
): string {
  let colorName: string
  let step: string

  if (color.startsWith('accent-')) {
    colorName = accentColor
    step = color.slice('accent-'.length)
  } else if (color.startsWith('gray-')) {
    colorName = resolvedGrayColor
    step = color.slice('gray-'.length)
  } else {
    // Named color: 'blue-9', 'tomato-a3', 'indigo-contrast', etc.
    const dashIdx = color.lastIndexOf('-')
    if (dashIdx <= 0) return color as string
    colorName = color.slice(0, dashIdx)
    step = color.slice(dashIdx + 1)
  }

  // Check overrides first (per-scale, per-mode — like CSS custom properties in Radix web)
  if (colorOverrides) {
    const scaleOverride = colorOverrides[colorName as keyof ColorOverrides]
    if (scaleOverride) {
      const modeOverride = scaleOverride[appearance]
      if (modeOverride) {
        const value = (modeOverride as Record<string, string>)[step]
        if (value !== undefined) return value
      }
    }
  }

  // Fall back to built-in scale
  const scale = colorMap[colorName]?.[appearance]
  if (!scale) {
    if (__DEV__ && !color.startsWith('#') && !color.startsWith('rgb')) {
      console.warn(`[radix-native] Unknown color token: "${color}"`)
    }
    return color as string
  }

  return (scale as unknown as Record<string, string>)[step] ?? (color as string)
}
