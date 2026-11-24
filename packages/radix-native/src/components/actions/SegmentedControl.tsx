import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import { useControllableState } from '../../hooks/useControllableState'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useWidest, useWidestCell, type WidestCells } from '../../hooks/useWidest'
import { useControl } from '../internal/control'
import { ControlLabel } from '../internal/ControlLabel'
import { shadowStyle } from '../../utils/shadow'
import type { RadiusToken } from '../../theme/theme.types'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { TextSize } from '../typography/Text'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import type { SegmentedVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SegmentedControlSize = 1 | 2 | 3
export type SegmentedControlVariant = SegmentedVariant

export interface SegmentedControlRootProps extends NativeViewProps, MarginProps {
  /** Default: 2. */
  size?: SegmentedControlSize
  /** Default: 'surface'. */
  variant?: SegmentedControlVariant
  /** Overrides the Theme's radius. */
  radius?: RadiusToken
  /** Disables every item (Radix has no per-item disabled). */
  disabled?: boolean
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
}

export interface SegmentedControlItemProps extends Omit<NativeViewProps, 'children'> {
  value: string
  children?: React.ReactNode
}

// ─── Size mappings (segmented-control.css .rt-r-size-N) ───────────────────────

interface SizeConfig {
  height: SpaceToken
  radiusLevel: RadiusLevel
  fontSize: TextSize
  paddingX: SpaceToken
  gap: SpaceToken
}

const SIZES: Record<SegmentedControlSize, SizeConfig> = {
  1: { height: 5, radiusLevel: 2, fontSize: 1, paddingX: 3, gap: 1 },
  2: { height: 6, radiusLevel: 2, fontSize: 2, paddingX: 4, gap: 2 },
  3: { height: 7, radiusLevel: 3, fontSize: 3, paddingX: 4, gap: 3 },
}

// --segmented-control-transition-duration and its easing; labels / separators fade in 0.8 × that
const INDICATOR_TIMING = { duration: 100, easing: Easing.bezier(0.445, 0.05, 0.55, 0.95) }
const FADE_DURATION = 80

// ─── Context ──────────────────────────────────────────────────────────────────

interface RootContextValue {
  value: string | undefined
  select: (value: string) => void
  disabled: boolean
  size: SegmentedControlSize
  borderRadius: number
  text: string
  separator: string
  /** Values in order, to place separators and the indicator. */
  values: string[]
  cells: WidestCells
  reducedMotion: boolean
}

const RootContext = createContext<RootContextValue | null>(null)

// ─── Root ─────────────────────────────────────────────────────────────────────

/**
 * Toggle buttons for switching between values, like Radix Themes
 * `SegmentedControl`: single choice that can't be cleared, every item as wide
 * as the widest (Radix's `grid-auto-columns: 1fr`), and an indicator that
 * slides to the checked item (100ms; none under Reduce Motion).
 */
function SegmentedControlRoot({
  size = 2,
  variant = 'surface',
  radius,
  disabled = false,
  value: valueProp,
  defaultValue,
  onValueChange,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: SegmentedControlRootProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics({ radius })
  const colors = useVariantColors('segmented', { variant, disabled })
  const reducedMotion = useReducedMotion()
  const cfg = SIZES[size]
  const height = metrics.space(cfg.height)
  // --segmented-control-border-radius: max(var(--radius-N), var(--radius-full))
  const borderRadius = metrics.radius(cfg.radiusLevel, 'pill')

  const [value, setValue] = useControllableState<string | undefined>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange as ((v: string | undefined) => void) | undefined,
  })
  // Radix ignores the empty value ToggleGroup sends on a second press: no deselecting
  const select = useCallback((v: string) => { if (!disabled) setValue(v) }, [disabled, setValue])

  const items = React.Children.toArray(children).filter(React.isValidElement<SegmentedControlItemProps>)
  const values = items.map((item) => item.props.value)
  const cells = useWidest()
  const itemWidth = cells.widest ?? 0
  const index = value === undefined ? -1 : values.indexOf(value)

  // Indicator: translateX(index × 100%), animated unless Reduce Motion
  const x = useSharedValue(Math.max(index, 0) * itemWidth)
  useEffect(() => {
    const target = Math.max(index, 0) * itemWidth
    x.value = reducedMotion || !cells.ready ? target : withTiming(target, INDICATOR_TIMING)
  }, [index, itemWidth, reducedMotion, cells.ready, x])
  const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }))

  const ctx = useMemo<RootContextValue>(() => ({
    value, select, disabled, size, borderRadius, text: colors.text, separator: colors.separator, values, cells, reducedMotion,
  }), [value, select, disabled, size, borderRadius, colors.text, colors.separator, values, cells, reducedMotion])

  const rootStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignSelf: 'flex-start',
    height,
    borderRadius,
    backgroundColor: colors.bg,
    opacity: cells.ready ? undefined : 0,
    ...margins,
  }), [height, borderRadius, colors.bg, cells.ready, margins])

  const ringWidth = colors.indicatorRing ? 1 : 0

  return (
    <View accessibilityRole="radiogroup" style={[rootStyle, style]} {...rest}>
      {index >= 0 && itemWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute', top: 0, left: 0, height: '100%', width: itemWidth,
              // ::before inset 1px with a 1px ring = the full cell; disabled: inset 0, no ring
              borderRadius,
              borderWidth: ringWidth,
              borderColor: colors.indicatorRing,
              backgroundColor: colors.indicator,
            },
            shadowStyle(colors.indicatorShadow),
            indicatorStyle,
          ]}
        />
      ) : null}
      <RootContext.Provider value={ctx}>{items}</RootContext.Provider>
    </View>
  )
}
SegmentedControlRoot.displayName = 'SegmentedControl.Root'

