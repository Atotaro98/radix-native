import React from 'react'
import { StyleSheet, View } from 'react-native'
import { screen, fireEvent } from '@testing-library/react-native'
import { Theme, TextField, TextArea } from '../index'
import { renderWithTheme } from './helpers/render'
import { focusRings } from './helpers/queries'
import { indigo, red, slate } from '../tokens/colors'

const borderOf = (input: { parent: unknown }) =>
  // The input's parent is the View that draws the border.
  ((input.parent as { parent: { props: { style: unknown[] } } }).parent.props.style[0] as { borderColor: string }).borderColor

/** Whether the input's focus ring is visible. */
const focusRingVisible = () => focusRings(screen.UNSAFE_root).length > 0

describe.each([
  ['TextField', TextField],
  ['TextArea', TextArea],
] as const)('%s', (_name, Input) => {
  it('forwards consumer props and focus handlers', () => {
    const onFocus = jest.fn()
    const onBlur = jest.fn()
    const onChangeText = jest.fn()
    renderWithTheme(<Input placeholder="Email" onFocus={onFocus} onBlur={onBlur} onChangeText={onChangeText} />)
    const input = screen.getByPlaceholderText('Email')
    fireEvent(input, 'focus')
    fireEvent.changeText(input, 'a@b.c')
    fireEvent(input, 'blur')
    expect(onFocus).toHaveBeenCalledTimes(1)
    expect(onChangeText).toHaveBeenCalledWith('a@b.c')
    expect(onBlur).toHaveBeenCalledTimes(1)
  })

  it('exposes disabled state on the input itself', () => {
    renderWithTheme(<Input disabled placeholder="Email" accessibilityState={{ selected: true }} />)
    const input = screen.getByPlaceholderText('Email')
    expect(input.props.editable).toBe(false)
    expect(input.props.accessibilityState).toEqual({ selected: true, disabled: true })
  })

  it('shows the focus ring while focused, and drops it once disabled', () => {
    const { rerender } = renderWithTheme(<Input placeholder="Email" />)
    fireEvent(screen.getByPlaceholderText('Email'), 'focus')
    expect(borderOf(screen.getByPlaceholderText('Email'))).toBe(indigo.light[8])
    expect(focusRingVisible()).toBe(true)
    rerender(<Theme appearance="light"><Input placeholder="Email" disabled /></Theme>)
    expect(focusRingVisible()).toBe(false)
  })

  it.each([
    ['readOnly', { readOnly: true }],
    ['editable={false}', { editable: false }],
  ] as const)('%s looks disabled but is not reported as disabled', (_label, props) => {
    renderWithTheme(<Input placeholder="Email" {...props} />)
    const input = screen.getByPlaceholderText('Email')
    expect(input.props.style).toMatchObject({ color: slate.light.a11 })
    expect(input.props.accessibilityState).toEqual({ disabled: false })
  })

  // iOS multiline TextInput only recolors text the native view gets from
  // React (RCTUITextView applies new text attributes to typing only), and an
  // uncontrolled input snaps back to `defaultValue` when its style changes.
  // So the input always receives `value`: typed text survives a theme switch
  // and is repainted with the new appearance.
  it('keeps typed text as its value across an appearance change', () => {
    const onChangeText = jest.fn()
    const { rerender } = renderWithTheme(<Input placeholder="Email" defaultValue="Hola" onChangeText={onChangeText} />)
    expect(screen.getByPlaceholderText('Email').props.value).toBe('Hola')
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'Adios')
    expect(onChangeText).toHaveBeenCalledWith('Adios')
    rerender(<Theme appearance="dark"><Input placeholder="Email" defaultValue="Hola" onChangeText={onChangeText} /></Theme>)
    const input = screen.getByPlaceholderText('Email')
    expect(input.props.value).toBe('Adios')
    expect(input.props.defaultValue).toBeUndefined()
    expect(input.props.style).toMatchObject({ color: slate.dark[12] })
  })

  it('the keyboard follows the Theme appearance unless overridden', () => {
    const { rerender } = renderWithTheme(<Input placeholder="Email" />, { appearance: 'dark' })
    expect(screen.getByPlaceholderText('Email').props.keyboardAppearance).toBe('dark')
    rerender(<Theme appearance="dark"><Input placeholder="Email" keyboardAppearance="light" /></Theme>)
    expect(screen.getByPlaceholderText('Email').props.keyboardAppearance).toBe('light')
  })

  it('a controlled value wins over typing', () => {
    const onChangeText = jest.fn()
    renderWithTheme(<Input placeholder="Email" value="fixed" onChangeText={onChangeText} />)
    fireEvent.changeText(screen.getByPlaceholderText('Email'), 'other')
    expect(onChangeText).toHaveBeenCalledWith('other')
    expect(screen.getByPlaceholderText('Email').props.value).toBe('fixed')
  })

  it('disabled stays not editable when readOnly={false} is passed', () => {
    renderWithTheme(<Input placeholder="Email" disabled readOnly={false} />)
    expect(screen.getByPlaceholderText('Email').props).toMatchObject({ readOnly: true, editable: false })
  })

  it('read-only focus ring is gray-8', () => {
    renderWithTheme(<Input placeholder="Email" readOnly />)
    const input = screen.getByPlaceholderText('Email')
    fireEvent(input, 'focus')
    expect(borderOf(input)).toBe(slate.light[8])
  })
})

