import React, { useState } from 'react'
import { StyleSheet, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { fireEvent, screen } from '@testing-library/react-native'
import { AccessibleIcon, Button, IconButton, VisuallyHidden } from '../index'
import { renderWithTheme } from './helpers/render'
import { crimson, indigo } from '../tokens/colors'

function Icon(props: { color?: string }) {
  return <RNText testID="icon">{props.color ?? 'none'}</RNText>
}

describe('Button', () => {
  it('merges adjacent text children into a single label', () => {
    const name = 'Juan'
    renderWithTheme(<Button>Hola {name}</Button>)
    expect(screen.getByText('Hola Juan')).toBeTruthy()
  })

  it('calls onPress and the consumer press handlers', () => {
    const onPress = jest.fn()
    const onPressIn = jest.fn()
    const onPressOut = jest.fn()
    renderWithTheme(
      <Button onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        Save
      </Button>,
    )
    const button = screen.getByRole('button')
    fireEvent(button, 'pressIn')
    fireEvent(button, 'pressOut')
    fireEvent.press(button)
    expect(onPressIn).toHaveBeenCalledTimes(1)
    expect(onPressOut).toHaveBeenCalledTimes(1)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not fire onPress when disabled or loading', () => {
    const onPress = jest.fn()
    renderWithTheme(
      <>
        <Button disabled onPress={onPress}>A</Button>
        <Button loading onPress={onPress}>B</Button>
      </>,
    )
    for (const button of screen.getAllByRole('button')) fireEvent.press(button)
    expect(onPress).not.toHaveBeenCalled()
  })

  it('exposes busy/disabled state while loading, merged with consumer state', () => {
    renderWithTheme(
      <Button loading accessibilityState={{ expanded: true }}>
        Save
      </Button>,
    )
    expect(screen.getByRole('button').props.accessibilityState).toEqual({
      expanded: true,
      disabled: true,
      busy: true,
    })
  })

  it('injects the text color into icons only when they set no color', () => {
    renderWithTheme(
      <>
        <Button>
          <Icon />
        </Button>
        <Button>
          <Icon color="#123456" />
        </Button>
      </>,
    )
    const icons = screen.getAllByTestId('icon')
    expect(icons[0]).toHaveTextContent(indigo.light.contrast)
    expect(icons[1]).toHaveTextContent('#123456')
  })

  it('extends the touch target vertically for small sizes', () => {
    renderWithTheme(<Button size={1}>Tiny</Button>)
    expect(screen.getByRole('button').props.hitSlop).toEqual({ top: 10, bottom: 10, left: 0, right: 0 })
  })

  it('keeps the label readable by screen readers while loading', () => {
    renderWithTheme(<Button loading>Save</Button>)
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy()
    // The inner spinner is decorative: the button itself reports busy.
    expect(screen.queryByRole('progressbar')).toBeNull()
  })

  it('springs back when disabled mid-press', () => {
    jest.useFakeTimers()
    function SubmitButton() {
      const [loading, setLoading] = useState(false)
      return <Button loading={loading} onPressIn={() => setLoading(true)}>Send</Button>
    }
    renderWithTheme(<SubmitButton />)
    const button = screen.getByRole('button')
    // Reanimated's Jest setup exposes the live animated style on the host.
    const scale = () => button.props.jestAnimatedStyle.value.transform
    fireEvent(button, 'pressIn') // sets loading → the button disables while held
    jest.advanceTimersByTime(500)
    expect(scale()).toEqual([{ scale: 1 }])
    jest.useRealTimers()
  })

  it('lets the consumer override hitSlop and accessibilityRole', () => {
    renderWithTheme(
      <Button hitSlop={4} accessibilityRole="link">
        Go
      </Button>,
    )
    const link = screen.getByRole('link')
    expect(link.props.hitSlop).toBe(4)
  })

  it.each([
    ['gray keeps the theme accent', 'gray', indigo.light[8]],
    ['any other color uses its own', 'crimson', crimson.light[8]],
  ] as const)('focus ring (Radix --focus-8): %s', (_label, color, expected) => {
    renderWithTheme(<Button color={color}>Save</Button>)
    fireEvent(screen.getByRole('button'), 'focus')
    const styleOf = (node: { props: { style?: unknown } }) =>
      StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
    const rings = screen.UNSAFE_root.findAll(
      (node: { type: unknown; props: { style?: unknown } }) => typeof node.type === 'string'
        && styleOf(node)?.position === 'absolute' && styleOf(node)?.borderWidth === 2,
    )
    expect(rings.map((node: { props: { style?: unknown } }) => styleOf(node)?.borderColor)).toEqual([expected])
  })
})

describe('IconButton', () => {
  it('meets the minimum touch target and warns without a label', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithTheme(
      <IconButton size={1}>
        <Icon />
      </IconButton>,
    )
    expect(screen.getByRole('button').props.hitSlop).toEqual({ top: 10, bottom: 10, left: 10, right: 10 })
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('accessibilityLabel'))
    warn.mockRestore()
  })

  it('renders a text child as its label, tinting icons', () => {
    renderWithTheme(
      <IconButton accessibilityLabel="Count">
        <Icon />
        {3}
      </IconButton>,
    )
    expect(screen.getByText('3')).toBeTruthy()
    expect(screen.getByTestId('icon')).toHaveTextContent(indigo.light.contrast)
  })

  it('does not warn when labelled', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithTheme(
      <IconButton accessibilityLabel="Close">
        <Icon />
      </IconButton>,
    )
    expect(screen.getByLabelText('Close')).toBeTruthy()
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it('does not warn when its content labels it (AccessibleIcon, VisuallyHidden)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    renderWithTheme(
      <>
        <IconButton>
          <AccessibleIcon label="Edit"><Icon /></AccessibleIcon>
        </IconButton>
        <IconButton>
          <Icon />
          <VisuallyHidden>Settings</VisuallyHidden>
        </IconButton>
      </>,
    )
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
