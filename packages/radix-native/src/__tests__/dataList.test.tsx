import React from 'react'
import { View } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { DataList } from '../components/display/DataList'
import { Code } from '../components/typography/Code'

type Node = { props: { style?: unknown; onLayout?: unknown }; children: unknown[] }
const kids = (n: Node) => n.children.filter((c): c is Node => typeof c === 'object')

function Example(props: React.ComponentProps<typeof DataList.Root>) {
  return (
    <DataList.Root testID="root" {...props}>
      <DataList.Item testID="item1">
        <DataList.Label testID="label1">Status</DataList.Label>
        <DataList.Value testID="value1">Authorized</DataList.Value>
      </DataList.Item>
      <DataList.Item testID="item2">
        <DataList.Label testID="label2" color="iris">A much longer label</DataList.Label>
        <DataList.Value testID="value2">ID <Code variant="ghost">u_2J89JSA4GJ</Code></DataList.Value>
      </DataList.Item>
    </DataList.Root>
  )
}

/** Fires the measuring onLayout inside each label. */
function measure(id: string, width: number) {
  const label = screen.getByTestId(id) as unknown as Node
  const inner = kids(label)[0]
  act(() => {
    fireEvent(inner as never, 'layout', { nativeEvent: { layout: { width, height: 20, x: 0, y: 0 } } })
  })
}

describe('DataList (data-list.css)', () => {
  it('a label width widens the shared column (Radix specimen: width="200px" on one label)', () => {
    renderWithTheme(
      <DataList.Root testID="root">
        <DataList.Item><DataList.Label testID="label1" width={200}>Name</DataList.Label><DataList.Value>x</DataList.Value></DataList.Item>
        <DataList.Item><DataList.Label testID="label2">Email</DataList.Label><DataList.Value>y</DataList.Value></DataList.Item>
      </DataList.Root>,
    )
    measure('label1', 40)
    measure('label2', 45)
    expect(flat(screen.getByTestId('label2')).width).toBe(200)
  })

  it.each([[1, 12, 12], [2, 16, 14], [3, 20, 16]] as const)('size %i: gap %i, text %ipx', (size, gap, fontSize) => {
    renderWithTheme(<Example size={size} />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).rowGap).toBe(gap)
    expect(flat(screen.getByTestId('item1', { includeHiddenElements: true })).columnGap).toBe(gap)
    expect(flat(screen.getByText('Authorized', { includeHiddenElements: true })).fontSize).toBe(fontSize)
  })

  it('label is gray-a11, a colored label accent-a11, value gray-12', () => {
    renderWithTheme(<Example />, { accentColor: 'iris' })
    const status = flat(screen.getByText('Status', { includeHiddenElements: true })).color
    const colored = flat(screen.getByText('A much longer label', { includeHiddenElements: true })).color
    const value = flat(screen.getByText('Authorized', { includeHiddenElements: true })).color
    expect(new Set([status, colored, value]).size).toBe(3)
  })

  it('nests text components in the value so they inherit the list size', () => {
    renderWithTheme(<Example size={1} />)
    // Code is 0.95em of the list's 12px
    expect(flat(screen.getByText('u_2J89JSA4GJ', { includeHiddenElements: true })).fontSize).toBeCloseTo(12 * 0.95, 0)
  })

  it('stays hidden until every label is measured, then gives all labels the widest width', () => {
    renderWithTheme(<Example />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).opacity).toBe(0)
    measure('label1', 50)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).opacity).toBe(0)
    measure('label2', 180)
    expect(flat(screen.getByTestId('root')).opacity).toBeUndefined()
    expect(flat(screen.getByTestId('label1'))).toMatchObject({ width: 180, minWidth: 120 })
    expect(flat(screen.getByTestId('label2')).width).toBe(180)
  })

  it('value pokes 0.25em out of the row except at the list edges (baseline)', () => {
    renderWithTheme(<Example />)
    const v1 = flat(screen.getByTestId('value1', { includeHiddenElements: true }))
    const v2 = flat(screen.getByTestId('value2', { includeHiddenElements: true }))
    expect([v1.marginTop, v1.marginBottom, v2.marginTop, v2.marginBottom]).toEqual([0, -3.5, -3.5, 0])
  })

  it('vertical: items are columns with a space-1 gap, labels unmeasured', () => {
    renderWithTheme(<Example orientation="vertical" />)
    expect(flat(screen.getByTestId('item1'))).toMatchObject({ flexDirection: 'column', rowGap: 4 })
    expect(flat(screen.getByTestId('root')).opacity).toBeUndefined()
    expect(flat(screen.getByTestId('label1')).minWidth).toBe(0)
  })

  it('trim="both" pulls the first and last items in by the leading', () => {
    renderWithTheme(<Example orientation="vertical" trim="both" />)
    // size 2: 0.42 × 14 − 20 / 2 and 0.36 × 14 − 20 / 2
    expect(flat(screen.getByTestId('item1')).marginTop).toBeCloseTo(0.42 * 14 - 10)
    expect(flat(screen.getByTestId('item2')).marginBottom).toBeCloseTo(0.36 * 14 - 10)
  })

  it('throws outside a Root', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderWithTheme(<DataList.Item><View /></DataList.Item>)).toThrow('DataList.Item must be used within DataList.Root')
    jest.restoreAllMocks()
  })
})
