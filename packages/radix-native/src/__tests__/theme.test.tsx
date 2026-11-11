/** Theme: root state, nesting (inherit + override), merges, handlers and background. */
import React from 'react'
import { StyleSheet, Text as RNText } from 'react-native'
import { act, render, screen } from '@testing-library/react-native'
import { Theme, ThemeControls, useThemeContext, useColor } from '../index'
import type { ThemeContextValue, ThemeProps } from '../index'
import { indigo, crimson, slate, mauve, sand, red } from '../tokens/colors'

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: jest.fn(() => 'light'),
}))
const mockColorScheme = jest.requireMock<{ default: jest.Mock<'light' | 'dark' | null, []> }>(
  'react-native/Libraries/Utilities/useColorScheme',
).default

let captured: Record<string, ThemeContextValue> = {}
function Capture({ id }: { id: string }) {
  captured[id] = useThemeContext()
  return null
}
beforeEach(() => {
  captured = {}
  mockColorScheme.mockReturnValue('light')
})

/** Background of the nearest host View above a test node: the Theme that paints (or not). */
/** The background of the Theme's View above `testID` (the root Theme also wraps its portal host). */
function backgroundAbove(testID: string) {
  let node = screen.getByTestId(testID).parent
  while (node) {
    if (node.type === 'View' && StyleSheet.flatten(node.props.style)?.flex === 1 && 'backgroundColor' in (StyleSheet.flatten(node.props.style) ?? {})) {
      return StyleSheet.flatten(node.props.style)?.backgroundColor
    }
    node = node.parent
  }
  throw new Error(`no Theme View above ${testID}`)
}

/** Each change handler, the value it sets and the context key it changes. */
const HANDLERS = [
  ['onAppearanceChange', 'dark', 'appearance'],
  ['onAccentColorChange', 'crimson', 'accentColor'],
  ['onGrayColorChange', 'sand', 'grayColor'],
  ['onRadiusChange', 'full', 'radius'],
  ['onScalingChange', '110%', 'scaling'],
] as const

