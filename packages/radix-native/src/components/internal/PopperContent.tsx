import React, { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import type { AccessibilityRole, DimensionValue, StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
import { AnchoredContent, type AnchoredContentProps } from './AnchoredContent'
import { CardRing } from './CardRing'
import { InsetContext, type InsetValues } from '../layout/InsetContext'
import type { RadiusLevel } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'

export type PanelSize = 1 | 2 | 3 | 4

// popover.css / hover-card.css .rt-*Content:where(.rt-r-size-N)
const SIZES: Record<PanelSize, { padding: SpaceToken; radius: RadiusLevel }> = {
  1: { padding: 3, radius: 4 },
  2: { padding: 4, radius: 4 },
  3: { padding: 5, radius: 5 },
  4: { padding: 6, radius: 5 },
}

/** Padding and radius of a Popover / HoverCard panel of this size, in px. */
export function usePanelSize(size: PanelSize): { padding: number; borderRadius: number } {
  const metrics = useMetrics()
  return { padding: metrics.space(SIZES[size].padding), borderRadius: metrics.radius(SIZES[size].radius) }
}

export interface PopperContentProps extends Omit<AnchoredContentProps, 'children' | 'style'> {
  /** Panel padding and radius in px (from the component's size table). */
  padding: number
  borderRadius: number
  accessibilityRole?: AccessibilityRole
  accessibilityLabel?: string
  /** Publishes the padding as Inset values, so an Inset inside reaches the panel edges (Popover, HoverCard). */
  inset?: boolean
  width?: DimensionValue
  minWidth?: DimensionValue
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  /** Default: the space left on the placed side. */
  maxHeight?: DimensionValue
  /** The panel's style. */
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/**
 * Internal: an Anchored overlay drawn as Radix's `.rt-PopperContent` panel —
 * Popover, HoverCard, menus, sub-menus and Select. A solid panel with the
 * shadow's 1px ring over the content, scrolling within the space left on the
 * placed side (`overflow: auto`). Placement, layer and animation come from
 * AnchoredContent.
 */
export function PopperContent({
  padding, borderRadius, accessibilityRole, accessibilityLabel, inset = false,
  width, minWidth, maxWidth, height, minHeight, maxHeight, style, children, ...anchored
}: PopperContentProps) {
  const colors = useVariantColors('popperPanel', {})
  const insetValues = useMemo<InsetValues>(() => ({
    padding: { top: padding, right: padding, bottom: padding, left: padding }, borderWidth: 0, borderRadius: 0,
  }), [padding])

  return (
    <AnchoredContent {...anchored}>
      {(placement) => (
        <View
          accessibilityRole={accessibilityRole}
          accessibilityLabel={accessibilityLabel}
          style={[
            {
              width, minWidth, maxWidth, height, minHeight,
              maxHeight: maxHeight ?? placement?.availableHeight,
              borderRadius,
              backgroundColor: colors.panel,
            },
            shadowStyle(colors.shadow),
            style,
          ]}
        >
          {/* flexGrow 0: a ScrollView grows to its parent's max-height otherwise, inflating the measured size */}
          <ScrollView bounces={false} style={{ borderRadius, flexGrow: 0 }} contentContainerStyle={{ padding }}>
            {inset ? <InsetContext.Provider value={insetValues}>{children}</InsetContext.Provider> : children}
          </ScrollView>
          <CardRing color={colors.ring} borderRadius={borderRadius} />
        </View>
      )}
    </AnchoredContent>
  )
}
