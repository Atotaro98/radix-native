import React, { useCallback } from 'react'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop, MIN_TOUCH_TARGET } from '../../utils/hitSlop'
import type { MetricsInput } from '../../utils/metrics'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import { FocusRing } from './FocusRing'

export type CheckedState = boolean | 'indeterminate'
export type ToggleRole = 'checkbox' | 'radio' | 'switch'

/** The outer box of an Indicator: what the touch target and the focus ring are built around. */
export interface ToggleGeometry {
  width: number
  height: number
  borderRadius: number
  /** Gap between the Indicator and its focus ring. */
  focusOffset: number
}

/**
 * What a Toggle (Checkbox, Radio, Switch) looks like: its Indicator and the
 * pure geometry of that Indicator for the Theme's scaling and radius. The one
 * source of the Indicator's size, shared by the Indicator itself, the Toggle,
 * and the rows of a Selection group.
 */
export interface ToggleKind<P extends object> {
  geometry: (props: P, theme: MetricsInput) => ToggleGeometry
  Indicator: React.ComponentType<P>
}

/** Binds a Toggle's pure geometry to the current Theme (for its Indicator). */
export function useToggleGeometry<P, G>(geometry: (props: P, theme: MetricsInput) => G, props: P): G {
  const { scaling, radius } = useThemeContext()
  return geometry(props, { scaling, radius })
}

interface SurfaceBase extends Omit<NativePressableProps, 'children' | 'disabled' | 'onPress'> {
  role: ToggleRole
  checked: CheckedState
  disabled: boolean
  /** Not called while disabled. */
  onPress: (event: GestureResponderEvent) => void
  /** Accent color of the focus ring. */
  color?: AccentColor
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

type WithIndicator<P extends object> = SurfaceBase & {
  /** The Indicator to draw; the focus ring and the touch target surround it. */
  indicator: { kind: ToggleKind<P>; props: P }
  /**
   * Set when a label sits next to the Indicator (a Selection group row): the
   * row reaches the minimum touch target vertically, from the taller of the
   * Indicator and one line of the label. Unset, the surface is the Indicator.
   */
  labelLineHeight?: number
  borderRadius?: never
}

type WithoutIndicator = SurfaceBase & {
  indicator?: undefined
  labelLineHeight?: never
  /** The surface draws itself (a Selection card): the focus ring follows its edge, inset. */
  borderRadius: number
}

export type ToggleSurfaceProps<P extends object> = WithIndicator<P> | WithoutIndicator

/**
 * Internal: the Toggle surface — the pressable part of everything that acts as
 * a Toggle (Checkbox, Radio, Switch, Selection group rows, Selection cards).
 * Owns the role, the announced checked state (`'mixed'` for indeterminate),
 * the disabled gate, the press scale, the minimum touch target and the focus
 * ring, and composes the consumer's handlers and accessibility state. It holds
 * no checked state of its own.
 */
export function ToggleSurface<P extends object>(props: ToggleSurfaceProps<P>) {
  const {
    role,
    checked,
    disabled,
    onPress,
    color,
    style,
    children,
    indicator,
    labelLineHeight,
    borderRadius,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
    accessibilityState,
    hitSlop,
    ...rest
  } = props

  const theme = useThemeContext()
  const { focused, scaleStyle, handlers } = useInteraction({
    enabled: !disabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })
  const focus = useVariantColors('focusRing', { color })

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    onPress(e)
  }, [disabled, onPress])

  const geometry = indicator
    ? indicator.kind.geometry(indicator.props, { scaling: theme.scaling, radius: theme.radius })
    : undefined
  const isRow = geometry !== undefined && labelLineHeight !== undefined

  let minHitSlop
  if (geometry && isRow) minHitSlop = getMinHitSlop(MIN_TOUCH_TARGET, Math.max(geometry.height, labelLineHeight))
  else if (geometry) minHitSlop = getMinHitSlop(geometry.width, geometry.height)

  const ring = (radius: number, offset: number) => (
    <FocusRing visible={focused} color={focus.ring} borderRadius={radius} offset={offset} />
  )

  let content: React.ReactNode
  if (indicator && geometry && isRow) {
    content = (
      <>
        <View>
          <indicator.kind.Indicator {...indicator.props} />
          {ring(geometry.borderRadius, geometry.focusOffset)}
        </View>
        {children}
      </>
    )
  } else if (indicator && geometry) {
    content = (
      <>
        <indicator.kind.Indicator {...indicator.props} />
        {ring(geometry.borderRadius, geometry.focusOffset)}
      </>
    )
  } else {
    content = (
      <>
        {children}
        {ring(borderRadius ?? 0, 0)}
      </>
    )
  }

  return (
    <AnimatedPressable
      accessibilityRole={role}
      hitSlop={hitSlop ?? minHitSlop}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{
        ...accessibilityState,
        checked: checked === 'indeterminate' ? 'mixed' : checked,
        disabled,
      }}
      style={[
        scaleStyle,
        geometry && !isRow ? { width: geometry.width, height: geometry.height } : undefined,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  )
}
