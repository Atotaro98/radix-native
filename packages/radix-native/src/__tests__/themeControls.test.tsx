/**
 * ThemeControls drives the root Theme. Its options are drawn by hand to look
 * like Radix's ThemePanel, on the library's own Control shell, Variant
 * recipes and Presence.
 */
import React from 'react'
import { Text as RNText } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { Theme, ThemeControls, useThemeContext } from '../index'
import { cardRings, focusRings } from './helpers/queries'
import { slate } from '../tokens/colors'

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
  it('changes the appearance, radius and scaling through its radio cards', () => {
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
    expect(screen.getByRole('radio', { name: 'ruby' }).props.accessibilityState).toMatchObject({ checked: true })
  })

  it('an option is a Control: a focus ring, the minimum touch target, its ring from the recipe', () => {
    renderPanel()
    const ruby = screen.getByRole('radio', { name: 'ruby' })
    // a 28pt swatch grows to 44pt
    expect(ruby.props.hitSlop).toEqual({ top: 8, bottom: 8, left: 8, right: 8 })
    expect(cardRings(ruby)).toHaveLength(0)
    expect(cardRings(screen.getByRole('radio', { name: 'indigo' }))).toEqual([{ color: slate.light[12], width: 2 }])
    expect(cardRings(screen.getByRole('radio', { name: 'Large' }))).toEqual([{ color: slate.light[7], width: 1 }])
    expect(cardRings(screen.getByRole('radio', { name: 'Medium' }))).toEqual([{ color: slate.light[12], width: 2 }])
    fireEvent(ruby, 'focus')
    expect(focusRings(screen.getByRole('radio', { name: 'ruby' }))).toHaveLength(1)
  })

  it('a closed panel is not mounted, so nothing in it can be reached', () => {
    renderPanel({ defaultOpen: false })
    expect(screen.queryByRole('radio', { name: 'ruby' })).toBeNull()
    fireEvent.press(screen.getByRole('button', { name: 'Toggle theme panel' }))
    expect(screen.getByRole('radio', { name: 'ruby' })).toBeTruthy()
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
