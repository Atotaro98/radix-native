import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { useResolveSpace } from './useResolveSpace'
import type { MarginProps } from '../types/marginProps'

/**
 * Resolves margin token props into a memoized ViewStyle.
 *
 * RN equivalent of Radix web's `extractProps(props, marginPropDefs)`.
 * Centralises the `sp(mt ?? my ?? m)` pattern that was copy-pasted in every component.
 */
export function useMargins({ m, mx, my, mt, mr, mb, ml }: MarginProps): ViewStyle {
  const sp = useResolveSpace()
  return useMemo(() => ({
    marginTop: sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft: sp(ml ?? mx ?? m),
    marginRight: sp(mr ?? mx ?? m),
  }), [sp, m, mx, my, mt, mr, mb, ml])
}
