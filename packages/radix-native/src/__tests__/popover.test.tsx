import React, { useImperativeHandle } from 'react'
import { Pressable, Text, View } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'
import { Popover } from '../components/overlays/Popover'

/** A trigger that reports a fixed window rect, as a host component would. */
function FakeAnchor({ onPress, ref }: { onPress?: (e: GestureResponderEvent) => void; ref?: React.Ref<unknown> }) {
  useImperativeHandle(ref, () => ({ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(40, 100, 90, 32) }))
  return <Pressable testID="trigger" onPress={onPress}><Text>Comment</Text></Pressable>
}

function Example(props: Partial<React.ComponentProps<typeof Popover.Root>>) {
  return (
    <Popover.Root {...props}>
      <Popover.Trigger><FakeAnchor /></Popover.Trigger>
      <Popover.Content testID="content">
        <Text>Popover body</Text>
        <Popover.Close><Pressable testID="close"><Text>Close</Text></Pressable></Popover.Close>
      </Popover.Content>
    </Popover.Root>
  )
}

const layoutContent = (width = 200, height = 120) => act(() => {
  fireEvent(screen.getByTestId('content', { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } })
})

describe('Popover', () => {
  it('opens from the trigger and places itself below it, aligned to its start, 8px away', () => {
    renderWithTheme(<Example />)
    expect(screen.queryByText('Popover body')).toBeNull()
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    expect(flat(screen.getByTestId('content'))).toMatchObject({ left: 40, top: 100 + 32 + 8, minWidth: 90 })
  })

  it('stays hidden until measured', () => {
    renderWithTheme(<Example defaultOpen />)
    expect(flat(screen.getByTestId('content', { includeHiddenElements: true })).opacity).toBe(0)
  })

  it('Close closes it', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<Example onOpenChange={onOpenChange} />)
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    fireEvent.press(screen.getByTestId('close'))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('non-modal: no backdrop; modal: a backdrop that closes it', () => {
    const onOpenChange = jest.fn()
    const { unmount } = renderWithTheme(<Example defaultOpen />)
    expect(screen.queryByTestId('content-backdrop', { includeHiddenElements: true })).toBeNull()
    unmount()
    renderWithTheme(<Example defaultOpen modal onOpenChange={onOpenChange} />)
    fireEvent.press(screen.getByTestId('content-backdrop', { includeHiddenElements: true }))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('an outside touch closes a non-modal popover; a touch inside does not', () => {
    const onOpenChange = jest.fn()
    renderWithTheme(<View testID="page"><Example onOpenChange={onOpenChange} /></View>)
    fireEvent.press(screen.getByTestId('trigger'))
    layoutContent()
    let host = screen.getByTestId('page').parent
    while (host && typeof host.props.onStartShouldSetResponderCapture !== 'function') host = host.parent
    if (!host) throw new Error('no portal host')
    const capture = (x: number, y: number) => act(() => {
      (host!.props.onStartShouldSetResponderCapture as (e: unknown) => boolean)({ nativeEvent: { pageX: x, pageY: y } })
    })
    capture(60, 150)
    expect(onOpenChange).not.toHaveBeenLastCalledWith(false)
    capture(380, 700)
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })
})