describe('root Theme', () => {
  it('has the Radix defaults', () => {
    render(<Theme appearance="light"><Capture id="root" /></Theme>)
    expect(captured.root).toMatchObject({
      isRoot: true, appearance: 'light', accentColor: 'indigo', grayColor: 'auto',
      resolvedGrayColor: 'slate', radius: 'medium', scaling: '100%', fonts: {}, colorOverrides: {},
    })
    expect(captured.root.maxFontSizeMultiplier).toBeUndefined()
  })

  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    [null, 'light'],
  ] as const)('appearance="inherit" follows the system scheme (%s → %s)', (system, expected) => {
    mockColorScheme.mockReturnValue(system)
    render(<Theme><Capture id="root" /></Theme>)
    expect(captured.root.appearance).toBe(expected)
  })

  it('follows the system scheme when it changes', () => {
    const { rerender } = render(<Theme><Capture id="root" /></Theme>)
    mockColorScheme.mockReturnValue('dark')
    rerender(<Theme><Capture id="root" /></Theme>)
    expect(captured.root.appearance).toBe('dark')
  })

  it.each(HANDLERS)('%s changes the root and every Theme below it', (handler, value, key) => {
    render(
      <Theme appearance="light">
        <Capture id="root" />
        <Theme><Capture id="nested" /></Theme>
      </Theme>,
    )
    act(() => (captured.root[handler] as (v: string) => void)(value))
    expect(captured.root[key]).toBe(value)
    expect(captured.nested[key]).toBe(value)
  })

  it('keeps a handler change when the parent re-renders with the same props', () => {
    const ui = <Theme appearance="light" accentColor="indigo"><Capture id="root" /></Theme>
    const { rerender } = render(ui)
    act(() => captured.root.onAccentColorChange('crimson'))
    rerender(<Theme appearance="light" accentColor="indigo"><Capture id="root" /></Theme>)
    expect(captured.root.accentColor).toBe('crimson')
  })

  it.each([
    ['accentColor', 'onAccentColorChange', 'indigo', 'crimson', 'green'],
    ['scaling', 'onScalingChange', '100%', '110%', '90%'],
    ['radius', 'onRadiusChange', 'medium', 'full', 'none'],
  ] as const)('a new %s prop wins over a change made through the handler', (key, handler, initial, changed, next) => {
    const props = (v: string) => ({ appearance: 'light', [key]: v }) as Omit<ThemeProps, 'children'>
    const { rerender } = render(<Theme {...props(initial)}><Capture id="root" /></Theme>)
    act(() => (captured.root[handler] as (v: string) => void)(changed))
    expect(captured.root[key]).toBe(changed)
    rerender(<Theme {...props(next)}><Capture id="root" /></Theme>)
    expect(captured.root[key]).toBe(next)
  })

  it('resolves colors with its own values', () => {
    function Swatches() {
      return (
        <>
          <RNText testID="accent">{useColor('accent', 9)}</RNText>
          <RNText testID="gray">{useColor('gray-a3')}</RNText>
          <RNText testID="raw">{useColor('#123456')}</RNText>
        </>
      )
    }
    render(<Theme appearance="dark" accentColor="crimson"><Swatches /></Theme>)
    expect(screen.getByTestId('accent')).toHaveTextContent(crimson.dark[9])
    expect(screen.getByTestId('gray')).toHaveTextContent(mauve.dark.a3)
    expect(screen.getByTestId('raw')).toHaveTextContent('#123456')
  })

  it('paints white in light mode and gray-1 in dark mode, unless hasBackground={false}', () => {
    render(
      <>
        <Theme appearance="light"><RNText testID="light">a</RNText></Theme>
        <Theme appearance="dark"><RNText testID="dark">b</RNText></Theme>
        <Theme appearance="dark" hasBackground={false}><RNText testID="none">c</RNText></Theme>
      </>,
    )
    expect(backgroundAbove('light')).toBe('#fff')
    expect(backgroundAbove('dark')).toBe(slate.dark[1])
    expect(backgroundAbove('none')).toBeUndefined()
  })
})

