export type SpaceToken = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/**
 * Margin token — superset of SpaceToken that includes negative values.
 * Matches Radix's marginValues which include '-1' through '-9'.
 */
export type MarginToken = -9 | -8 | -7 | -6 | -5 | -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Base space scale in pixels (before scaling is applied) */
export const space: Record<SpaceToken, number> = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 24,
  6: 32,
  7: 40,
  8: 48,
  9: 64,
}
