import React from 'react'
import { View, useColorScheme } from 'react-native'
import { ThemeContext } from './ThemeContext'
import { resolveGrayColor } from './resolveGrayColor'
import { resolveColor } from '../utils/resolveColor'
import type { ThemeProps, ThemeContextValue, ThemeFonts, ColorOverrides } from './theme.types'

const EMPTY_FONTS: ThemeFonts = {}
const EMPTY_OVERRIDES: ColorOverrides = {}

export function ThemeRoot({
  appearance: appearanceProp = 'inherit',
  accentColor: accentColorProp = 'indigo',
  grayColor: grayColorProp = 'auto',
  radius: radiusProp = 'medium',
  scaling: scalingProp = '100%',
  hasBackground: hasBackgroundProp = true,
  fonts: fontsProp = EMPTY_FONTS,
  colorOverrides: colorOverridesProp = EMPTY_OVERRIDES,
  maxFontSizeMultiplier: maxFontSizeMultiplierProp,
  children,
}: ThemeProps) {
  const systemColorScheme = useColorScheme()

  const [appearance, setAppearance] = React.useState<'light' | 'dark'>(() =>
    appearanceProp === 'inherit'
      ? systemColorScheme === 'dark' ? 'dark' : 'light'
      : appearanceProp,
  )
  const [accentColor, setAccentColor] = React.useState(accentColorProp)
  const [grayColor, setGrayColor] = React.useState(grayColorProp)
  const [radius, setRadius] = React.useState(radiusProp)
  const [scaling, setScaling] = React.useState(scalingProp)

  React.useEffect(() => {
    setAppearance(
      appearanceProp === 'inherit'
        ? systemColorScheme === 'dark' ? 'dark' : 'light'
        : appearanceProp,
    )
  }, [appearanceProp, systemColorScheme])

  React.useEffect(() => { setAccentColor(accentColorProp) }, [accentColorProp])
  React.useEffect(() => { setGrayColor(grayColorProp) }, [grayColorProp])
  React.useEffect(() => { setRadius(radiusProp) }, [radiusProp])
  React.useEffect(() => { setScaling(scalingProp) }, [scalingProp])

  const resolvedGrayColor = grayColor === 'auto' ? resolveGrayColor(accentColor) : grayColor

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      appearance,
      accentColor,
      grayColor,
      resolvedGrayColor,
      radius,
      scaling,
      fonts: fontsProp,
      colorOverrides: colorOverridesProp,
      maxFontSizeMultiplier: maxFontSizeMultiplierProp,
      onAppearanceChange: setAppearance,
      onAccentColorChange: setAccentColor,
      onGrayColorChange: setGrayColor,
      onRadiusChange: setRadius,
      onScalingChange: setScaling,
    }),
    [appearance, accentColor, grayColor, resolvedGrayColor, radius, scaling, fontsProp, colorOverridesProp, maxFontSizeMultiplierProp],
  )

  const backgroundColor = hasBackgroundProp
    ? appearance === 'light'
      ? '#fff'
      : resolveColor('gray-1', appearance, accentColor, resolvedGrayColor, colorOverridesProp)
    : undefined

  return (
    <ThemeContext.Provider value={value}>
      <View style={{ flex: 1, backgroundColor }}>{children}</View>
    </ThemeContext.Provider>
  )
}
ThemeRoot.displayName = 'ThemeRoot'
