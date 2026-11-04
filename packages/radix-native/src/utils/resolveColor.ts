import {
  tomato, red, ruby, crimson, pink, plum, purple, violet,
  iris, indigo, blue, cyan, teal, jade, green, grass,
  bronze, gold, brown, orange, amber, yellow, lime, mint, sky,
  gray, mauve, slate, sage, olive, sand,
} from '../tokens/colors'
import type { AccentColor, GrayColor, ColorScaleWithModes } from '../tokens/colors/types'
import type { ThemeColor, ColorOverrides } from '../theme/theme.types'
import { isDev } from './env'

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
 * - `'accent-indicator'`, `'accent-track'` → step 9 (follow overrides of 9)
 * - `'gray-panel'`      → solid panel: white (light) / step 2 (dark)
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

  return resolveStep(colorName, step, appearance, colorOverrides, color as string)
}

/**
 * Steps Radix derives from other steps. Resolving them through their base step
 * means an override of the base (e.g. `9`) carries over, like CSS custom properties.
 */
const DERIVED_STEPS: Record<string, { light: string; dark: string }> = {
  indicator: { light: '9', dark: '9' },
  track: { light: '9', dark: '9' },
  // Radix `--color-panel-solid`: white in light mode, gray-2 in dark mode
  panel: { light: '#ffffff', dark: '2' },
}

function resolveStep(
  colorName: string,
  step: string,
  appearance: 'light' | 'dark',
  colorOverrides: ColorOverrides | undefined,
  original: string,
): string {
  // Check overrides first (per-scale, per-mode — like CSS custom properties in Radix web)
  const modeOverride = colorOverrides?.[colorName as keyof ColorOverrides]?.[appearance]
  const overridden = (modeOverride as Record<string, string> | undefined)?.[step]
  if (overridden !== undefined) return overridden

  const scale = colorMap[colorName]?.[appearance]
  if (!scale) {
    if (isDev && !original.startsWith('#') && !original.startsWith('rgb')) {
      console.warn(`[radix-native] Unknown color token: "${original}"`)
    }
    return original
  }

  const derived = DERIVED_STEPS[step]?.[appearance]
  if (derived !== undefined) {
    return derived.startsWith('#')
      ? derived
      : resolveStep(colorName, derived, appearance, colorOverrides, original)
  }

  return (scale as unknown as Record<string, string>)[step] ?? original
}
