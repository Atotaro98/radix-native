/** Theme: root state, nesting (inherit + override), merges and handlers. */
import React from 'react'
import { StyleSheet, Text as RNText } from 'react-native'
import { act, render, screen } from '@testing-library/react-native'
import { Theme, useThemeContext, useColor } from '../index'
import type { ThemeContextValue } from '../index'
import { indigo, crimson, slate, mauve } from '../tokens/colors'

let captured: Record<string, ThemeContextValue> = {}
function Capture({ id }: { id: string }) {
  captured[id] = useThemeContext()
  return null
}
beforeEach(() => { captured = {} })

describe('root Theme', () => {
  it('has Radix defaults and a white background in light mode', () => {
    render(<Theme appearance="light"><Capture id="root" /></Theme>)
    expect(captured.root).toMatchObject({
      isRoot: true, appearance: 'light', accentColor: 'indigo', grayColor: 'auto',
      resolvedGrayColor: 'slate', radius: 'medium', scaling: '100%',
    })
  })

  it('a prop change wins over a change made through the handlers', () => {
    const { rerender } = render(<Theme appearance="light" accentColor="indigo"><Capture id="root" /></Theme>)
    act(() => captured.root.onAccentColorChange('crimson'))
    expect(captured.root.accentColor).toBe('crimson')
    rerender(<Theme appearance="light" accentColor="green"><Capture id="root" /></Theme>)
    expect(captured.root.accentColor).toBe('green')
  })

  it('hands out a resolver bound to its values', () => {
    function Swatch() {
      return <RNText>{useColor('accent', 9)}</RNText>
    }
    render(<Theme appearance="dark" accentColor="crimson"><Swatch /></Theme>)
    expect(screen.getByText(crimson.dark[9])).toBeTruthy()
  })
})

describe('nested Theme', () => {
  it('inherits everything and overrides only what it sets', () => {
    render(
      <Theme appearance="light" accentColor="crimson" radius="large" maxFontSizeMultiplier={1.5}>
        <Theme scaling="90%"><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested).toMatchObject({
      isRoot: false, appearance: 'light', accentColor: 'crimson', resolvedGrayColor: 'mauve',
      radius: 'large', scaling: '90%', maxFontSizeMultiplier: 1.5,
    })
  })

  it("keeps the parent's resolved gray when only the accent changes (Radix)", () => {
    render(
      <Theme appearance="light" accentColor="crimson">
        <Theme accentColor="indigo"><Capture id="nested" /></Theme>
        <Theme accentColor="indigo" grayColor="auto"><Capture id="auto" /></Theme>
      </Theme>,
    )
    expect(captured.nested.resolvedGrayColor).toBe('mauve')
    expect(captured.auto.resolvedGrayColor).toBe('slate')
    expect(captured.nested.resolveColor('gray-9')).toBe(mauve.light[9])
    expect(captured.auto.resolveColor('gray-9')).toBe(slate.light[9])
  })

  it('merges fonts with the parent by key', () => {
    render(
      <Theme appearance="light" fonts={{ regular: 'Inter', bold: 'Inter-Bold' }}>
        <Theme fonts={{ code: 'Mono' }}><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested.fonts).toEqual({ regular: 'Inter', bold: 'Inter-Bold', code: 'Mono' })
  })

  it('merges colorOverrides with the parent per scale, mode and step', () => {
    render(
      <Theme appearance="light" colorOverrides={{ indigo: { light: { 9: '#111111', 10: '#222222' }, dark: { 9: '#333333' } } }}>
        <Theme colorOverrides={{ indigo: { light: { 9: '#999999' } } }}><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested.colorOverrides.indigo).toEqual({
      light: { 9: '#999999', 10: '#222222' },
      dark: { 9: '#333333' },
    })
    expect(captured.nested.resolveColor('accent-10')).toBe('#222222')
    expect(captured.nested.resolveColor('accent-11')).toBe(indigo.light[11])
  })

  it('cannot change the root: its handlers do nothing (Radix)', () => {
    render(
      <Theme appearance="light">
        <Capture id="root" />
        <Theme><Capture id="nested" /></Theme>
      </Theme>,
    )
    act(() => captured.nested.onAccentColorChange('crimson'))
    expect(captured.root.accentColor).toBe('indigo')
  })

  it('draws a background only with an explicit appearance, unless hasBackground says otherwise', () => {
    // The nearest host View above the text is the Theme that draws (or not) a background.
    const bg = (id: string) => {
      let node = screen.getByTestId(id).parent
      while (node && node.type !== 'View') node = node.parent
      return StyleSheet.flatten(node!.props.style)?.backgroundColor
    }
    render(
      <Theme appearance="light">
        <Theme><RNText testID="inherit">a</RNText></Theme>
        <Theme appearance="dark"><RNText testID="dark">b</RNText></Theme>
        <Theme appearance="dark" hasBackground={false}><RNText testID="none">c</RNText></Theme>
      </Theme>,
    )
    expect(bg('inherit')).toBe('#fff') // the root's View
    expect(bg('dark')).toBe(slate.dark[1])
    expect(bg('none')).toBe('#fff')
  })
})
