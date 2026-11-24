import React, { useImperativeHandle } from 'react'
import { I18nManager, Pressable, Text } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'

/** A window rect as `measureInWindow` reports it: x, y, width, height. */
export type WindowRect = readonly [x: number, y: number, width: number, height: number]

type Handlers = {
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  onPressOut?: (e: GestureResponderEvent) => void
}

/**
 * A trigger (testID `trigger`) that reports a fixed window rect, as a host
 * component would: the anchor of an Anchored overlay under test.
 */
export function FakeAnchor({ rect, label = 'Trigger', ref, ...rest }: Handlers & {
  rect: WindowRect
  label?: string
  ref?: React.Ref<unknown>
  accessibilityHint?: string
}) {
  useImperativeHandle(ref, () => ({ measureInWindow: (cb: (...r: number[]) => void) => cb(...rect) }))
  return <Pressable testID="trigger" {...rest}><Text>{label}</Text></Pressable>
}

/** Makes the library's own pressable with this testID (a Select trigger) report `rect` as its window rect. */
export function measureAs(testID: string, rect: WindowRect) {
  type Measure = (cb: (...r: number[]) => void) => void
  type Up = { instance: { measureInWindow?: Measure } | null; parent: Up | null }
  // The mocked native View (a class instance) behind the host element
  let node: Up | null = screen.getByTestId(testID) as unknown as Up
  while (node && typeof node.instance?.measureInWindow !== 'function') node = node.parent
  if (!node?.instance) throw new Error(`no native View behind ${testID}`)
  node.instance.measureInWindow = (cb) => cb(...rect)
}

/** Reports the measured size of an overlay's content (hidden until then), so it gets placed. */
export const layout = (testID: string, width: number, height: number) => act(() => {
  fireEvent(screen.getByTestId(testID, { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } })
})

/** A touch at a window point as the portal host above `testID` sees it in the capture phase (outside-touch dismissal). */
export function touchWindow(testID: string, x: number, y: number) {
  let host = screen.getByTestId(testID).parent
  while (host && typeof host.props.onStartShouldSetResponderCapture !== 'function') host = host.parent
  if (!host) throw new Error('no portal host')
  const capture = host.props.onStartShouldSetResponderCapture as (e: unknown) => boolean
  act(() => { capture({ nativeEvent: { pageX: x, pageY: y } }) })
}

/** Switches the app's layout direction; call `setRTL(false)` in `afterEach`. */
export const setRTL = (rtl: boolean) => {
  Object.defineProperty(I18nManager, 'isRTL', { configurable: true, get: () => rtl })
  Object.defineProperty(I18nManager, 'doLeftAndRightSwapInRTL', { configurable: true, get: () => true })
}
