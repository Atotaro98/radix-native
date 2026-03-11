export type FontSizeToken = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Base font size scale in pixels (before scaling is applied) */
export const fontSize: Record<FontSizeToken, number> = {
  1: 12,
  2: 14,
  3: 16,
  4: 18,
  5: 20,
  6: 24,
  7: 28,
  8: 35,
  9: 60,
}

/** Base line height scale in pixels (before scaling is applied) */
export const lineHeight: Record<FontSizeToken, number> = {
  1: 16,
  2: 20,
  3: 24,
  4: 26,
  5: 28,
  6: 30,
  7: 36,
  8: 40,
  9: 60,
}

/**
 * Heading line heights in pixels (before scaling).
 * Tighter than body line heights for sizes 2–5.
 */
export const headingLineHeight: Record<FontSizeToken, number> = {
  1: 16,
  2: 18,
  3: 22,
  4: 24,
  5: 26,
  6: 30,
  7: 36,
  8: 40,
  9: 60,
}

/**
 * Letter spacing as em multipliers per size token.
 * In RN, letterSpacing is in pixels — multiply by the resolved fontSize:
 *   letterSpacing = letterSpacingEm[size] * resolvedFontSize
 */
export const letterSpacingEm: Record<FontSizeToken, number> = {
  1: 0.0025,
  2: 0,
  3: 0,
  4: -0.0025,
  5: -0.005,
  6: -0.00625,
  7: -0.0075,
  8: -0.01,
  9: -0.025,
}
