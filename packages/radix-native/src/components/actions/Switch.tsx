import React from 'react'
import { Platform, View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { BaseToggle } from '../internal/BaseToggle'
import { useToggleGeometry, type ToggleKind } from '../internal/ToggleSurface'
import { resolveMetrics, type MetricsInput } from '../../utils/metrics'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
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

// ─── Thumb shadow ─────────────────────────────────────────────────────────────

/**
 * Radix gives the thumb a soft drop shadow in every variant (`0 1px 3px
 * black-a2/a3, 0 2px 4px -1px black-a1`; disabled `0 1px 3px black-a1`), while
 * the track itself stays flat. Approximated with one platform shadow.
 */
function thumbShadow(disabled: boolean): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: disabled ? 0.05 : 0.15,
      shadowRadius: 1.5,
    },
    default: { elevation: disabled ? 0 : 1 },
  })
}

// ─── Geometry ─────────────────────────────────────────────────────────────────

/** The track of a Switch for a size (its `radius` prop overrides the Theme's), plus its thumb. */
function switchGeometry({ size, radius }: { size: SwitchSize; radius?: RadiusToken }, theme: MetricsInput) {
  const metrics = resolveMetrics({ scaling: theme.scaling, radius: radius ?? theme.radius })
  return {
    width: metrics.px(TRACK_WIDTH[size]),
    height: metrics.px(TRACK_HEIGHT[size]),
    borderRadius: metrics.radius(SIZE_RADIUS_LEVEL[size], 'thumb'),
    focusOffset: 3,
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
  const {
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackRadius,
    thumbSize,
    thumbMargin,
  } = useToggleGeometry(switchGeometry, { size, radius })
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
    <View style={trackStyle}>
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
      <Animated.View style={[thumbStyle, thumbShadow(disabled), thumbAnimatedStyle]} />
    </View>
  )
}

/** Internal: the Switch's Indicator and geometry, for the Toggle surface. */
export const SwitchToggle: ToggleKind<SwitchIndicatorProps> = {
  geometry: switchGeometry,
  Indicator: SwitchIndicator,
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

  return (
    <BaseToggle
      role="switch"
      {...rest}
      defaultChecked={defaultChecked}
      disabled={disabled}
      color={color}
      kind={SwitchToggle}
      indicator={{ size, variant, color, highContrast, radius, disabled }}
      margins={margins}
    />
  )
}
Switch.displayName = 'Switch'
