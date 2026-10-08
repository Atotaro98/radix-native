import { resolveColor } from '../utils/resolveColor'
import { resolveSpace } from '../utils/resolveSpace'
import { withAlpha } from '../utils/alpha'
import { getMinHitSlop, MIN_TOUCH_TARGET } from '../utils/hitSlop'
import { getTextWrapProps, resolveTypography } from '../utils/typography'
import { getRadius, getFullRadius } from '../tokens/radius'
import { headingLineHeight } from '../tokens/typography'
import { indigo, slate, blue } from '../tokens/colors'

describe('resolveColor', () => {
  it('resolves accent and gray aliases against the theme', () => {
    expect(resolveColor('accent-9', 'light', 'indigo', 'slate')).toBe(indigo.light[9])
    expect(resolveColor('gray-12', 'dark', 'indigo', 'slate')).toBe(slate.dark[12])
    expect(resolveColor('accent-a3', 'light', 'indigo', 'slate')).toBe(indigo.light.a3)
    expect(resolveColor('accent-contrast', 'light', 'indigo', 'slate')).toBe(indigo.light.contrast)
  })

  it('resolves explicit scales independently of the accent', () => {
    expect(resolveColor('blue-9', 'light', 'indigo', 'slate')).toBe(blue.light[9])
  })

  it('applies per-mode overrides before the built-in scale', () => {
    const overrides = { indigo: { light: { 9: '#123456' } } }
    expect(resolveColor('accent-9', 'light', 'indigo', 'slate', overrides)).toBe('#123456')
    expect(resolveColor('accent-9', 'dark', 'indigo', 'slate', overrides)).toBe(indigo.dark[9])
  })

  it('passes raw colors through unchanged', () => {
    expect(resolveColor('#ff0000', 'light', 'indigo', 'slate')).toBe('#ff0000')
    expect(resolveColor('rgba(0,0,0,0.5)', 'light', 'indigo', 'slate')).toBe('rgba(0,0,0,0.5)')
  })
})

describe('resolveSpace', () => {
  it('maps tokens to pixels with scaling', () => {
    expect(resolveSpace(3, '100%')).toBe(12)
    expect(resolveSpace(4, '110%')).toBe(18)
  })

  it('supports negative margins', () => {
    expect(resolveSpace(-2, '100%')).toBe(-8)
    expect(resolveSpace(0, '90%')).toBe(0)
  })
})

describe('radius', () => {
  it('scales the base radius by the token factor', () => {
    expect(getRadius('medium', 3)).toBe(6)
    expect(getRadius('small', 4)).toBe(6)
    expect(getRadius('none', 6)).toBe(0)
  })

  it('only produces a pill for "full"', () => {
    expect(getFullRadius('full')).toBe(9999)
    expect(getFullRadius('large')).toBe(0)
  })
})

describe('withAlpha', () => {
  it('handles #rgb, #rrggbb and #rrggbbaa', () => {
    expect(withAlpha('#fff', 0.6)).toBe('#ffffff99')
    expect(withAlpha('#112233', 0.6)).toBe('#11223399')
    expect(withAlpha('#11223380', 0.5)).toBe('#11223340')
  })

  it('leaves non-hex colors untouched', () => {
    expect(withAlpha('rgb(0,0,0)', 0.5)).toBe('rgb(0,0,0)')
    expect(withAlpha('#zzzzzz', 0.5)).toBe('#zzzzzz')
  })
})

describe('getMinHitSlop', () => {
  it('grows small controls up to the minimum touch target', () => {
    expect(getMinHitSlop(16, 16)).toEqual({ top: 14, bottom: 14, left: 14, right: 14 })
  })

  it('returns undefined when the control is already large enough', () => {
    expect(getMinHitSlop(MIN_TOUCH_TARGET, 48)).toBeUndefined()
  })
})

describe('typography helpers', () => {
  it('maps truncate / wrap to numberOfLines + ellipsizeMode', () => {
    expect(getTextWrapProps(true, 'nowrap')).toEqual({ numberOfLines: 1, ellipsizeMode: 'tail' })
    expect(getTextWrapProps(false, 'nowrap')).toEqual({ numberOfLines: 1, ellipsizeMode: 'clip' })
    expect(getTextWrapProps(undefined, 'wrap')).toEqual({})
  })

  it('resolves scaled font metrics', () => {
    expect(resolveTypography(3, '100%')).toEqual({ fontSize: 16, lineHeight: 24, letterSpacing: 0 })
    expect(resolveTypography(3, '100%', headingLineHeight).lineHeight).toBe(22)
    expect(resolveTypography(2, '110%').fontSize).toBe(15)
  })
})
