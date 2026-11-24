/**
 * The classic look as components render it (iOS shadow props), against Radix
 * Themes CSS: the recipes decide shadow and bevel, these check the wiring.
 */
import React from 'react'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { Button, Card, CheckboxCards, Text } from '../index'
import { renderWithTheme } from './helpers/render'
import { flat } from './helpers/queries'

describe('classic look', () => {
  it('a classic Button is lifted at rest', () => {
    renderWithTheme(<Button variant="classic" testID="b">Go</Button>)
    expect(flat(screen.getByTestId('b'))).toMatchObject({ shadowOpacity: 0.15, shadowRadius: 2 })
  })

  // base-button.js: loading sets data-disabled → background-image none, no lift
  it('a loading classic Button is flat, like a disabled one', () => {
    renderWithTheme(<Button variant="classic" loading testID="b">Go</Button>)
    expect(flat(screen.getByTestId('b')).shadowOpacity).toBeUndefined()
  })

  // card.css :active uses --base-card-classic-active-* (still an outer shadow)
  it('a pressed classic Card keeps its shadow', () => {
    renderWithTheme(<Card variant="classic" onPress={() => {}} testID="c"><Text>x</Text></Card>)
    act(() => { fireEvent(screen.getByTestId('c'), 'pressIn') })
    expect(flat(screen.getByTestId('c'))).toMatchObject({ shadowOpacity: 0.15 })
  })

  // checkbox-cards.css :has(:disabled) keeps the classic outer shadow
  it('a disabled classic card item keeps its shadow', () => {
    renderWithTheme(
      <CheckboxCards variant="classic" disabled><CheckboxCards.Item value="a">A</CheckboxCards.Item></CheckboxCards>,
    )
    expect(flat(screen.getByRole('checkbox'))).toMatchObject({ shadowOpacity: 0.15 })
  })
})
