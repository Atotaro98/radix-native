import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp, GestureResponderEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { useControl } from '../internal/control'
import { paintSurface } from '../internal/surface'
import { InsetContext, type InsetValues } from './InsetContext'
import type { RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import { useSkeletonRadius } from '../feedback/SkeletonContext'
import type { CardVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardSize = 1 | 2 | 3 | 4 | 5
export type { CardVariant }

export interface CardProps extends NativeViewProps, MarginProps {
  /** Card size (1–5). Controls padding. Default: 1. */
  size?: CardSize
  /** Visual variant. Default: 'surface'. */
  variant?: CardVariant
  /** Makes the card pressable. */
  onPress?: (event: GestureResponderEvent) => void
  onPressIn?: (event: GestureResponderEvent) => void
  onPressOut?: (event: GestureResponderEvent) => void
  onLongPress?: (event: GestureResponderEvent) => void
  onFocus?: (event: NativeSyntheticEvent<TargetedEvent>) => void
  onBlur?: (event: NativeSyntheticEvent<TargetedEvent>) => void
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

// Radix .rt-Card:where(.rt-r-size-1…5) --card-padding: var(--space-3/4/5/6/8)
const SIZE_PADDING: Record<CardSize, number> = { 1: 12, 2: 16, 3: 24, 4: 32, 5: 48 }
const SIZE_RADIUS_LEVEL: Record<CardSize, RadiusLevel> = { 1: 4, 2: 4, 3: 5, 4: 5, 5: 6 }
// Radix --card-border-width: 1px (surface, classic), 0px (ghost); drawn by CardRing
const BORDER_WIDTH = 1

/** `--margin-*-override: calc(var(--margin-*) - var(--card-padding))` (ghost). `auto` stays `auto`. */
function pullBy(margin: ViewStyle['marginTop'], by: number): ViewStyle['marginTop'] {
  if (margin === 'auto') return margin
  return (typeof margin === 'number' ? margin : 0) - by
}

/** A static Card is a View: the pressable-only props do not reach it. */
function viewProps({ onPressIn: _i, onPressOut: _o, onLongPress: _l, onFocus: _f, onBlur: _b, ...view }: Omit<CardProps, 'onPress'>) {
  return view
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  size = 1,
  variant = 'surface',
  onPress,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: CardProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const metrics = useMetrics()
  const resolvedPadding = metrics.px(SIZE_PADDING[size])
  const borderRadius = metrics.radius(SIZE_RADIUS_LEVEL[size])
  useSkeletonRadius(borderRadius)

  const control = useControl({
    props: rest,
    children,
    role: 'button',
    onPress,
    disabled: !onPress,
    focusRing: { borderRadius },
  })
  const { pressed } = control

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useVariantColors('card', { variant, pressed })
  // Radix :active: surface/classic change the ring, ghost fills with gray-a4 (the recipe decides)
  const surface = paintSurface(colors, borderRadius)

  // ─── Styles ─────────────────────────────────────────────────────────────
  const isGhost = variant === 'ghost'
  // Radix --card-border-width: 1px (surface, classic), 0px (ghost)
  const borderWidth = variant === 'ghost' ? 0 : BORDER_WIDTH
  const cardStyle = useMemo<ViewStyle>(() => ({
    // The border is a ring over the content (Radix draws it as a box-shadow ring on ::after),
    // so the content starts at the card padding, not 1px further in.
    padding: resolvedPadding,
    overflow: 'hidden',
    ...margins,
    // .rt-Card:where(.rt-variant-ghost): negative margins pull the card out by its padding
    ...(isGhost && {
      marginTop: pullBy(margins.marginTop, resolvedPadding),
      marginRight: pullBy(margins.marginRight, resolvedPadding),
      marginBottom: pullBy(margins.marginBottom, resolvedPadding),
      marginLeft: pullBy(margins.marginLeft, resolvedPadding),
    }),
  }), [resolvedPadding, margins, isGhost])

  // base-card.css: --inset-padding-* = card padding − border width
  const inset = useMemo<InsetValues>(() => {
    const p = resolvedPadding - borderWidth
    return { padding: { top: p, right: p, bottom: p, left: p }, borderWidth, borderRadius }
  }, [resolvedPadding, borderWidth, borderRadius])

  const content = <InsetContext.Provider value={inset}>{children}</InsetContext.Provider>

  if (onPress) {
    return (
      <AnimatedPressable
        {...control.pressableProps}
        style={[control.scaleStyle, cardStyle, surface.style, style]}
      >
        {control.wrap(content)}
        {surface.over}
        {control.focusRing}
      </AnimatedPressable>
    )
  }

  return (
    <View style={[cardStyle, surface.style, style]} {...viewProps(rest)}>
      {content}
      {surface.over}
    </View>
  )
}
Card.displayName = 'Card'

