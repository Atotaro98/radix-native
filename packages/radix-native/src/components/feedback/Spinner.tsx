import React, { useEffect, useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated'
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

// ─── SpinnerLeaf ──────────────────────────────────────────────────────────────

interface SpinnerLeafProps {
  delay: number
  rotation: number
  boxSize: number
  leafWidth: number
  leafHeight: number
  leafRadius: number
  leafColor: string
}

function SpinnerLeaf({
  delay,
  rotation,
  boxSize,
  leafWidth,
  leafHeight,
  leafRadius,
  leafColor,
}: SpinnerLeafProps) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.25, { duration: ANIMATION_DURATION, easing: Easing.linear }),
          withTiming(1, { duration: 0 }),
        ),
        -1,
      ),
    )
  }, [])

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }))

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: (boxSize - leafWidth) / 2,
          width: leafWidth,
          height: boxSize,
          transform: [{ rotate: `${rotation}deg` }],
          alignItems: 'center',
        },
        animStyle,
      ]}
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
}

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
      {Array.from({ length: LEAF_COUNT }, (_, i) => (
        <SpinnerLeaf
          key={i}
          delay={(i / LEAF_COUNT) * ANIMATION_DURATION}
          rotation={(i * 360) / LEAF_COUNT}
          boxSize={boxSize}
          leafWidth={leafWidth}
          leafHeight={leafHeight}
          leafRadius={leafRadius}
          leafColor={leafColor}
        />
      ))}
    </View>
  )
}
Spinner.displayName = 'Spinner'
