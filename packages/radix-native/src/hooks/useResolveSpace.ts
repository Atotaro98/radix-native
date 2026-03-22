import React from 'react'
import { useThemeContext } from './useThemeContext'
import { resolveSpace } from '../utils/resolveSpace'
import type { MarginToken, SpaceToken } from '../tokens/spacing'

/**
 * Returns a memoized function that resolves a spacing token to pixels,
 * applying the current theme scaling.
 *
 * Replaces the inline `sp` helper that was copy-pasted across all components.
 *
 * @example
 * const sp = useResolveSpace()
 * const marginTop = sp(mt ?? my ?? m)
 */
export function useResolveSpace() {
  const { scaling } = useThemeContext()
  return React.useCallback(
    (token: MarginToken | SpaceToken | undefined): number | undefined =>
      token !== undefined ? resolveSpace(token, scaling) : undefined,
    [scaling],
  )
}
