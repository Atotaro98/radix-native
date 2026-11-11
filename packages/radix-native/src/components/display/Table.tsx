import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ScrollView, View } from 'react-native'
import type { LayoutChangeEvent, ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { renderInlineText } from '../internal/inlineText'
import { resolveColumnWidths, type TableCellSize, type TableLength } from '../../utils/tableLayout'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { TextSize } from '../typography/Text'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import type { PaddingProps } from '../../types/layoutProps'
import type { TableVariant } from '../../utils/variantPalette'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TableSize = 1 | 2 | 3
export type { TableVariant, TableLength }
export type TableLayout = 'auto' | 'fixed'
export type TableRowAlign = 'start' | 'center' | 'end' | 'baseline'
export type TableCellJustify = 'start' | 'center' | 'end'

export interface TableRootProps extends NativeViewProps, MarginProps {
  /** Default: 2. */
  size?: TableSize
  /** Default: 'ghost'. */
  variant?: TableVariant
  /** Default: 'auto' (columns sized by content), like the browser. */
  layout?: TableLayout
}

export type TableSectionProps = NativeViewProps

export interface TableRowProps extends NativeViewProps {
  /** Vertical alignment of the cells. Default: start (top). */
  align?: TableRowAlign
}

export interface TableCellProps extends NativeViewProps, PaddingProps {
  justify?: TableCellJustify
  /** Number, `'Npx'` or `'N%'` of the table's width. Any cell's width sizes its column. */
  width?: TableLength
  minWidth?: TableLength
  maxWidth?: TableLength
}

// ─── Size mappings (table.css .rt-TableRoot:where(.rt-r-size-N)) ──────────────

interface SizeConfig {
  radius: RadiusLevel
  paddingY: SpaceToken
  paddingX: SpaceToken
  /** --table-cell-min-height, unscaled px. */
  minHeight: number
  fontSize: TextSize
}

const SIZES: Record<TableSize, SizeConfig> = {
  1: { radius: 3, paddingY: 2, paddingX: 2, minHeight: 36, fontSize: 2 },
  2: { radius: 4, paddingY: 3, paddingX: 3, minHeight: 44, fontSize: 2 },
  3: { radius: 4, paddingY: 3, paddingX: 4, minHeight: 48, fontSize: 3 },
}

const ALIGN: Record<TableRowAlign, ViewStyle['alignItems']> = { start: 'flex-start', center: 'center', end: 'flex-end', baseline: 'baseline' }
const JUSTIFY: Record<TableCellJustify, ViewStyle['alignItems']> = { start: 'flex-start', center: 'center', end: 'flex-end' }

// ─── Contexts ─────────────────────────────────────────────────────────────────

interface TableContextValue {
  size: TableSize
  variant: TableVariant
  layout: TableLayout
  colors: { text: string; divider: string; headerBg?: string }
  widths: number[] | null
  register: (id: object, cell: TableCellSize) => () => void
  report: (id: object, natural: number) => void
}

const TableContext = createContext<TableContextValue | null>(null)
const SectionContext = createContext<{ header: boolean; first: boolean }>({ header: false, first: false })
const RowContext = createContext<{ first: boolean; last: boolean; col: number }>({ first: false, last: false, col: 0 })

function useTable(part: string): TableContextValue {
  const ctx = useContext(TableContext)
  if (!ctx) throw new Error(`Table.${part} must be used within Table.Root`)
  return ctx
}

// ─── Root ─────────────────────────────────────────────────────────────────────

/**
 * Semantic table presentation, like Radix Themes `Table`. RN has no table
 * layout: every cell reports its natural width, each column takes its widest
 * cell (auto) or the first row's widths (fixed), and the table stays hidden
 * until that is known. A table wider than its container scrolls sideways.
 */
function TableRoot({
  size = 2,
  variant = 'ghost',
  layout = 'auto',
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: TableRootProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics()
  const colors = useVariantColors('table', { variant })
  const surface = variant === 'surface'
  const borderRadius = metrics.radius(SIZES[size].radius)

  const cells = useRef(new Map<object, TableCellSize>())
  const [version, setVersion] = useState(0)
  const [available, setAvailable] = useState(0)

  const register = useCallback((id: object, cell: TableCellSize) => {
    cells.current.set(id, cell)
    setVersion((v) => v + 1)
    return () => {
      cells.current.delete(id)
      setVersion((v) => v + 1)
    }
  }, [])
  const report = useCallback((id: object, natural: number) => {
    const cell = cells.current.get(id)
    if (!cell || cell.natural === natural) return
    cells.current.set(id, { ...cell, natural })
    setVersion((v) => v + 1)
  }, [])

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    // The surface border is drawn inside the root
    setAvailable(e.nativeEvent.layout.width - (surface ? 2 : 0))
  }, [surface])

  const widths = useMemo(() => {
    void version
    const list = Array.from(cells.current.values())
    const columns = list.reduce((n, c) => Math.max(n, c.col + 1), 0)
    const measured = layout === 'fixed' || list.every((c) => c.natural !== undefined)
    if (!available || !columns || !measured) return null
    return resolveColumnWidths(list, columns, available, layout)
  }, [version, available, layout])

  const ctx = useMemo<TableContextValue>(() => ({
    size, variant, layout,
    colors: { text: colors.text, divider: colors.divider, headerBg: colors.headerBg },
    widths, register, report,
  }), [size, variant, layout, colors.text, colors.divider, colors.headerBg, widths, register, report])

  const sections = React.Children.toArray(children)
  const tableWidth = widths ? widths.reduce((a, b) => a + b, 0) : undefined

  return (
    <View
      onLayout={onLayout}
      style={[
        surface && { borderWidth: 1, borderColor: colors.border, borderRadius, backgroundColor: colors.bg, overflow: 'hidden' },
        { opacity: widths ? undefined : 0 },
        margins,
        style,
      ]}
      {...rest}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} scrollEnabled={!!tableWidth && tableWidth > available}>
        <View style={{ width: tableWidth }}>
          <TableContext.Provider value={ctx}>
            {sections.map((section, i) => (
              <SectionPosition key={React.isValidElement(section) && section.key != null ? section.key : i} first={i === 0}>
                {section}
              </SectionPosition>
            ))}
          </TableContext.Provider>
        </View>
      </ScrollView>
    </View>
  )
}
TableRoot.displayName = 'Table.Root'

