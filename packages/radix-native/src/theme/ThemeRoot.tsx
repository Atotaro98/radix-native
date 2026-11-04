import React from 'react'
import { useColorScheme } from 'react-native'
import { ThemeImpl } from './ThemeImpl'
import type { ThemeProps } from './theme.types'

/**
 * The outermost Theme (Radix `ThemeRoot`): owns the values ThemeControls can
 * change. A prop change always wins over a change made from ThemeControls.
 */
export function ThemeRoot({
  appearance: appearanceProp = 'inherit',
  accentColor: accentColorProp = 'indigo',
  grayColor: grayColorProp = 'auto',
  radius: radiusProp = 'medium',
  scaling: scalingProp = '100%',
  ...rest
}: ThemeProps) {
  const systemColorScheme = useColorScheme()
  const resolvedAppearanceProp = appearanceProp === 'inherit'
    ? systemColorScheme === 'dark' ? 'dark' : 'light'
    : appearanceProp

  const [appearance, setAppearance] = React.useState<'light' | 'dark'>(resolvedAppearanceProp)
  React.useEffect(() => setAppearance(resolvedAppearanceProp), [resolvedAppearanceProp])
  const [accentColor, setAccentColor] = React.useState(accentColorProp)
  React.useEffect(() => setAccentColor(accentColorProp), [accentColorProp])
  const [grayColor, setGrayColor] = React.useState(grayColorProp)
  React.useEffect(() => setGrayColor(grayColorProp), [grayColorProp])
  const [radius, setRadius] = React.useState(radiusProp)
  React.useEffect(() => setRadius(radiusProp), [radiusProp])
  const [scaling, setScaling] = React.useState(scalingProp)
  React.useEffect(() => setScaling(scalingProp), [scalingProp])

  return (
    <ThemeImpl
      {...rest}
      isRoot
      appearance={appearance}
      accentColor={accentColor}
      grayColor={grayColor}
      radius={radius}
      scaling={scaling}
      onAppearanceChange={setAppearance}
      onAccentColorChange={setAccentColor}
      onGrayColorChange={setGrayColor}
      onRadiusChange={setRadius}
      onScalingChange={setScaling}
    />
  )
}
ThemeRoot.displayName = 'ThemeRoot'
