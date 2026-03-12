import React from 'react'
import { View } from 'react-native'
import { ThemeContext } from './ThemeContext'
import { resolveGrayColor } from './resolveGrayColor'
import { resolveColor } from '../utils/resolveColor'
import type { ThemeProps, ThemeContextValue } from './theme.types'

export function ThemeImpl({
  appearance: appearanceProp,
  accentColor: accentColorProp,
  grayColor: grayColorProp,
  radius: radiusProp,
  scaling: scalingProp,
  hasBackground: hasBackgroundProp,
  fonts: fontsProp,
  colorOverrides: colorOverridesProp,
  children,
}: ThemeProps) {
  // Always defined here — ThemeImpl is only rendered when context exists
  const parent = React.useContext(ThemeContext)!

  const appearance =
    appearanceProp !== undefined && appearanceProp !== 'inherit'
      ? appearanceProp
      : parent.appearance

  const accentColor = accentColorProp ?? parent.accentColor
  // Inherit resolvedGrayColor from parent (same as Radix) so 'auto' doesn't
  // re-resolve against the nested accentColor unless explicitly set
  const grayColor = grayColorProp ?? parent.resolvedGrayColor
  const radius = radiusProp ?? parent.radius
  const scaling = scalingProp ?? parent.scaling
  const resolvedGrayColor = grayColor === 'auto' ? resolveGrayColor(accentColor) : grayColor
  const resolvedColorOverrides = colorOverridesProp ?? parent.colorOverrides

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      appearance,
      accentColor,
      grayColor,
      resolvedGrayColor,
      radius,
      scaling,
      fonts: fontsProp ?? parent.fonts,
      colorOverrides: resolvedColorOverrides,
      // Handlers always bubble up to ThemeRoot
      onAppearanceChange: parent.onAppearanceChange,
      onAccentColorChange: parent.onAccentColorChange,
      onGrayColorChange: parent.onGrayColorChange,
      onRadiusChange: parent.onRadiusChange,
      onScalingChange: parent.onScalingChange,
    }),
    [appearance, accentColor, grayColor, resolvedGrayColor, radius, scaling, fontsProp, resolvedColorOverrides, parent],
  )

  // Radix web: nested <Theme> gets hasBackground when it has an explicit
  // appearance prop set to 'light' or 'dark' (not 'inherit' / undefined).
  const hasExplicitAppearance =
    appearanceProp !== undefined && appearanceProp !== 'inherit'

  const showBackground = hasBackgroundProp ?? hasExplicitAppearance

  const backgroundColor = showBackground
    ? appearance === 'light'
      ? '#fff'
      : resolveColor('gray-1', appearance, accentColor, resolvedGrayColor, resolvedColorOverrides)
    : undefined

  const content = backgroundColor != null
    ? <View style={{ flex: 1, backgroundColor }}>{children}</View>
    : children

  return <ThemeContext.Provider value={value}>{content}</ThemeContext.Provider>
}
ThemeImpl.displayName = 'ThemeImpl'
