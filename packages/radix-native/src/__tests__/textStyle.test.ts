import { resolveTextStyle, SYSTEM_SERIF, type TextStyleTheme, type TextStyleRequest } from '../utils/textStyle'
import { SYSTEM_MONOSPACE } from '../utils/fonts'
import type { ThemeFonts } from '../theme/theme.types'

const theme = (fonts: ThemeFonts = {}, extra: Partial<TextStyleTheme> = {}): TextStyleTheme => ({
  scaling: '100%',
  fonts,
  ...extra,
})

const resolve = (request: TextStyleRequest, parent: number | null = null, t: TextStyleTheme = theme()) =>
  resolveTextStyle(t, request, parent === null ? null : { fontSize: parent })

const INTER: ThemeFonts = { regular: 'Inter', medium: 'Inter-Medium', bold: 'Inter-Bold' }
const ONLY_REGULAR: ThemeFonts = { regular: 'Inter' }

describe('resolveTextStyle — size', () => {
  it.each`
    case                                | request                                   | parent  | fontSize     | lineHeight   | letterSpacing
    ${'standalone default → size 3'}    | ${{}}                                     | ${null} | ${16}        | ${24}        | ${0}
    ${'explicit token'}                 | ${{ size: 5 }}                            | ${null} | ${20}        | ${28}        | ${-0.1}
    ${'heading line heights'}           | ${{ size: 3, lineHeight: 'heading' }}     | ${null} | ${16}        | ${22}        | ${0}
    ${'tight line height'}              | ${{ size: 4, lineHeight: 'tight' }}       | ${null} | ${18}        | ${18}        | ${-0.045}
    ${'no line height'}                 | ${{ size: 2, lineHeight: 'none' }}        | ${null} | ${14}        | ${undefined} | ${0}
    ${'nested, no size → inherits'}     | ${{}}                                     | ${20}   | ${undefined} | ${undefined} | ${undefined}
    ${'nested, explicit size'}          | ${{ size: 5 }}                            | ${12}   | ${20}        | ${28}        | ${-0.1}
    ${'code nested → 0.95em of parent'} | ${{ role: 'code', lineHeight: 'none' }}   | ${20}   | ${19}        | ${undefined} | ${-0.007 * 19}
    ${'em nested → 1.18em of parent'}   | ${{ role: 'em' }}                         | ${16}   | ${19}        | ${undefined} | ${-0.025 * 19}
    ${'quote standalone → token × 1.18'}| ${{ role: 'quote' }}                      | ${null} | ${19}        | ${24}        | ${-0.025 * 19}
    ${'sizeAdjust override (Kbd)'}      | ${{ sizeAdjust: 0.75, defaultSize: 2 }}   | ${null} | ${11}        | ${20}        | ${0}
  `('$case', ({ request, parent, fontSize, lineHeight, letterSpacing }) => {
    const { style } = resolve(request, parent)
    expect(style.fontSize).toBe(fontSize)
    expect(style.lineHeight).toBe(lineHeight)
    if (letterSpacing === undefined) expect(style.letterSpacing).toBeUndefined()
    else expect(style.letterSpacing).toBeCloseTo(letterSpacing)
  })

  it('applies theme scaling', () => {
    const { style } = resolve({ size: 2 }, null, theme({}, { scaling: '110%' }))
    expect(style.fontSize).toBe(15)
    expect(style.lineHeight).toBe(22)
  })

  it('exposes the size nested text should inherit', () => {
    expect(resolve({ size: 5 }).contextFontSize).toBe(20)
    expect(resolve({}, 12).contextFontSize).toBe(12)
    expect(resolve({ role: 'code' }, 20).contextFontSize).toBe(19)
  })
})