// ─── Item ─────────────────────────────────────────────────────────────────────

function SegmentedControlItem({ value, children, style, ...rest }: SegmentedControlItemProps) {
  const ctx = useContext(RootContext)
  if (!ctx) throw new Error('SegmentedControl.Item must be used within SegmentedControl.Root')
  const metrics = useMetrics()
  const cfg = SIZES[ctx.size]
  // Active label: medium weight; inactive: regular (segmented-control.css ItemLabelActive / Inactive)
  const onLayout = useWidestCell(ctx.cells)

  const index = ctx.values.indexOf(value)
  const checkedIndex = ctx.value === undefined ? -1 : ctx.values.indexOf(ctx.value)
  const checked = index === checkedIndex
  const first = index === 0
  const last = index === ctx.values.length - 1
  // Separator hidden on the first item, the checked one and the one after it
  const separatorVisible = !first && !checked && index !== checkedIndex + 1

  const fade = (on: boolean) => (ctx.reducedMotion ? (on ? 1 : 0) : withTiming(on ? 1 : 0, {
    duration: FADE_DURATION,
    easing: on ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
  }))
  const active = useSharedValue(checked ? 1 : 0)
  const sep = useSharedValue(separatorVisible ? 1 : 0)
  useEffect(() => { active.value = fade(checked) })
  useEffect(() => { sep.value = fade(separatorVisible) })
  const activeStyle = useAnimatedStyle(() => ({ opacity: active.value }))
  const inactiveStyle = useAnimatedStyle(() => ({ opacity: 1 - active.value }))
  const sepStyle = useAnimatedStyle(() => ({ opacity: sep.value }))

  // --tab-active-letter-spacing −0.01em / --tab-inactive-letter-spacing 0 replace the size's spacing
  const row: ViewStyle = { flexDirection: 'row', alignItems: 'center', gap: metrics.space(cfg.gap) }
  const label = (weight: 'medium' | 'regular') => (
    <View style={row}>
      <ControlLabel size={cfg.fontSize} weight={weight} letterSpacingEm={weight === 'medium' ? -0.01 : 0} truncate={false} color={ctx.text}>
        {children}
      </ControlLabel>
    </View>
  )

  const select = useCallback(() => ctx.select(value), [ctx, value])
  // No press scale (plain Pressable); the focus ring follows the root's corners on the ends
  const control = useControl({
    props: rest,
    children,
    role: 'radio',
    onPress: select,
    disabled: ctx.disabled,
    state: { checked },
    focusRing: { borderRadius: first || last ? ctx.borderRadius : 0 },
  })

  const corner = {
    borderTopLeftRadius: first ? ctx.borderRadius : 0,
    borderBottomLeftRadius: first ? ctx.borderRadius : 0,
    borderTopRightRadius: last ? ctx.borderRadius : 0,
    borderBottomRightRadius: last ? ctx.borderRadius : 0,
  }

  return (
    <Pressable
      {...control.pressableProps}
      style={[{ justifyContent: 'center', alignItems: 'center', width: ctx.cells.widest ?? undefined }, corner, style as StyleProp<ViewStyle>]}
    >
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: -0.5, top: 3, bottom: 3, width: 1, backgroundColor: ctx.separator }, sepStyle]}
      />
      {/* Natural width, measured for the shared column; padding-x per size */}
      <View onLayout={onLayout} style={{ paddingHorizontal: metrics.space(cfg.paddingX), alignSelf: 'center' }}>
        {/* Rendered twice (medium in flow, regular over it) so the width never changes, like Radix.
            Not WeightReserve: on Android a zero-height reserving copy of the regular label made
            the visible one lose its last letter (React Native caches text layouts by string and style) */}
        {control.wrap(
          <>
            <Animated.View style={activeStyle}>{label('medium')}</Animated.View>
            <Animated.View style={[CENTERED, inactiveStyle]} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              {label('regular')}
            </Animated.View>
          </>,
        )}
      </View>
      {control.focusRing}
    </Pressable>
  )
}
SegmentedControlItem.displayName = 'SegmentedControl.Item'

const CENTERED: ViewStyle = { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }

export const SegmentedControl = Object.assign(SegmentedControlRoot, {
  Root: SegmentedControlRoot,
  Item: SegmentedControlItem,
})
