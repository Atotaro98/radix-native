/**
 * Automated contrast checks on the token combinations components use.
 *
 * These guard against palette / mapping regressions. Note that Radix designs
 * its scales with APCA, not WCAG 2: text on solid step 9 (`contrast` color —
 * used by solid Buttons, Badges, Checkboxes…) is only ~3:1 for several hues
 * (orange, cyan, teal, grass…). That passes WCAG for large text / UI parts but
 * not for body text — use `highContrast` when AA matters. Likewise colored text
 * (a11) on soft / surface fills is ≈4:1 in light mode for some hues.
 *
 * The second half checks every text-on-fill pair the Variant recipes produce: each
 * recipe in the registry declares its pair, or that it has none (`TEXT_ON_FILL`).
 */
import { resolveColor } from '../utils/resolveColor'
import { resolveVariantColors } from '../utils/variantPalette'
import type { RecipeName, RecipeState, VariantColors } from '../utils/variantPalette'
import type { ResolveColorFn } from '../hooks/useResolveColor'
import { contrastRatio, composite } from './helpers/contrast'
import type { AccentColor, GrayColor } from '../tokens/colors/types'

const ACCENTS: AccentColor[] = [
  'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet',
  'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass',
  'bronze', 'gold', 'brown', 'orange', 'amber', 'yellow', 'lime', 'mint', 'sky', 'gray',
]
const GRAYS: GrayColor[] = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand']
const MODES = ['light', 'dark'] as const

const toHex = ({ r, g, b }: { r: number; g: number; b: number }) =>
  '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')

