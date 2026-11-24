/**
 * Selection groups: CheckboxGroup, RadioGroup, CheckboxCards and RadioCards
 * share their semantics (one value or several, controlled or not, what items
 * inherit). Each case runs against the four families.
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { fireEvent, screen } from '@testing-library/react-native'
import { CheckboxGroup, RadioGroup, CheckboxCards, RadioCards } from '../index'
import { renderWithTheme } from './helpers/render'
import { crimson, indigo } from '../tokens/colors'
import { cardRings, focusRings } from './helpers/queries'

const families = [
  { name: 'CheckboxGroup', Group: CheckboxGroup, role: 'checkbox', multiple: true },
  { name: 'CheckboxCards', Group: CheckboxCards, role: 'checkbox', multiple: true },
  { name: 'RadioGroup', Group: RadioGroup, role: 'radio', multiple: false },
  { name: 'RadioCards', Group: RadioCards, role: 'radio', multiple: false },
] as const

// The four Roots share a props shape apart from the value type.
type AnyGroup = React.ComponentType<Record<string, unknown>> & { Item: React.ComponentType<Record<string, unknown>> }

describe.each(families)('$name', ({ name, Group: G, role, multiple }) => {
  const Group = G as unknown as AnyGroup
  const options = (
    <>
      <Group.Item value="a">Alpha</Group.Item>
      <Group.Item value="b">Beta</Group.Item>
    </>
  )
  const item = (label: string) => screen.getByRole(role, { name: label })

  it.each([
    ['gray keeps the theme accent', 'gray', indigo.light[8]],
    ['any other color uses its own', 'crimson', crimson.light[8]],
  ] as const)('focus ring (Radix --focus-8): %s', (_label, color, expected) => {
    renderWithTheme(<Group color={color}>{options}</Group>)
    fireEvent(item('Alpha'), 'focus')
    expect(focusRings(screen.UNSAFE_root).map((ring) => ring.props.color)).toEqual([expected])
  })
  const checked = (label: string) => item(label).props.accessibilityState.checked

  it(multiple ? 'toggles several values (two quick presses never go stale)' : 'selects a single value', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Group onValueChange={onValueChange}>{options}</Group>)
    fireEvent.press(item('Alpha'))
    fireEvent.press(item('Beta'))
    if (multiple) {
      expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
      fireEvent.press(item('Alpha'))
      expect(onValueChange).toHaveBeenLastCalledWith(['b'])
    } else {
      expect(onValueChange).toHaveBeenLastCalledWith('b')
      expect(checked('Alpha')).toBe(false)
    }
    expect(checked('Beta')).toBe(true)
  })

  it('follows a controlled value', () => {
    const onValueChange = jest.fn()
    renderWithTheme(<Group value={multiple ? ['a'] : 'a'} onValueChange={onValueChange}>{options}</Group>)
    fireEvent.press(item('Beta'))
    expect(onValueChange).toHaveBeenCalledWith(multiple ? ['a', 'b'] : 'b')
    // Not updated by the parent → stays as given
    expect(checked('Alpha')).toBe(true)
    expect(checked('Beta')).toBe(false)
  })

  it('a disabled group disables every item, even one that sets disabled={false}', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <Group disabled onValueChange={onValueChange}>
        <Group.Item value="a" disabled={false}>Alpha</Group.Item>
      </Group>,
    )
    expect(item('Alpha').props.accessibilityState).toMatchObject({ disabled: true })
    fireEvent.press(item('Alpha'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('a disabled item does not select', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <Group onValueChange={onValueChange}>
        <Group.Item value="a" disabled>Alpha</Group.Item>
      </Group>,
    )
    fireEvent.press(item('Alpha'))
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('throws a clear error for an Item outside its Root', () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => renderWithTheme(<Group.Item value="a">Alpha</Group.Item>))
      .toThrow(`${name}.Item must be used within ${name}.Root`)
    error.mockRestore()
  })
})

it('an Item only connects to a Root of its own family', () => {
  const error = jest.spyOn(console, 'error').mockImplementation(() => {})
  expect(() => renderWithTheme(
    <CheckboxCards>
      <CheckboxGroup.Item value="a">Alpha</CheckboxGroup.Item>
    </CheckboxCards>,
  )).toThrow('CheckboxGroup.Item must be used within CheckboxGroup.Root')
  error.mockRestore()
})

describe('Groups', () => {
  it('announce the label row as a single control named by its label', () => {
    renderWithTheme(
      <CheckboxGroup defaultValue={['a']}>
        <CheckboxGroup.Item value="a">Apples</CheckboxGroup.Item>
      </CheckboxGroup>,
    )
    expect(screen.getByRole('checkbox', { name: 'Apples' }).props.accessibilityState).toMatchObject({ checked: true })
  })

  it('RadioGroup exposes a radiogroup', () => {
    renderWithTheme(
      <RadioGroup accessibilityLabel="Plan">
        <RadioGroup.Item value="free">Free</RadioGroup.Item>
      </RadioGroup>,
    )
    // The group container is not itself focusable (that would hide its items)
    expect(screen.getByLabelText('Plan').props.role).toBe('radiogroup')
  })

  it.each([
    ['CheckboxGroup', CheckboxGroup],
    ['RadioGroup', RadioGroup],
  ] as const)('%s spaces items by space-1 and labels by 0.5em (Radix)', (_name, G) => {
    const Group = G as unknown as AnyGroup
    renderWithTheme(
      <Group testID="group" size={2}>
        <Group.Item value="a">Alpha</Group.Item>
      </Group>,
    )
    expect(StyleSheet.flatten(screen.getByTestId('group').props.style).gap).toBe(4)
    // size 2 → Text size 2 (14px) → 7px between control and label
    const row = screen.getByText('Alpha').parent!.parent!
    expect(StyleSheet.flatten(row.props.style).gap).toBe(7)
  })
})

describe('Cards', () => {
  it('CheckboxCards lays out `columns` cards per row', () => {
    renderWithTheme(
      <CheckboxCards columns={2}>
        <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        <CheckboxCards.Item value="b">B</CheckboxCards.Item>
        <CheckboxCards.Item value="c">C</CheckboxCards.Item>
      </CheckboxCards>,
    )
    const rowOf = (label: string) => {
      // text → card → cell → row
      let node = screen.getByText(label).parent
      while (node && node.props.style?.flexDirection !== 'row') node = node.parent
      return node
    }
    expect(rowOf('A')).toBe(rowOf('B'))
    expect(rowOf('C')).not.toBe(rowOf('A'))
  })

  it('wraps plain string children in Text and auto-fits when columns is omitted', () => {
    renderWithTheme(
      <CheckboxCards>
        <CheckboxCards.Item value="a">Plain</CheckboxCards.Item>
      </CheckboxCards>,
    )
    expect(screen.getByRole('checkbox', { name: 'Plain' })).toBeTruthy()
  })

  it('RadioCards exposes a radiogroup', () => {
    renderWithTheme(
      <RadioCards accessibilityLabel="Size" defaultValue="b" columns={2}>
        <RadioCards.Item value="a">A</RadioCards.Item>
        <RadioCards.Item value="b">B</RadioCards.Item>
      </RadioCards>,
    )
    expect(screen.getByLabelText('Size').props.role).toBe('radiogroup')
  })
})

describe('Selection card checked ring', () => {
  type Host = { type: unknown; props: { style?: unknown }; findAll: (match: (n: Host) => boolean) => Host[] }
  const flat = (node: { props: { style?: unknown } }): ViewStyle =>
    StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}
  /** Where the content starts: border + padding on each side. */
  const contentOffset = (card: Host) => {
    const s = flat(card)
    const border = s.borderWidth ?? 0
    return {
      top: border + Number(s.paddingTop ?? 0),
      right: border + Number(s.paddingRight ?? 0),
      bottom: border + Number(s.paddingBottom ?? 0),
      left: border + Number(s.paddingLeft ?? 0),
    }
  }
  const ringWidths = (card: Host) => cardRings(card).map((r) => r.width)

  // Radix draws the checked ring as an `::after` outline, so it takes no layout
  // space; ThemeControls passes its own padding through `style`.
  it.each([
    ['default padding', undefined],
    ['padding overridden through style', { paddingTop: 6, paddingBottom: 6, paddingLeft: 2, paddingRight: 2 }],
  ] as const)('RadioCards: checked and unchecked items have the same content offset (%s)', (_, style) => {
    renderWithTheme(
      <RadioCards defaultValue="b" columns={2}>
        <RadioCards.Item value="a" style={style}>A</RadioCards.Item>
        <RadioCards.Item value="b" style={style}>B</RadioCards.Item>
      </RadioCards>,
    )
    const a = screen.getByRole('radio', { name: 'A' }) as unknown as Host
    const b = screen.getByRole('radio', { name: 'B' }) as unknown as Host
    expect(contentOffset(b)).toEqual(contentOffset(a))
    expect(ringWidths(a)).toEqual([1])
    expect(ringWidths(b)).toEqual([2])
    // base-card.css: no layout border, the ring is drawn over the card's outer 2px (CardRing).
    expect(flat(b).borderWidth).toBeUndefined()
  })

  it('CheckboxCards: checked and unchecked items have the same content offset', () => {
    renderWithTheme(
      <CheckboxCards defaultValue={['b']} columns={2}>
        <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        <CheckboxCards.Item value="b">B</CheckboxCards.Item>
      </CheckboxCards>,
    )
    const a = screen.getByRole('checkbox', { name: 'A' }) as unknown as Host
    const b = screen.getByRole('checkbox', { name: 'B' }) as unknown as Host
    expect(contentOffset(b)).toEqual(contentOffset(a))
  })
})

describe('Selection card layout', () => {
  // .rt-CheckboxCardsItem / .rt-RadioCardsItem { display: flex; align-items: center; gap: var(--space-2) }
  it('lays its content out in a centered row with a space-2 gap', () => {
    renderWithTheme(
      <RadioCards defaultValue="a">
        <RadioCards.Item value="a">A</RadioCards.Item>
      </RadioCards>,
    )
    const s = StyleSheet.flatten(screen.getByRole('radio', { name: 'A' }).props.style as StyleProp<ViewStyle>)
    expect(s).toMatchObject({ flexDirection: 'row', alignItems: 'center', gap: 8 })
  })
})
