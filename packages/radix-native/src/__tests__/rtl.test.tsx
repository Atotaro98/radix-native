/** Right-to-left: physical placement of overlays, direction of sliding parts. */
import React, { useImperativeHandle } from 'react'
import { I18nManager, Pressable, Text } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { physical } from '../utils/rtl'
import { placeItemAligned } from '../utils/selectLayout'
import { Popover, Slider } from '../index'

const setRTL = (rtl: boolean) => {
  Object.defineProperty(I18nManager, 'isRTL', { configurable: true, get: () => rtl })
  Object.defineProperty(I18nManager, 'doLeftAndRightSwapInRTL', { configurable: true, get: () => true })
}
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

function FakeAnchor({ onPress, ref }: { onPress?: (e: GestureResponderEvent) => void; ref?: React.Ref<unknown> }) {
  useImperativeHandle(ref, () => ({ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(40, 100, 90, 32) }))
  return <Pressable testID="trigger" onPress={onPress}><Text>Open</Text></Pressable>
}

describe('Popover in RTL', () => {
  it('aligns its start to the anchor\'s right edge and keeps the physical position', () => {
    setRTL(true)
    renderWithTheme(
      <Popover.Root>
        <Popover.Trigger><FakeAnchor /></Popover.Trigger>
        <Popover.Content testID="content" minWidth={0}><Text>Body</Text></Popover.Content>
      </Popover.Root>,
    )
    fireEvent.press(screen.getByTestId('trigger'))
    act(() => {
      fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 200, height: 120 } } })
    })
    const style = flat(screen.getByTestId('content'))
    // The content's right edge on the anchor's (40 + 90 − 200 → clamped to the 10px collision padding)
    expect(style.right).toBe(10)
    expect(style.left).toBeUndefined()
  })
})

describe('Select item-aligned in RTL', () => {
  it('lines the item text up with the trigger text on the right', () => {
    const { x } = placeItemAligned({
      trigger: { x: 100, y: 300, width: 120, height: 32 }, triggerPaddingX: 12,
      content: { width: 160, height: 100 }, boundary: { x: 0, y: 0, width: 400, height: 800 },
      contentPadding: 8, itemPaddingLeft: 24, itemHeight: 32, selectedIndex: 0, offsetBefore: 0, rtl: true,
    })
    expect(x).toBe(100 + 120 - 12 + 8 + 24 - 160)
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
