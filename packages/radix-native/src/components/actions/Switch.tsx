import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp, GestureResponderEvent } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import { FocusRing } from '../internal/FocusRing'
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
  onPress,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  accessibilityState,
  hitSlop,
  ...rest
}: SwitchProps) {
  const { appearance, scaling, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { focused, scaleStyle, handlers } = useInteraction({
    enabled: !disabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  // ─── Controlled / uncontrolled ─────────────────────────────────────────────
  const [isChecked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
  })

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

  // ─── Thumb animation ─────────────────────────────────────────────────────────
  // The track border is drawn as an overlay (like Radix's inset box-shadow),
  // so it never takes layout space and the thumb doesn't jump between states.
  const thumbTravel = trackWidth - thumbSize - thumbMargin * 2
  const translateX = useSharedValue(isChecked ? thumbTravel : 0)

  React.useEffect(() => {
    translateX.value = withTiming(isChecked ? thumbTravel : 0, {
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    })
  }, [isChecked, thumbTravel, translateX])

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

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
  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    setChecked(prev => !prev)
    onPress?.(e)
  }, [disabled, setChecked, onPress])

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
    <AnimatedPressable
      accessibilityRole="switch"
      hitSlop={hitSlop ?? getMinHitSlop(trackWidth, trackHeight)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, checked: isChecked, disabled }}
      style={[scaleStyle, trackStyle, classicStyle, style]}
    >
      {colors.trackBorder && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: trackRadius,
            borderWidth: 1,
            borderColor: colors.trackBorder,
          }}
        />
      )}
      <Animated.View style={[thumbStyle, thumbAnimatedStyle]} />
      <FocusRing visible={focused} color={rc(prefix, 8)} borderRadius={trackRadius} offset={3} />
    </AnimatedPressable>
  )
}
Switch.displayName = 'Switch'
