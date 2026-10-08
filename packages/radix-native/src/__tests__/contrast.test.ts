/**
 * Automated contrast checks on the token combinations components use.
 *
 * These guard against palette / mapping regressions. Note that Radix designs
 * its scales with APCA, not WCAG 2: text on solid step 9 (`contrast` color —
 * used by solid Buttons, Badges, Checkboxes…) is only ~3:1 for several hues
 * (orange, cyan, teal, grass…). That passes WCAG for large text / UI parts but
 * not for body text — use `highContrast` when AA matters.
 */
import { resolveColor } from '../utils/resolveColor'
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
