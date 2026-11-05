import React from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { BaseToggle } from '../internal/BaseToggle'
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

// ─── Geometry ─────────────────────────────────────────────────────────────────

function useSwitchTrack(size: SwitchSize, radius: RadiusToken | undefined) {
  const metrics = useMetrics({ radius })
  const trackRadius = metrics.radius(SIZE_RADIUS_LEVEL[size], 'thumb')
  return {
    trackWidth: metrics.px(TRACK_WIDTH[size]),
    trackHeight: metrics.px(TRACK_HEIGHT[size]),
    trackRadius,
    thumbSize: metrics.px(THUMB_SIZE[size]),
    thumbMargin: metrics.px(THUMB_MARGIN),
  }
}

// ─── Indicator ────────────────────────────────────────────────────────────────

export interface SwitchIndicatorProps {
  size: SwitchSize
  variant: SwitchVariant
  color?: AccentColor
  highContrast?: boolean
  radius?: RadiusToken
  checked: boolean
  disabled: boolean
}

/** Internal: the track and its sliding thumb, drawn from the checked state alone. */
export function SwitchIndicator({ size, variant, color, highContrast, radius, checked, disabled }: SwitchIndicatorProps) {
  const { appearance } = useThemeContext()
  const { trackWidth, trackHeight, trackRadius, thumbSize, thumbMargin } = useSwitchTrack(size, radius)
  const thumbRadius = Math.max(trackRadius - thumbMargin, 0)

  // ─── Thumb animation ─────────────────────────────────────────────────────────
  // The track border is drawn as an overlay (like Radix's inset box-shadow),
  // so it never takes layout space and the thumb doesn't jump between states.
  const thumbTravel = trackWidth - thumbSize - thumbMargin * 2
  const translateX = useSharedValue(checked ? thumbTravel : 0)

  React.useEffect(() => {
    translateX.value = withTiming(checked ? thumbTravel : 0, {
      duration: 150,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    })
  }, [checked, thumbTravel, translateX])

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const colors = useVariantColors('switch', { variant, color, highContrast, checked, disabled })
  const classicStyle = variant === 'classic' && checked && !disabled
    ? getClassicEffect(appearance, {})
    : undefined

  const trackStyle: ViewStyle = {
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackRadius,
    backgroundColor: colors.track,
    justifyContent: 'center',
    paddingHorizontal: thumbMargin,
  }

  const thumbStyle: ViewStyle = {
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbRadius,
    backgroundColor: colors.thumb,
  }

  return (
    <View style={[trackStyle, classicStyle]}>
      {colors.border && (
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
            borderColor: colors.border,
          }}
        />
      )}
      <Animated.View style={[thumbStyle, thumbAnimatedStyle]} />
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Switch({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  radius,
  defaultChecked = false,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  ...rest
}: SwitchProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { trackWidth, trackHeight, trackRadius } = useSwitchTrack(size, radius)

  return (
    <BaseToggle
      role="switch"
      {...rest}
      defaultChecked={defaultChecked}
      disabled={disabled}
      color={color}
      width={trackWidth}
      height={trackHeight}
      borderRadius={trackRadius}
      focusOffset={3}
      margins={margins}
    >
      {({ checked }) => (
        <SwitchIndicator
          size={size}
          variant={variant}
          color={color}
          highContrast={highContrast}
          radius={radius}
          checked={checked}
          disabled={disabled}
        />
      )}
    </BaseToggle>
  )
}
Switch.displayName = 'Switch'
