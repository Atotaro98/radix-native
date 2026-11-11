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
  // Escape hatch for raw colors ('#ff0000', 'rgb(...)') that keeps autocomplete
  | (string & Record<never, never>)

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
  /** Code — monospace font, falls back to system monospace */
  code?: string
  /** Strong — falls back to bold → regular */
  strong?: string
  /** Em — falls back to the system serif (italic) */
  em?: string
  /** Quote — falls back to the system serif (italic) */
  quote?: string
}

/**
 * Partial override of individual color steps within a scale.
 * Only the steps you specify are overridden; the rest fall back to the built-in scale.
 */
export type ColorScaleOverride = Partial<
  Record<
    | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
    | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8' | 'a9' | 'a10' | 'a11' | 'a12'
    | 'contrast' | 'surface' | 'indicator' | 'track',
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
  /** Whether this is the outermost Theme (only it can be changed through the handlers). */
  isRoot: boolean
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
  /** RN-only: global cap for font scaling (accessibility). Components use this as fallback when no local prop is set. */
  maxFontSizeMultiplier?: number
  /** Resolves a ThemeColor token (`'accent-9'`, `'gray-a3'`, `'blue-9'`, `'#fff'`) with this Theme's values. */
  resolveColor: (token: ThemeColor) => string
  /** RN-only: the screen edges overlays keep clear of (notch, home indicator). */
  safeAreaInsets: SafeAreaInsets
}

/** RN-only: insets in px, as your safe-area library reports them. */
export interface SafeAreaInsets {
  top: number
  right: number
  bottom: number
  left: number
}

export interface ThemeProps {
  appearance?: ThemeAppearance
  accentColor?: AccentColor
  grayColor?: GrayColor | 'auto'
  radius?: RadiusToken
  scaling?: ScalingMode
  /**
   * Whether the Theme renders a background color.
   * Defaults to `true` — sets `backgroundColor` to white (light) or gray-1 (dark),
   * matching Radix web's `--color-background` / `data-has-background`.
   */
  hasBackground?: boolean
  /** RN-only */
  fonts?: ThemeFonts
  /** RN-only */
  colorOverrides?: ColorOverrides
  /** RN-only: global cap for font scaling. Applied to all text unless overridden per-component. */
  maxFontSizeMultiplier?: number
  /**
   * RN-only: the screen edges overlays (Dialog, Popover…) keep clear of. Pass
   * them from your safe-area library; default 0 on every side. Inherited.
   */
  safeAreaInsets?: Partial<SafeAreaInsets>
  children: React.ReactNode
}
