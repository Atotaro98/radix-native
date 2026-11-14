import React, { useImperativeHandle } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import type { GestureResponderEvent, StyleProp, ViewStyle, TextStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { Tooltip, clampArrow } from '../components/overlays/Tooltip'
import { HoverCard } from '../components/overlays/HoverCard'

const flat = (node: { props: { style?: unknown } }): ViewStyle & TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

type Handlers = { onPress?: (e: GestureResponderEvent) => void; onLongPress?: (e: GestureResponderEvent) => void; onPressOut?: (e: GestureResponderEvent) => void }
function FakeAnchor({ ref, ...handlers }: Handlers & { ref?: React.Ref<unknown>; accessibilityHint?: string }) {
  useImperativeHandle(ref, () => ({ measureInWindow: (cb: (x: number, y: number, w: number, h: number) => void) => cb(150, 300, 100, 32) }))
  return <Pressable testID="trigger" {...handlers}><Text>Trigger</Text></Pressable>
}

const layout = (id: string, width: number, height: number) => act(() => {
  fireEvent(screen.getByTestId(id, { includeHiddenElements: true }), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width, height } } })
})

describe('Tooltip (tooltip.css)', () => {
  it('long-press shows it above the trigger, centred, 4px + arrow away; lifting the finger hides it', () => {
    const onPress = jest.fn()
    renderWithTheme(<Tooltip content="Add to library" testID="tip"><FakeAnchor onPress={onPress} /></Tooltip>)
    fireEvent(screen.getByTestId('trigger'), 'longPress')
    layout('tip', 120, 24)
    // top: 300 − 24 − (4 + 5); centred: 150 + 50 − 60
    expect(flat(screen.getByTestId('tip'))).toMatchObject({ top: 300 - 24 - 9, left: 140 })
    fireEvent(screen.getByTestId('trigger'), 'pressOut')
    expect(screen.queryByText('Add to library')).toBeNull()
  })

  it('a tap still presses the trigger and shows nothing', () => {
    const onPress = jest.fn()
    renderWithTheme(<Tooltip content="Add to library"><FakeAnchor onPress={onPress} /></Tooltip>)
    fireEvent.press(screen.getByTestId('trigger'))
    expect(onPress).toHaveBeenCalled()
    expect(screen.queryByText('Add to library')).toBeNull()
  })

  it('a string content is the trigger accessibility hint', () => {
    renderWithTheme(<Tooltip content="Add to library"><FakeAnchor /></Tooltip>)
    expect(screen.getByTestId('trigger').props.accessibilityHint).toBe('Add to library')
  })

  it('text is size 1 (12px) on gray-12', () => {
    renderWithTheme(<Tooltip content="Hi" defaultOpen testID="tip"><FakeAnchor /></Tooltip>)
    expect(flat(screen.getByText('Hi', { includeHiddenElements: true })).fontSize).toBe(12)
  })
})

describe('HoverCard', () => {
  it('long-press opens it below the trigger, aligned to its start, 8px away', () => {
    renderWithTheme(
      <HoverCard.Root>
        <HoverCard.Trigger><FakeAnchor /></HoverCard.Trigger>
        <HoverCard.Content testID="card"><Text>Preview</Text></HoverCard.Content>
      </HoverCard.Root>,
    )
    expect(screen.queryByText('Preview')).toBeNull()
    fireEvent(screen.getByTestId('trigger'), 'longPress')
    layout('card', 200, 100)
    expect(flat(screen.getByTestId('card'))).toMatchObject({ left: 150, top: 340 })
  })
})

describe('Tooltip arrow', () => {
  // edge 120, radius 4: the arrow's centre stays within [4 + 5, 120 − 4 − 5]
  it.each([[60, 60], [-30, 9], [200, 111]])('points at %p → drawn at %p', (at, expected) => {
    expect(clampArrow(at, 120, 4)).toBe(expected)
  })
  it('sits in the middle of an edge too short for it', () => {
    expect(clampArrow(3, 12, 4)).toBe(6)
  })
})
