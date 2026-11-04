import { compositeLayers, fadeColor, parseColor } from '../utils/colorMath'
import { resolveColor } from '../utils/resolveColor'

describe('colorMath', () => {
  it('parses hex and rgb()', () => {
    expect(parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(parseColor('#00000080')?.a).toBeCloseTo(0.5, 2)
    expect(parseColor('rgba(0, 0, 0, 0.25)')).toEqual({ r: 0, g: 0, b: 0, a: 0.25 })
    expect(parseColor('papayawhip')).toBeNull()
  })

  it('composites translucent layers top-most first', () => {
    expect(compositeLayers(['#00000080', '#ffffff'])).toBe('#7f7f7f')
    // two 50% black layers → 75% black
    expect(compositeLayers(['#00000080', '#00000080'])).toBe('#000000c0')
    expect(compositeLayers(['transparent', '#123456'])).toBe('#123456')
  })

  it('falls back to the top layer when a layer cannot be parsed', () => {
    expect(compositeLayers(['papayawhip', '#000000'])).toBe('papayawhip')
  })

  it('fades a color', () => {
    expect(fadeColor('#ff0000', 0.5)).toBe('#ff000080')
  })
})

describe('derived color steps', () => {
  const rc = (token: string, mode: 'light' | 'dark', overrides?: Parameters<typeof resolveColor>[4]) =>
    resolveColor(token, mode, 'indigo', 'slate', overrides)

  it('indicator and track follow step 9, including overrides of 9', () => {
    expect(rc('accent-indicator', 'light')).toBe(rc('accent-9', 'light'))
    expect(rc('accent-track', 'dark')).toBe(rc('accent-9', 'dark'))
    const overrides = { indigo: { light: { 9: '#ff0000' } } }
    expect(rc('accent-indicator', 'light', overrides)).toBe('#ff0000')
    expect(rc('accent-track', 'light', { indigo: { light: { track: '#00ff00' } } })).toBe('#00ff00')
  })

  it('panel is white in light mode and step 2 in dark mode', () => {
    expect(rc('gray-panel', 'light')).toBe('#ffffff')
    expect(rc('gray-panel', 'dark')).toBe(rc('gray-2', 'dark'))
  })
})
