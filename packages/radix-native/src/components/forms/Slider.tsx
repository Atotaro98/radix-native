import React, { useCallback, useMemo, useRef, useState } from 'react'
import { isRTL } from '../../utils/rtl'
import { View } from 'react-native'
import type { AccessibilityActionEvent, GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { CardRing } from '../internal/CardRing'
import { shadowStyle } from '../../utils/shadow'
import { beginDrag, commits, moveDrag, sliderLayout, stepThumb, thumbLabel, type SliderConfig, type SliderDrag } from '../../utils/slider'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { SelectionVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SliderSize = 1 | 2 | 3
export type SliderVariant = SelectionVariant

export interface SliderProps extends MarginProps {
  /** Default: 2. */
  size?: SliderSize
  /** Default: 'surface'. */
  variant?: SliderVariant
  color?: AccentColor
  highContrast?: boolean
  radius?: RadiusToken
  value?: number[]
  /** Radix Themes renders no thumbs when neither `value` nor `defaultValue` is set. */
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  /** On release (only if the value changed), and on every accessibility increment / decrement. */
  onValueCommit?: (value: number[]) => void
  /** Default: 0. */
  min?: number
  /** Default: 100. */
  max?: number
  /** Default: 1. */
  step?: number
  /** A move that brings two thumbs closer than this many steps is rejected. Default: 0. */
  minStepsBetweenThumbs?: number
  /** Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical'
  /** Slide from the end (right, or top when vertical). */
  inverted?: boolean
  disabled?: boolean
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
}

// --slider-track-size: calc(var(--space-2) × 0.75 | 1 | 1.25), unscaled px
const TRACK: Record<SliderSize, number> = { 1: 6, 2: 8, 3: 10 }
// Minimum touch target across the track
const TOUCH = 44

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Lets the user pick a value or a range by dragging, like Radix Themes
 * `Slider`. Thumbs snap to `step`, may cross (the value stays sorted), and a
 * press on the track moves the closest thumb there. No animation, as in Radix.
 */
export function Slider({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  radius,
  value: valueProp,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  orientation = 'horizontal',
  inverted = false,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  style,
  testID,
  accessibilityLabel,
}: SliderProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics({ radius })
  const colors = useVariantColors('slider', { variant, color, highContrast, disabled })
  const vertical = orientation === 'vertical'

  const track = metrics.px(TRACK[size])
  // --slider-thumb-size: track + space-1; the visible disc is inset −0.25 × track
  const thumbSize = track + metrics.space(1)
  const discSize = thumbSize + track / 2
  // .rt-SliderRoot border-radius: max(factor × track / 3, factor × --radius-thumb)
  const rootRadius = Math.max((metrics.radiusFactor * track) / 3, metrics.radiusFactor * metrics.radiusThumb)
  const thumbRadius = metrics.radius(1, 'thumb')

  const [values, setValues] = useControllableState<number[]>({
    prop: valueProp,
    defaultProp: defaultValue ?? [min],
    onChange: onValueChange,
  })
  // Radix Themes maps thumbs over (value ?? defaultValue ?? [])
  const thumbCount = (valueProp ?? defaultValue ?? []).length

  const [length, setLength] = useState(0)
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setLength(vertical ? e.nativeEvent.layout.height : e.nativeEvent.layout.width)
  }, [vertical])

  const rtl = isRTL()
  const config = useMemo<SliderConfig>(
    () => ({ min, max, step, minStepsBetweenThumbs, vertical, inverted, rtl }),
    [min, max, step, minStepsBetweenThumbs, vertical, inverted, rtl],
  )

  // The drag itself is `utils/slider`; here: the responder's events in, the values out
  const drag = useRef<SliderDrag | null>(null)
  const valuesRef = useRef<readonly number[]>(values)
  valuesRef.current = values
  const apply = (next: readonly number[]) => {
    if (next === valuesRef.current) return
    valuesRef.current = next
    setValues([...next])
  }
  const commit = (before: readonly number[]) => {
    if (commits(before, valuesRef.current)) onValueCommit?.([...valuesRef.current])
  }

  const positionOf = (e: GestureResponderEvent) => (vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX)
  const pageOf = (e: GestureResponderEvent) => (vertical ? e.nativeEvent.pageY : e.nativeEvent.pageX)

  const onGrant = (e: GestureResponderEvent) => {
    const next = beginDrag(valuesRef.current, config, length, positionOf(e), pageOf(e))
    drag.current = next.drag
    apply(next.values)
  }
  const onMove = (e: GestureResponderEvent) => {
    if (!drag.current) return
    const next = moveDrag(drag.current, valuesRef.current, config, length, pageOf(e))
    drag.current = next.drag
    apply(next.values)
  }
  const onEnd = () => {
    const d = drag.current
    drag.current = null
    if (d) commit(d.start)
  }

  const onAccessibilityAction = (index: number) => (e: AccessibilityActionEvent) => {
    const by = e.nativeEvent.actionName === 'increment' ? 1 : e.nativeEvent.actionName === 'decrement' ? -1 : 0
    if (!by) return
    const before = valuesRef.current
    apply(stepThumb(before, config, index, by))
    commit(before)
  }

  const { range, thumbCenters } = sliderLayout(values, config, length, thumbSize)

  const rootStyle = useMemo<ViewStyle>(() => ({
    justifyContent: 'center',
    alignItems: 'center',
    ...(vertical ? { width: track, alignSelf: 'stretch', flexGrow: 1 } : { height: track, alignSelf: 'stretch', flexGrow: 1 }),
    ...margins,
  }), [vertical, track, margins])

  const pad = Math.max(0, (TOUCH - track) / 2)

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={[rootStyle, style]}
      hitSlop={vertical ? { left: pad, right: pad } : { top: pad, bottom: pad }}
      onLayout={onLayout}
      onStartShouldSetResponder={() => !disabled}
      onMoveShouldSetResponder={() => !disabled}
      onResponderTerminationRequest={() => false}
      // Returning true keeps native parents (a ScrollView, a pager) from taking the drag
      onResponderGrant={(e) => { onGrant(e); return true }}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
    >
      {/* Track: overflow hidden, radius inherited from the root */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: rootRadius, overflow: 'hidden', backgroundColor: colors.track }}>
        <View style={{ position: 'absolute', [range.startEdge]: `${range.start}%`, [range.endEdge]: `${range.end}%`, ...(vertical ? { left: 0, right: 0 } : { top: 0, bottom: 0 }), borderRadius: rootRadius, backgroundColor: colors.range }}>
          {colors.rangeBorder ? <CardRing color={colors.rangeBorder} borderRadius={rootRadius} /> : null}
        </View>
        {colors.trackBorder ? <CardRing color={colors.trackBorder} borderRadius={rootRadius} /> : null}
      </View>

      {Array.from({ length: thumbCount }, (_, i) => {
        const v = values[i] ?? min
        const along = (thumbCenters[i] ?? 0) - discSize / 2
        return (
          <View
            key={i}
            pointerEvents="none"
            accessible
            accessibilityRole="adjustable"
            accessibilityLabel={thumbLabel(i, thumbCount)}
            accessibilityState={{ disabled }}
            accessibilityValue={{ min, max, now: v }}
            accessibilityActions={disabled ? [] : [{ name: 'increment' }, { name: 'decrement' }]}
            onAccessibilityAction={onAccessibilityAction(i)}
            style={[
              {
                position: 'absolute',
                width: discSize,
                height: discSize,
                borderRadius: thumbRadius,
                backgroundColor: colors.thumb,
                borderWidth: 1,
                borderColor: colors.thumbRing,
                ...(vertical ? { top: along } : { left: along }),
              },
              shadowStyle(colors.thumbShadow),
            ]}
          />
        )
      })}
    </View>
  )
}
Slider.displayName = 'Slider'
