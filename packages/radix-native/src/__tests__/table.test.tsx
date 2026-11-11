import React from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Table } from '../components/display/Table'
import { resolveColumnWidths, resolveLength } from '../utils/tableLayout'

type Node = { type: unknown; props: { style?: unknown; onLayout?: unknown; testID?: string }; parent: Node | null; findAll: (m: (n: Node) => boolean) => Node[] }
const flat = (node: { props: { style?: unknown } }): ViewStyle & TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

describe('table layout', () => {
  it('resolves numbers, px and % lengths', () => {
    expect([resolveLength(120, 400), resolveLength('120px', 400), resolveLength('25%', 400), resolveLength(undefined, 400)]).toEqual([120, 120, 100, undefined])
  })

  it('auto: each column is its widest cell, a width replaces the natural width, min / max clamp', () => {
    const widths = resolveColumnWidths([
      { col: 0, natural: 80, firstRow: true },
      { col: 0, natural: 120, firstRow: false },
      { col: 1, natural: 300, maxWidth: 200, firstRow: true },
      { col: 2, natural: 10, minWidth: 50, firstRow: true },
      { col: 2, natural: 400, width: 60, firstRow: false },
    ], 3, 300, 'auto')
    expect(widths).toEqual([120, 200, 60])
  })

  it('auto: a narrower table grows every column in proportion to fill the width', () => {
    expect(resolveColumnWidths([
      { col: 0, natural: 100, firstRow: true },
      { col: 1, natural: 50, firstRow: true },
    ], 2, 300, 'auto')).toEqual([200, 100])
  })

  it('fixed: first-row widths are kept, the rest share what is left', () => {
    expect(resolveColumnWidths([
      { col: 0, width: '50%', firstRow: true },
      { col: 1, firstRow: true },
      { col: 2, firstRow: true },
      { col: 1, width: 999, firstRow: false },
    ], 3, 400, 'fixed')).toEqual([200, 100, 100])
  })
})

function Example(props: React.ComponentProps<typeof Table.Root>) {
  return (
    <Table.Root testID="root" {...props}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell testID="h0">Full name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell testID="h1">Email</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <Table.Row>
          <Table.RowHeaderCell testID="r0">Danilo Sousa</Table.RowHeaderCell>
          <Table.Cell>danilo@example.com</Table.Cell>
        </Table.Row>
        <Table.Row testID="last">
          <Table.RowHeaderCell>Zahra Ambessa</Table.RowHeaderCell>
          <Table.Cell>zahra@example.com</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  )
}

function layoutAll(rootWidth: number, naturals: number[]) {
  const root = screen.getByTestId('root', { includeHiddenElements: true }) as unknown as Node
  act(() => { fireEvent(root as never, 'layout', { nativeEvent: { layout: { width: rootWidth, height: 200, x: 0, y: 0 } } }) })
  const cells = root.findAll((n) => typeof n.type === 'string' && typeof n.props.onLayout === 'function' && n.props.testID !== 'root')
  cells.forEach((cell, i) => {
    act(() => { fireEvent(cell as never, 'layout', { nativeEvent: { layout: { width: naturals[i % naturals.length], height: 20, x: 0, y: 0 } } }) })
  })
}

describe('Table (table.css)', () => {
  it('stays hidden until every cell is measured, then aligns columns across rows', () => {
    renderWithTheme(<Example />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).opacity).toBe(0)
    layoutAll(300, [100, 50])
    expect(flat(screen.getByTestId('root')).opacity).toBeUndefined()
    const a = screen.getByTestId('r0')
    const b = screen.getByTestId('h0')
    expect(flat(a).width).toBe(flat(b).width)
    expect(flat(a).width).toBe(200)
  })

  it('column header cells are bold; row header cells normal', () => {
    renderWithTheme(<Example />)
    expect(flat(screen.getByText('Full name', { includeHiddenElements: true })).fontWeight).toBe('700')
    expect(flat(screen.getByText('Danilo Sousa', { includeHiddenElements: true })).fontWeight).toBe('400')
  })

  it.each([[1, 36], [2, 44], [3, 48]] as const)('size %i cells are at least %ipx tall', (size, minHeight) => {
    renderWithTheme(<Example size={size} />)
    expect(flat(screen.getByTestId('h1', { includeHiddenElements: true })).minHeight).toBe(minHeight)
  })

  it('surface: bordered panel, header row background, no divider under the last row', () => {
    renderWithTheme(<Example variant="surface" />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true }))).toMatchObject({ borderWidth: 1, overflow: 'hidden' })
    expect(flat(screen.getByTestId('last', { includeHiddenElements: true })).borderBottomWidth).toBe(0)
  })

  it('ghost keeps the divider under the last row', () => {
    renderWithTheme(<Example />)
    expect(flat(screen.getByTestId('last', { includeHiddenElements: true })).borderBottomWidth).toBe(1)
  })
})
