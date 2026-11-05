import React from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useLayoutStyle } from '../../hooks/useLayoutStyle'
import type { SpaceToken } from '../../tokens/spacing'
import type { GapProps, LayoutProps } from '../../types/layoutProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Flex-specific value types ────────────────────────────────────────────────

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'
export type FlexJustify = 'start' | 'center' | 'end' | 'between'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'

// ─── Alignment helpers ────────────────────────────────────────────────────────

const ALIGN_MAP: Record<FlexAlign, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  baseline: 'baseline',
  stretch: 'stretch',
}

const JUSTIFY_MAP: Record<FlexJustify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FlexProps extends NativeViewProps, LayoutProps, GapProps {
  direction?: FlexDirection
  align?: FlexAlign
  justify?: FlexJustify
  wrap?: FlexWrap
}

/** Flexbox layout primitive. Renders as a View with display: flex (the RN default). */
export function Flex(props: FlexProps) {
  const {
    style: layoutStyle,
    rest: { direction = 'column', align, justify, wrap, gap, gapX, gapY, style, ...rest },
  } = useLayoutStyle(props)
  const { space } = useMetrics()
  const sp = (token: SpaceToken | undefined) => (token !== undefined ? space(token) : undefined)

  const flexStyle: ViewStyle = {
    flexDirection: direction,
    alignItems: align ? ALIGN_MAP[align] : undefined,
    justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
    flexWrap: wrap,
    rowGap: sp(gapY ?? gap),
    columnGap: sp(gapX ?? gap),
  }

  return <View style={[flexStyle, layoutStyle, style]} {...rest} />
}
Flex.displayName = 'Flex'
