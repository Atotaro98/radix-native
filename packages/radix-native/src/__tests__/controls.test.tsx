import React from 'react'
import { fireEvent, screen } from '@testing-library/react-native'
import { Checkbox, Switch, Radio, CheckboxGroup, RadioGroup, CheckboxCards, RadioCards } from '../index'
import { renderWithTheme } from './helpers/render'

describe('Checkbox', () => {
  it('toggles when uncontrolled', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Checkbox accessibilityLabel="Terms" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox')
    fireEvent.press(box)
    expect(onCheckedChange).toHaveBeenLastCalledWith(true)
    expect(box.props.accessibilityState).toMatchObject({ checked: true })
    fireEvent.press(box)
    expect(onCheckedChange).toHaveBeenLastCalledWith(false)
  })

  it('stays in sync with the controlled prop', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Checkbox checked={false} onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox')
    fireEvent.press(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(box.props.accessibilityState).toMatchObject({ checked: false })
  })

  it('announces indeterminate as mixed and checks on press', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox')
    expect(box.props.accessibilityState).toMatchObject({ checked: 'mixed' })
    fireEvent.press(box)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('ignores presses when disabled and has a 44pt touch target', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Checkbox disabled onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox')
    fireEvent.press(box)
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(box.props.hitSlop).toEqual({ top: 14, bottom: 14, left: 14, right: 14 })
  })
})

describe('Switch', () => {
  it('toggles and calls consumer onPress', () => {
    const onCheckedChange = jest.fn()
    const onPress = jest.fn()
    renderWithTheme(<Switch onCheckedChange={onCheckedChange} onPress={onPress} />)
    fireEvent.press(screen.getByRole('switch'))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(onPress).toHaveBeenCalledTimes(1)
  })
})

describe('Radio', () => {
  it('checks on press but never unchecks (native radio semantics)', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Radio onCheckedChange={onCheckedChange} />)
    const radio = screen.getByRole('radio')
    fireEvent.press(radio)
    fireEvent.press(radio)
    expect(onCheckedChange).toHaveBeenCalledTimes(1)
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(radio.props.accessibilityState).toMatchObject({ checked: true })
  })
})

describe('CheckboxGroup', () => {
  it('keeps both values when toggled twice before re-rendering', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <CheckboxGroup onValueChange={onValueChange}>
        <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
        <CheckboxGroup.Item value="b">B</CheckboxGroup.Item>
      </CheckboxGroup>,
    )
    const [a, b] = screen.getAllByRole('checkbox')
    fireEvent.press(a)
    fireEvent.press(b)
    expect(onValueChange).toHaveBeenLastCalledWith(['a', 'b'])
    fireEvent.press(a)
    expect(onValueChange).toHaveBeenLastCalledWith(['b'])
  })

  it('announces the label row as a single checkbox named by its label', () => {
    renderWithTheme(
      <CheckboxGroup defaultValue={['a']}>
        <CheckboxGroup.Item value="a">Apples</CheckboxGroup.Item>
      </CheckboxGroup>,
    )
    const item = screen.getByRole('checkbox', { name: 'Apples' })
    expect(item.props.accessibilityState).toMatchObject({ checked: true })
  })
})

describe('RadioGroup', () => {
  it('exposes a radiogroup and selects a single value', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <RadioGroup accessibilityLabel="Plan" onValueChange={onValueChange}>
        <RadioGroup.Item value="free">Free</RadioGroup.Item>
        <RadioGroup.Item value="pro">Pro</RadioGroup.Item>
      </RadioGroup>,
    )
    // The group container is not itself focusable (that would hide its items)
    expect(screen.getByLabelText('Plan').props.accessibilityRole).toBe('radiogroup')
    fireEvent.press(screen.getByRole('radio', { name: 'Pro' }))
    expect(onValueChange).toHaveBeenCalledWith('pro')
    expect(screen.getByRole('radio', { name: 'Pro' }).props.accessibilityState).toMatchObject({ checked: true })
    expect(screen.getByRole('radio', { name: 'Free' }).props.accessibilityState).toMatchObject({ checked: false })
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
    expect(screen.getByText('Plain')).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'Plain' })).toBeTruthy()
  })

  it('RadioCards honours the classic variant and selection', () => {
    const onValueChange = jest.fn()
    renderWithTheme(
      <RadioCards variant="classic" columns={2} accessibilityLabel="Size" onValueChange={onValueChange}>
        <RadioCards.Item value="a">A</RadioCards.Item>
        <RadioCards.Item value="b">B</RadioCards.Item>
      </RadioCards>,
    )
    expect(screen.getByLabelText('Size').props.accessibilityRole).toBe('radiogroup')
    fireEvent.press(screen.getByRole('radio', { name: 'B' }))
    expect(onValueChange).toHaveBeenCalledWith('b')
  })
})
