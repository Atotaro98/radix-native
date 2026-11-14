/**
 * Behaviour every Toggle shares through BaseToggle, and that everything acting
 * as a Toggle (rows, cards) shares through the Toggle surface: role, announced
 * state, what a press does, the disabled gate, the press scale, the touch
 * target and the focus ring.
 */
import React from 'react'
import { StyleSheet, type StyleProp, type TextStyle, type ViewStyle } from 'react-native'
import { act, fireEvent, screen } from '@testing-library/react-native'
import { Checkbox, CheckboxCards, CheckboxGroup, Radio, RadioCards, RadioGroup, Switch } from '../index'
import { renderWithTheme } from './helpers/render'
import { flat, focusRings, hasBevel } from './helpers/queries'

type Node = { type: unknown; props: { style?: unknown; visible?: boolean; offset?: number; borderRadius?: number } }
type Toggle = typeof Checkbox | typeof Radio | typeof Switch

const lineHeightOf = (n: Node) => StyleSheet.flatten(n.props.style as StyleProp<TextStyle>)?.lineHeight

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

// ─── Toggle surface ─────────────────────────────────────────────────────────

interface SurfaceProps { disabled?: boolean; onChange: jest.Mock }
type Surface = {
  role: 'checkbox' | 'radio' | 'switch'
  /** Renders one unchecked item that reports a press through `onChange`. */
  render: (p: SurfaceProps) => React.ReactElement
  /** Where the touch target comes from: the Indicator, a row with a label, or the card itself. */
  touch: 'indicator' | 'row' | 'card'
}

const SURFACES: [string, Surface][] = [
  ['Checkbox', { role: 'checkbox', touch: 'indicator', render: ({ disabled, onChange }) => <Checkbox disabled={disabled} onCheckedChange={onChange} /> }],
  ['Radio', { role: 'radio', touch: 'indicator', render: ({ disabled, onChange }) => <Radio disabled={disabled} onCheckedChange={onChange} /> }],
  ['Switch', { role: 'switch', touch: 'indicator', render: ({ disabled, onChange }) => <Switch disabled={disabled} onCheckedChange={onChange} /> }],
  ['CheckboxGroup row', { role: 'checkbox', touch: 'row', render: ({ disabled, onChange }) => (
    <CheckboxGroup disabled={disabled} onValueChange={onChange}><CheckboxGroup.Item value="a">Apples</CheckboxGroup.Item></CheckboxGroup>
  ) }],
  ['RadioGroup row', { role: 'radio', touch: 'row', render: ({ disabled, onChange }) => (
    <RadioGroup disabled={disabled} onValueChange={onChange}><RadioGroup.Item value="a">Apples</RadioGroup.Item></RadioGroup>
  ) }],
  ['CheckboxCards item', { role: 'checkbox', touch: 'card', render: ({ disabled, onChange }) => (
    <CheckboxCards disabled={disabled} onValueChange={onChange}><CheckboxCards.Item value="a">Apples</CheckboxCards.Item></CheckboxCards>
  ) }],
  ['RadioCards item', { role: 'radio', touch: 'card', render: ({ disabled, onChange }) => (
    <RadioCards disabled={disabled} onValueChange={onChange}><RadioCards.Item value="a">Apples</RadioCards.Item></RadioCards>
  ) }],
]

describe.each(SURFACES)('Toggle surface: %s', (_name, { role, render, touch }) => {
  const get = () => screen.getByRole(role)

  it('announces its role and checked state, and checks on press', () => {
    const onChange = jest.fn()
    renderWithTheme(render({ onChange }))
    expect(get().props.accessibilityState).toMatchObject({ checked: false, disabled: false })
    fireEvent.press(get())
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(get().props.accessibilityState).toMatchObject({ checked: true })
  })

  it('ignores presses and announces itself disabled when disabled', () => {
    const onChange = jest.fn()
    renderWithTheme(render({ disabled: true, onChange }))
    fireEvent.press(get())
    expect(onChange).not.toHaveBeenCalled()
    expect(get().props.accessibilityState).toMatchObject({ checked: false, disabled: true })
  })

  it('press-scales', () => {
    renderWithTheme(render({ onChange: jest.fn() }))
    expect(flat(get()).transform).toEqual([{ scale: 1 }])
  })

  it('reaches the 44pt touch target', () => {
    renderWithTheme(render({ onChange: jest.fn() }))
    const el = get()
    const slop = el.props.hitSlop ?? { top: 0, bottom: 0, left: 0, right: 0 }
    if (touch === 'indicator') {
      const { width, height } = flat(el) as { width: number; height: number }
      expect(width + slop.left + slop.right).toBeGreaterThanOrEqual(44)
      expect(height + slop.top + slop.bottom).toBeGreaterThanOrEqual(44)
    } else if (touch === 'row') {
      // One line of the label (taller than the Indicator at every size) plus the vertical slop.
      const label = el.findAll((n: Node) => typeof n.type === 'string' && lineHeightOf(n) !== undefined)[0]
      expect((lineHeightOf(label) ?? 0) + slop.top + slop.bottom).toBeGreaterThanOrEqual(44)
    } else {
      expect(el.props.hitSlop).toBeUndefined()
    }
  })

  it('shows the focus ring only while focused, never when disabled', () => {
    const { unmount } = renderWithTheme(render({ onChange: jest.fn() }))
    expect(focusRings(get())).toHaveLength(0)
    act(() => fireEvent(get(), 'focus'))
    const [ring, ...others] = focusRings(get())
    expect(others).toHaveLength(0)
    // Inset along a card's edge; otherwise outside the Indicator — in a row it
    // wraps the Indicator, not the whole row (Radix focuses the checkbox).
    if (touch === 'card') expect(ring.props.offset ?? 0).toBe(0)
    else expect(ring.props.offset).toBeGreaterThan(0)
    if (touch === 'row') expect(get().children).not.toContain(ring)
    act(() => fireEvent(get(), 'blur'))
    expect(focusRings(get())).toHaveLength(0)
    unmount()

    renderWithTheme(render({ disabled: true, onChange: jest.fn() }))
    act(() => fireEvent(get(), 'focus'))
    expect(focusRings(get())).toHaveLength(0)
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
    expect(hasBevel(screen.getByRole(role))).toBe(true)
  })

  it.each(['surface', 'classic', 'soft'] as const)('%s Switch: the thumb has the drop shadow, the track has none', (variant) => {
    renderWithTheme(<Switch variant={variant} defaultChecked />)
    const [thumb, ...others] = shadowed('switch')
    expect(others).toHaveLength(0)
    expect(flat(thumb).width).toBe(flat(thumb).height)
  })
})
