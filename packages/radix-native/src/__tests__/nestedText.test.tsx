/**
 * Nested text inherits the size of the closest radix-native text, scaled by its
 * own Text role — and the same role nested in itself keeps the size (Radix
 * `.rt-Code :where(.rt-Code)`, `.rt-Em :where(.rt-Em)`…).
 */
import React from 'react'
import { StyleSheet, type StyleProp, type TextStyle } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Text, Heading, Link, Code, Em, Strong, Quote, Blockquote, Kbd } from '../index'
import { resolveTextStyle } from '../utils/textStyle'
import { renderWithTheme } from './helpers/render'

const size = (testID: string) =>
  (StyleSheet.flatten(screen.getByTestId(testID).props.style as StyleProp<TextStyle>) ?? {}).fontSize

const child = <Code testID="child">x</Code>

describe('a Code inside each typography module is 0.95× that module', () => {
  it.each<[string, () => React.ReactElement, number]>([
    ['Text', () => <Text size={3}>a {child}</Text>, 16],
    ['Heading', () => <Heading size={3}>a {child}</Heading>, 16],
    ['Link', () => <Link size={3}>a {child}</Link>, 16],
    ['Blockquote', () => <Blockquote size={3}>a {child}</Blockquote>, 16],
    ['Em', () => <Text size={3}><Em>a {child}</Em></Text>, 19],
    ['Quote', () => <Text size={3}><Quote>a {child}</Quote></Text>, 19],
    ['Strong', () => <Text size={3}><Strong>a {child}</Strong></Text>, 16],
  ])('%s', (_name, ui, containerSize) => {
    renderWithTheme(ui())
    expect(size('child')).toBe(Math.round(containerSize * 0.95))
  })

  it('Kbd', () => {
    renderWithTheme(<Kbd size={5}>a {child}</Kbd>)
    const kbdSize = (StyleSheet.flatten(screen.getByText(/^a /).props.style) as TextStyle).fontSize as number
    expect(size('child')).toBe(Math.round(kbdSize * 0.95))
  })
})

describe('the same role nested in itself keeps its size', () => {
  // No fontSize of its own: RN text inheritance keeps the outer size.
  it.each<[string, () => React.ReactElement]>([
    ['Em', () => <Text size={3}><Em>a <Em testID="inner">b</Em></Em></Text>],
    ['Quote', () => <Text size={3}><Quote>a <Quote testID="inner">b</Quote></Quote></Text>],
    ['Code', () => <Text size={3}><Code>a <Code testID="inner">b</Code></Code></Text>],
    ['Strong', () => <Text size={3}><Strong>a <Strong testID="inner">b</Strong></Strong></Text>],
  ])('%s', (_name, ui) => {
    renderWithTheme(ui())
    expect(size('inner')).toBeUndefined()
  })

  it('an explicit size still wins', () => {
    renderWithTheme(<Code size={3}>a <Code size={5} testID="inner">b</Code></Code>)
    expect(size('inner')).toBe(Math.round(20 * 0.95))
  })
})

describe('resolveTextStyle with a parent role', () => {
  const theme = { scaling: '100%' as const, fonts: {} }

  it('applies the role adjustment under a different role', () => {
    expect(resolveTextStyle(theme, { role: 'em' }, { fontSize: 20, role: 'code' }).style.fontSize).toBe(24)
  })

  it('skips it under the same role', () => {
    const resolved = resolveTextStyle(theme, { role: 'em' }, { fontSize: 20, role: 'em' })
    expect(resolved.style.fontSize).toBeUndefined()
    expect(resolved.contextFontSize).toBe(20)
  })

  it('an explicit sizeAdjust (Kbd) is never skipped', () => {
    expect(resolveTextStyle(theme, { sizeAdjust: 0.75 }, { fontSize: 20, role: 'default' }).style.fontSize).toBe(15)
  })
})

describe('color of nested text', () => {
  it('standaloneColor applies only outside other text', () => {
    const theme = { scaling: '100%' as const, fonts: {} }
    expect(resolveTextStyle(theme, { standaloneColor: '#111' }, null).style.color).toBe('#111')
    expect(resolveTextStyle(theme, { standaloneColor: '#111' }, { fontSize: 16 }).style.color).toBeUndefined()
    expect(resolveTextStyle(theme, { color: '#222', standaloneColor: '#111' }, { fontSize: 16 }).style.color).toBe('#222')
  })
})
