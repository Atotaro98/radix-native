import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { renderWithTheme } from './helpers/render'
import { VisuallyHidden } from '../components/utilities/VisuallyHidden'
import { AccessibleIcon } from '../components/utilities/AccessibleIcon'
import { IconButton } from '../components/actions/IconButton'
import { Button } from '../components/actions/Button'
import { Card } from '../components/layout/Card'

const flat = (node: { props: { style?: unknown } }): ViewStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

function Icon(props: { color?: string; testID?: string }) {
  return <View testID={props.testID ?? 'icon'} style={{ width: 15, height: 15, backgroundColor: props.color }} />
}

describe('VisuallyHidden (VISUALLY_HIDDEN_STYLES)', () => {
  it('is a 1×1 absolute box that stays readable by screen readers', () => {
    renderWithTheme(<VisuallyHidden testID="v">Close</VisuallyHidden>)
    const v = screen.getByTestId('v')
    expect(flat(v)).toMatchObject({ position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden' })
    expect(v.props.accessibilityElementsHidden).toBeUndefined()
    expect(screen.getByText('Close')).toBeTruthy()
  })

  it('merges the consumer style after the hidden style', () => {
    renderWithTheme(<VisuallyHidden testID="v" style={{ position: 'relative' }}><Text>x</Text></VisuallyHidden>)
    expect(flat(screen.getByTestId('v')).position).toBe('relative')
  })
})

describe('AccessibleIcon', () => {
  it('standalone: an image named by the label, with the icon hidden', () => {
    renderWithTheme(<AccessibleIcon label="Settings"><Icon /></AccessibleIcon>)
    const el = screen.getByLabelText('Settings')
    expect(el.props).toMatchObject({ accessible: true, accessibilityRole: 'image' })
    let node = screen.getByTestId('icon', { includeHiddenElements: true }).parent
    while (node && !node.props.accessibilityElementsHidden) node = node.parent
    expect(node?.props.importantForAccessibility).toBe('no-hide-descendants')
  })

  it('inside an IconButton: not a separate element, label kept for the button name, tinted', () => {
    renderWithTheme(
      <IconButton testID="b"><AccessibleIcon label="Close"><Icon /></AccessibleIcon></IconButton>,
    )
    // The button is named by the label (Android does not read it in from a non-accessible child)
    expect(screen.getByTestId('b').props.accessibilityLabel).toBe('Close')
    const label = screen.getAllByLabelText('Close', { includeHiddenElements: true }).find((n) => n.props.testID !== 'b')!
    expect(label.props.accessible).toBe(false)
    expect(label.props.accessibilityRole).toBeUndefined()
    const icon = screen.getByTestId('icon', { includeHiddenElements: true })
    expect(flat(icon).backgroundColor).toBeDefined()
  })

  it('inside a pressable Card: not a separate element', () => {
    renderWithTheme(<Card testID="c" onPress={() => {}}><AccessibleIcon label="Open"><Icon /></AccessibleIcon></Card>)
    expect(screen.getByTestId('c').props.accessibilityLabel).toBe('Open')
    const inner = screen.getAllByLabelText('Open', { includeHiddenElements: true }).find((n) => n.props.testID !== 'c')!
    expect(inner.props.accessible).toBe(false)
  })

  it('a control is named by its text, AccessibleIcon labels and VisuallyHidden text, in order', () => {
    renderWithTheme(
      <>
        <IconButton testID="v">
          <Icon />
          <VisuallyHidden>Settings</VisuallyHidden>
        </IconButton>
        <Button testID="m">Save <AccessibleIcon label="draft"><Icon /></AccessibleIcon></Button>
        <Button testID="plain">Plain</Button>
        <Button testID="busy" loading>Saving</Button>
      </>,
    )
    expect(screen.getByTestId('v').props.accessibilityLabel).toBe('Settings')
    expect(screen.getByTestId('m').props.accessibilityLabel).toBe('Save draft')
    // Visible text only: the platform reads it in by itself
    expect(screen.getByTestId('plain').props.accessibilityLabel).toBeUndefined()
    // Loading hides the label on screen; the name stays
    expect(screen.getByTestId('busy').props.accessibilityLabel).toBe('Saving')
  })

  it('keeps an icon color the icon sets itself', () => {
    renderWithTheme(<AccessibleIcon label="x" color="red"><Icon color="blue" /></AccessibleIcon>)
    expect(flat(screen.getByTestId('icon', { includeHiddenElements: true })).backgroundColor).toBe('blue')
  })

  it('requires exactly one child (React.Children.only)', () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() =>
      renderWithTheme(
        // @ts-expect-error two children
        <AccessibleIcon label="x"><Icon /><Icon /></AccessibleIcon>,
      ),
    ).toThrow()
    jest.restoreAllMocks()
  })
})
