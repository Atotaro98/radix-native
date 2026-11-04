import React from 'react'
import { fireEvent, screen } from '@testing-library/react-native'
import { Checkbox, Switch, Radio } from '../index'
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