describe('placeholder (Radix soft: accent-12 at 0.6 / 0.65)', () => {
  it('TextField soft placeholder is 60% alpha', () => {
    renderWithTheme(<TextField variant="soft" placeholder="Search" />)
    expect(screen.getByPlaceholderText('Search').props.placeholderTextColor).toMatch(/^#[0-9a-f]{6}99$/i)
  })

  it('TextArea soft placeholder is 65% alpha', () => {
    renderWithTheme(<TextArea variant="soft" placeholder="Notes" />)
    expect(screen.getByPlaceholderText('Notes').props.placeholderTextColor).toMatch(/^#[0-9a-f]{6}a6$/i)
  })
})

it('TextArea is always multiline; TextField never is', () => {
  renderWithTheme(
    <>
      <TextField placeholder="One" />
      <TextArea placeholder="Many" />
    </>,
  )
  expect(screen.getByPlaceholderText('One').props.multiline).toBe(false)
  expect(screen.getByPlaceholderText('Many').props.multiline).toBe(true)
})

describe('TextField.Slot (text-field.css .rt-TextFieldSlot)', () => {
  const Icon = ({ color, testID }: { color?: string; testID?: string }) => <View testID={testID} accessibilityLabel={color} />
  Icon.displayName = 'Icon'

  it('the first slot goes left, a second one right; side="right" alone goes right', () => {
    renderWithTheme(
      <TextField placeholder="Search" testID="x">
        <TextField.Slot><Icon testID="a" /></TextField.Slot>
        <TextField.Slot><Icon testID="b" /></TextField.Slot>
      </TextField>,
    )
    const json = JSON.stringify(screen.toJSON())
    const order = ['"testID":"a"', '"placeholder":"Search"', '"testID":"b"'].map((k) => json.indexOf(k))
    expect(order.every((i) => i >= 0)).toBe(true)
    expect([...order].sort((x, y) => x - y)).toEqual(order)
  })

  it('removes the field padding on the side of a slot and pads the slot per size', () => {
    renderWithTheme(
      <TextField placeholder="Search" size={3}>
        <TextField.Slot side="right" testID="slot"><Icon testID="a" /></TextField.Slot>
      </TextField>,
    )
    const container = StyleSheet.flatten(screen.getByPlaceholderText('Search').parent!.parent!.props.style)
    expect(container).toMatchObject({ flexDirection: 'row', paddingLeft: 12, paddingRight: 0 })
    const slot = StyleSheet.flatten(screen.getByTestId('slot').props.style)
    expect(slot).toMatchObject({ gap: 12, paddingLeft: 12, paddingRight: 12, marginRight: -1 })
  })

  it('tints icons: gray-a11, the slot color at a11, soft accent-12', () => {
    renderWithTheme(
      <>
        <TextField placeholder="1"><TextField.Slot><Icon testID="gray" /></TextField.Slot></TextField>
        <TextField placeholder="2"><TextField.Slot color="red"><Icon testID="own" /></TextField.Slot></TextField>
        <TextField placeholder="3" variant="soft"><TextField.Slot><Icon testID="soft" /></TextField.Slot></TextField>
        <TextField placeholder="4"><TextField.Slot><Icon testID="kept" color="#000" /></TextField.Slot></TextField>
      </>,
    )
    expect(screen.getByTestId('gray').props.accessibilityLabel).toBe(slate.light.a11)
    expect(screen.getByTestId('own').props.accessibilityLabel).toBe(red.light.a11)
    expect(screen.getByTestId('soft').props.accessibilityLabel).toBe(indigo.light[12])
    expect(screen.getByTestId('kept').props.accessibilityLabel).toBe('#000')
  })
})
