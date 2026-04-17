import React, { useEffect, useRef, useMemo } from 'react'
import { View, Animated, Easing } from 'react-native'
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
  const pulseAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!loading) return
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: PULSE_DURATION,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
      ]),
    )
    animation.start()
    return () => animation.stop()
  }, [loading, pulseAnim])

  const colorFrom = rc('gray', 'a3')
  const colorTo = rc('gray', 'a4')

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colorFrom, colorTo],
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
        style={{
          ...({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 } as ViewStyle),
          backgroundColor,
          borderRadius: 4,
        }}
      />
      {/* Hidden children to preserve layout dimensions */}
      {hasChildren && (
        <View style={{ opacity: 0 }} pointerEvents="none">
          {children}
        </View>
      )}
    </View>
  )
}
Skeleton.displayName = 'Skeleton'
