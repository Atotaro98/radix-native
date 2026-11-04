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
 * The second half checks every text-on-fill pair the Variant recipes produce.
 */
import { resolveColor } from '../utils/resolveColor'
import { resolveVariantColors } from '../utils/variantPalette'
import type { RecipeName, RecipeState } from '../utils/variantPalette'
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

// ─── Text on its own background, through the real Variant recipes ──────────────

type TextRecipe = 'button' | 'badge' | 'avatar' | 'code' | 'textField'
const TEXT_RECIPES: { name: TextRecipe; variants: readonly string[] }[] = [
  { name: 'button', variants: ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost'] },
  { name: 'badge', variants: ['solid', 'soft', 'surface', 'outline'] },
  { name: 'avatar', variants: ['solid', 'soft'] },
  { name: 'code', variants: ['solid', 'soft', 'outline'] },
  { name: 'textField', variants: ['classic', 'surface', 'soft'] },
]

const cases = MODES.flatMap(mode => TEXT_RECIPES.flatMap(({ name, variants }) =>
  variants.flatMap(variant => [false, true].map(highContrast => ({ mode, name, variant, highContrast })))))

describe.each(cases)('$mode $name $variant (highContrast: $highContrast)', ({ mode, name, variant, highContrast }) => {
  const page = mode === 'light' ? '#ffffff' : resolveColor('gray-1', mode, 'indigo', 'slate')
  // Regression floors for Radix's APCA-tuned pairs (see the note at the top):
  // contrast on solid step 9 ≈ 3:1; a11 on a tinted fill (soft/surface) ≈ 4:1
  // in light mode (orange 3.99). highContrast and plain fields must reach AA.
  const solid = variant === 'solid' || variant === 'classic'
  const minimum = highContrast || name === 'textField' ? 4.5 : solid ? 2.9 : 3.9

  it.each(ACCENTS)('text on its background ≥ %s', (accent) => {
    const rc = ((first: string, step?: string | number) =>
      resolveColor(step === undefined ? first : `${first}-${step}`, mode, 'indigo', 'slate')) as ResolveColorFn
    const state = { appearance: mode, variant, highContrast, hasColor: true } as RecipeState<RecipeName>
    const colors = resolveVariantColors(name, state as RecipeState<typeof name>, { rc, color: accent, appearance: mode }) as
      { bg?: string; text?: string }
    const bg = toHex(composite(colors.bg ?? 'transparent', page))
    expect(contrastRatio(colors.text!, bg)).toBeGreaterThanOrEqual(minimum)
  })
})