describe.each(MODES)('%s mode', (mode) => {
  const background = mode === 'light' ? '#ffffff' : resolveColor('gray-1', mode, 'indigo', 'slate')
  const rc = (scale: string, step: string | number) =>
    resolveColor(`${scale}-${step}`, mode, 'indigo', 'slate')

  it.each(GRAYS)('gray-12 body text on the background is AAA (%s)', (gray) => {
    expect(contrastRatio(rc(gray, 12), background)).toBeGreaterThanOrEqual(7)
  })

  it.each(ACCENTS)('colored text (a11) on the background is AA (%s)', (accent) => {
    expect(contrastRatio(rc(accent, 'a11'), background)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(ACCENTS)('highContrast text (12) on the background is AAA (%s)', (accent) => {
    expect(contrastRatio(rc(accent, 12), background)).toBeGreaterThanOrEqual(7)
  })

  it.each(ACCENTS)('soft variant text (12, highContrast) on a3 is AA (%s)', (accent) => {
    const softBg = toHex(composite(rc(accent, 'a3'), background))
    expect(contrastRatio(rc(accent, 12), softBg)).toBeGreaterThanOrEqual(4.5)
  })

  it.each(ACCENTS)('solid variant text (contrast on 9) stays ≈3:1 or better (%s)', (accent) => {
    // Regression guard only — see the note at the top of this file.
    expect(contrastRatio(rc(accent, 'contrast'), rc(accent, 9))).toBeGreaterThanOrEqual(2.9)
  })
})

// ─── Text on its own fill, through the real Variant recipes ───────────────────

/**
 * What a recipe says about text: the states to walk (enabled ones: disabled text is
 * exempt from WCAG), which of its parts is the text and which the fill under it
 * (default `text` on `bg`; no fill = straight on the page), and the floor it must
 * reach. `null`: the recipe colors no text of its own.
 *
 * The map is total over the recipe registry, so a new recipe does not compile until
 * it says where its text is.
 */
interface Spec<R extends RecipeName> {
  states: readonly Omit<RecipeState<R>, 'appearance'>[]
  pair?: (colors: VariantColors<R>) => { text?: string; fill?: string }
  minimum: (state: Omit<RecipeState<R>, 'appearance'>, mode: 'light' | 'dark') => number
}

const HC = [false, true] as const
const withHC = <V extends string>(variants: readonly V[], extra: object = {}) =>
  variants.flatMap(variant => HC.map(highContrast => ({ variant, highContrast, hasColor: true, ...extra })))

// Regression floors for Radix's APCA-tuned pairs (see the note at the top):
// contrast on solid step 9 ≈ 3:1; a11 on a tinted fill (soft / surface) ≈ 4:1
// in light mode (orange 3.99). High contrast must reach AA.
const SOLID = 2.9
const TINTED = 3.9
const AA = 4.5
const AAA = 7
// Radix pairs under 4:1, kept as they are and guarded against getting worse:
// a highlighted soft menu item with its own color (accent-a11 on accent-a4; orange 3.54)
const SOFT_HIGHLIGHT = 3.5
// a menu label (gray-a10 on the panel; 3.78)
const MENU_LABEL = 3.7
const chipFloor = (s: { variant: string; highContrast?: boolean }) =>
  s.highContrast ? AA : s.variant === 'solid' || s.variant === 'classic' ? SOLID : TINTED

const TEXT_ON_FILL: { [R in RecipeName]: Spec<R> | null } = {
  button: { states: withHC(['classic', 'solid', 'soft', 'surface', 'outline', 'ghost'] as const), minimum: chipFloor },
  badge: { states: withHC(['solid', 'soft', 'surface', 'outline'] as const), minimum: chipFloor },
  avatar: { states: withHC(['solid', 'soft'] as const), minimum: chipFloor },
  code: { states: withHC(['solid', 'soft', 'outline'] as const), minimum: chipFloor },
  textField: { states: withHC(['classic', 'surface', 'soft'] as const), minimum: () => AA },
  textArea: { states: withHC(['classic', 'surface', 'soft'] as const), minimum: () => AA },
  callout: { states: withHC(['soft', 'surface', 'outline'] as const), minimum: s => (s.highContrast ? AA : TINTED) },
  checkboxCard: { states: withHC(['surface', 'classic'] as const), minimum: () => AAA },
  radioCard: { states: withHC(['surface', 'classic'] as const, { checked: true }), minimum: () => AAA },
  segmented: { states: [{ variant: 'surface' }, { variant: 'classic' }], minimum: () => AAA },
  table: { states: [{ variant: 'surface' }, { variant: 'ghost' }], minimum: () => AAA },
  tooltip: { states: [{}], minimum: () => AAA },
  kbd: { states: [{ variant: 'classic' }, { variant: 'soft' }], minimum: () => AA },
  selectTrigger: {
    states: withHC(['classic', 'surface', 'soft', 'ghost'] as const),
    minimum: s => (s.variant === 'soft' || s.variant === 'ghost' ? AA : AAA),
  },
  menuItem: {
    states: [
      ...withHC(['solid', 'soft'] as const, { highlighted: true }),
      ...withHC(['solid', 'soft'] as const, { highlighted: true, hasColor: false }),
      ...withHC(['solid', 'soft'] as const, { subOpen: true, hasColor: false }),
      ...withHC(['solid', 'soft'] as const, { hasColor: false }),
    ],
    minimum: s => (!s.highlighted ? AAA : s.variant === 'solid' ? (s.highContrast && !s.hasColor ? AA : SOLID) : s.hasColor ? SOFT_HIGHLIGHT : AAA),
  },
  // Text straight on the page
  text: { states: HC.map(highContrast => ({ highContrast, hasColor: true })), minimum: s => (s.highContrast ? AAA : AA) },
  blockquote: { states: HC.map(highContrast => ({ highContrast, hasColor: true })), minimum: s => (s.highContrast ? AAA : AA) },
  link: { states: HC.map(highContrast => ({ highContrast })), minimum: s => (s.highContrast ? AAA : AA) },
  dataListLabel: {
    states: [true, false].flatMap(hasColor => HC.map(highContrast => ({ highContrast, hasColor }))),
    minimum: s => (s.highContrast ? AAA : AA),
  },
  body: { states: [{}], minimum: () => AAA },
  controlLabel: { states: [{}], minimum: () => AAA },
  tabList: { states: [{}, { active: true }], minimum: s => (s.active ? AAA : AA) },
  menuChrome: { states: [{}], pair: colors => ({ text: colors.label }), minimum: () => MENU_LABEL },
  textFieldSlot: { states: withHC(['classic', 'surface', 'soft'] as const), minimum: () => AA },
  // No text of their own
  checkbox: null,
  radio: null,
  switch: null,
  progress: null,
  slider: null,
  card: null,
  dialog: null,
  popperPanel: null,
  focusRing: null,
  themePanel: null,
  themePanelOption: null,
}

const specs = (Object.keys(TEXT_ON_FILL) as RecipeName[]).flatMap(name => {
  const spec = TEXT_ON_FILL[name] as Spec<RecipeName> | null
  return spec ? MODES.flatMap(mode => spec.states.map(state => ({ name, mode, state, spec, label: JSON.stringify(state) }))) : []
})

describe.each(specs)('$mode $name $label', ({ name, mode, state, spec }) => {
  const page = mode === 'light' ? '#ffffff' : resolveColor('gray-1', mode, 'indigo', 'slate')
  const minimum = spec.minimum(state, mode)

  it.each(ACCENTS)(`text on its fill ≥ ${minimum} (%s)`, (accent) => {
    const rc = ((first: string, step?: string | number) =>
      resolveColor(step === undefined ? first : `${first}-${step}`, mode, 'indigo', 'slate')) as ResolveColorFn
    const colors = resolveVariantColors(name, { ...state, appearance: mode } as RecipeState<RecipeName>, { rc, color: accent, appearance: mode })
    const parts = colors as { text?: string; bg?: string }
    const { text, fill } = spec.pair ? spec.pair(colors) : { text: parts.text, fill: parts.bg }
    // A recipe may give no text color for a state (plain Text without `color`): nothing to check
    if (text === undefined) return
    const under = toHex(composite(fill ?? 'transparent', page))
    const ratio = contrastRatio(toHex(composite(text, under)), under)
    expect(ratio).toBeGreaterThanOrEqual(minimum)
  })
})

// ─── Kbd and control labels (gray only, every gray scale) ─────────────────────

describe.each(MODES)('%s mode, gray-only recipes', (mode) => {
  const ctx = (gray: GrayColor) => {
    const rc = ((first: string, step?: string | number) =>
      resolveColor(step === undefined ? first : `${first}-${step}`, mode, 'indigo', gray)) as ResolveColorFn
    const page = mode === 'light' ? '#ffffff' : rc('gray', 1)
    return { rc, page, paint: { rc, color: 'accent' as const, appearance: mode } }
  }

  it.each(GRAYS.flatMap(gray => (['classic', 'soft'] as const).map(variant => [variant, gray] as const)))(
    'Kbd %s text on its background is AA (%s)',
    (variant, gray) => {
      const { page, paint } = ctx(gray)
      const colors = resolveVariantColors('kbd', { appearance: mode, variant }, paint)
      expect(contrastRatio(colors.text, toHex(composite(colors.bg, page)))).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(GRAYS)('an enabled control label is AAA on the background (%s)', (gray) => {
    const { page, paint } = ctx(gray)
    const colors = resolveVariantColors('controlLabel', { appearance: mode }, paint)
    expect(contrastRatio(colors.text, page)).toBeGreaterThanOrEqual(7)
  })
})
