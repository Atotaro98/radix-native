/**
 * Grid — CSS-Grid-inspired layout component for React Native.
 *
 * Each direct child is placed in an equal-width cell; cells are grouped into
 * rows of `columns` (`flex: 1` per cell), so the layout is exact from the
 * first frame — no `onLayout` measurement, no width jump.
 *
 * ─── What it CAN do ────────────────────────────────────────────────────────────
 *  - Equal-width column grids: `<Grid columns={3} gap={3}>…</Grid>`
 *  - Theme-aware gap, padding, margin, background, and radius tokens
 *  - Consistent spacing via `gap` / `gapX` / `gapY` (mapped to space tokens)
 *  - Alignment of items within the grid via `align` / `justify`
 *
 * ─── What it CANNOT do (CSS Grid limitations in RN) ────────────────────────────
 *  - Mixed-width column templates (e.g. `"1fr 2fr"`, `"200px 1fr"`)
 *  - Row templates (`grid-template-rows`)
 *  - `grid-auto-flow: column`
 *  - Children spanning multiple columns/rows (`grid-column: span 2`)
 *  - Named grid areas (`grid-template-areas`)
 *  - Responsive breakpoint objects — use platform-specific logic instead
 *
 * ─── For scrolling & virtualization ────────────────────────────────────────────
 *  Grid is a layout container (View), NOT a scrollable list.
 *  If you need scrolling or virtualized rendering, use one of:
 *    - `<FlatList numColumns={N} />`       (React Native built-in)
 *    - `<FlashList numColumns={N} />`      (@shopify/flash-list)
 *    - `<LegendList numColumns={N} />`     (@legendapp/list)
 *  These support virtualization out of the box and are the right choice for
 *  long or dynamic lists rendered in a grid.
 */
import React from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useLayoutStyle } from '../../hooks/useLayoutStyle'
import type { GapProps, LayoutProps } from '../../types/layoutProps'
import type { NativeViewProps } from '../../types/nativeProps'
import { ColumnRows } from '../internal/ColumnRows'

// ─── Types ────────────────────────────────────────────────────────────────────

export type GridAlign = 'start' | 'center' | 'end' | 'stretch'
export type GridJustify = 'start' | 'center' | 'end' | 'between'

export interface GridProps extends NativeViewProps, LayoutProps, GapProps {
  /** Number of equal-width columns. Default: 1. */
  columns?: number
  /** Cross-axis alignment of items within their cells. */
  align?: GridAlign
  /** Horizontal alignment of items within their cells ('between' stretches them). */
  justify?: GridJustify
}

// ─── Alignment helpers ────────────────────────────────────────────────────────

const ALIGN_MAP: Record<GridAlign, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

const JUSTIFY_MAP: Record<GridJustify, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'stretch',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Grid(props: GridProps) {
  const {
    style: layoutStyle,
    rest: { columns = 1, gap, gapX, gapY, align, justify, style, children, ...rest },
  } = useLayoutStyle(props)
  const { space } = useMetrics()
  const columnGap = space(gapX ?? gap ?? 0)
  const rowGap = space(gapY ?? gap ?? 0)

  return (
    <View style={[layoutStyle, style]} {...rest}>
      <ColumnRows
        columns={columns}
        columnGap={columnGap}
        rowGap={rowGap}
        alignItems={ALIGN_MAP[align ?? 'stretch']}
        cellAlignItems={justify ? JUSTIFY_MAP[justify] : undefined}
      >
        {children}
      </ColumnRows>
    </View>
  )
}
Grid.displayName = 'Grid'