describe('resolveTextStyle — face', () => {
  it.each`
    case                                         | fonts           | request                                | parent  | fontFamily           | fontWeight   | fontStyle    | missing
    ${'system font, no weight'}                  | ${{}}           | ${{}}                                  | ${null} | ${undefined}         | ${undefined} | ${undefined} | ${undefined}
    ${'system font, bold'}                       | ${{}}           | ${{ weight: 'bold' }}                  | ${null} | ${undefined}         | ${'700'}     | ${undefined} | ${undefined}
    ${'custom regular, no weight'}               | ${INTER}        | ${{}}                                  | ${null} | ${'Inter'}           | ${undefined} | ${undefined} | ${undefined}
    ${'custom exact face drops fontWeight'}      | ${INTER}        | ${{ weight: 'medium' }}                | ${null} | ${'Inter-Medium'}    | ${undefined} | ${undefined} | ${undefined}
    ${'missing face → regular, reported'}        | ${ONLY_REGULAR} | ${{ weight: 'bold' }}                  | ${null} | ${'Inter'}           | ${undefined} | ${undefined} | ${'bold'}
    ${'missing light face → reported'}           | ${INTER}        | ${{ weight: 'light' }}                 | ${null} | ${'Inter'}           | ${undefined} | ${undefined} | ${'light'}
    ${'nested body text inherits the face'}      | ${INTER}        | ${{}}                                  | ${16}   | ${undefined}         | ${undefined} | ${undefined} | ${undefined}
    ${'strong uses bold'}                        | ${{}}           | ${{ role: 'strong' }}                  | ${16}   | ${undefined}         | ${'700'}     | ${undefined} | ${undefined}
    ${'strong uses fonts.bold'}                  | ${INTER}        | ${{ role: 'strong' }}                  | ${16}   | ${'Inter-Bold'}      | ${undefined} | ${undefined} | ${undefined}
    ${'strong prefers fonts.strong'}             | ${{ ...INTER, strong: 'Inter-Black' }} | ${{ role: 'strong' }} | ${16} | ${'Inter-Black'} | ${undefined} | ${undefined} | ${undefined}
    ${'strong without bold face → reported'}     | ${ONLY_REGULAR} | ${{ role: 'strong' }}                  | ${16}   | ${'Inter'}           | ${undefined} | ${undefined} | ${'bold'}
    ${'heading prefers fonts.heading'}           | ${{ ...INTER, heading: 'Display' }} | ${{ role: 'heading', weight: 'bold' }} | ${null} | ${'Display'} | ${undefined} | ${undefined} | ${undefined}
    ${'heading falls back to the weight face'}   | ${INTER}        | ${{ role: 'heading', weight: 'medium' }} | ${null} | ${'Inter-Medium'} | ${undefined} | ${undefined} | ${undefined}
    ${'heading falls back to bold, reported'}    | ${{ regular: 'Inter', bold: 'Inter-Bold' }} | ${{ role: 'heading', weight: 'light' }} | ${null} | ${'Inter-Bold'} | ${undefined} | ${undefined} | ${'light'}
    ${'code uses system monospace'}              | ${INTER}        | ${{ role: 'code' }}                    | ${16}   | ${SYSTEM_MONOSPACE}  | ${undefined} | ${undefined} | ${undefined}
    ${'code on system mono keeps weight'}        | ${{}}           | ${{ role: 'code', weight: 'bold' }}    | ${16}   | ${SYSTEM_MONOSPACE}  | ${'700'}     | ${undefined} | ${undefined}
    ${'custom code face'}                        | ${{ code: 'Fira' }} | ${{ role: 'code', weight: 'bold' }} | ${16}   | ${'Fira'}            | ${undefined} | ${undefined} | ${undefined}
    ${'em uses system serif italic'}             | ${INTER}        | ${{ role: 'em' }}                      | ${16}   | ${SYSTEM_SERIF}      | ${undefined} | ${'italic'}  | ${undefined}
    ${'custom em face has italic baked in'}      | ${{ em: 'Lora-Italic' }} | ${{ role: 'em' }}             | ${16}   | ${'Lora-Italic'}     | ${undefined} | ${undefined} | ${undefined}
    ${'custom quote face'}                       | ${{ quote: 'Lora-Italic' }} | ${{ role: 'quote' }}       | ${16}   | ${'Lora-Italic'}     | ${undefined} | ${undefined} | ${undefined}
  `('$case', ({ fonts, request, parent, fontFamily, fontWeight, fontStyle, missing }) => {
    const result = resolve(request, parent, theme(fonts))
    expect(result.style.fontFamily).toBe(fontFamily)
    expect(result.style.fontWeight).toBe(fontWeight)
    expect(result.style.fontStyle).toBe(fontStyle)
    expect(result.missingFace).toBe(missing)
  })
})

describe('resolveTextStyle — Font scaling cap', () => {
  it.each`
    case                                      | local        | global       | compact  | cap
    ${'body text, nothing set → no cap'}      | ${undefined} | ${undefined} | ${false} | ${undefined}
    ${'compact text, nothing set → 2'}        | ${undefined} | ${undefined} | ${true}  | ${2}
    ${'global cap wins over compact default'} | ${undefined} | ${1.5}       | ${true}  | ${1.5}
    ${'global cap applies to body text'}      | ${undefined} | ${1.5}       | ${false} | ${1.5}
    ${'local cap wins over global'}           | ${3}         | ${1.5}       | ${true}  | ${3}
    ${'local cap on body text'}               | ${1}         | ${undefined} | ${false} | ${1}
  `('$case', ({ local, global, compact, cap }) => {
    const { textProps } = resolve(
      { compact, maxFontSizeMultiplier: local },
      null,
      theme({}, { maxFontSizeMultiplier: global }),
    )
    expect(textProps.maxFontSizeMultiplier).toBe(cap)
  })
})

describe('resolveTextStyle — nesting and layout', () => {
  const margins = { marginTop: 8 }

  it('standalone text gets flexShrink and margins', () => {
    expect(resolve({ margins }).style).toMatchObject({ flexShrink: 1, marginTop: 8 })
  })

  it.each(['default', 'strong', 'em', 'quote', 'code'] as const)('nested %s text gets no layout props', (role) => {
    const { style } = resolve({ role, margins }, 16)
    expect(style.flexShrink).toBeUndefined()
    expect(style.marginTop).toBeUndefined()
  })

  it('passes color through, and leaves it unset to inherit', () => {
    expect(resolve({ color: '#123456' }).style.color).toBe('#123456')
    expect(resolve({}, 16).style).not.toHaveProperty('color')
  })

  it('maps truncate / wrap to text props', () => {
    expect(resolve({ truncate: true }).textProps).toMatchObject({ numberOfLines: 1, ellipsizeMode: 'tail' })
    expect(resolve({ wrap: 'nowrap' }).textProps).toMatchObject({ numberOfLines: 1, ellipsizeMode: 'clip' })
    expect(resolve({}).textProps.numberOfLines).toBeUndefined()
  })
})
