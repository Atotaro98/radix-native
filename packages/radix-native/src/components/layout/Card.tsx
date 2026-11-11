import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp, GestureResponderEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { FocusRing } from '../internal/FocusRing'
import { InsetContext, type InsetValues } from './InsetContext'
import type { RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import { shadowStyle } from '../../utils/shadow'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardSize = 1 | 2 | 3 | 4 | 5
export type CardVariant = 'surface' | 'classic' | 'ghost'

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
// Radix --card-border-width: 1px (surface, classic), 0px (ghost)
const BORDER_WIDTH = 1

/** `--margin-*-override: calc(var(--margin-*) - var(--card-padding))` (ghost). `auto` stays `auto`. */
function pullBy(margin: ViewStyle['marginTop'], by: number): ViewStyle['marginTop'] {
  if (margin === 'auto') return margin
  return (typeof margin === 'number' ? margin : 0) - by
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card({
  size = 1,
  variant = 'surface',
  onPress,
  onPressIn,
  onPressOut,
  onLongPress,
  onFocus,
  onBlur,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: CardProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { pressed, focused, scaleStyle, handlers } = useInteraction({
    enabled: !!onPress,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  const metrics = useMetrics()
  const resolvedPadding = metrics.px(SIZE_PADDING[size])
  const borderRadius = metrics.radius(SIZE_RADIUS_LEVEL[size])

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useVariantColors('card', { variant })
  const focus = useVariantColors('focusRing', {})

  // ─── Styles ─────────────────────────────────────────────────────────────
  // classic: the outer drop shadow, kept while pressed (Radix --base-card-classic-active-*)
  const shadow = shadowStyle(colors.shadow)
  const isGhost = variant === 'ghost'
  const borderWidth = colors.border ? BORDER_WIDTH : 0
  const cardStyle = useMemo<ViewStyle>(() => ({
    // The border is an overlay (Radix draws it as a box-shadow ring on ::after), so the
    // content starts at the card padding, not 1px further in.
    padding: resolvedPadding,
    borderRadius,
    backgroundColor: colors.bg,
    overflow: 'hidden',
    ...margins,
    // .rt-Card:where(.rt-variant-ghost): negative margins pull the card out by its padding
    ...(isGhost && {
      marginTop: pullBy(margins.marginTop, resolvedPadding),
      marginRight: pullBy(margins.marginRight, resolvedPadding),
      marginBottom: pullBy(margins.marginBottom, resolvedPadding),
      marginLeft: pullBy(margins.marginLeft, resolvedPadding),
    }),
  }), [resolvedPadding, borderRadius, colors.bg, margins, isGhost])

  // base-card.css: --inset-padding-* = card padding − border width
  const inset = useMemo<InsetValues>(() => {
    const p = resolvedPadding - borderWidth
    return { padding: { top: p, right: p, bottom: p, left: p }, borderWidth, borderRadius }
  }, [resolvedPadding, borderWidth, borderRadius])

  const content = <InsetContext.Provider value={inset}>{children}</InsetContext.Provider>

  if (onPress) {
    // Radix :active: surface/classic change the ring, ghost fills with gray-a4
    const pressedBg = pressed && colors.pressedBg ? { backgroundColor: colors.pressedBg } : undefined
    const ringColor = pressed && colors.pressedBorder ? colors.pressedBorder : colors.border

    return (
      <AnimatedPressable
        accessibilityRole="button"
        {...rest}
        {...handlers}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[scaleStyle, cardStyle, shadow, pressedBg, style]}
      >
        {content}
        {ringColor ? <CardRing color={ringColor} borderRadius={borderRadius} /> : null}
        <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} />
      </AnimatedPressable>
    )
  }

  return (
    <View style={[cardStyle, shadow, style]} {...rest}>
      {content}
      {colors.border ? <CardRing color={colors.border} borderRadius={borderRadius} /> : null}
    </View>
  )
}
Card.displayName = 'Card'

/**
 * The card's 1px border, drawn over the content like Radix's `::after` box-shadow
 * ring, so it takes no layout space and an `Inset` with `clip="padding-box"` runs under it.
 */
function CardRing({ color, borderRadius }: { color: string; borderRadius: number }) {
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius,
        borderWidth: BORDER_WIDTH,
        borderColor: color,
      }}
    />
  )
}