describe('nested Theme', () => {
  it('inherits everything and overrides only what it sets', () => {
    render(
      <Theme appearance="dark" accentColor="crimson" radius="large" maxFontSizeMultiplier={1.5}>
        <Theme scaling="90%"><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested).toMatchObject({
      isRoot: false, appearance: 'dark', accentColor: 'crimson', resolvedGrayColor: 'mauve',
      radius: 'large', scaling: '90%', maxFontSizeMultiplier: 1.5,
    })
  })

  it('appearance="inherit" takes the parent appearance, not the system scheme', () => {
    mockColorScheme.mockReturnValue('dark')
    render(
      <Theme appearance="light">
        <Theme appearance="inherit"><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested.appearance).toBe('light')
  })

  it('resolves colors with its own appearance and accent', () => {
    render(
      <Theme appearance="light">
        <Theme appearance="dark" accentColor="crimson"><Capture id="nested" /></Theme>
      </Theme>,
    )
    expect(captured.nested.resolveColor('accent-9')).toBe(crimson.dark[9])
    expect(captured.nested.resolveColor('gray-12')).toBe(slate.dark[12])
  })

  it("keeps the parent's resolved gray when only the accent changes (Radix)", () => {
    render(
      <Theme appearance="light" accentColor="crimson">
        <Theme accentColor="indigo"><Capture id="inherited" /></Theme>
        <Theme accentColor="indigo" grayColor="auto"><Capture id="auto" /></Theme>
        <Theme accentColor="indigo" grayColor="sand"><Capture id="explicit" /></Theme>
      </Theme>,
    )
    expect(captured.inherited.resolveColor('gray-9')).toBe(mauve.light[9])
    expect(captured.auto.resolveColor('gray-9')).toBe(slate.light[9])
    expect(captured.explicit.resolveColor('gray-9')).toBe(sand.light[9])
  })

  it('merges fonts with the parent by key, and shares them when it sets none', () => {
    render(
      <Theme appearance="light" fonts={{ regular: 'Inter', bold: 'Inter-Bold' }}>
        <Capture id="root" />
        <Theme fonts={{ bold: 'Serif-Bold', code: 'Mono' }}><Capture id="merged" /></Theme>
        <Theme><Capture id="plain" /></Theme>
      </Theme>,
    )
    expect(captured.merged.fonts).toEqual({ regular: 'Inter', bold: 'Serif-Bold', code: 'Mono' })
    expect(captured.plain.fonts).toBe(captured.root.fonts)
  })

  it('merges colorOverrides with the parent per scale, mode and step', () => {
    render(
      <Theme
        appearance="light"
        colorOverrides={{ indigo: { light: { 9: '#111111', 10: '#222222' }, dark: { 9: '#333333' } }, red: { light: { 9: '#444444' } } }}
      >
        <Theme colorOverrides={{ indigo: { light: { 9: '#999999' } }, crimson: { light: { 9: '#555555' } } }}>
          <Capture id="nested" />
        </Theme>
      </Theme>,
    )
    const { colorOverrides, resolveColor } = captured.nested
    expect(colorOverrides).toEqual({
      indigo: { light: { 9: '#999999', 10: '#222222' }, dark: { 9: '#333333' } },
      red: { light: { 9: '#444444' } },
      crimson: { light: { 9: '#555555' } },
    })
    expect(resolveColor('accent-9')).toBe('#999999')
    expect(resolveColor('accent-10')).toBe('#222222')
    expect(resolveColor('accent-11')).toBe(indigo.light[11])
    expect(resolveColor('red-9')).toBe('#444444')
    expect(resolveColor('red-10')).toBe(red.light[10])
  })

  it.each(HANDLERS)('cannot change the root: %s does nothing (Radix)', (handler, value, key) => {
    render(
      <Theme appearance="light">
        <Capture id="root" />
        <Theme><Capture id="nested" /></Theme>
      </Theme>,
    )
    const rootBefore = captured.root[key]
    const nestedBefore = captured.nested[key]
    act(() => (captured.nested[handler] as (v: string) => void)(value))
    expect(captured.root[key]).toBe(rootBefore)
    expect(captured.nested[key]).toBe(nestedBefore)
  })

  it('paints a background only with an explicit appearance, unless hasBackground says otherwise', () => {
    // The root paints nothing, so a node under a non-painting nested Theme sees no background.
    render(
      <Theme appearance="light" hasBackground={false}>
        <Theme><RNText testID="inherit">a</RNText></Theme>
        <Theme appearance="light"><RNText testID="light">b</RNText></Theme>
        <Theme appearance="dark"><RNText testID="dark">c</RNText></Theme>
        <Theme appearance="dark" hasBackground={false}><RNText testID="off">d</RNText></Theme>
        <Theme hasBackground><RNText testID="on">e</RNText></Theme>
      </Theme>,
    )
    expect(backgroundAbove('inherit')).toBeUndefined()
    expect(backgroundAbove('light')).toBe('#fff')
    expect(backgroundAbove('dark')).toBe(slate.dark[1])
    expect(backgroundAbove('off')).toBeUndefined()
    expect(backgroundAbove('on')).toBe('#fff')
  })
})

describe('ThemeControls placement', () => {
  let warn: jest.SpyInstance
  beforeEach(() => { warn = jest.spyOn(console, 'warn').mockImplementation(() => {}) })
  afterEach(() => warn.mockRestore())

  it('warns inside a nested Theme, where its changes have no effect', () => {
    render(<Theme appearance="light"><Theme><ThemeControls /></Theme></Theme>)
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ThemeControls is inside a nested Theme'))
  })

  it('does not warn under the root Theme', () => {
    render(<Theme appearance="light"><ThemeControls /></Theme>)
    expect(warn).not.toHaveBeenCalledWith(expect.stringContaining('ThemeControls'))
  })
})
