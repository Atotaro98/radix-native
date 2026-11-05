/**
 * Behaviour every Toggle shares through BaseToggle: role, announced state,
 * what a press does, the disabled gate, the touch target and the focus ring.
 */
import React from 'react'
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { Checkbox, CheckboxCards, CheckboxGroup, Radio, RadioGroup, Switch } from '../index'
import { renderWithTheme } from './helpers/render'

type Node = { type: unknown; props: { style?: unknown } }
type Toggle = typeof Checkbox | typeof Radio | typeof Switch

const flat = (n: Node): ViewStyle => StyleSheet.flatten(n.props.style as StyleProp<ViewStyle>) ?? {}

/** FocusRing is the only absolutely positioned 2px ring inside a Toggle. */
const focusRings = (el: { findAll: (p: (n: Node) => boolean) => Node[] }) =>
  el.findAll((n) => typeof n.type === 'string' && flat(n).position === 'absolute' && flat(n).borderWidth === 2)

const TOGGLES: [string, Toggle, 'checkbox' | 'radio' | 'switch'][] = [
  ['Checkbox', Checkbox, 'checkbox'],
  ['Radio', Radio, 'radio'],
  ['Switch', Switch, 'switch'],
]

describe.each(TOGGLES)('%s', (_name, Component, role) => {
  it('announces its role and checked state', () => {
    renderWithTheme(<Component defaultChecked accessibilityLabel="x" />)
    expect(screen.getByRole(role).props.accessibilityState).toMatchObject({ checked: true, disabled: false })
  })

  it('checks on press and forwards onPress', () => {
    const onCheckedChange = jest.fn()
    const onPress = jest.fn()
    renderWithTheme(<Component onCheckedChange={onCheckedChange} onPress={onPress} />)
    fireEvent.press(screen.getByRole(role))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('ignores presses when disabled', () => {
    const onCheckedChange = jest.fn()
    const onPress = jest.fn()
    renderWithTheme(<Component disabled onCheckedChange={onCheckedChange} onPress={onPress} />)
    fireEvent.press(screen.getByRole(role))
    expect(onCheckedChange).not.toHaveBeenCalled()
    expect(onPress).not.toHaveBeenCalled()
    expect(screen.getByRole(role).props.accessibilityState).toMatchObject({ disabled: true })
  })

  it('grows to a 44pt touch target unless hitSlop is given', () => {
    const { unmount } = renderWithTheme(<Component />)
    const el = screen.getByRole(role)
    const { width, height } = flat(el) as { width: number; height: number }
    const slop = el.props.hitSlop
    expect(width + slop.left + slop.right).toBeGreaterThanOrEqual(44)
    expect(height + slop.top + slop.bottom).toBeGreaterThanOrEqual(44)
    unmount()
    renderWithTheme(<Component hitSlop={4} />)
    expect(screen.getByRole(role).props.hitSlop).toBe(4)
  })

  it('shows the focus ring only while focused', () => {
    const onFocus = jest.fn()
    renderWithTheme(<Component onFocus={onFocus} />)
    const el = screen.getByRole(role)
    expect(focusRings(el)).toHaveLength(0)
    act(() => fireEvent(el, 'focus'))
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(focusRings(screen.getByRole(role))).toHaveLength(1)
    act(() => fireEvent(screen.getByRole(role), 'blur'))
    expect(focusRings(screen.getByRole(role))).toHaveLength(0)
  })

  it('shows no focus ring when disabled', () => {
    renderWithTheme(<Component disabled />)
    act(() => fireEvent(screen.getByRole(role), 'focus'))
    expect(focusRings(screen.getByRole(role))).toHaveLength(0)
  })
})

describe('what a press does, per role', () => {
  it('Checkbox: unchecked → checked → unchecked; indeterminate → checked', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Checkbox defaultChecked="indeterminate" onCheckedChange={onCheckedChange} />)
    const box = screen.getByRole('checkbox')
    expect(box.props.accessibilityState).toMatchObject({ checked: 'mixed' })
    fireEvent.press(box)
    fireEvent.press(box)
    expect(onCheckedChange.mock.calls).toEqual([[true], [false]])
  })

  it('Radio: only checks', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Radio defaultChecked onCheckedChange={onCheckedChange} />)
    fireEvent.press(screen.getByRole('radio'))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('Switch: flips', () => {
    const onCheckedChange = jest.fn()
    renderWithTheme(<Switch defaultChecked onCheckedChange={onCheckedChange} />)
    fireEvent.press(screen.getByRole('switch'))
    fireEvent.press(screen.getByRole('switch'))
    expect(onCheckedChange.mock.calls).toEqual([[false], [true]])
  })
})

describe('rows and cards show an Indicator, not a second Toggle', () => {
  it('a labelled CheckboxGroup.Item is a single checkbox', () => {
    renderWithTheme(
      <CheckboxGroup defaultValue={['a']}>
        <CheckboxGroup.Item value="a">Apples</CheckboxGroup.Item>
      </CheckboxGroup>,
    )
    expect(screen.getAllByRole('checkbox', { includeHiddenElements: true })).toHaveLength(1)
  })

  it('a labelled RadioGroup.Item is a single radio', () => {
    renderWithTheme(
      <RadioGroup defaultValue="a">
        <RadioGroup.Item value="a">Apples</RadioGroup.Item>
      </RadioGroup>,
    )
    expect(screen.getAllByRole('radio', { includeHiddenElements: true })).toHaveLength(1)
  })

  it('a CheckboxCards.Item is a single checkbox', () => {
    renderWithTheme(
      <CheckboxCards defaultValue={['a']}>
        <CheckboxCards.Item value="a">Apples</CheckboxCards.Item>
      </CheckboxCards>,
    )
    expect(screen.getAllByRole('checkbox', { includeHiddenElements: true })).toHaveLength(1)
  })
})

describe('classic look, as in Radix', () => {
  const hasDropShadow = (n: Node) => {
    const s = flat(n) as ViewStyle & { shadowOpacity?: number; elevation?: number }
    return (s.shadowOpacity ?? 0) > 0 || (s.elevation ?? 0) > 0
  }
  const shadowed = (role: 'checkbox' | 'radio' | 'switch') =>
    screen.getByRole(role).findAll((n: Node) => typeof n.type === 'string' && hasDropShadow(n))

  it.each([
    ['Checkbox', Checkbox, 'checkbox'],
    ['Radio', Radio, 'radio'],
  ] as const)('checked classic %s is a bevel without a drop shadow', (_name, Component, role) => {
    renderWithTheme(<Component variant="classic" defaultChecked />)
    expect(shadowed(role)).toHaveLength(0)
    // ClassicOverlay: two translucent halves
    const halves = screen.getByRole(role).findAll(
      (n: Node) => typeof n.type === 'string' && flat(n).height === '50%',
    )
    expect(halves).toHaveLength(2)
  })

  it.each(['surface', 'classic', 'soft'] as const)('%s Switch: the thumb has the drop shadow, the track has none', (variant) => {
    renderWithTheme(<Switch variant={variant} defaultChecked />)
    const [thumb, ...others] = shadowed('switch')
    expect(others).toHaveLength(0)
    expect(flat(thumb).width).toBe(flat(thumb).height)
  })
})
