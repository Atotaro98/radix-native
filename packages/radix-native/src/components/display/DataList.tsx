import React, { createContext, useContext, useMemo } from 'react'
import { Text as RNText, View } from 'react-native'
import type { DimensionValue, StyleProp, TextStyle, ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useWidest, useWidestCell, type WidestCells } from '../../hooks/useWidest'
import { Text } from '../typography/Text'
import { Link } from '../typography/Link'
import { Code } from '../typography/Code'
import { Em } from '../typography/Em'
import { Strong } from '../typography/Strong'
import { Quote } from '../typography/Quote'
import { Kbd } from '../typography/Kbd'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DataListSize = 1 | 2 | 3
export type DataListOrientation = 'horizontal' | 'vertical'
export type DataListTrim = 'normal' | 'start' | 'end' | 'both'
export type DataListItemAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'

export interface DataListRootProps extends NativeViewProps, MarginProps {
  /** Default: 'horizontal'. */
  orientation?: DataListOrientation
  /** Text size and gaps. Default: 2. */
  size?: DataListSize
  /** Removes the leading space above the first and / or below the last item. */
  trim?: DataListTrim
}

export interface DataListItemProps extends NativeViewProps {
  /** Vertical alignment of label and value (horizontal lists). Default: baseline. */
  align?: DataListItemAlign
}

export interface DataListLabelProps extends NativeViewProps {
  width?: DimensionValue
  minWidth?: DimensionValue
  maxWidth?: DimensionValue
  color?: AccentColor
  highContrast?: boolean
}

export type DataListValueProps = NativeViewProps

// ─── Size mappings (data-list.css) ────────────────────────────────────────────

// .rt-DataListRoot:where(.rt-r-size-N) gap: space-3, space-4, calc(space-4 * 1.25); unscaled px
const GAP: Record<DataListSize, number> = { 1: 12, 2: 16, 3: 20 }
// .rt-DataListLabel min-width (horizontal): a plain 120px, not scaled
const LABEL_MIN_WIDTH = 120

const ALIGN: Record<DataListItemAlign, ViewStyle['alignItems']> = {
  start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline', stretch: 'stretch',
}

// Value's -0.25em vertical margins (horizontal): [start, end, first item start, last item end]
const VALUE_TRIM: Record<DataListItemAlign, [number, number, number, number]> = {
  baseline: [-0.25, -0.25, 0, 0],
  start: [0, -0.25, 0, 0],
  center: [-0.25, -0.25, -0.25, -0.25],
  end: [-0.25, 0, 0, 0],
  stretch: [0, 0, 0, 0],
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface RootContextValue {
  orientation: DataListOrientation
  gap: number
  /** Font size of the list's Text size (Radix sets it on the `dl`). */
  fontSize: number
  textStyle: StyleProp<TextStyle>
  textProps: object
  provide: (children: React.ReactNode) => React.ReactNode
  /** The label column (subgrid stand-in): every label takes the widest. */
  labels: WidestCells
  trimStart: number
  trimEnd: number
}

const RootContext = createContext<RootContextValue | null>(null)
const ItemContext = createContext<{ align: DataListItemAlign; first: boolean; last: boolean }>({
  align: 'baseline', first: false, last: false,
})

function useRoot(part: string): RootContextValue {
  const ctx = useContext(RootContext)
  if (!ctx) throw new Error(`DataList.${part} must be used within DataList.Root`)
  return ctx
}

// ─── Inline content ───────────────────────────────────────────────────────────

/** Components that render as text and nest inside one RN Text (inheriting the list's size). */
const INLINE_TEXT = new Set<unknown>([Text, Link, Code, Em, Strong, Quote, Kbd])

/**
 * Radix sets the list's font on the `dl`, so text, Code, Link… inside a label
 * or value inherit it. RN only inherits inside a Text: runs of strings and
 * text components are merged into one Text at the list's size; other elements
 * (Badge, Flex, IconButton) render as they are.
 */
function renderInline(children: React.ReactNode, ctx: RootContextValue, color: string) {
  const nodes: React.ReactNode[] = []
  let run: React.ReactNode[] = []
  const flush = () => {
    if (run.length === 0) return
    nodes.push(
      <RNText key={`t${nodes.length}`} style={[ctx.textStyle, { color, flexShrink: 1 }]} {...ctx.textProps}>
        {ctx.provide(run)}
      </RNText>,
    )
    run = []
  }
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') run.push(child)
    else if (React.isValidElement(child) && INLINE_TEXT.has(child.type)) run.push(React.cloneElement(child, { key: child.key ?? `i${run.length}` }))
    else if (child != null && typeof child !== 'boolean') {
      flush()
      nodes.push(child)
    }
  })
  flush()
  return nodes
}

// ─── Parts ────────────────────────────────────────────────────────────────────

