import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { useThemeContext } from './useThemeContext'
import { resolveSpace } from '../utils/resolveSpace'
import type { MarginProps, MarginValue } from '../types/marginProps'
import type { ScalingMode } from '../tokens/scaling'

function resolveMargin(value: MarginValue | undefined, scaling: ScalingMode): ViewStyle['marginTop'] {
  if (value === undefined) return undefined
  if (value === 'auto') return 'auto'
  return resolveSpace(value, scaling)
}

/**
 * Resolves margin token props into a memoized ViewStyle.
 *
 * RN equivalent of Radix web's `extractProps(props, marginPropDefs)`.
 * Centralises the `sp(mt ?? my ?? m)` pattern that was copy-pasted in every component.
 */
export function useMargins({ m, mx, my, mt, mr, mb, ml }: MarginProps): ViewStyle {
  const { scaling } = useThemeContext()
  return useMemo(() => ({
    marginTop: resolveMargin(mt ?? my ?? m, scaling),
    marginBottom: resolveMargin(mb ?? my ?? m, scaling),
    marginLeft: resolveMargin(ml ?? mx ?? m, scaling),
    marginRight: resolveMargin(mr ?? mx ?? m, scaling),
  }), [scaling, m, mx, my, mt, mr, mb, ml])
}
