import React, { createContext, useContext, useMemo } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import type { AccessibilityRole, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useControl } from './control'
import { ControlLabel, WeightReserve } from './ControlLabel'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadiusLevel } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'
import type { TextSize } from '../typography/Text'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

export type TabListSize = 1 | 2
export type TabListWrap = 'nowrap' | 'wrap' | 'wrap-reverse'
export type TabListJustify = 'start' | 'center' | 'end'

/** Radix `baseTabListPropDefs`, shared by Tabs.List and TabNav.Root. */
export interface BaseTabListProps extends NativeViewProps, MarginProps {
  /** Default: 2. */
  size?: TabListSize
  /** Default: no wrapping (the list scrolls sideways). */
  wrap?: TabListWrap
  justify?: TabListJustify
  /** Accent color of the active bar. */
  color?: AccentColor
  /** The active bar in accent-12. */
  highContrast?: boolean
}

// base-tab-list.css .rt-BaseTabList:where(.rt-r-size-N)
interface SizeConfig {
  height: SpaceToken
  paddingX: SpaceToken
  innerPaddingX: SpaceToken
  /** Unscaled px: size 1 is --space-1 × 0.5. */
  innerPaddingY: number
  innerRadius: RadiusLevel
  fontSize: TextSize
}

const SIZES: Record<TabListSize, SizeConfig> = {
  1: { height: 6, paddingX: 1, innerPaddingX: 1, innerPaddingY: 2, innerRadius: 1, fontSize: 1 },
  2: { height: 7, paddingX: 2, innerPaddingX: 2, innerPaddingY: 4, innerRadius: 2, fontSize: 2 },
}

const JUSTIFY: Record<TabListJustify, ViewStyle['justifyContent']> = { start: 'flex-start', center: 'center', end: 'flex-end' }

interface TabListContextValue {
  size: TabListSize
  color?: AccentColor
  highContrast?: boolean
}

const TabListContext = createContext<TabListContextValue>({ size: 2 })

/**
 * Internal: Radix's BaseTabList — a row of triggers over a 1px gray-a5 rule.
 * Without `wrap` it scrolls sideways (Radix `overflow-x: auto`, scrollbar hidden).
 */
export function BaseTabList({
  size = 2, wrap, justify, color, highContrast, role,
  m, mx, my, mt, mr, mb, ml, style, children, ...rest
}: BaseTabListProps & { role?: AccessibilityRole }) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const colors = useVariantColors('tabList', { color, highContrast })
  const ctx = useMemo(() => ({ size, color, highContrast }), [size, color, highContrast])
  const row: ViewStyle = {
    flexDirection: 'row',
    justifyContent: JUSTIFY[justify ?? 'start'],
    flexWrap: wrap === 'wrap' ? 'wrap' : wrap === 'wrap-reverse' ? 'wrap-reverse' : 'nowrap',
  }
  const wraps = wrap === 'wrap' || wrap === 'wrap-reverse'

  return (
    <View accessibilityRole={role} style={[margins, style]} {...rest}>
      {/* box-shadow: inset 0 -1px 0 0 var(--gray-a5) */}
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, backgroundColor: colors.rule }} />
      <TabListContext.Provider value={ctx}>
        {wraps ? (
          <View style={row}>{children}</View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[row, { flexGrow: 1 }]}>
            {children}
          </ScrollView>
        )}
      </TabListContext.Provider>
    </View>
  )
}

interface BaseTabTriggerProps extends Omit<NativeViewProps, 'children'> {
  active: boolean
  disabled?: boolean
  onPress?: (e: GestureResponderEvent) => void
  /** `tab` (Tabs) or `link` (TabNav). */
  role: 'tab' | 'link'
  children?: React.ReactNode
}

/**
 * Internal: Radix's BaseTabListTrigger. The active trigger is gray-12 with a
 * medium label and a 2px bar along its bottom edge (no animation, as in Radix);
 * the label reserves the width of both weights, so it never changes.
 */
export function BaseTabTrigger({ active, disabled, onPress, role, style, children, ...rest }: BaseTabTriggerProps) {
  const list = useContext(TabListContext)
  const metrics = useMetrics()
  const cfg = SIZES[list.size]
  const colors = useVariantColors('tabList', { color: list.color, highContrast: list.highContrast, active })
  const innerRadius = metrics.radius(cfg.innerRadius)
  // No press scale (plain Pressable); the focus outline sits on the inner, offset −2px
  const control = useControl({
    props: rest,
    children,
    role,
    onPress,
    disabled: !!disabled,
    state: { selected: active },
    focusRing: { color: list.color, borderRadius: innerRadius },
  })

  // --tab-active-letter-spacing −0.01em / --tab-inactive-letter-spacing 0
  const label = (weight: 'medium' | 'regular') => (
    <ControlLabel size={cfg.fontSize} weight={weight} letterSpacingEm={weight === 'medium' ? -0.01 : 0} truncate={false} color={colors.text}>
      {children}
    </ControlLabel>
  )
  const inner: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.space(1),
    paddingVertical: metrics.px(cfg.innerPaddingY),
    paddingHorizontal: metrics.space(cfg.innerPaddingX),
    borderRadius: innerRadius,
  }

  return (
    <Pressable
      {...control.pressableProps}
      style={[{
        height: metrics.space(cfg.height),
        paddingHorizontal: metrics.space(cfg.paddingX),
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
      }, style as StyleProp<ViewStyle>]}
    >
      {/* .rt-BaseTabListTriggerInnerHidden: the hidden copies reserve the width */}
      {control.wrap(
        <WeightReserve label={label} style={inner}>
          {label(active ? 'medium' : 'regular')}
          {control.focusRing}
        </WeightReserve>,
      )}
      {active ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, backgroundColor: colors.indicator }} />
      ) : null}
    </Pressable>
  )
}
