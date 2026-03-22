import React, { useCallback, useMemo, useRef } from 'react'
import { Pressable, Animated, Easing } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { usePressScale } from '../../hooks/usePressScale'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getRadiusThumb } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SwitchSize = 1 | 2 | 3
export type SwitchVariant = 'classic' | 'surface' | 'soft'

export interface SwitchProps extends NativePressableProps, MarginProps {
  /** Switch size (1–3). Default: 2. */
  size?: SwitchSize
  /** Visual variant. Default: 'surface'. */
  variant?: SwitchVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Controlled checked state. */
  checked?: boolean
  /** Uncontrolled default checked state. */
  defaultChecked?: boolean
  /** Called when the checked state changes. */
  onCheckedChange?: (checked: boolean) => void
  /** Disables the switch. */
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

const TRACK_WIDTH: Record<SwitchSize, number> = { 1: 28, 2: 35, 3: 42 }
const TRACK_HEIGHT: Record<SwitchSize, number> = { 1: 16, 2: 20, 3: 24 }
const THUMB_SIZE: Record<SwitchSize, number> = { 1: 14, 2: 18, 3: 22 }
const THUMB_MARGIN = 1
const SIZE_RADIUS_LEVEL: Record<SwitchSize, RadiusLevel> = { 1: 1, 2: 2, 3: 2 }

// ─── Component ────────────────────────────────────────────────────────────────

export function Switch({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  radius: radiusProp,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: SwitchProps) {
  const { appearance, scaling, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { scaleStyle, handlePressIn: scalePressIn, handlePressOut: scalePressOut } = usePressScale(!disabled)

  // ─── Controlled / uncontrolled ─────────────────────────────────────────────
  const [internal, setInternal] = React.useState(defaultChecked)
  const isControlled = checkedProp !== undefined
  const isChecked = isControlled ? checkedProp : internal

  const prefix = color ?? 'accent'

  const scalingFactor = scalingMap[scaling]
  const trackWidth = Math.round(TRACK_WIDTH[size] * scalingFactor)
  const trackHeight = Math.round(TRACK_HEIGHT[size] * scalingFactor)
  const thumbSize = Math.round(THUMB_SIZE[size] * scalingFactor)
  const thumbMargin = Math.round(THUMB_MARGIN * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const effectiveRadius = radiusProp ?? themeRadius
  const level = SIZE_RADIUS_LEVEL[size]
  const trackRadius = Math.max(getRadius(effectiveRadius, level), getRadiusThumb(effectiveRadius))
  const thumbRadius = Math.max(trackRadius - thumbMargin, 0)

  // ─── Animation ─────────────────────────────────────────────────────────────
  const thumbTravel = trackWidth - thumbSize - thumbMargin * 2
  const translateXRef = useRef<Animated.Value | null>(null)
  if (translateXRef.current === null) {
    translateXRef.current = new Animated.Value(isChecked ? thumbTravel : 0)
  }
  const translateX = translateXRef.current

  React.useEffect(() => {
    const animation = Animated.timing(translateX, {
      toValue: isChecked ? thumbTravel : 0,
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: true,
    })
    animation.start()
    return () => animation.stop()
  }, [isChecked, thumbTravel, translateX])

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    if (disabled) {
      return {
        track: rc('gray', 'a3'),
        trackBorder: variant !== 'soft' ? rc('gray', 'a6') : undefined,
        thumb: rc('gray', 'a5'),
      }
    }

    const hc = highContrast

    if (isChecked) {
      switch (variant) {
        case 'classic':
        case 'surface': {
          const track = hc ? rc(prefix, 12) : rc(prefix, 9)
          return { track, trackBorder: undefined, thumb: 'white' }
        }
        case 'soft': {
          const track = rc(prefix, 'a5')
          const thumb = hc ? rc(prefix, 12) : rc(prefix, 'a11')
          return { track, trackBorder: undefined, thumb }
        }
      }
    }

    // Unchecked
    switch (variant) {
      case 'classic':
      case 'surface':
        return {
          track: rc('gray', 'a3'),
          trackBorder: rc('gray', 'a7'),
          thumb: 'white',
        }
      case 'soft':
        return {
          track: rc('gray', 'a5'),
          trackBorder: undefined,
          thumb: rc('gray', 'a11'),
        }
    }
  }, [variant, prefix, highContrast, isChecked, disabled, rc])

  // ─── Toggle ────────────────────────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (disabled) return
    const next = !isChecked
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }, [disabled, isChecked, isControlled, onCheckedChange])

  // ─── Classic effect ────────────────────────────────────────────────────────
  const isClassic = variant === 'classic'
  const classicStyle = isClassic && isChecked && !disabled
    ? getClassicEffect(appearance, {})
    : undefined

  // ─── Styles ────────────────────────────────────────────────────────────────
  const trackStyle: ViewStyle = {
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackRadius,
    backgroundColor: colors.track,
    borderWidth: colors.trackBorder ? 1 : undefined,
    borderColor: colors.trackBorder,
    justifyContent: 'center',
    paddingHorizontal: thumbMargin,
    ...margins,
  }

  const thumbStyle: ViewStyle = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbRadius,
    backgroundColor: colors.thumb,
  }

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={scalePressIn}
        onPressOut={scalePressOut}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityState={{ checked: isChecked, disabled }}
        style={[trackStyle, classicStyle, style]}
        {...rest}
      >
        <Animated.View style={[thumbStyle, { transform: [{ translateX }] }]} />
      </Pressable>
    </Animated.View>
  )
}
Switch.displayName = 'Switch'