/** Which section is first (its first row drives fixed layout). */
const SectionFirst = createContext(false)
function SectionPosition({ first, children }: { first: boolean; children: React.ReactNode }) {
  return <SectionFirst.Provider value={first}>{children}</SectionFirst.Provider>
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function makeSection(header: boolean, name: string) {
  function Section({ style, children, ...rest }: TableSectionProps) {
    useTable(name)
    const first = useContext(SectionFirst)
    const rows = React.Children.toArray(children)
    return (
      <View style={style} {...rest}>
        {rows.map((row, i) => (
          <SectionContext.Provider key={React.isValidElement(row) && row.key != null ? row.key : i} value={{ header, first: first && i === 0 }}>
            <RowContext.Provider value={{ first: first && i === 0, last: !header && i === rows.length - 1, col: 0 }}>
              {row}
            </RowContext.Provider>
          </SectionContext.Provider>
        ))}
      </View>
    )
  }
  Section.displayName = `Table.${name}`
  return Section
}

const TableHeader = makeSection(true, 'Header')
const TableBody = makeSection(false, 'Body')

// ─── Row ──────────────────────────────────────────────────────────────────────

function TableRow({ align = 'start', style, children, ...rest }: TableRowProps) {
  const table = useTable('Row')
  const section = useContext(SectionContext)
  const position = useContext(RowContext)
  const cells = React.Children.toArray(children)
  // surface: the last body row has no divider
  const divider = !(table.variant === 'surface' && position.last)
  return (
    <View
      style={[{
        flexDirection: 'row',
        alignItems: ALIGN[align],
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: table.colors.divider,
        backgroundColor: section.header ? table.colors.headerBg : undefined,
      }, style]}
      {...rest}
    >
      {cells.map((cell, col) => (
        <RowContext.Provider key={React.isValidElement(cell) && cell.key != null ? cell.key : col} value={{ ...position, col }}>
          {cell}
        </RowContext.Provider>
      ))}
    </View>
  )
}
TableRow.displayName = 'Table.Row'

// ─── Cells ────────────────────────────────────────────────────────────────────

function makeCell(kind: 'cell' | 'column' | 'row', name: string) {
  function Cell({
    justify = 'start', width, minWidth, maxWidth,
    p, px, py, pt, pr, pb, pl,
    style, children, ...rest
  }: TableCellProps) {
    const table = useTable(name)
    const { col, first } = useContext(RowContext)
    const metrics = useMetrics()
    const cfg = SIZES[table.size]
    // ColumnHeaderCell is bold (700, not medium); RowHeaderCell normal
    const text = useTextStyle({ size: cfg.fontSize, weight: kind === 'column' ? 'bold' : 'regular' })
    const id = useRef({}).current
    const { register, report } = table

    useLayoutEffect(
      () => register(id, { col, width, minWidth, maxWidth, firstRow: first }),
      [register, id, col, width, minWidth, maxWidth, first],
    )
    const onLayout = useCallback((e: LayoutChangeEvent) => report(id, e.nativeEvent.layout.width), [report, id])

    const sp = (token: SpaceToken | undefined) => (token === undefined ? undefined : metrics.space(token))
    const padding: ViewStyle = {
      paddingTop: sp(pt ?? py ?? p) ?? metrics.space(cfg.paddingY),
      paddingBottom: sp(pb ?? py ?? p) ?? metrics.space(cfg.paddingY),
      paddingLeft: sp(pl ?? px ?? p) ?? metrics.space(cfg.paddingX),
      paddingRight: sp(pr ?? px ?? p) ?? metrics.space(cfg.paddingX),
    }

    return (
      <View
        accessibilityRole={kind === 'column' ? 'header' : undefined}
        style={[{
          width: table.widths?.[col],
          minHeight: metrics.px(cfg.minHeight),
          alignItems: JUSTIFY[justify],
          alignSelf: 'stretch',
        }, style]}
        {...rest}
      >
        {/* The cell's natural (max-content) width, padding included */}
        <View
          onLayout={table.layout === 'auto' ? onLayout : undefined}
          style={[padding, { flexDirection: 'row', maxWidth: '100%' }]}
        >
          {renderInlineText(children, { textStyle: [text.style, { textAlign: justify === 'start' ? 'left' : justify === 'end' ? 'right' : 'center' }], textProps: text.textProps, provide: text.provide }, table.colors.text)}
        </View>
      </View>
    )
  }
  Cell.displayName = `Table.${name}`
  return Cell
}

const TableCell = makeCell('cell', 'Cell')
const TableColumnHeaderCell = makeCell('column', 'ColumnHeaderCell')
const TableRowHeaderCell = makeCell('row', 'RowHeaderCell')

export const Table = Object.assign(TableRoot, {
  Root: TableRoot,
  Header: TableHeader,
  Body: TableBody,
  Row: TableRow,
  Cell: TableCell,
  ColumnHeaderCell: TableColumnHeaderCell,
  RowHeaderCell: TableRowHeaderCell,
})
