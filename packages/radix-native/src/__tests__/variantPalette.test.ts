/**
 * Variant recipes vs Radix Themes CSS. Each case names the Radix selector it
 * mirrors; expectations are paints (tokens), so no theme is needed.
 */
import {
  getVariantPaints, resolvePaint, c, g, f, raw, layers, fade, byMode, blackA, whiteA, TRANSPARENT, WHITE, SHADOW_1_RING,
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
    // --base-button-classic-disabled-box-shadow: gray-a4 ring (light); gray-a5 over gray-a2 rings (dark)
    ['.rt-variant-classic[data-disabled]', { variant: 'classic', disabled: true },
      { bg: g(2), text: g('a8'), border: byMode(g('a4'), layers(g('a5'), g('a2'))) }],
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
  const surface = layers(g('surface'), byMode(WHITE, g(1)))
  it.each([
    ['card surface → color-panel + gray-a5', 'card', { variant: 'surface' }, { bg: g('panel'), border: g('a5'), pressedBorder: g('a6') }],
    ['card classic → color-panel + classic border', 'card', { variant: 'classic' }, { bg: g('panel'), border: classicBorder }],
    ['card ghost :active', 'card', { variant: 'ghost' }, { pressedBg: g('a4') }],
    ['checkbox card surface → color-surface', 'checkboxCard', { variant: 'surface' }, { bg: surface, border: g('a5') }],
    ['checkbox card classic', 'checkboxCard', { variant: 'classic' }, { bg: surface, border: classicBorder }],
    ['card item :disabled', 'checkboxCard', { variant: 'surface', disabled: true }, { bg: layers(g('a2'), surface), text: g('a9') }],
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
    ['classic :focus-within → focus-8 ring', 'textField', { variant: 'classic', focused: true }, { border: f(8) }],
    ['surface :focus-within → focus-8 ring', 'textArea', { variant: 'surface', focused: true }, { border: f(8) }],
    ['.rt-variant-soft :focus-within → accent-8 ring (gray stays gray)', 'textField', { variant: 'soft', focused: true }, { border: c(8) }],
    ['text field soft placeholder 0.6', 'textField', { variant: 'soft' }, { bg: c('a3'), text: c(12), placeholder: fade(c(12), 0.6) }],
    ['text area soft placeholder 0.65', 'textArea', { variant: 'soft' }, { placeholder: fade(c(12), 0.65) }],
    ['surface :disabled', 'textField', { variant: 'surface', disabled: true },
      { bg: layers(g('a2'), g('surface')), border: g('a6'), text: g('a11'), placeholder: fade(g('a10'), 0.5) }],
    ['classic :disabled keeps shadow-1', 'textField', { variant: 'classic', disabled: true }, { border: SHADOW_1_RING }],
    [':read-only:focus → gray-8 ring', 'textField', { variant: 'surface', disabled: true, focused: true }, { border: g(8) }],
    ['soft :read-only:focus → gray-8 ring', 'textArea', { variant: 'soft', disabled: true, focused: true }, { border: g(8) }],
    ['soft :disabled keeps the accent placeholder', 'textField', { variant: 'soft', disabled: true },
      { bg: g('a3'), text: g('a11'), placeholder: fade(c(12), 0.3) }],
  ] as const)('%s', (_selector, name, state, expected) => {
    expect(paints(name, state)).toMatchObject(expected)
  })
})

describe('text (text.css, heading.css, link.css, blockquote.css)', () => {
  it('no color → gray-12; [data-accent-color] → accent-a11; high contrast → accent-12', () => {
    expect(paints('text', {}).text).toEqual(g(12))
    expect(paints('text', { hasColor: true }).text).toEqual(c('a11'))
    expect(paints('text', { hasColor: true, highContrast: true }).text).toEqual(c(12))
  })

  it('links are always colored; underline accent-a5, high contrast accent-a6', () => {
    expect(paints('link', {})).toEqual({ text: c('a11'), decoration: c('a5') })
    expect(paints('link', { highContrast: true })).toEqual({ text: c(12), decoration: c('a6') })
  })

  it('blockquote border is accent-a6', () => {
    expect(paints('blockquote', {}).decoration).toEqual(c('a6'))
  })
})

