import React, { useEffect, useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, interpolateColor, Easing } from 'react-native-reanimated'
import type { ViewStyle, StyleProp } from 'react-native'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkeletonProps extends NativeViewProps, MarginProps {
  /** When true, shows skeleton placeholder. When false, renders children. Default: true. */
  loading?: boolean
  /** Width of the skeleton placeholder. */
  width?: number | string
  /** Height of the skeleton placeholder. */
  height?: number | string
  /** Min width of the skeleton placeholder. */
  minWidth?: number | string
  /** Max width of the skeleton placeholder. */
  maxWidth?: number | string
  /** Min height of the skeleton placeholder. */
  minHeight?: number | string
  /** Max height of the skeleton placeholder. */
  maxHeight?: number | string
  style?: StyleProp<ViewStyle>
}

// ─── Animation ────────────────────────────────────────────────────────────────

const PULSE_DURATION = 1000

// ─── Component ────────────────────────────────────────────────────────────────

export function Skeleton({
  loading = true,
  width: widthProp,
  height: heightProp,
  minWidth: minWidthProp,
  maxWidth: maxWidthProp,
  minHeight: minHeightProp,
  maxHeight: maxHeightProp,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: SkeletonProps) {
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Pulse animation (gray-a3 ↔ gray-a4, 1s infinite) ──────────────
  const pulseAnim = useSharedValue(0)

  const colorFrom = rc('gray', 'a3')
  const colorTo = rc('gray', 'a4')

  const colorFromSV = useSharedValue(colorFrom)
  const colorToSV = useSharedValue(colorTo)

  useEffect(() => { colorFromSV.value = colorFrom }, [colorFrom])
  useEffect(() => { colorToSV.value = colorTo }, [colorTo])

  useEffect(() => {
    if (!loading) return
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    )
  }, [loading])

  const pulseStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(pulseAnim.value, [0, 1], [colorFromSV.value, colorToSV.value])
    return { backgroundColor: bgColor }
  })

  // ─── If not loading, render children ────────────────────────────────
  if (!loading) {
    return <>{children}</>
  }

  // ─── Skeleton placeholder ───────────────────────────────────────────
  const hasChildren = children != null

  const skeletonStyle = useMemo<ViewStyle>(() => ({
    overflow: 'hidden',
    borderRadius: 4,
    width: widthProp,
    height: heightProp ?? (hasChildren ? undefined : 16),
    minWidth: minWidthProp,
    maxWidth: maxWidthProp,
    minHeight: minHeightProp,
    maxHeight: maxHeightProp,
    ...margins,
  }), [widthProp, heightProp, minWidthProp, maxWidthProp, minHeightProp, maxHeightProp, hasChildren, margins])

  return (
    <View
      style={[skeletonStyle, style]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...rest}
    >
      {/* Animated background overlay */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 4 } as ViewStyle,
          pulseStyle,
        ]}
      />
      {/* Hidden children to preserve layout dimensions */}
      {hasChildren && (
        <View style={{ opacity: 0 }} pointerEvents="none">
          {typeof children === 'string' || typeof children === 'number'
            ? <RNText>{children}</RNText>
            : children}
        </View>
      )}
    </View>
  )
}
Skeleton.displayName = 'Skeleton'
