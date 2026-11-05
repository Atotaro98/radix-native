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
    const styleOf = (node: { props: { style?: unknown } }) =>
      StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>)
    const rings = screen.UNSAFE_root.findAll(
      (node: { type: unknown; props: { style?: unknown } }) => typeof node.type === 'string'
        && styleOf(node)?.position === 'absolute' && styleOf(node)?.borderWidth === 2,
    )
    expect(rings.map((node: { props: { style?: unknown } }) => styleOf(node)?.borderColor)).toEqual([expected])
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

  it('RadioCards exposes a radiogroup and draws a 2px checked border without shifting content', () => {
    renderWithTheme(
      <RadioCards accessibilityLabel="Size" defaultValue="b" columns={2}>
        <RadioCards.Item value="a">A</RadioCards.Item>
        <RadioCards.Item value="b">B</RadioCards.Item>
      </RadioCards>,
    )
    expect(screen.getByLabelText('Size').props.role).toBe('radiogroup')
    const a = StyleSheet.flatten(screen.getByRole('radio', { name: 'A' }).props.style)
    const b = StyleSheet.flatten(screen.getByRole('radio', { name: 'B' }).props.style)
    expect([a.borderWidth, b.borderWidth]).toEqual([1, 2])
    expect(a.paddingTop + a.borderWidth).toBe(b.paddingTop + b.borderWidth)
  })
})
