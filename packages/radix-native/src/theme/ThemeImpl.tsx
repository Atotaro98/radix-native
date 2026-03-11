import React from 'react'
import { ThemeContext } from './ThemeContext'
import { resolveGrayColor } from './resolveGrayColor'
import type { ThemeProps, ThemeContextValue } from './theme.types'

export function ThemeImpl({
  appearance: appearanceProp,
  accentColor: accentColorProp,
  grayColor: grayColorProp,
  radius: radiusProp,
  scaling: scalingProp,
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

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      appearance,
      accentColor,
      grayColor,
      resolvedGrayColor,
      radius,
      scaling,
      fonts: fontsProp ?? parent.fonts,
      colorOverrides: colorOverridesProp ?? parent.colorOverrides,
      // Handlers always bubble up to ThemeRoot
      onAppearanceChange: parent.onAppearanceChange,
      onAccentColorChange: parent.onAccentColorChange,
      onGrayColorChange: parent.onGrayColorChange,
      onRadiusChange: parent.onRadiusChange,
      onScalingChange: parent.onScalingChange,
    }),
    [appearance, accentColor, grayColor, resolvedGrayColor, radius, scaling, fontsProp, colorOverridesProp, parent],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
ThemeImpl.displayName = 'ThemeImpl'
