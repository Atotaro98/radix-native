import React from 'react'
import { useMetrics } from './useMetrics'
import type { MarginToken, SpaceToken } from '../tokens/spacing'

/**
 * Returns a memoized function that resolves a spacing token to pixels,
 * applying the current theme scaling.
 *
 * @deprecated Use `useMetrics().space(token)`.
 */
export function useResolveSpace() {
  const { space } = useMetrics()
  return React.useCallback(
    (token: MarginToken | SpaceToken | undefined): number | undefined =>
      token !== undefined ? space(token) : undefined,
    [space],
  )
}
