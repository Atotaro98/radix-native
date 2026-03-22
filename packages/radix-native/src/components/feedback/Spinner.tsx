import React, { useEffect, useRef, useMemo } from 'react'
import { View, Animated, Easing } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { scalingMap } from '../../tokens/scaling'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SpinnerSize = 1 | 2 | 3

export interface SpinnerProps extends NativeViewProps, MarginProps {
  /** Spinner size (1–3). Default: 2. */
  size?: SpinnerSize
  /** When false, renders children instead of spinner. Default: true. */
  loading?: boolean
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings (Radix: space-3, space-4, space-4*1.25) ───────────────────

const SIZE_PX: Record<SpinnerSize, number> = { 1: 16, 2: 20, 3: 25 }
const LEAF_COUNT = 8
const ANIMATION_DURATION = 800

// ─── Component ────────────────────────────────────────────────────────────────

export function Spinner({
  size = 2,
  loading = true,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: SpinnerProps) {
  const { scaling } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const scalingFactor = scalingMap[scaling]
  const boxSize = Math.round(SIZE_PX[size] * scalingFactor)

  // Spinner uses currentColor — we default to gray-12 (inherits text color intent)
  const leafColor = rc('gray', 'a11')

  // ─── Animation (8 leaves, staggered opacity fade) ─────────────────────
  const animValues = useRef<Animated.Value[]>([])
  if (animValues.current.length === 0) {
    animValues.current = Array.from({ length: LEAF_COUNT }, () => new Animated.Value(1))
  }

  useEffect(() => {
    if (!loading) return

    const animations = animValues.current.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 0.25,
            duration: ANIMATION_DURATION,
            easing: Easing.linear,
            useNativeDriver: true,
            delay: (i / LEAF_COUNT) * ANIMATION_DURATION,
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    )

    animations.forEach(a => a.start())
    return () => animations.forEach(a => a.stop())
  }, [loading])

  // ─── If not loading, render children ──────────────────────────────────
  if (!loading) {
    return <>{children}</>
  }

  // ─── Leaf dimensions ──────────────────────────────────────────────────
  const leafWidth = boxSize * 0.125
  const leafHeight = boxSize * 0.3
  const leafRadius = Math.max(1, leafWidth / 2)

  const containerStyle = useMemo<ViewStyle>(() => ({
    width: boxSize,
    height: boxSize,
    opacity: 0.65,
    ...margins,
  }), [boxSize, margins])

  return (
    <View
      style={[containerStyle, style]}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      {...rest}
    >
      {animValues.current.map((opacity, i) => {
        const rotation = (i * 360) / LEAF_COUNT
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              top: 0,
              left: (boxSize - leafWidth) / 2,
              width: leafWidth,
              height: boxSize,
              transform: [{ rotate: `${rotation}deg` }],
              alignItems: 'center',
              opacity,
            }}
          >
            <View
              style={{
                width: leafWidth,
                height: leafHeight,
                borderRadius: leafRadius,
                backgroundColor: leafColor,
              }}
            />
          </Animated.View>
        )
      })}
    </View>
  )
}
Spinner.displayName = 'Spinner'
