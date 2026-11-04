/**
 * Variant recipes vs Radix Themes CSS. Each case names the Radix selector it
 * mirrors; expectations are paints (tokens), so no theme is needed.
 */
import { getVariantPaints, c, g, layers, TRANSPARENT, SHADOW_1_RING } from '../utils/variantPalette'
import type { RecipeName, RecipeState } from '../utils/variantPalette'

const light = { appearance: 'light' as const }

function paints<R extends RecipeName>(name: R, state: Omit<RecipeState<R>, 'appearance'>) {
  return getVariantPaints(name, { ...light, ...state } as RecipeState<R>)
}

describe('buttons (base-button.css)', () => {
  it.each([
    ['.rt-variant-solid', { variant: 'solid' }, { bg: c(9), text: c('contrast'), pressedBg: c(10) }],
    ['.rt-variant-solid.rt-high-contrast', { variant: 'solid', highContrast: true }, { bg: c(12), text: g(1) }],
    ['.rt-variant-classic:active', { variant: 'classic' }, { bg: c(9), pressedBg: c(9) }],
    ['.rt-variant-soft', { variant: 'soft' }, { bg: c('a3'), text: c('a11'), pressedBg: c('a5') }],
    ['.rt-variant-surface', { variant: 'surface' }, { bg: c('surface'), border: c('a7') }],
    ['.rt-variant-outline', { variant: 'outline' }, { bg: TRANSPARENT, border: c('a8') }],
    ['.rt-variant-outline.rt-high-contrast', { variant: 'outline', highContrast: true }, { border: g('a11'), text: c(12) }],
    ['.rt-variant-ghost', { variant: 'ghost' }, { bg: TRANSPARENT, pressedBg: c('a4') }],
    ['[data-disabled] solid', { variant: 'solid', disabled: true }, { bg: g('a3'), text: g('a8') }],
  ] as const)('%s', (_selector, state, expected) => {
    expect(paints('button', state)).toMatchObject(expected)
  })
})

describe('chips (badge.css, avatar.css, code.css)', () => {
  it.each([
    ['badge .rt-variant-solid.rt-high-contrast', 'badge', { variant: 'solid', highContrast: true }, { bg: c(12), text: c(1) }],
    ['badge .rt-variant-surface', 'badge', { variant: 'surface' }, { bg: c('surface'), border: c('a6'), text: c('a11') }],
    ['badge .rt-variant-outline', 'badge', { variant: 'outline' }, { border: c('a8') }],
    ['badge .rt-variant-outline.rt-high-contrast', 'badge', { variant: 'outline', highContrast: true }, { border: g('a11'), text: c(12) }],
    ['avatar .rt-variant-soft', 'avatar', { variant: 'soft' }, { bg: c('a3'), text: c('a11') }],
    ['code .rt-variant-outline.rt-high-contrast', 'code', { variant: 'outline', highContrast: true }, { border: g('a11') }],
    ['code .rt-variant-ghost[data-accent-color]', 'code', { variant: 'ghost', hasColor: true }, { text: c('a11') }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })

  it('code ghost without color inherits the text color', () => {
    expect(paints('code', { variant: 'ghost' }).text).toBeUndefined()
  })
})

describe('selection controls (base-checkbox.css, base-radio.css)', () => {
  it.each([
    ['checkbox surface unchecked', 'checkbox', { variant: 'surface' }, { bg: g('surface'), border: g('a7') }],
    ['checkbox classic unchecked: gray-a3 + shadow-1', 'checkbox', { variant: 'classic' }, { bg: g('surface'), border: layers(g('a3'), SHADOW_1_RING) }],
    ['checkbox checked → accent-indicator', 'checkbox', { variant: 'surface', checked: true }, { bg: c('indicator'), indicator: c('contrast') }],
    ['checkbox checked high contrast', 'checkbox', { variant: 'classic', checked: true, highContrast: true }, { bg: c(12), indicator: c(1) }],
    ['checkbox soft → accent-a5', 'checkbox', { variant: 'soft', checked: true }, { bg: c('a5'), indicator: c('a11') }],
    ['checkbox surface :disabled', 'checkbox', { variant: 'surface', disabled: true, checked: true }, { bg: g('a3'), border: g('a6'), indicator: g('a8') }],
    ['checkbox classic :disabled → shadow-1', 'checkbox', { variant: 'classic', disabled: true }, { bg: g('a3'), border: SHADOW_1_RING }],
    ['radio classic unchecked: gray-7 + shadow-1', 'radio', { variant: 'classic' }, { border: layers(g(7), SHADOW_1_RING) }],
    ['radio soft → accent-a4', 'radio', { variant: 'soft', checked: true }, { bg: c('a4'), indicator: c('a11') }],
    ['radio classic :disabled → shadow-1', 'radio', { variant: 'classic', disabled: true }, { bg: g('a3'), border: SHADOW_1_RING }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })

  it('soft disabled has no ring', () => {
    expect(paints('checkbox', { variant: 'soft', disabled: true }).border).toBeUndefined()
    expect(paints('radio', { variant: 'soft', disabled: true }).border).toBeUndefined()
  })
})
