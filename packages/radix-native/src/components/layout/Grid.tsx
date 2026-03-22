/**
 * Grid — CSS-Grid-inspired layout component for React Native.
 *
 * Renders a plain View with `flexDirection: 'row'` and `flexWrap: 'wrap'`.
 * Each direct child is automatically wrapped in a cell whose width is
 * calculated from the number of `columns` so items flow into a uniform grid.
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
import React, { useState, useCallback } from 'react'
import { View } from 'react-native'
import type { ViewStyle, LayoutChangeEvent, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveSpace } from '../../utils/resolveSpace'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'
import type { ThemeColor, RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type GridAlign = 'start' | 'center' | 'end' | 'stretch'
export type GridJustify = 'start' | 'center' | 'end' | 'between'

export interface GridProps extends NativeViewProps, MarginProps {
  /** Number of equal-width columns. Default: 1. */
  columns?: number
  /** Space token applied to both row and column gaps. */
  gap?: SpaceToken
  /** Space token for column (horizontal) gaps only. Overrides `gap`. */
  gapX?: SpaceToken
  /** Space token for row (vertical) gaps only. Overrides `gap`. */
  gapY?: SpaceToken
  /** Cross-axis alignment of items within their cells. */
  align?: GridAlign
  /** Main-axis justification of items within their cells. */
  justify?: GridJustify
  // ─── Padding ──────────────────────────────────────────────────────
  p?: SpaceToken
  px?: SpaceToken
  py?: SpaceToken
  pt?: SpaceToken
  pr?: SpaceToken
  pb?: SpaceToken
  pl?: SpaceToken
  // ─── Size ─────────────────────────────────────────────────────────
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  height?: number | string
  minHeight?: number | string
  maxHeight?: number | string
  // ─── Position ─────────────────────────────────────────────────────
  position?: 'relative' | 'absolute'
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  // ─── Layout ───────────────────────────────────────────────────────
  overflow?: 'hidden' | 'visible' | 'scroll'
  flexBasis?: number | string
  flexShrink?: number
  flexGrow?: number
  // ─── Theme ────────────────────────────────────────────────────────
  bg?: ThemeColor
  radius?: RadiusToken
  style?: StyleProp<ViewStyle>
}

// ─── Alignment helpers ────────────────────────────────────────────────────────

const ALIGN_MAP: Record<GridAlign, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
}

const JUSTIFY_MAP: Record<GridJustify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Grid({
  columns = 1,
  gap,
  gapX,
  gapY,
  align,
  justify,
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  width, minWidth, maxWidth,
  height, minHeight, maxHeight,
  position,
  top, right, bottom, left,
  overflow,
  flexBasis, flexShrink, flexGrow,
  bg,
  radius,
  style,
  children,
  onLayout: onLayoutProp,
  ...rest
}: GridProps) {
  const { scaling } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const sp = (token: SpaceToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const columnGap = sp(gapX ?? gap) ?? 0
  const rowGap = sp(gapY ?? gap) ?? 0

  // ─── Container width measurement ──────────────────────────────────────────
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      setContainerWidth(e.nativeEvent.layout.width)
      onLayoutProp?.(e)
    },
    [onLayoutProp],
  )

  // ─── Cell width calculation ───────────────────────────────────────────────
  // totalGapWidth = (columns - 1) * columnGap
  // cellWidth = (containerWidth - totalGapWidth) / columns
  const cols = Math.max(1, Math.round(columns))
  const cellWidth =
    containerWidth > 0
      ? (containerWidth - (cols - 1) * columnGap) / cols
      : undefined

  // ─── Container style ─────────────────────────────────────────────────────
  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: ALIGN_MAP[align ?? 'stretch'],
    justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
    rowGap,
    columnGap,
    // Padding
    paddingTop:    sp(pt ?? py ?? p),
    paddingBottom: sp(pb ?? py ?? p),
    paddingLeft:   sp(pl ?? px ?? p),
    paddingRight:  sp(pr ?? px ?? p),
    // Margin
    ...margins,
    // Size
    width:     width     as ViewStyle['width'],
    minWidth:  minWidth  as ViewStyle['minWidth'],
    maxWidth:  maxWidth  as ViewStyle['maxWidth'],
    height:    height    as ViewStyle['height'],
    minHeight: minHeight as ViewStyle['minHeight'],
    maxHeight: maxHeight as ViewStyle['maxHeight'],
    // Position
    position,
    top: top as ViewStyle['top'],
    right: right as ViewStyle['right'],
    bottom: bottom as ViewStyle['bottom'],
    left: left as ViewStyle['left'],
    // Layout
    overflow: overflow as ViewStyle['overflow'],
    flexBasis: flexBasis as ViewStyle['flexBasis'],
    flexShrink,
    flexGrow,
    // Theme
    backgroundColor: bg ? rc(bg) : undefined,
    borderRadius: radius
      ? (radius === 'full' ? getFullRadius(radius) : getRadius(radius, 4))
      : undefined,
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  const items = React.Children.toArray(children)

  return (
    <View style={[containerStyle, style]} onLayout={handleLayout} {...rest}>
      {items.map((child, idx) => (
        <View key={(child as React.ReactElement).key ?? `cell-${idx}`} style={{ width: cellWidth }}>
          {child}
        </View>
      ))}
    </View>
  )
}
Grid.displayName = 'Grid'
