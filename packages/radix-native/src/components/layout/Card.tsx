import React, { useMemo } from 'react'
import { Pressable, View, Animated } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { usePressScale } from '../../hooks/usePressScale'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
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
  onPress?: () => void
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
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: CardProps) {
  const { appearance, scaling, radius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { scaleStyle, handlePressIn: scalePressIn, handlePressOut: scalePressOut } = usePressScale(!!onPress)

  const scalingFactor = scalingMap[scaling]
  const resolvedPadding = Math.round(SIZE_PADDING[size] * scalingFactor)
  const borderRadius = getRadius(radius, SIZE_RADIUS_LEVEL[size])

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    switch (variant) {
      case 'surface':
        return {
          bg: rc('gray', 'surface'),
          border: rc('gray', 'a6'),
          showBorder: true,
        }
      case 'classic':
        return {
          bg: rc('gray', 2),
          border: rc('gray', 'a3'),
          showBorder: true,
        }
      case 'ghost':
        return { bg: undefined, pressedBg: rc('gray', 'a4'), border: undefined, showBorder: false }
    }
  }, [variant, rc])

  const isClassic = variant === 'classic'

  // ─── Styles ─────────────────────────────────────────────────────────────
  const cardStyle = useMemo<ViewStyle>(() => ({
    padding: resolvedPadding,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.showBorder ? 1 : undefined,
    borderColor: colors.border,
    overflow: 'hidden',
    ...margins,
  }), [resolvedPadding, borderRadius, colors, margins])

  if (onPress) {
    return (
      <Animated.View style={scaleStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={scalePressIn}
          onPressOut={scalePressOut}
          accessibilityRole="button"
          style={({ pressed }) => {
            const classicEffect = isClassic
              ? getClassicEffect(appearance, { pressed })
              : undefined
            return [
              cardStyle,
              classicEffect,
              pressed && (colors.pressedBg
                ? { backgroundColor: colors.pressedBg }
                : { opacity: 0.88 }),
              style,
            ]
          }}
          {...rest}
        >
          {children}
        </Pressable>
      </Animated.View>
    )
  }

  return (
    <View style={[cardStyle, isClassic ? getClassicEffect(appearance, {}) : undefined, style]} {...rest}>
      {children}
    </View>
  )
}
Card.displayName = 'Card'
