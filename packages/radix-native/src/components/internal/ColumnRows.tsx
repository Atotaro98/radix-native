import React from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'

interface ColumnRowsProps {
  columns: number
  columnGap: number
  rowGap: number
  /** Vertical alignment of cells inside each row. */
  alignItems?: ViewStyle['alignItems']
  /** Horizontal alignment of each child inside its cell. */
  cellAlignItems?: ViewStyle['alignItems']
  children?: React.ReactNode
}

/**
 * Lays children out in rows of `columns` equal-width cells.
 *
 * Unlike percentage `flexBasis` (which overflows once a gap is added) or
 * measuring with `onLayout` (which renders a wrong first frame), chunking
 * into rows and giving each cell `flex: 1` is exact from the first frame.
 * Incomplete last rows are padded with empty cells to keep widths equal.
 */
export function ColumnRows({ columns, columnGap, rowGap, alignItems, cellAlignItems, children }: ColumnRowsProps) {
  const cols = Math.max(1, Math.floor(columns))
  const items = React.Children.toArray(children)

  const rows: React.ReactNode[][] = []
  for (let i = 0; i < items.length; i += cols) {
    rows.push(items.slice(i, i + cols))
  }

  return (
    <>
      {rows.map((row, rowIdx) => (
        <View
          key={`row-${rowIdx}`}
          style={{
            flexDirection: 'row',
            alignItems,
            columnGap,
            marginTop: rowIdx === 0 ? 0 : rowGap,
          }}
        >
          {row.map((child, colIdx) => (
            <View
              key={React.isValidElement(child) && child.key != null ? child.key : `cell-${colIdx}`}
              style={{ flex: 1, minWidth: 0, alignItems: cellAlignItems }}
            >
              {child}
            </View>
          ))}
          {Array.from({ length: cols - row.length }, (_, i) => (
            <View key={`pad-${i}`} style={{ flex: 1 }} />
          ))}
        </View>
      ))}
    </>
  )
}

interface AutoFitRowsProps {
  /** Minimum cell width before items wrap to a new row. */
  minItemWidth: number
  gap: number
  children?: React.ReactNode
}

/**
 * RN approximation of CSS `repeat(auto-fit, minmax(<min>, 1fr))`: items wrap
 * once they would get narrower than `minItemWidth` and grow to fill the row.
 */
export function AutoFitRows({ minItemWidth, gap, children }: AutoFitRowsProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {React.Children.toArray(children).map((child, idx) => (
        <View
          key={React.isValidElement(child) && child.key != null ? child.key : `cell-${idx}`}
          style={{ flexGrow: 1, flexShrink: 1, flexBasis: minItemWidth, minWidth: 0 }}
        >
          {child}
        </View>
      ))}
    </View>
  )
}
