/**
 * `accent-track` / `accent-indicator` per scale, as in Radix Themes
 * tokens/colors/{amber,lime,mint,sky,yellow}.css:
 * - dark `--{color}-track` = color-mix(in oklab, {color}-8, {color}-9 65%) (amber 75%)
 * - light yellow indicator and track = yellow-10
 * Expected hex values are the browser / colorjs.io results of those mixes.
 */
import React from 'react'
import { StyleSheet } from 'react-native'
import { screen } from '@testing-library/react-native'
import { Switch, Progress } from '../index'
import * as scales from '../tokens/colors'
import type { AccentColor, ColorScaleWithModes } from '../tokens/colors/types'
import { mixOklab } from '../utils/colorMath'
import { resolveColor } from '../utils/resolveColor'
import { renderWithTheme } from './helpers/render'

type Mode = 'light' | 'dark'
type Overrides = Parameters<typeof resolveColor>[4]

const rc = (color: string, mode: Mode, accent: AccentColor, overrides?: Overrides) =>
  resolveColor(color, mode, accent, 'gray', overrides)

const DARK_TRACK: [AccentColor, string][] = [
  ['amber', '#e2ac37'],
  ['lime', '#98c254'],
  ['mint', '#65c3b0'],
  ['sky', '#5bbde2'],
  ['yellow', '#d2b929'],
]

describe('mixOklab', () => {
  it('matches CSS color-mix(in oklab, …)', () => {
    expect(mixOklab('#8f6424', '#ffc53d', 0.75)).toBe('#e2ac37')
    expect(mixOklab('#000000', '#ffffff', 0)).toBe('#000000')
    expect(mixOklab('#000000', '#ffffff', 1)).toBe('#ffffff')
  })

  it('mixes alpha and falls back to the second color when one cannot be parsed', () => {
    expect(mixOklab('#ff000000', '#ff0000', 0.5)).toBe('#ff000080')
    expect(mixOklab('papayawhip', '#123456', 0.5)).toBe('#123456')
  })
})

describe('resolveColor track / indicator', () => {
  it.each(DARK_TRACK)('dark %s track mixes steps 8 and 9', (accent, hex) => {
    expect(rc('accent-track', 'dark', accent)).toBe(hex)
    expect(rc('accent-indicator', 'dark', accent)).toBe(rc('accent-9', 'dark', accent))
    expect(rc('accent-track', 'light', accent)).toBe(
      accent === 'yellow' ? rc('accent-10', 'light', accent) : rc('accent-9', 'light', accent),
    )
  })

  it('light yellow indicator and track use step 10', () => {
    expect(rc('accent-indicator', 'light', 'yellow')).toBe('#ffdc00')
    expect(rc('accent-track', 'light', 'yellow')).toBe('#ffdc00')
    expect(rc('yellow-indicator', 'light', 'indigo')).toBe('#ffdc00')
  })

  it('other scales keep step 9 in both modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      expect(rc('accent-track', mode, 'indigo')).toBe(rc('accent-9', mode, 'indigo'))
      expect(rc('accent-indicator', mode, 'orange')).toBe(rc('accent-9', mode, 'orange'))
    }
  })

  it('overrides of the base steps carry over', () => {
    const sky = { sky: { dark: { 8: '#000000', 9: '#ffffff' } } }
    expect(rc('accent-track', 'dark', 'sky', sky)).toBe(mixOklab('#000000', '#ffffff', 0.65))
    expect(rc('accent-track', 'light', 'yellow', { yellow: { light: { 10: '#ff0000' } } })).toBe('#ff0000')
    expect(rc('accent-track', 'dark', 'amber', { amber: { dark: { track: '#00ff00' } } })).toBe('#00ff00')
  })

  it('generated tokens agree with the runtime derivation', () => {
    for (const [name, scale] of Object.entries(scales as unknown as Record<string, ColorScaleWithModes>)) {
      if (typeof scale !== 'object') continue
      for (const mode of ['light', 'dark'] as const) {
        expect([name, mode, scale[mode].track]).toEqual([name, mode, rc(`${name}-track`, mode, 'indigo')])
        expect([name, mode, scale[mode].indicator]).toEqual([name, mode, rc(`${name}-indicator`, mode, 'indigo')])
      }
    }
  })
})

const bg = (el: { props: { style?: unknown } }) =>
  (StyleSheet.flatten(el.props.style as never as object) ?? {}) as { backgroundColor?: string }

/** The Switch Indicator's track: the first host view with a background inside the switch. */
const track = () =>
  screen.getByRole('switch').findAll(
    (n: { type: unknown; props: { style?: unknown } }) => typeof n.type === 'string' && bg(n).backgroundColor !== undefined,
  )[0]

describe('checked Switch track', () => {
  it.each(DARK_TRACK)('dark %s surface and classic', (accent, hex) => {
    for (const variant of ['surface', 'classic'] as const) {
      const { unmount } = renderWithTheme(<Switch checked variant={variant} />, { appearance: 'dark', accentColor: accent })
      expect(bg(track()).backgroundColor).toBe(hex)
      unmount()
    }
  })

  it('light yellow uses step 10', () => {
    renderWithTheme(<Switch checked />, { accentColor: 'yellow' })
    expect(bg(track()).backgroundColor).toBe('#ffdc00')
  })

  it('follows the color prop', () => {
    renderWithTheme(<Switch checked color="sky" />, { appearance: 'dark' })
    expect(bg(track()).backgroundColor).toBe('#5bbde2')
  })
})

describe('Progress indicator', () => {
  const indicator = () =>
    bg(screen.getByTestId('p').children[0] as unknown as { props: { style: unknown } })

  it.each(DARK_TRACK)('dark %s surface and classic', (accent, hex) => {
    for (const variant of ['surface', 'classic'] as const) {
      const { unmount } = renderWithTheme(
        <Progress value={50} variant={variant} testID="p" />,
        { appearance: 'dark', accentColor: accent },
      )
      expect(indicator().backgroundColor).toBe(hex)
      unmount()
    }
  })

  it('light yellow uses step 10', () => {
    renderWithTheme(<Progress value={50} testID="p" />, { accentColor: 'yellow' })
    expect(indicator().backgroundColor).toBe('#ffdc00')
  })
})
