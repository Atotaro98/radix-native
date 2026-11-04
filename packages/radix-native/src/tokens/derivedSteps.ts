/**
 * Steps Radix Themes derives from other steps of the same scale
 * (packages/radix-ui-themes/src/styles/tokens/colors/{color}.css).
 *
 * Resolving them through their base steps means an override of a base step
 * (e.g. `9`) carries over, like CSS custom properties. Shared by `resolveColor`
 * (runtime, with overrides) and `scripts/generate-colors.ts` (token files).
 */

import { mixOklab } from '../utils/colorMath'

type Appearance = 'light' | 'dark'

/** A step name (`'9'`), a literal color (`'#ffffff'`) or `color-mix(in oklab, from, to weight)`. */
export type Derivation = string | { mix: readonly [from: string, to: string]; weight: number }

type ByMode = Record<Appearance, Derivation>

const DEFAULT_DERIVED: Record<string, ByMode> = {
  indicator: { light: '9', dark: '9' },
  track: { light: '9', dark: '9' },
  // Radix `--color-panel-solid`: white in light mode, gray-2 in dark mode
  panel: { light: '#ffffff', dark: '2' },
}

/** `--{color}-track` in dark mode: `color-mix(in oklab, var(--{color}-8), var(--{color}-9) 65%)` */
const darkTrack = (weight: number): Derivation => ({ mix: ['8', '9'], weight })

const SCALE_DERIVED: Record<string, Record<string, Partial<ByMode>>> = {
  amber: { track: { dark: darkTrack(0.75) } },
  lime: { track: { dark: darkTrack(0.65) } },
  mint: { track: { dark: darkTrack(0.65) } },
  sky: { track: { dark: darkTrack(0.65) } },
  // yellow.css light: `--yellow-indicator` / `--yellow-track` use step 10
  yellow: {
    indicator: { light: '10' },
    track: { light: '10', dark: darkTrack(0.65) },
  },
}

export function getDerivation(colorName: string, step: string, appearance: Appearance): Derivation | undefined {
  return SCALE_DERIVED[colorName]?.[step]?.[appearance] ?? DEFAULT_DERIVED[step]?.[appearance]
}

/** Computes a derivation, reading base steps through `lookup` (which may apply overrides). */
export function applyDerivation(derivation: Derivation, lookup: (step: string) => string): string {
  if (typeof derivation !== 'string') {
    const [from, to] = derivation.mix
    return mixOklab(lookup(from), lookup(to), derivation.weight)
  }
  return derivation.startsWith('#') ? derivation : lookup(derivation)
}
