import React, { useEffect, useRef, useMemo } from 'react'
import { View, Animated, Easing } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { scalingMap } from '../../tokens/scaling'
import { getRadiusFactor, getRadiusThumb } from '../../tokens/radius'
import type { RadiusToken } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressSize = 1 | 2 | 3
export type ProgressVariant = 'classic' | 'surface' | 'soft'

export interface ProgressProps extends NativeViewProps, MarginProps {
  /** Progress size (1–3). Default: 2. */
  size?: ProgressSize
  /** Visual variant. Default: 'surface'. */
  variant?: ProgressVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast. */
  highContrast?: boolean
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Current value (0–max). Omit for indeterminate. */
  value?: number
  /** Maximum value. Default: 100. */
  max?: number
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings (Radix: space-1, space-2*0.75, space-2) ───────────────────

const SIZE_HEIGHT: Record<ProgressSize, number> = { 1: 4, 2: 6, 3: 8 }

// ─── Component ────────────────────────────────────────────────────────────────

export function Progress({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  radius: radiusProp,
  value,
  max = 100,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: ProgressProps) {
  const { scaling, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const prefix = color ?? 'accent'
  const effectiveRadius = radiusProp ?? themeRadius
  const scalingFactor = scalingMap[scaling]
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)

  // Radix: border-radius: max(factor * height/3, factor * radius-thumb)
  // When radius="none", factor=0 → borderRadius=0 (square)
  const factor = getRadiusFactor(effectiveRadius)
  const borderRadius = Math.max(
    Math.round(factor * resolvedHeight / 3),
    Math.round(factor * getRadiusThumb(effectiveRadius)),
  )

  const isIndeterminate = value === undefined
  const progress = isIndeterminate ? 0 : Math.min(Math.max(value / max, 0), 1)

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    const hc = highContrast
    const indicatorBg = hc ? rc(prefix, 12) : rc(prefix, 9)
    switch (variant) {
      case 'classic':
        return {
          trackBg: rc('gray', 'a3'),
          trackBorder: rc('gray', 'a4'),
          trackTopBorder: rc('gray', 'a5'),
          indicatorBg,
        }
      case 'surface':
        return {
          trackBg: rc('gray', 'a3'),
          trackBorder: rc('gray', 'a4'),
          trackTopBorder: undefined,
          indicatorBg,
        }
      case 'soft':
        return {
          trackBg: rc('gray', 'a4'),
          trackBorder: undefined,
          trackTopBorder: undefined,
          indicatorBg,
        }
    }
  }, [variant, prefix, highContrast, rc])

  // ─── Indeterminate animation ────────────────────────────────────────────
  const indeterminateAnim = useRef<Animated.Value | null>(null)
  if (indeterminateAnim.current === null) {
    indeterminateAnim.current = new Animated.Value(0)
  }
  const animValue = indeterminateAnim.current

  useEffect(() => {
    if (!isIndeterminate) return

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 2000,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: false,
        }),
        Animated.timing(animValue, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [isIndeterminate, animValue])

  // ─── Styles ─────────────────────────────────────────────────────────────
  const trackStyle = useMemo<ViewStyle>(() => ({
    height: resolvedHeight,
    borderRadius,
    backgroundColor: colors.trackBg,
    borderWidth: colors.trackBorder ? 1 : undefined,
    borderColor: colors.trackBorder,
    borderTopColor: colors.trackTopBorder ?? colors.trackBorder,
    overflow: 'hidden',
    ...margins,
  }), [resolvedHeight, borderRadius, colors, margins])

  const indicatorBaseStyle: ViewStyle = {
    height: '100%',
    borderRadius,
    backgroundColor: colors.indicatorBg,
  }

  return (
    <View
      style={[trackStyle, style]}
      accessibilityRole="progressbar"
      accessibilityValue={{
        min: 0,
        max,
        now: isIndeterminate ? undefined : value,
      }}
      {...rest}
    >
      {isIndeterminate ? (
        <Animated.View
          style={[
            indicatorBaseStyle,
            {
              width: animValue.interpolate({
                inputRange: [0, 0.3, 0.5, 1],
                outputRange: ['5%', '60%', '90%', '100%'],
              }),
            },
          ]}
        />
      ) : (
        <View style={[indicatorBaseStyle, { width: `${progress * 100}%` }]} />
      )}
    </View>
  )
}
Progress.displayName = 'Progress'
