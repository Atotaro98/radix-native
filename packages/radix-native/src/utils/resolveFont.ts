import type { TextStyle } from 'react-native'
import type { TextWeight } from '../components/typography/Text'

// ─── Weight map ──────────────────────────────────────────────────────────────

export const FONT_WEIGHT: Record<TextWeight, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

// ─── resolveFont ─────────────────────────────────────────────────────────────
// On RN/iOS, combining fontWeight with a custom fontFamily causes iOS to ignore
// the fontFamily and use the system font instead (known RN bug). When a custom
// fontFamily is provided the weight is already baked into the font file (e.g.
// Inter-Medium.ttf), so fontWeight must NOT be set.
//
// Same approach as Tamagui's getSplitStyles: `delete style.fontWeight` when a
// face override exists.

export function resolveFont(
  fontFamily: string | undefined,
  fontWeight: TextStyle['fontWeight'],
): { fontFamily: string | undefined; fontWeight: TextStyle['fontWeight'] | undefined } {
  return {
    fontFamily,
    fontWeight: fontFamily ? undefined : fontWeight,
  }
}
