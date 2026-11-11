import React from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Select } from '../components/forms/Select'
import { placeItemAligned } from '../utils/selectLayout'

const flat = (node: { props: { style?: unknown } }): ViewStyle & TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

describe('item-aligned placement (Radix SelectItemAlignedPosition)', () => {
  const base = {
    trigger: { x: 40, y: 400, width: 160, height: 32 },
    triggerPaddingX: 12,
    content: { width: 200, height: 160 },
    boundary: { x: 10, y: 10, width: 380, height: 780 },
    contentPadding: 8,
    itemPaddingLeft: 24,
    itemHeight: 32,
    offsetBefore: 0,
  }
  it('lines the selected item text up with the trigger value text', () => {
    // x: 40 + 12 − 8 − 24; y: centre of item 2 (8 + 64 + 16) on the trigger centre (416)
    expect(placeItemAligned({ ...base, selectedIndex: 2 })).toEqual({ x: 20, y: 416 - 88 })
  })
  it('stays inside the boundary', () => {
    expect(placeItemAligned({ ...base, trigger: { ...base.trigger, x: 0, y: 20 }, selectedIndex: 3 })).toEqual({ x: 10, y: 10 })
  })
})

/** Items inside a component of their own, like Radix's playground SelectItemsDemo. */
function Fruits() {
  return (
    <Select.Group>
      <Select.Label>Fruits</Select.Label>
      <Select.Item value="apple" testID="apple">Apple</Select.Item>
      <Select.Item value="orange" testID="orange">Orange</Select.Item>
      <Select.Item value="grape" disabled testID="grape">Grape</Select.Item>
    </Select.Group>
  )
}

function Example(props: Partial<React.ComponentProps<typeof Select.Root>> & { position?: 'item-aligned' | 'popper'; variant?: 'surface' | 'classic' | 'soft' | 'ghost' }) {
  const { position, variant, ...root } = props
  return (
    <Select.Root {...root}>
      <Select.Trigger testID="trigger" variant={variant} placeholder="Pick a fruit" />
      <Select.Content testID="content" position={position}>
        <Fruits />
      </Select.Content>
    </Select.Root>
  )
}

describe('Select (select.css)', () => {
  it('shows the placeholder, then the selected item text before the list ever opened (items in a component of their own)', () => {
    const { unmount } = renderWithTheme(<Example />)
    expect(screen.getByText('Pick a fruit')).toBeTruthy()
    unmount()
    renderWithTheme(<Example defaultValue="orange" />)
    expect(screen.getByTestId('trigger').props.accessibilityValue).toEqual({ text: 'Orange' })
  })

  it.each([[1, 24], [2, 32], [3, 40]] as const)('size %i trigger is %ipx tall', (size, height) => {
    renderWithTheme(<Example size={size} />)
    expect(flat(screen.getByTestId('trigger')).height).toBe(height)
  })

  it('opens from the trigger, selects an item, closes', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Example onValueChange={onValueChange} />)
    fireEvent.press(screen.getByTestId('trigger'))
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: true })
    fireEvent.press(screen.getByTestId('orange', { includeHiddenElements: true }))
    expect(onValueChange).toHaveBeenCalledWith('orange')
    expect(screen.getByTestId('trigger').props.accessibilityState).toMatchObject({ expanded: false })
  })

  it('a disabled item cannot be chosen', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Example defaultOpen onValueChange={onValueChange} />)
    fireEvent.press(screen.getByTestId('grape', { includeHiddenElements: true }))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('every item reserves the gutter on both sides (size 2: 24px) and the selected one is marked', () => {
    renderWithTheme(<Example defaultOpen defaultValue="apple" />)
    expect(flat(screen.getByTestId('orange', { includeHiddenElements: true }))).toMatchObject({ paddingLeft: 24, paddingRight: 24, height: 32 })
    expect(screen.getByTestId('apple', { includeHiddenElements: true }).props.accessibilityState).toMatchObject({ selected: true })
  })

  it('ghost trigger: no fixed height, padding offset by negative margins', () => {
    renderWithTheme(<Example variant="ghost" />)
    expect(flat(screen.getByTestId('trigger'))).toMatchObject({ paddingVertical: 4, marginVertical: -4, marginHorizontal: -8 })
    expect(flat(screen.getByTestId('trigger')).height).toBeUndefined()
  })

  it('stays hidden until the trigger has been measured', () => {
    renderWithTheme(<Example defaultOpen position="popper" />)
    act(() => {
      fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 120, height: 140 } } })
    })
    expect(flat(screen.getByTestId('content', { includeHiddenElements: true })).opacity).toBe(0)
  })
})
