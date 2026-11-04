/**
 * Component sizes through Metrics, checked against Radix CSS
 * (`var(--space-N)` and `calc(Npx * var(--scaling))` scale; plain `px` values don't).
 */
import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Avatar, Card, CheckboxCards, RadioCards, Spinner, Text } from '../index'
import { renderWithTheme } from './helpers/render'

type Node = { type: unknown; props: { style?: unknown } }

const flat = (node: { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

describe('Spinner', () => {
  // .rt-Spinner: var(--space-3), var(--space-4), calc(1.25 * var(--space-4))
  it.each<[1 | 2 | 3, number]>([[1, 12], [2, 16], [3, 20]])(
    'size %i is %ipx at 100%% scaling',
    (size, expected) => {
      renderWithTheme(<Spinner size={size} testID="s" />)
      const style = flat(screen.getByTestId('s'))
      expect(style.width).toBe(expected)
      expect(style.height).toBe(expected)
    },
  )

  it('size 3 scales with the Theme (1.25 × space-4 at 90%)', () => {
    renderWithTheme(<Spinner size={3} testID="s" />, { scaling: '90%' })
    expect(flat(screen.getByTestId('s')).width).toBe(18)
  })
})

describe('Card', () => {
  // .rt-Card:where(.rt-r-size-5) --card-padding: var(--space-8)
  it('size 5 padding is space-8 (48px)', () => {
    renderWithTheme(<Card size={5} testID="c"><Text>x</Text></Card>)
    expect(flat(screen.getByTestId('c')).padding).toBe(48)
  })
})

describe('RadioCards item padding', () => {
  // .rt-RadioCardsRoot --radio-cards-item-padding-x / -y
  it.each<[1 | 2 | 3, number, number]>([[1, 12, 10], [2, 16, 14], [3, 24, 20]])(
    'size %i is %ipx × %ipx (x × y)',
    (size, x, y) => {
      renderWithTheme(
        <RadioCards size={size}>
          <RadioCards.Item value="a">A</RadioCards.Item>
        </RadioCards>,
      )
      const style = flat(screen.getByRole('radio'))
      expect(style).toMatchObject({ paddingLeft: x, paddingRight: x, paddingTop: y, paddingBottom: y })
    },
  )
})

describe('Avatar', () => {
  // .rt-AvatarRoot --avatar-size: var(--space-5…9) for sizes 1–5, plain px for 6–9
  it.each<[1 | 2 | 3 | 4 | 5, number]>([[1, 26], [2, 35], [3, 44], [4, 53], [5, 70]])(
    'size %i scales with the Theme (%ipx at 110%%)',
    (size, expected) => {
      renderWithTheme(<Avatar size={size} fallback="A" testID="a" />, { scaling: '110%' })
      expect(flat(screen.getByTestId('a')).width).toBe(expected)
    },
  )

  it.each<[6 | 7 | 8 | 9, number]>([[6, 80], [7, 96], [8, 128], [9, 160]])(
    'size %i stays %ipx at any scaling',
    (size, expected) => {
      renderWithTheme(<Avatar size={size} fallback="A" testID="a" />, { scaling: '110%' })
      const style = flat(screen.getByTestId('a'))
      expect(style.width).toBe(expected)
      expect(style.height).toBe(expected)
    },
  )
})

describe('selection card auto-fit grid', () => {
  // radioCardsRootPropDefs / checkboxCardsRootPropDefs columns: repeat(auto-fit, minmax(160px, 1fr))
  const basis = () =>
    screen.UNSAFE_root.findAll((n: Node) => typeof n.type === 'string' && flat(n).flexBasis !== undefined)
      .map((n: Node) => flat(n).flexBasis)

  it('RadioCards cells keep a plain 160px minimum at 110% scaling', () => {
    renderWithTheme(
      <RadioCards>
        <RadioCards.Item value="a">A</RadioCards.Item>
        <RadioCards.Item value="b">B</RadioCards.Item>
      </RadioCards>,
      { scaling: '110%' },
    )
    expect(basis()).toEqual([160, 160])
  })

  it('CheckboxCards cells keep a plain 160px minimum at 90% scaling', () => {
    renderWithTheme(
      <CheckboxCards>
        <CheckboxCards.Item value="a">A</CheckboxCards.Item>
      </CheckboxCards>,
      { scaling: '90%' },
    )
    expect(basis()).toEqual([160])
  })
})
