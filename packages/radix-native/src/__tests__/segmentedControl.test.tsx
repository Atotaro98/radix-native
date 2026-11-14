import React from 'react'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { SegmentedControl } from '../components/actions/SegmentedControl'

type Node = { type: unknown; props: { onLayout?: unknown; style?: unknown }; findAll: (m: (n: Node) => boolean) => Node[] }

function Example(props: React.ComponentProps<typeof SegmentedControl.Root>) {
  return (
    <SegmentedControl.Root testID="root" defaultValue="inbox" {...props}>
      <SegmentedControl.Item value="inbox">Inbox</SegmentedControl.Item>
      <SegmentedControl.Item value="drafts">Drafts</SegmentedControl.Item>
      <SegmentedControl.Item value="sent">Sent</SegmentedControl.Item>
    </SegmentedControl.Root>
  )
}

const radio = (name: string) => screen.getByRole('radio', { name, hidden: true } as never)

/** Fires every item's measuring onLayout. */
function measureAll(widths: number[]) {
  const root = screen.getByTestId('root', { includeHiddenElements: true }) as unknown as Node
  const cells = root.findAll((n) => typeof n.type === 'string' && typeof n.props.onLayout === 'function')
  cells.forEach((cell, i) => {
    act(() => {
      fireEvent(cell as never, 'layout', { nativeEvent: { layout: { width: widths[i], height: 20, x: 0, y: 0 } } })
    })
  })
}

describe('SegmentedControl (segmented-control.css)', () => {
  it.each([[1, 24], [2, 32], [3, 40]] as const)('size %i is %ipx tall', (size, height) => {
    renderWithTheme(<Example size={size} />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).height).toBe(height)
  })

  it('every item takes the widest item width, and the root shows once all are measured', () => {
    renderWithTheme(<Example />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).opacity).toBe(0)
    measureAll([60, 70, 50])
    expect(flat(screen.getByTestId('root')).opacity).toBeUndefined()
    expect(['Inbox', 'Drafts', 'Sent'].map((n) => flat(radio(n)).width)).toEqual([70, 70, 70])
  })

  it('exposes a radiogroup and selects on press, without deselecting', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Example onValueChange={onValueChange} />)
    measureAll([60, 70, 50])
    fireEvent.press(radio('Drafts'))
    expect(onValueChange).toHaveBeenLastCalledWith('drafts')
    expect(radio('Drafts').props.accessibilityState).toMatchObject({ checked: true })
    fireEvent.press(radio('Drafts'))
    expect(radio('Drafts').props.accessibilityState).toMatchObject({ checked: true })
  })

  it('disabled disables every item', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Example disabled onValueChange={onValueChange} />)
    measureAll([60, 70, 50])
    fireEvent.press(radio('Sent'))
    expect(onValueChange).not.toHaveBeenCalled()
    expect(radio('Sent').props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('renders each label twice (medium and regular) so the width never changes', () => {
    renderWithTheme(<Example />)
    expect(screen.getAllByText('Inbox', { includeHiddenElements: true })).toHaveLength(2)
  })

  it('radius follows max(radius-N, radius-full): a pill with radius="full"', () => {
    renderWithTheme(<Example radius="full" />)
    expect(flat(screen.getByTestId('root', { includeHiddenElements: true })).borderRadius).toBeGreaterThan(100)
  })
})