function DataListRoot({
  orientation = 'horizontal',
  size = 2,
  trim,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: DataListRootProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics()
  // The dl is also a .rt-Text of the list's size
  const text = useTextStyle({ size })
  const gap = metrics.px(GAP[size])

  // Subgrid stand-in: every label reports its natural width; all take the widest
  const labels = useWidest()

  // text-box-trim stand-in (.rt-DataListRoot:where(.rt-r-trim-*)): 0.42em / 0.36em − line-height / 2
  const lineHeight = typeof text.style.lineHeight === 'number' ? text.style.lineHeight : text.contextFontSize
  const trimStart = trim === 'start' || trim === 'both' ? 0.42 * text.contextFontSize - lineHeight / 2 : 0
  const trimEnd = trim === 'end' || trim === 'both' ? 0.36 * text.contextFontSize - lineHeight / 2 : 0

  const ctx = useMemo<RootContextValue>(() => ({
    orientation, gap, fontSize: text.contextFontSize, textStyle: text.style, textProps: text.textProps,
    provide: text.provide, labels, trimStart, trimEnd,
  }), [orientation, gap, text, labels, trimStart, trimEnd])

  const items = React.Children.toArray(children)
  // Hidden until every label is measured, so the first frame never shows unaligned columns
  const hidden = orientation === 'horizontal' && !labels.ready

  return (
    <View style={[{ rowGap: gap, opacity: hidden ? 0 : undefined }, margins, style]} {...rest}>
      <RootContext.Provider value={ctx}>
        {items.map((item, i) => (
          <ItemPosition key={React.isValidElement(item) && item.key != null ? item.key : i} first={i === 0} last={i === items.length - 1}>
            {item}
          </ItemPosition>
        ))}
      </RootContext.Provider>
    </View>
  )
}
DataListRoot.displayName = 'DataList.Root'

function ItemPosition({ first, last, children }: { first: boolean; last: boolean; children: React.ReactNode }) {
  const value = useMemo(() => ({ align: 'baseline' as DataListItemAlign, first, last }), [first, last])
  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>
}

function DataListItem({ align, style, children, ...rest }: DataListItemProps) {
  const root = useRoot('Item')
  const pos = useContext(ItemContext)
  const metrics = useMetrics()
  const horizontal = root.orientation === 'horizontal'
  const itemCtx = useMemo(() => ({ align: align ?? 'baseline', first: pos.first, last: pos.last }), [align, pos.first, pos.last])

  const itemStyle: ViewStyle = {
    ...(horizontal
      ? { flexDirection: 'row', columnGap: root.gap, alignItems: ALIGN[align ?? 'baseline'] }
      // vertical: flex column, gap space-1
      : { flexDirection: 'column', rowGap: metrics.space(1) }),
    marginTop: pos.first && root.trimStart ? root.trimStart : undefined,
    marginBottom: pos.last && root.trimEnd ? root.trimEnd : undefined,
  }

  return (
    <View style={[itemStyle, style]} {...rest}>
      <ItemContext.Provider value={itemCtx}>{children}</ItemContext.Provider>
    </View>
  )
}
DataListItem.displayName = 'DataList.Item'

function DataListLabel({ width, minWidth, maxWidth, color, highContrast, style, children, ...rest }: DataListLabelProps) {
  const root = useRoot('Label')
  const colors = useVariantColors('dataListLabel', { color, highContrast })
  const horizontal = root.orientation === 'horizontal'
  // A grid auto column is as wide as its widest cell, counting a cell's own width / min-width
  const ownWidth = Math.max(typeof width === 'number' ? width : 0, typeof minWidth === 'number' ? minWidth : 0)
  const onLayout = useWidestCell(root.labels, horizontal, ownWidth)

  const content = renderInline(children, root, colors.text)
  if (!horizontal) {
    return <View style={[{ flexDirection: 'row', minWidth: 0 }, style]} {...rest}>{content}</View>
  }
  return (
    <View
      style={[{
        flexDirection: 'row',
        flexShrink: 0,
        width: width ?? root.labels.widest ?? undefined,
        minWidth: minWidth ?? LABEL_MIN_WIDTH,
        maxWidth,
      }, style]}
      {...rest}
    >
      {/* Measures the label's own width; the outer View takes the column's (widest label) */}
      <View style={{ flexDirection: 'row', alignSelf: 'flex-start', maxWidth: '100%' }} onLayout={onLayout}>
        {content}
      </View>
    </View>
  )
}
DataListLabel.displayName = 'DataList.Label'

function DataListValue({ style, children, ...rest }: DataListValueProps) {
  const root = useRoot('Value')
  const { align, first, last } = useContext(ItemContext)
  const body = useVariantColors('text', {})
  const horizontal = root.orientation === 'horizontal'
  const [start, end, firstStart, lastEnd] = VALUE_TRIM[align]
  const valueStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: horizontal ? undefined : 'flex-start',
    flex: horizontal ? 1 : undefined,
    minWidth: 0,
    // Tall content (Badge, IconButton) may poke 0.25em out of the row without growing it
    marginTop: horizontal ? (first ? firstStart : start) * root.fontSize : 0,
    marginBottom: horizontal ? (last ? lastEnd : end) * root.fontSize : 0,
  }
  return (
    <View style={[valueStyle, style]} {...rest}>
      {renderInline(children, root, body.text)}
    </View>
  )
}
DataListValue.displayName = 'DataList.Value'

export const DataList = Object.assign(DataListRoot, {
  Root: DataListRoot,
  Item: DataListItem,
  Label: DataListLabel,
  Value: DataListValue,
})
