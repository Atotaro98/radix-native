/** Right-to-left: physical placement of overlays, direction of sliding parts. */
import React from 'react'
import { Text } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { FakeAnchor, layout, setRTL } from './helpers/overlay'
import { physical } from '../utils/rtl'
import { Popover, Slider } from '../index'

afterEach(() => setRTL(false))

describe('physical', () => {
  it('is the identity in LTR', () => {
    const style = { left: 4, borderLeftWidth: 1 }
    expect(physical(style)).toBe(style)
  })
  it('swaps left / right keys in RTL, so React Native swaps them back', () => {
    setRTL(true)
    expect(physical({ left: 4, top: 2, borderLeftWidth: 1, borderRightColor: 'red', marginRight: 3 }))
      .toEqual({ right: 4, top: 2, borderRightWidth: 1, borderLeftColor: 'red', marginLeft: 3 })
  })
})

describe('Popover in RTL', () => {
  it('aligns its start to the anchor\'s right edge and keeps the physical position', () => {
    setRTL(true)
    renderWithTheme(
      <Popover.Root>
        <Popover.Trigger><FakeAnchor rect={[40, 100, 90, 32]} /></Popover.Trigger>
        <Popover.Content testID="content" minWidth={0}><Text>Body</Text></Popover.Content>
      </Popover.Root>,
    )
    fireEvent.press(screen.getByTestId('trigger'))
    layout('content', 200, 120)
    const style = flat(screen.getByTestId('content'))
    // The content's right edge on the anchor's (40 + 90 − 200 → clamped to the 10px collision padding)
    expect(style.right).toBe(10)
    expect(style.left).toBeUndefined()
  })
})

describe('Slider in RTL', () => {
  const touch = (x: number) => ({ nativeEvent: { locationX: x, locationY: 0, pageX: x, pageY: 0 } })
  it('starts on the right: a touch near the left edge is near the maximum', () => {
    setRTL(true)
    const onValueChange = jest.fn()
    renderWithTheme(<Slider testID="s" defaultValue={[50]} onValueChange={onValueChange} />)
    const root = screen.getByTestId('s')
    act(() => { fireEvent(root, 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 8 } } }) })
    act(() => { fireEvent(root, 'responderGrant', touch(20)) })
    expect(onValueChange.mock.calls.at(-1)?.[0][0]).toBeGreaterThan(80)
  })
})