describe('kbd (kbd.css)', () => {
  it('.rt-variant-soft → gray-a3, gray-12 text, no bevel', () => {
    expect(paints('kbd', { variant: 'soft' })).toEqual({ bg: g('a3'), text: g(12) })
  })

  it('.rt-variant-classic → gray-1 with the per-mode --kbd-box-shadow colors', () => {
    // the drop shadow is checked under 'shadows and bevel'
    expect(paints('kbd', { variant: 'classic' })).toMatchObject({
      bg: g(1),
      text: g(12),
      ring: byMode(g('a5'), g('a7')),
      bottomEdge: byMode(g('a7'), blackA(11)),
      highlight: byMode(g('a3'), g('a11')),
    })
  })
})

describe('control label (checkbox-group.css, radio-group.css)', () => {
  it('gray-12, gray-a8 when disabled', () => {
    expect(paints('controlLabel', {})).toEqual({ text: g(12) })
    expect(paints('controlLabel', { disabled: true })).toEqual({ text: g('a8') })
  })
})

describe('focus ring (color.css --focus-*)', () => {
  it(':focus-visible → outline focus-8', () => {
    expect(paints('focusRing', {})).toEqual({ ring: f(8) })
  })

  const rc = (color: string, step: unknown) => `${color}-${String(step)}`
  const resolve = (paint: Parameters<typeof resolvePaint>[0], color: Parameters<typeof resolvePaint>[1]['color']) =>
    resolvePaint(paint, { rc: rc as Parameters<typeof resolvePaint>[1]['rc'], color, appearance: 'light' })

  it.each([
    ['.radix-themes → accent', 'accent', 'accent-8'],
    ["[data-accent-color]:not([data-accent-color='gray']) → own color", 'crimson', 'crimson-8'],
    ["[data-accent-color='gray'] → inherited accent", 'gray', 'accent-8'],
  ] as const)('%s', (_selector, color, expected) => {
    expect(resolve(f(8), color)).toBe(expected)
  })

  it('accent-* paints still follow a gray color', () => {
    expect(resolve(c(8), 'gray')).toBe('gray-8')
  })
})

