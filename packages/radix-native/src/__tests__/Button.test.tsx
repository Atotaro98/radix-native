import React from 'react'
import { Text as RNText } from 'react-native'
import { fireEvent, screen } from '@testing-library/react-native'
import { Button, IconButton } from '../index'
import { renderWithTheme } from './helpers/render'
import { indigo } from '../tokens/colors'

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

  it('lets the consumer override hitSlop and accessibilityRole', () => {
    renderWithTheme(
      <Button hitSlop={4} accessibilityRole="link">
        Go
      </Button>,
    )
    const link = screen.getByRole('link')
    expect(link.props.hitSlop).toBe(4)
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
})
