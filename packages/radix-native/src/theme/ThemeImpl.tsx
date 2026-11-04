import React from 'react'
import { View } from 'react-native'
import { ThemeContext } from './ThemeContext'
import { resolveGrayColor } from './resolveGrayColor'
import { resolveColor } from '../utils/resolveColor'
import type {
  ThemeProps, ThemeContextValue, ThemeChangeHandlers, ThemeFonts, ColorOverrides, ColorScaleOverride,
} from './theme.types'

interface ThemeImplProps extends ThemeProps, Partial<ThemeChangeHandlers> {
  isRoot?: boolean
}

const noop = () => {}
const EMPTY_FONTS: ThemeFonts = {}
const EMPTY_OVERRIDES: ColorOverrides = {}

/**
 * Builds the Theme context (Radix `ThemeImpl`), for the root and nested
 * Themes alike: inherits every value from the parent and overrides only what
 * it sets. Nested Themes cannot change the root (their handlers are no-ops,
 * as in Radix). `fonts` and `colorOverrides` merge with the parent's, the way
 * CSS custom properties cascade.
 */
export function ThemeImpl({
  isRoot = false,
  appearance: appearanceProp,
  accentColor: accentColorProp,
  grayColor: grayColorProp,
  radius: radiusProp,
  scaling: scalingProp,
  hasBackground: hasBackgroundProp,
  fonts: fontsProp,
  colorOverrides: colorOverridesProp,
  maxFontSizeMultiplier: maxFontSizeMultiplierProp,
  onAppearanceChange = noop,
  onAccentColorChange = noop,
  onGrayColorChange = noop,
  onRadiusChange = noop,
  onScalingChange = noop,
  children,
}: ThemeImplProps) {
  const parent = React.useContext(ThemeContext)

  const isExplicitAppearance = appearanceProp === 'light' || appearanceProp === 'dark'
  const appearance = isExplicitAppearance ? appearanceProp : parent?.appearance ?? 'light'
  const accentColor = accentColorProp ?? parent?.accentColor ?? 'indigo'
  // Radix: a nested Theme inherits the parent's *resolved* gray, so 'auto'
  // only re-resolves against a nested accent when set explicitly.
  const grayColor = grayColorProp ?? parent?.resolvedGrayColor ?? 'auto'
  const resolvedGrayColor = grayColor === 'auto' ? resolveGrayColor(accentColor) : grayColor
  const radius = radiusProp ?? parent?.radius ?? 'medium'
  const scaling = scalingProp ?? parent?.scaling ?? '100%'
  const maxFontSizeMultiplier = maxFontSizeMultiplierProp ?? parent?.maxFontSizeMultiplier

  const parentFonts = parent?.fonts ?? EMPTY_FONTS
  const fonts = React.useMemo(
    () => (fontsProp ? { ...parentFonts, ...fontsProp } : parentFonts),
    [parentFonts, fontsProp],
  )
  const parentOverrides = parent?.colorOverrides ?? EMPTY_OVERRIDES
  const colorOverrides = React.useMemo(
    () => (colorOverridesProp ? mergeColorOverrides(parentOverrides, colorOverridesProp) : parentOverrides),
    [parentOverrides, colorOverridesProp],
  )

  const resolve = React.useCallback(
    (token: string) => resolveColor(token, appearance, accentColor, resolvedGrayColor, colorOverrides),
    [appearance, accentColor, resolvedGrayColor, colorOverrides],
  )

  const value = React.useMemo<ThemeContextValue>(() => ({
    isRoot,
    appearance,
    accentColor,
    grayColor,
    resolvedGrayColor,
    radius,
    scaling,
    fonts,
    colorOverrides,
    maxFontSizeMultiplier,
    resolveColor: resolve,
    onAppearanceChange,
    onAccentColorChange,
    onGrayColorChange,
    onRadiusChange,
    onScalingChange,
  }), [isRoot, appearance, accentColor, grayColor, resolvedGrayColor, radius, scaling, fonts, colorOverrides,
    maxFontSizeMultiplier, resolve, onAppearanceChange, onAccentColorChange, onGrayColorChange, onRadiusChange, onScalingChange])

  // Radix: the root always has a background; a nested Theme only with an explicit appearance.
  const hasBackground = hasBackgroundProp ?? (isRoot || isExplicitAppearance)
  // Radix --color-background: white (light) / gray-1 (dark)
  const backgroundColor = appearance === 'light' ? '#fff' : resolve('gray-1')

  return (
    <ThemeContext.Provider value={value}>
      {isRoot || hasBackground
        ? <View style={{ flex: 1, backgroundColor: hasBackground ? backgroundColor : undefined }}>{children}</View>
        : children}
    </ThemeContext.Provider>
  )
}
ThemeImpl.displayName = 'ThemeImpl'

/** Per scale, per mode, per step: the child's steps win, the parent's others stay. */
function mergeColorOverrides(parent: ColorOverrides, child: ColorOverrides): ColorOverrides {
  const merged: ColorOverrides = { ...parent }
  for (const name of Object.keys(child) as (keyof ColorOverrides)[]) {
    const p = parent[name]
    const c = child[name]
    if (!c) continue
    merged[name] = {
      light: mergeScale(p?.light, c.light),
      dark: mergeScale(p?.dark, c.dark),
    }
  }
  return merged
}

function mergeScale(parent?: ColorScaleOverride, child?: ColorScaleOverride): ColorScaleOverride | undefined {
  if (!parent) return child
  if (!child) return parent
  return { ...parent, ...child }
}
