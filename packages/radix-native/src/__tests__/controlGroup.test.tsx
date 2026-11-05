/**
 * CheckboxGroup and RadioGroup share one module (createControlGroup):
 * same selection rules, same item shapes, their own value type and roles.
 */
import React from 'react'
import { fireEvent, screen } from '@testing-library/react-native'
import { CheckboxCards, CheckboxGroup, RadioCards, RadioGroup } from '../index'
import { renderWithTheme } from './helpers/render'

const GROUPS = [
  { name: 'CheckboxGroup', Group: CheckboxGroup, rootRole: 'group', itemRole: 'checkbox', afterPressingB: ['a', 'b'], initial: ['a'] },
  { name: 'RadioGroup', Group: RadioGroup, rootRole: 'radiogroup', itemRole: 'radio', afterPressingB: 'b', initial: 'a' },
] as const

describe.each(GROUPS)('$name', ({ Group, rootRole, itemRole, afterPressingB, initial }) => {
  // The two groups take different value types; the cast keeps one table for both.
  const G = Group as unknown as typeof CheckboxGroup
  const value = initial as never

  it('announces the group with its Radix role and name', () => {
    renderWithTheme(
      <G accessibilityLabel="Fruit">
        <G.Item value="a">Apple</G.Item>
      </G>,
    )
    // The container is not itself focusable (that would hide its items): check the prop.
    expect(screen.getByLabelText('Fruit').props.role).toBe(rootRole)
  })

  it('uncontrolled: a labelled item is one accessible row that selects on press', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <G defaultValue={value} onValueChange={onValueChange}>
        <G.Item value="a">Apple</G.Item>
        <G.Item value="b">Banana</G.Item>
      </G>,
    )
    expect(screen.getAllByRole(itemRole)).toHaveLength(2)
    fireEvent.press(screen.getByText('Banana'))
    expect(onValueChange).toHaveBeenCalledWith(afterPressingB)
    expect(screen.getAllByRole(itemRole)[1].props.accessibilityState).toMatchObject({ checked: true })
  })

  it('controlled: reports the change but shows the prop', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <G value={value} onValueChange={onValueChange}>
        <G.Item value="a">Apple</G.Item>
        <G.Item value="b">Banana</G.Item>
      </G>,
    )
    fireEvent.press(screen.getByText('Banana'))
    expect(onValueChange).toHaveBeenCalledWith(afterPressingB)
    expect(screen.getAllByRole(itemRole)[1].props.accessibilityState).toMatchObject({ checked: false })
  })

  it('an item without a label is the control itself', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <G defaultValue={value} onValueChange={onValueChange}>
        <G.Item value="a" />
        <G.Item value="b" />
      </G>,
    )
    const items = screen.getAllByRole(itemRole)
    expect(items[0].props.accessibilityState).toMatchObject({ checked: true })
    fireEvent.press(items[1])
    expect(onValueChange).toHaveBeenCalledWith(afterPressingB)
  })

  it('a disabled group disables every item, even one that is not disabled itself', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <G disabled onValueChange={onValueChange}>
        <G.Item value="a">Apple</G.Item>
        <G.Item value="b" disabled={false} />
      </G>,
    )
    for (const item of screen.getAllByRole(itemRole)) {
      expect(item.props.accessibilityState).toMatchObject({ disabled: true })
      fireEvent.press(item)
    }
    expect(onValueChange).not.toHaveBeenCalled()
  })
})

describe.each([
  ['CheckboxCards', CheckboxCards, 'group'],
  ['RadioCards', RadioCards, 'radiogroup'],
] as const)('%s', (_name, Cards, rootRole) => {
  it('announces the group with its Radix role and name', () => {
    const C = Cards as unknown as typeof CheckboxCards
    renderWithTheme(
      <C accessibilityLabel="Plan">
        <C.Item value="a">A</C.Item>
      </C>,
    )
    expect(screen.getByLabelText('Plan').props.role).toBe(rootRole)
  })
})