describe('shadows and bevel (classic look)', () => {
  // The drop shadow that stands in for the raised classic look (Radix draws Button's with insets).
  const lift = (opacity: number) => ({ color: raw('#000000'), opacity, offsetY: 1, radius: 2, elevation: 2 })
  const dark = { appearance: 'dark' as const }

  it.each([
    // .rt-variant-classic: bevel gradient (background-image + ::after) at rest and while pressed
    ['button classic at rest → lift + bevel', 'button', { variant: 'classic' }, { shadow: lift(0.15), bevel: true }],
    ['button classic :active → bevel, no lift', 'button', { variant: 'classic', pressed: true }, { shadow: undefined, bevel: true }],
    // [data-disabled] (loading sets it too): background-image none
    ['button classic [data-disabled] / loading → flat', 'button', { variant: 'classic', disabled: true }, { shadow: undefined, bevel: undefined }],
    ['button solid → flat', 'button', { variant: 'solid' }, { shadow: undefined, bevel: undefined }],
    // --base-card-classic-box-shadow-outer; :active keeps it (--base-card-classic-active-*)
    ['card classic → lift', 'card', { variant: 'classic' }, { shadow: lift(0.15) }],
    ['card classic :active → keeps the lift', 'card', { variant: 'classic', pressed: true }, { shadow: lift(0.15) }],
    ['card surface → no shadow', 'card', { variant: 'surface' }, { shadow: undefined }],
    // checkbox-cards / radio-cards classic: outer shadow kept on :disabled
    ['checkbox card classic → lift', 'checkboxCard', { variant: 'classic' }, { shadow: lift(0.15) }],
    ['checkbox card classic :disabled → keeps the lift', 'checkboxCard', { variant: 'classic', disabled: true }, { shadow: lift(0.15) }],
    ['radio card classic :disabled → keeps the lift', 'radioCard', { variant: 'classic', disabled: true }, { shadow: lift(0.15) }],
    ['checkbox card surface → no shadow', 'checkboxCard', { variant: 'surface' }, { shadow: undefined }],
    // checkbox / radio classic [data-state=checked]: bevel gradient, inset only (no drop shadow)
    ['checkbox classic checked → bevel', 'checkbox', { variant: 'classic', checked: true }, { bevel: true, shadow: undefined }],
    ['checkbox classic unchecked → none', 'checkbox', { variant: 'classic' }, { bevel: undefined }],
    ['checkbox classic checked :disabled → none', 'checkbox', { variant: 'classic', checked: true, disabled: true }, { bevel: undefined }],
    ['checkbox surface checked → none', 'checkbox', { variant: 'surface', checked: true }, { bevel: undefined }],
    ['radio classic checked → bevel', 'radio', { variant: 'classic', checked: true }, { bevel: true }],
    ['radio classic checked :disabled → none', 'radio', { variant: 'classic', checked: true, disabled: true }, { bevel: undefined }],
  ] as const)('%s', (_selector, name, state, expected) => {
    const actual = new Map(Object.entries(paints(name, state)))
    expect(Object.fromEntries(Object.keys(expected).map(key => [key, actual.get(key)]))).toEqual(expected)
  })

  it('the classic lift is darker in dark mode', () => {
    expect(getVariantPaints('button', { ...dark, variant: 'classic' }).shadow).toEqual(lift(0.3))
    expect(getVariantPaints('card', { ...dark, variant: 'classic' }).shadow).toEqual(lift(0.3))
  })

  // .rt-SwitchThumb: a drop shadow in every variant; [data-disabled] 0 1px 3px black-a1
  it.each(['classic', 'surface', 'soft'] as const)('switch %s thumb shadow, lighter when disabled', variant => {
    const thumb = { color: raw('#000000'), offsetY: 1, radius: 1.5 }
    expect(paints('switch', { variant }).thumbShadow).toEqual({ ...thumb, opacity: 0.15, elevation: 1 })
    expect(paints('switch', { variant, disabled: true }).thumbShadow).toEqual({ ...thumb, opacity: 0.05, elevation: 0 })
  })

  // --kbd-box-shadow outer drop shadow: 0 0.08em 0.17em gray-a7 (dark black-a12)
  it('kbd classic drop shadow; soft has none', () => {
    const shadow = { color: byMode(g(12), raw('#000000')), offsetY: 1, radius: 1, elevation: 1 }
    expect(paints('kbd', { variant: 'classic' }).shadow).toEqual({ ...shadow, opacity: 0.12 })
    expect(getVariantPaints('kbd', { ...dark, variant: 'classic' }).shadow).toEqual({ ...shadow, opacity: 0.95 })
    expect(paints('kbd', { variant: 'soft' }).shadow).toBeUndefined()
  })
})

describe('callouts (callout.css)', () => {
  it.each([
    ['.rt-variant-soft', { variant: 'soft' }, { bg: c('a3'), text: c('a11') }],
    ['.rt-variant-surface', { variant: 'surface' }, { bg: c('a2'), border: c('a6'), text: c('a11') }],
    ['.rt-variant-outline', { variant: 'outline' }, { bg: TRANSPARENT, border: c('a7'), text: c('a11') }],
    ['.rt-high-contrast (text only)', { variant: 'surface', highContrast: true }, { bg: c('a2'), border: c('a6'), text: c(12) }],
  ] as const)('%s', (_selector, state, expected) => {
    expect(paints('callout', state)).toMatchObject(expected)
  })
  it('soft has no ring', () => {
    expect(paints('callout', { variant: 'soft' })).not.toHaveProperty('border')
  })
})
