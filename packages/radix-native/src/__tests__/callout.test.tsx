import React from 'react'
import { View } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat, cardRings } from './helpers/queries'
import { Callout } from '../components/display/Callout'

type Node = { type: unknown; props: { style?: unknown }; children: unknown[]; findAll: (m: (n: Node) => boolean) => Node[] }
function Icon(props: { color?: string }) {
  return <View testID="icon" style={{ width: 15, height: 15, backgroundColor: props.color }} />
}

function Example(props: React.ComponentProps<typeof Callout.Root>) {
  return (
    <Callout.Root testID="c" {...props}>
      <Callout.Icon testID="icon-slot"><Icon /></Callout.Icon>
      <Callout.Text>Upgrade available</Callout.Text>
    </Callout.Root>
  )
}

describe('Callout (callout.css)', () => {
  it.each([
    [1, 12, 8, 8, 20],
    [2, 16, 12, 8, 20],
    [3, 24, 16, 12, 24],
  ] as const)('size %i: padding %i, column-gap %i, row-gap %i, icon height %i', (size, padding, columnGap, rowGap, iconHeight) => {
    renderWithTheme(<Example size={size} />)
    const root = screen.getByTestId('c') as unknown as Node
    expect(flat(root)).toMatchObject({ padding, columnGap, flexDirection: 'row' })
    const content = root.children.filter((n): n is Node => typeof n === 'object')[1]
    expect(flat(content).rowGap).toBe(rowGap)
    expect(flat(screen.getByTestId('icon-slot')).height).toBe(iconHeight)
  })

  it('maps size 1 and 2 to text size 2, size 3 to text size 3', () => {
    renderWithTheme(<><Example size={1} /><Callout.Root size={3}><Callout.Text>Big</Callout.Text></Callout.Root></>)
    expect(flat(screen.getByText('Upgrade available')).fontSize).toBe(14)
    expect(flat(screen.getByText('Big')).fontSize).toBe(16)
  })

  it('text and icon share the callout color (accent-a11), not gray-12', () => {
    renderWithTheme(<Example />)
    const textColor = flat(screen.getByText('Upgrade available')).color
    expect(flat(screen.getByTestId('icon')).backgroundColor).toBe(textColor)
  })

  it('soft has no ring; surface and outline draw one over the content', () => {
    const { unmount } = renderWithTheme(<Example variant="soft" />)
    expect(cardRings(screen.getByTestId('c'))).toHaveLength(0)
    unmount()
    renderWithTheme(<Example variant="outline" />)
    const root = screen.getByTestId('c')
    expect(flat(root).borderWidth).toBeUndefined()
    expect(cardRings(root)).toHaveLength(1)
  })

  it('puts icons in the left column wherever they appear', () => {
    renderWithTheme(
      <Callout.Root testID="c">
        <Callout.Text>First</Callout.Text>
        <Callout.Icon testID="icon-slot"><Icon /></Callout.Icon>
      </Callout.Root>,
    )
    const root = screen.getByTestId('c') as unknown as Node
    const columns = root.children.filter((n): n is Node => typeof n === 'object')
    expect(columns[0].findAll((n) => (n.props as { testID?: string }).testID === 'icon-slot').length).toBeGreaterThan(0)
  })

  it('passes accessibilityRole="alert" through', () => {
    renderWithTheme(<Example accessibilityRole="alert" />)
    expect(screen.getByTestId('c').props.accessibilityRole).toBe('alert')
  })
})
