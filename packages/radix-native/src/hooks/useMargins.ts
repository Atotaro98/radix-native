import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { useMetrics } from './useMetrics'
import type { MarginProps, MarginValue } from '../types/marginProps'
import type { Metrics } from '../utils/metrics'

function resolveMargin(value: MarginValue | undefined, space: Metrics['space']): ViewStyle['marginTop'] {
  if (value === undefined) return undefined
  if (value === 'auto') return 'auto'
  return space(value)
}

/**
 * Resolves margin token props into a memoized ViewStyle.
 *
 * RN equivalent of Radix web's `extractProps(props, marginPropDefs)`.
 * Centralises the `sp(mt ?? my ?? m)` pattern that was copy-pasted in every component.
 */
export function useMargins({ m, mx, my, mt, mr, mb, ml }: MarginProps): ViewStyle {
  const { space } = useMetrics()
  return useMemo(() => ({
    marginTop: resolveMargin(mt ?? my ?? m, space),
    marginBottom: resolveMargin(mb ?? my ?? m, space),
    marginLeft: resolveMargin(ml ?? mx ?? m, space),
    marginRight: resolveMargin(mr ?? mx ?? m, space),
  }), [space, m, mx, my, mt, mr, mb, ml])
}
