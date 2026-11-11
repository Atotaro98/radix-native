import React, { useMemo } from 'react'
import { ScrollView, View } from 'react-native'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
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

export interface PopperPanelProps {
  size: PanelSize
  width?: DimensionValue
  minWidth?: DimensionValue
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  /** Default: the space left on the placed side. */
  maxHeight?: DimensionValue
  availableHeight?: number
  style?: StyleProp<ViewStyle>
  accessibilityLabel?: string
  children?: React.ReactNode
}

/**
 * Internal: the panel of Popover and HoverCard — solid panel, the shadow's 1px
 * ring over the content, padding and radius per size (also the Inset values),
 * scrolling within the space left (`overflow: auto`).
 */
export function PopperPanel({
  size, width, minWidth, maxWidth, height, minHeight, maxHeight, availableHeight, style, accessibilityLabel, children,
}: PopperPanelProps) {
  const metrics = useMetrics()
  const colors = useVariantColors('popperPanel', {})
  const cfg = SIZES[size]
  const padding = metrics.space(cfg.padding)
  const borderRadius = metrics.radius(cfg.radius)
  const inset = useMemo<InsetValues>(() => ({
    padding: { top: padding, right: padding, bottom: padding, left: padding }, borderWidth: 0, borderRadius: 0,
  }), [padding])

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      style={[
        { width, minWidth, maxWidth, height, minHeight, maxHeight: maxHeight ?? availableHeight, borderRadius, backgroundColor: colors.panel },
        shadowStyle(colors.shadow),
        style,
      ]}
    >
      <ScrollView bounces={false} style={{ borderRadius }} contentContainerStyle={{ padding }}>
        <InsetContext.Provider value={inset}>{children}</InsetContext.Provider>
      </ScrollView>
      <CardRing color={colors.ring} borderRadius={borderRadius} />
    </View>
  )
}
