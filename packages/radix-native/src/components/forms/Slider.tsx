import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View } from 'react-native'
import type { AccessibilityActionEvent, GestureResponderEvent, LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { CardRing } from '../internal/CardRing'
import { shadowStyle } from '../../utils/shadow'
import {
  getClosestValueIndex, percentOf, snapToStep, thumbCenter, thumbLabel, updateValues, valueFromPosition,
} from '../../utils/slider'
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

  // Horizontal slides from the left (inverted: right); vertical from the bottom (inverted: top)
  const fromEnd = vertical ? !inverted : inverted
  const minDistance = minStepsBetweenThumbs * step
  const config = { min, max, step }

  const drag = useRef<{ index: number; start: number[]; origin: number; page: number } | null>(null)
  const valuesRef = useRef(values)
  valuesRef.current = values

  const moveTo = useCallback((index: number, raw: number): number => {
    const snapped = snapToStep(raw, config)
    const current = valuesRef.current
    if (current[index] === snapped) return index
    const next = updateValues(current, index, snapped, minDistance)
    if (!next) return index
    valuesRef.current = next.values
    setValues(next.values)
    return next.index
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step, minDistance, setValues])

  const positionOf = (e: GestureResponderEvent) => (vertical ? e.nativeEvent.locationY : e.nativeEvent.locationX)
  const pageOf = (e: GestureResponderEvent) => (vertical ? e.nativeEvent.pageY : e.nativeEvent.pageX)

  const onGrant = (e: GestureResponderEvent) => {
    const origin = positionOf(e)
    const raw = valueFromPosition(origin, length, { min, max, fromEnd })
    const index = getClosestValueIndex(valuesRef.current, raw)
    drag.current = { index, start: valuesRef.current, origin, page: pageOf(e) }
    drag.current.index = moveTo(index, raw)
  }
  const onMove = (e: GestureResponderEvent) => {
    const d = drag.current
    if (!d) return
    // locationX can jump between targets on Android; follow the page delta from the grant
    const position = d.origin + (pageOf(e) - d.page)
    d.index = moveTo(d.index, valueFromPosition(position, length, { min, max, fromEnd }))
  }
  const onEnd = () => {
    const d = drag.current
    drag.current = null
    if (d && String(d.start) !== String(valuesRef.current)) onValueCommit?.(valuesRef.current)
  }

  const onAccessibilityAction = (index: number) => (e: AccessibilityActionEvent) => {
    const delta = e.nativeEvent.actionName === 'increment' ? step : e.nativeEvent.actionName === 'decrement' ? -step : 0
    if (!delta) return
    const before = valuesRef.current
    moveTo(index, before[index] + delta)
    if (String(before) !== String(valuesRef.current)) onValueCommit?.(valuesRef.current)
  }

  // ─── Geometry ───────────────────────────────────────────────────────────
  const percents = values.map((v) => percentOf(v, min, max))
  // Range: one value → from the start edge; several → between the outer thumbs
  const rangeStart = values.length > 1 ? Math.min(...percents) : 0
  const rangeEnd = 100 - Math.max(...percents)
  const startEdge = vertical ? (inverted ? 'top' : 'bottom') : (inverted ? 'right' : 'left')
  const endEdge = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[startEdge] as typeof startEdge

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
      onResponderGrant={onGrant}
      onResponderMove={onMove}
      onResponderRelease={onEnd}
      onResponderTerminate={onEnd}
    >
      {/* Track: overflow hidden, radius inherited from the root */}
      <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: rootRadius, overflow: 'hidden', backgroundColor: colors.track }}>
        <View style={{ position: 'absolute', [startEdge]: `${rangeStart}%`, [endEdge]: `${rangeEnd}%`, ...(vertical ? { left: 0, right: 0 } : { top: 0, bottom: 0 }), borderRadius: rootRadius, backgroundColor: colors.range }}>
          {colors.rangeBorder ? <CardRing color={colors.rangeBorder} borderRadius={rootRadius} /> : null}
        </View>
        {colors.trackBorder ? <CardRing color={colors.trackBorder} borderRadius={rootRadius} /> : null}
      </View>

      {Array.from({ length: thumbCount }, (_, i) => {
        const v = values[i] ?? min
        const center = thumbCenter(percentOf(v, min, max), length, thumbSize)
        const along = (fromEnd ? length - center : center) - discSize / 2
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
