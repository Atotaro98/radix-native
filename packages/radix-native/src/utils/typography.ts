import { fontSize, lineHeight, letterSpacingEm, type FontSizeToken } from '../tokens/typography'
import { scalingMap, type ScalingMode } from '../tokens/scaling'
import type { TextWrap } from '../components/typography/Text'

export interface ResolvedTypography {
  fontSize: number
  lineHeight: number
  letterSpacing: number
}

/**
 * Resolves a font-size token into scaled `fontSize`, `lineHeight` and
 * `letterSpacing` (px). Pass `lineHeights` to use a different line-height
 * scale (e.g. `headingLineHeight`).
 */
export function resolveTypography(
  size: FontSizeToken,
  scaling: ScalingMode,
  lineHeights: Record<FontSizeToken, number> = lineHeight,
): ResolvedTypography {
  const factor = scalingMap[scaling]
  const resolvedFontSize = Math.round(fontSize[size] * factor)
  return {
    fontSize: resolvedFontSize,
    lineHeight: Math.round(lineHeights[size] * factor),
    letterSpacing: letterSpacingEm[size] * resolvedFontSize,
  }
}

/** Maps Radix `truncate` / `wrap` props to RN `numberOfLines` / `ellipsizeMode`. */
export function getTextWrapProps(
  truncate: boolean | undefined,
  wrap: TextWrap | undefined,
): { numberOfLines?: number; ellipsizeMode?: 'tail' | 'clip' } {
  if (truncate) return { numberOfLines: 1, ellipsizeMode: 'tail' }
  if (wrap === 'nowrap') return { numberOfLines: 1, ellipsizeMode: 'clip' }
  return {}
}
