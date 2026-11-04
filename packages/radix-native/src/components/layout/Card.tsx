import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp, GestureResponderEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { FocusRing } from '../internal/FocusRing'
import type { RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import { getClassicEffect } from '../../utils/classicEffect'
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

const SIZE_PADDING: Record<CardSize, number> = { 1: 12, 2: 16, 3: 24, 4: 32, 5: 40 }
const SIZE_RADIUS_LEVEL: Record<CardSize, RadiusLevel> = { 1: 4, 2: 4, 3: 5, 4: 5, 5: 6 }

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
  const { appearance } = useThemeContext()
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

  const isClassic = variant === 'classic'

  // ─── Styles ─────────────────────────────────────────────────────────────
  const cardStyle = useMemo<ViewStyle>(() => ({
    padding: resolvedPadding,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    overflow: 'hidden',
    ...margins,
  }), [resolvedPadding, borderRadius, colors, margins])

  if (onPress) {
    const classicEffect = isClassic
      ? getClassicEffect(appearance, { pressed })
      : undefined
    // Radix :active: surface/classic change the ring, ghost fills with gray-a4
    const pressedStyle = pressed
      ? colors.pressedBg ? { backgroundColor: colors.pressedBg } : { borderColor: colors.pressedBorder }
      : undefined

    return (
      <AnimatedPressable
        accessibilityRole="button"
        {...rest}
        {...handlers}
        onPress={onPress}
        onLongPress={onLongPress}
        style={[scaleStyle, cardStyle, classicEffect, pressedStyle, style]}
      >
        {children}
        <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} />
      </AnimatedPressable>
    )
  }

  return (
    <View style={[cardStyle, isClassic ? getClassicEffect(appearance, {}) : undefined, style]} {...rest}>
      {children}
    </View>
  )
}
Card.displayName = 'Card'
