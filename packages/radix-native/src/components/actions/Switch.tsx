import React from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
import { useMargins } from '../../hooks/useMargins'
import { BaseToggle } from '../internal/BaseToggle'
import { defineToggle } from '../internal/ToggleSurface'
import { resolveMetrics, type MetricsInput } from '../../utils/metrics'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'
import type { SelectionVariant } from '../../utils/variantPalette'
import { paintSurface } from '../internal/surface'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SwitchSize = 1 | 2 | 3
export type SwitchVariant = SelectionVariant

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

type SwitchGeometry = ReturnType<typeof switchGeometry>

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
function SwitchIndicator({ variant, color, highContrast, checked, disabled, geometry }: SwitchIndicatorProps & { geometry: SwitchGeometry }) {
  const {
    width: trackWidth,
    height: trackHeight,
    borderRadius: trackRadius,
    thumbSize,
    thumbMargin,
  } = geometry
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

  // The track's fill and its ring over it (Radix inset box-shadow)
  const track = paintSurface(colors, trackRadius)

  const trackStyle: ViewStyle = {
    width: trackWidth,
    height: trackHeight,
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
    <View style={[trackStyle, track.style]}>
      {track.over}
      <Animated.View style={[thumbStyle, shadowStyle(colors.thumbShadow), thumbAnimatedStyle]} />
    </View>
  )
}

/** Internal: the Switch's Indicator and geometry, for the Toggle surface. */
export const SwitchToggle = defineToggle<SwitchIndicatorProps, SwitchGeometry>(switchGeometry, SwitchIndicator)

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
      kind={SwitchToggle}
      indicator={{ size, variant, color, highContrast, radius, disabled }}
      margins={margins}
    />
  )
}
Switch.displayName = 'Switch'
