import React from 'react'
import { useColorScheme } from 'react-native'
import { ThemeContext } from './ThemeContext'
import { resolveGrayColor } from './resolveGrayColor'
import type { ThemeProps, ThemeContextValue } from './theme.types'

export function ThemeRoot({
  appearance: appearanceProp = 'inherit',
  accentColor: accentColorProp = 'indigo',
  grayColor: grayColorProp = 'auto',
  radius: radiusProp = 'medium',
  scaling: scalingProp = '100%',
  fonts: fontsProp = {},
  colorOverrides: colorOverridesProp = {},
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
      onAppearanceChange: setAppearance,
      onAccentColorChange: setAccentColor,
      onGrayColorChange: setGrayColor,
      onRadiusChange: setRadius,
      onScalingChange: setScaling,
    }),
    [appearance, accentColor, grayColor, resolvedGrayColor, radius, scaling, fontsProp, colorOverridesProp],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
ThemeRoot.displayName = 'ThemeRoot'
