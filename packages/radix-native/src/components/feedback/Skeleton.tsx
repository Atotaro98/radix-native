import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text as RNText } from 'react-native'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence, interpolateColor, cancelAnimation, Easing } from 'react-native-reanimated'
import type { ViewStyle, StyleProp, DimensionValue } from 'react-native'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { SkeletonContext } from './SkeletonContext'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkeletonProps extends NativeViewProps, MarginProps {
  /** When true, shows skeleton placeholder. When false, renders children. Default: true. */
  loading?: boolean
  /** Width of the skeleton placeholder. */
  width?: DimensionValue
  /** Height of the skeleton placeholder. */
  height?: DimensionValue
  /** Min width of the skeleton placeholder. */
  minWidth?: DimensionValue
  /** Max width of the skeleton placeholder. */
  maxWidth?: DimensionValue
  /** Min height of the skeleton placeholder. */
  minHeight?: DimensionValue
  /** Max height of the skeleton placeholder. */
  maxHeight?: DimensionValue
  style?: StyleProp<ViewStyle>
}

// ─── Animation ────────────────────────────────────────────────────────────────

// skeleton.css: rt-skeleton-pulse 1000ms infinite alternate-reverse, timing `ease`
const PULSE_DURATION = 1000
const EASE = Easing.bezier(0.25, 0.1, 0.25, 1)

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
  const metrics = useMetrics()
  // Plain text sizes the placeholder: it renders like a Text in the same spot
  // (the surrounding text's size, Theme fonts and Font scaling cap). Inside a
  // Text, this View breaks RN's style inheritance, so the size is set explicitly.
  const text = useTextStyle({ inline: true })
  const textStyle = text.isNested ? [text.style, { fontSize: text.contextFontSize }] : text.style

  // Radix .rt-Skeleton: border-radius: var(--radius-1), unless the wrapped element has its own
  // (its CSS wins; Switch / Checkbox / Radio set --skeleton-radius-override). See SkeletonContext.
  const [childRadius, setChildRadius] = useState<number | null>(null)
  const reportRadius = useCallback((r: number | null) => setChildRadius(r), [])
  const borderRadius = childRadius ?? metrics.radius(1)

  // ─── Pulse animation (gray-a4 → gray-a3 → …, 1s each way) ───────────
  // alternate-reverse starts at the `to` keyframe (gray-a4)
  const pulseAnim = useSharedValue(1)

  const colorFrom = rc('gray', 'a3')
  const colorTo = rc('gray', 'a4')

  const colorFromSV = useSharedValue(colorFrom)
  const colorToSV = useSharedValue(colorTo)

  useEffect(() => { colorFromSV.value = colorFrom }, [colorFrom, colorFromSV])
  useEffect(() => { colorToSV.value = colorTo }, [colorTo, colorToSV])

  useEffect(() => {
    if (!loading) return
    pulseAnim.value = 1
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(0, { duration: PULSE_DURATION, easing: EASE }),
        withTiming(1, { duration: PULSE_DURATION, easing: EASE }),
      ),
      -1,
    )
    return () => cancelAnimation(pulseAnim)
  }, [loading, pulseAnim])

  const pulseStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(pulseAnim.value, [0, 1], [colorFromSV.value, colorToSV.value])
    return { backgroundColor: bgColor }
  })

  // ─── Skeleton placeholder ───────────────────────────────────────────
  const hasChildren = children != null

  const skeletonStyle = useMemo<ViewStyle>(() => ({
    overflow: 'hidden',
    borderRadius,
    width: widthProp,
    // .rt-Skeleton:empty { display: block; height: var(--space-3) }
    height: heightProp ?? (hasChildren ? undefined : metrics.space(3)),
    minWidth: minWidthProp,
    maxWidth: maxWidthProp,
    minHeight: minHeightProp,
    maxHeight: maxHeightProp,
    ...margins,
  }), [widthProp, heightProp, minWidthProp, maxWidthProp, minHeightProp, maxHeightProp, hasChildren, margins, borderRadius, metrics])

  // ─── If not loading, render children ────────────────────────────────
  // (after all hooks — toggling `loading` must not change the hook order)
  if (!loading) {
    return <>{children}</>
  }

  return (
    <View
      style={[skeletonStyle, style]}
      {...rest}
      // Radix: aria-hidden, inert, pointer-events: none !important — consumer props can't undo them
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      {/* Animated background overlay */}
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius } as ViewStyle,
          pulseStyle,
        ]}
      />
      {/* Hidden children to preserve layout dimensions */}
      {hasChildren && (
        <View style={{ opacity: 0 }}>
          <SkeletonContext.Provider value={reportRadius}>
            {typeof children === 'string' || typeof children === 'number'
              ? text.provide(<RNText {...text.textProps} style={textStyle}>{children}</RNText>)
              : children}
          </SkeletonContext.Provider>
        </View>
      )}
    </View>
  )
}
Skeleton.displayName = 'Skeleton'
