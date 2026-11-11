/**
 * Component sizes through Metrics, checked against Radix CSS
 * (`var(--space-N)` and `calc(Npx * var(--scaling))` scale; plain `px` values don't).
 */
import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Avatar, Blockquote, Card, CheckboxCards, CheckboxGroup, Code, Kbd, RadioCards, Spinner, Text } from '../index'
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

describe.each([
  { name: 'CheckboxCards', Cards: CheckboxCards, role: 'checkbox' },
  { name: 'RadioCards', Cards: RadioCards, role: 'radio' },
] as const)('$name item size (Radix)', ({ name, Cards, role }) => {
  // .rt-CheckboxCardsRoot / .rt-RadioCardsRoot :where(.rt-r-size-N): padding-x space-3/4/5,
  // padding-y space-3/1.2, space-4*0.875, space-5/1.2, font-size-2/3/4, radius-3/3/4.
  // CheckboxCards: padding-right = padding-x * 2 + checkbox size (14/16/20), Checkbox at padding-x.
  it.each<[1 | 2 | 3, number, number, number, number, number]>([
    [1, 12, 10, 14, 6, 14],
    [2, 16, 14, 16, 6, 16],
    [3, 24, 20, 18, 8, 20],
  ])('size %i: %ipx × %ipx padding, %ipx text, %ipx radius', (size, x, y, fontSize, radius, checkbox) => {
    renderWithTheme(
      <Cards size={size}>
        <Cards.Item value="a">A</Cards.Item>
      </Cards>,
    )
    const card = screen.getByRole(role)
    const right = name === 'CheckboxCards' ? x * 2 + checkbox : x
    expect(flat(card)).toMatchObject({
      paddingLeft: x, paddingRight: right, paddingTop: y, paddingBottom: y, borderRadius: radius,
    })
    expect(StyleSheet.flatten(screen.getByText('A').props.style)).toMatchObject({ fontSize })
    const trailing = card.findAll((n: { type: unknown; props: { style?: unknown } }) => typeof n.type === 'string' && flat(n).position === 'absolute' && flat(n).right === x)
    expect(trailing).toHaveLength(name === 'CheckboxCards' ? 1 : 0)
  })
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

describe('lengths relative to the text size (em)', () => {
  // .rt-Kbd: min-width 1.75em, line-height 1.7em, padding 0 0.5em 0.05em; em = 0.75 × size-2 or 0.8 × size-N
  it.each<[string, () => React.ReactElement, number, number, number, number]>([
    ['default (0.75 × 14 → 11px)', () => <Kbd testID="k">K</Kbd>, 19, 19, 6, 1],
    ['size 3 (0.8 × 16 → 13px)', () => <Kbd size={3} testID="k">K</Kbd>, 23, 22, 7, 1],
  ])('Kbd %s', (_, kbd, minWidth, minHeight, paddingHorizontal, paddingBottom) => {
    renderWithTheme(kbd())
    expect(flat(screen.getByTestId('k'))).toMatchObject({ minWidth, minHeight, paddingHorizontal, paddingBottom })
  })

  // .rt-Code: padding 0.1em 0.25em; size 6 = 0.95 × 24 → 23px
  it('Code pads 0.1em / 0.25em, ghost not at all', () => {
    renderWithTheme(<><Code size={6} testID="c">x</Code><Code size={6} variant="ghost" testID="g">x</Code></>)
    expect(flat(screen.getByTestId('c'))).toMatchObject({ paddingVertical: 2, paddingHorizontal: 6 })
    expect(flat(screen.getByTestId('g'))).toMatchObject({ paddingVertical: 0, paddingHorizontal: 0 })
  })

  // .rt-Blockquote: border-left max(space-1, 0.25em); padding-left min(space-5, max(space-3, 0.5em))
  it.each<[string, number, number]>([['100%', 4, 12], ['90%', 4, 11]])(
    'Blockquote at %s scaling uses the Theme’s space tokens',
    (scaling, borderLeftWidth, paddingLeft) => {
      renderWithTheme(<Blockquote testID="b">Quote</Blockquote>, { scaling: scaling as '100%' | '90%' })
      expect(flat(screen.getByTestId('b'))).toMatchObject({ borderLeftWidth, paddingLeft })
    },
  )

  // Radix CheckboxGroup: gap calc(var(--font-size) / 2) between the Indicator and its label
  it.each<[1 | 2 | 3, number]>([[2, 7], [3, 8]])('a size %i group row has a 0.5em gap', (size, gap) => {
    renderWithTheme(
      <CheckboxGroup size={size}><CheckboxGroup.Item value="a">Apples</CheckboxGroup.Item></CheckboxGroup>,
    )
    expect(flat(screen.getByRole('checkbox')).gap).toBe(gap)
  })
})
