/**
 * Variant recipes vs Radix Themes CSS. Each case names the Radix selector it
 * mirrors; expectations are paints (tokens), so no theme is needed.
 */
import {
  getVariantPaints, c, g, layers, fade, byMode, blackA, whiteA, TRANSPARENT, WHITE, SHADOW_1_RING,
} from '../utils/variantPalette'
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

describe('tracks (switch.css, progress.css)', () => {
  it.each([
    ['switch surface unchecked', 'switch', { variant: 'surface' }, { track: g('a3'), border: g('a5'), thumb: WHITE }],
    ['switch surface checked → accent-track', 'switch', { variant: 'surface', checked: true }, { track: c('track'), border: g('a5') }],
    ['switch high contrast → black-a8 overlay (light only)', 'switch', { variant: 'surface', checked: true, highContrast: true },
      { track: layers(byMode(blackA(8), TRANSPARENT), c('track')) }],
    ['switch surface [data-disabled]', 'switch', { variant: 'surface', disabled: true }, { track: g('a3'), border: g('a3'), thumb: g(2) }],
    ['switch classic unchecked → gray-a4 + shadow-1', 'switch', { variant: 'classic' }, { track: g('a4'), border: SHADOW_1_RING }],
    ['switch classic [data-disabled] at 0.5', 'switch', { variant: 'classic', disabled: true },
      { track: fade(g('a5'), 0.5), border: fade(SHADOW_1_RING, 0.5) }],
    ['switch soft thumb stays white', 'switch', { variant: 'soft', checked: true },
      { track: layers(c('a4'), c('a4'), c('a4'), g('a2')), thumb: WHITE }],
    ['switch soft unchecked', 'switch', { variant: 'soft' }, { track: layers(whiteA(1), g('a3'), g('a3')) }],
    ['progress surface', 'progress', { variant: 'surface' }, { track: g('a3'), border: g('a4'), indicator: c('track') }],
    ['progress classic → shadow-1', 'progress', { variant: 'classic' }, { border: SHADOW_1_RING }],
    ['progress soft', 'progress', { variant: 'soft' }, { track: layers(whiteA(1), g('a4')), indicator: layers(c('a5'), c(8)) }],
    ['progress high contrast', 'progress', { variant: 'surface', highContrast: true }, { indicator: c(12) }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })
})

describe('cards (base-card.css, card.css, checkbox-cards.css, radio-cards.css)', () => {
  const classicBorder = byMode(g('a3'), g('a6'))
  it.each([
    ['card surface → color-panel + gray-a5', 'card', { variant: 'surface' }, { bg: g('panel'), border: g('a5'), pressedBorder: g('a6') }],
    ['card classic → color-panel + classic border', 'card', { variant: 'classic' }, { bg: g('panel'), border: classicBorder }],
    ['card ghost :active', 'card', { variant: 'ghost' }, { pressedBg: g('a4') }],
    ['checkbox card surface → color-surface', 'checkboxCard', { variant: 'surface' }, { bg: g('surface'), border: g('a5') }],
    ['checkbox card classic', 'checkboxCard', { variant: 'classic' }, { bg: g('surface'), border: classicBorder }],
    ['card item :disabled', 'checkboxCard', { variant: 'surface', disabled: true }, { bg: layers(g('a2'), g('surface')), text: g('a9') }],
    ['radio card checked → accent-indicator outline', 'radioCard', { variant: 'surface', checked: true }, { checkedBorder: c('indicator') }],
    ['radio card checked high contrast', 'radioCard', { variant: 'surface', checked: true, highContrast: true }, { checkedBorder: c(12) }],
    ['radio card checked :disabled → gray-8', 'radioCard', { variant: 'classic', checked: true, disabled: true }, { checkedBorder: g(8) }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })
})

describe('text inputs (text-field.css, text-area.css)', () => {
  it.each([
    ['text field surface', 'textField', { variant: 'surface' }, { bg: g('surface'), border: g('a7'), text: g(12), placeholder: g('a10') }],
    ['text field classic → shadow-1', 'textField', { variant: 'classic' }, { border: SHADOW_1_RING }],
    ['focused → accent-8 ring', 'textField', { variant: 'classic', focused: true }, { border: c(8) }],
    ['text field soft placeholder 0.6', 'textField', { variant: 'soft' }, { bg: c('a3'), text: c(12), placeholder: fade(c(12), 0.6) }],
    ['text area soft placeholder 0.65', 'textArea', { variant: 'soft' }, { placeholder: fade(c(12), 0.65) }],
    ['surface :disabled', 'textField', { variant: 'surface', disabled: true },
      { bg: layers(g('a2'), g('surface')), border: g('a6'), text: g('a11'), placeholder: fade(g('a10'), 0.5) }],
    ['classic :disabled keeps shadow-1', 'textField', { variant: 'classic', disabled: true }, { border: SHADOW_1_RING }],
    ['soft :disabled keeps the accent placeholder', 'textField', { variant: 'soft', disabled: true },
      { bg: g('a3'), text: g('a11'), placeholder: fade(c(12), 0.3) }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })
})
