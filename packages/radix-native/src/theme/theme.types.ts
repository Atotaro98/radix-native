import type { AccentColor, GrayColor } from '../tokens/colors/types'
import type { RadiusToken } from '../tokens/radius'
import type { ScalingMode } from '../tokens/scaling'

export type { AccentColor, GrayColor, RadiusToken, ScalingMode }

export type ThemeAppearance = 'inherit' | 'light' | 'dark'

export type ThemeColor =
  | `accent-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `accent-a${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `gray-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `gray-a${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | `${AccentColor}-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`
  | (string & {})

export interface ThemeFonts {
  /** fontWeight 300 — falls back to regular */
  light?: string
  /** fontWeight 400 — base body font */
  regular?: string
  /** fontWeight 500 — falls back to regular */
  medium?: string
  /** fontWeight 700 — falls back to regular */
  bold?: string
  /** Heading component — falls back to bold → regular */
  heading?: string
  /** Code / Kbd — monospace font, falls back to system monospace */
  code?: string
}

/**
 * Partial override of individual color steps within a scale.
 * Only the steps you specify are overridden; the rest fall back to the built-in scale.
 */
export type ColorScaleOverride = Partial<
  Record<
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8' | 'a9' | 'a10' | 'a11' | 'a12'
    | 'contrast' | 'surface',
    string
  >
>

/**
 * Override any color scale with light/dark variants — like overriding CSS custom
 * properties in Radix web (e.g. `--red-9: #custom`).
 *
 * @example
 * colorOverrides={{
 *   red: {
 *     light: { 9: '#e54666', 10: '#dc3b5d' },
 *     dark:  { 9: '#e5484d', 10: '#ec5d5e' },
 *   },
 * }}
 */
export type ColorOverrides = Partial<
  Record<AccentColor | GrayColor, { light?: ColorScaleOverride; dark?: ColorScaleOverride }>
>

export interface ThemeChangeHandlers {
  onAppearanceChange: (value: 'light' | 'dark') => void
  onAccentColorChange: (value: AccentColor) => void
  onGrayColorChange: (value: GrayColor | 'auto') => void
  onRadiusChange: (value: RadiusToken) => void
  onScalingChange: (value: ScalingMode) => void
}

export interface ThemeContextValue extends ThemeChangeHandlers {
  /** Resolved appearance — always 'light' | 'dark', never 'inherit' */
  appearance: 'light' | 'dark'
  accentColor: AccentColor
  grayColor: GrayColor | 'auto'
  /** Resolved gray when grayColor is 'auto' */
  resolvedGrayColor: GrayColor
  radius: RadiusToken
  scaling: ScalingMode
  /** RN-only: custom font family names */
  fonts: ThemeFonts
  /** RN-only: override individual color steps */
  colorOverrides: ColorOverrides
}

export interface ThemeProps {
  appearance?: ThemeAppearance
  accentColor?: AccentColor
  grayColor?: GrayColor | 'auto'
  radius?: RadiusToken
  scaling?: ScalingMode
  /** RN-only */
  fonts?: ThemeFonts
  /** RN-only */
  colorOverrides?: ColorOverrides
  children: React.ReactNode
}
