import React from 'react'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { View } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { MIN_TOUCH_TARGET } from '../../utils/hitSlop'
import type { MetricsInput } from '../../utils/metrics'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import { useControl } from './control'
import { useSkeletonRadius } from '../feedback/SkeletonContext'

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
 * and the rows and cards of a Selection group. Whoever draws the Indicator
 * computes the geometry once (`useToggleGeometry`) and hands it over.
 */
export interface ToggleKind<P extends object> {
  geometry: (props: P, theme: MetricsInput) => ToggleGeometry
  /** Draws the Indicator; `geometry` is what this kind's `geometry` returned for these props. */
  Indicator: (props: P & { geometry: ToggleGeometry }) => React.ReactElement | null
}

/**
 * Builds a ToggleKind whose Indicator reads the whole geometry it computes
 * (a Checkbox's check size, a Switch's thumb), not only the outer box.
 */
export function defineToggle<P extends object, G extends ToggleGeometry>(
  geometry: (props: P, theme: MetricsInput) => G,
  Indicator: (props: P & { geometry: G }) => React.ReactElement | null,
): ToggleKind<P> {
  // Safe: every caller passes the geometry this kind's `geometry` returned for the same props.
  return { geometry, Indicator: Indicator as ToggleKind<P>['Indicator'] }
}

/** A Toggle's geometry for the current Theme; undefined without an Indicator. */
export function useToggleGeometry<P extends object>(indicator: { kind: ToggleKind<P>; props: P } | undefined) {
  const { scaling, radius } = useThemeContext()
  return indicator ? indicator.kind.geometry(indicator.props, { scaling, radius }) : undefined
}

interface SurfaceBase extends Omit<NativePressableProps, 'children' | 'disabled' | 'onPress'> {
  role: ToggleRole
  checked: CheckedState
  disabled: boolean
  /** Not called while disabled. */
  onPress: (event: GestureResponderEvent) => void
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

type WithIndicator<P extends object> = SurfaceBase & {
  /** The Indicator to draw; the focus ring and the touch target surround it, in the Indicator's `color`. */
  indicator: { kind: ToggleKind<P>; props: P }
  /**
   * Set when a label sits next to the Indicator (a Selection group row): the
   * row reaches the minimum touch target vertically, from the taller of the
   * Indicator and one line of the label. Unset, the surface is the Indicator.
   */
  labelLineHeight?: number
  borderRadius?: never
  color?: never
}

type WithoutIndicator = SurfaceBase & {
  indicator?: undefined
  labelLineHeight?: never
  /** The surface draws itself (a Selection card): the focus ring follows its edge, inset. */
  borderRadius: number
  /** Accent color of the focus ring. */
  color?: AccentColor
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
    ...rest
  } = props

  const geometry = useToggleGeometry(indicator)
  const isRow = geometry !== undefined && labelLineHeight !== undefined
  // switch.css / base-checkbox.css / base-radio.css: a bare Toggle sets --skeleton-radius-override
  // to its Indicator's radius; rows and cards report nothing.
  useSkeletonRadius(geometry && !isRow ? geometry.borderRadius : undefined)

  // A row's label or a card's content names the Toggle (hidden parts passed explicitly)
  const control = useControl({
    props: rest,
    children,
    role,
    onPress,
    disabled,
    state: { checked: checked === 'indeterminate' ? 'mixed' : checked },
    touchTarget: geometry
      ? isRow
        ? { width: MIN_TOUCH_TARGET, height: Math.max(geometry.height, labelLineHeight) }
        : { width: geometry.width, height: geometry.height }
      : undefined,
    // The focus ring surrounds the Indicator (in its color), or follows a card's edge (inset)
    focusRing: geometry
      ? { color: (indicator?.props as { color?: AccentColor }).color, borderRadius: geometry.borderRadius, offset: geometry.focusOffset }
      : { color, borderRadius: borderRadius ?? 0 },
  })

  let content: React.ReactNode
  if (indicator && geometry && isRow) {
    content = (
      <>
        <View>
          <indicator.kind.Indicator {...indicator.props} geometry={geometry} />
          {control.focusRing}
        </View>
        {children}
      </>
    )
  } else if (indicator && geometry) {
    content = (
      <>
        <indicator.kind.Indicator {...indicator.props} geometry={geometry} />
        {control.focusRing}
      </>
    )
  } else {
    content = (
      <>
        {children}
        {control.focusRing}
      </>
    )
  }

  return (
    <AnimatedPressable
      {...control.pressableProps}
      style={[
        control.scaleStyle,
        geometry && !isRow ? { width: geometry.width, height: geometry.height } : undefined,
        style,
      ]}
    >
      {control.wrap(content)}
    </AnimatedPressable>
  )
}
