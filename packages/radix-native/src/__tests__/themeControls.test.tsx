/**
 * ThemeControls drives the root Theme through the library's own public
 * components (RadioCards, Button, …), so these double as integration tests.
 */
import React from 'react'
import { Text as RNText } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { Theme, ThemeControls, useThemeContext } from '../index'

function Probe() {
  const { appearance, accentColor, grayColor, radius, scaling } = useThemeContext()
  return <RNText testID="state">{`${appearance} ${accentColor} ${grayColor} ${radius} ${scaling}`}</RNText>
}

const state = () => screen.getByTestId('state').props.children as string

function renderPanel(props: React.ComponentProps<typeof ThemeControls> = {}) {
  return render(
    <Theme appearance="light" accentColor="indigo" grayColor="auto" radius="medium" scaling="100%">
      <Probe />
      <ThemeControls defaultOpen {...props} />
    </Theme>,
  )
}

describe('ThemeControls', () => {
  it('changes the appearance, radius and scaling through RadioCards', () => {
    renderPanel()
    expect(state()).toBe('light indigo auto medium 100%')
    fireEvent.press(screen.getByRole('radio', { name: /Dark/ }))
    fireEvent.press(screen.getByRole('radio', { name: 'Large' }))
    fireEvent.press(screen.getByRole('radio', { name: '105%' }))
    expect(state()).toBe('dark indigo auto large 105%')
    expect(screen.getByRole('radio', { name: /Dark/ }).props.accessibilityState).toMatchObject({ checked: true })
  })

  it('picks accent and gray colors from swatches announced as radios', () => {
    renderPanel()
    fireEvent.press(screen.getByRole('radio', { name: 'ruby' }))
    fireEvent.press(screen.getByRole('radio', { name: 'sand' }))
    expect(state()).toBe('light ruby sand medium 100%')
    expect(screen.getByRole('radio', { name: 'ruby' }).props.accessibilityState).toEqual({ checked: true })
  })

  it('copies the current Theme', () => {
    const onCopyTheme = jest.fn()
    renderPanel({ showCopyTheme: true, onCopyTheme })
    fireEvent.press(screen.getByRole('button', { name: 'Copy Theme' }))
    expect(onCopyTheme).toHaveBeenCalledWith(
      '<Theme accentColor="indigo" grayColor="auto" appearance="light" radius="medium" scaling="100%">',
    )
  })

  it('caps its text at font scale 1 through a nested Theme', () => {
    renderPanel()
    for (const label of ['Theme', 'Accent color', '105%']) {
      expect(screen.getByText(label).props.maxFontSizeMultiplier).toBe(1)
    }
  })
})
