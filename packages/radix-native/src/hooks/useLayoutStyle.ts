import { useMemo } from 'react'
import type { ViewStyle } from 'react-native'
import { useMetrics } from './useMetrics'
import { useResolveColor } from './useResolveColor'
import type { LayoutProps } from '../types/layoutProps'
import { LAYOUT_PROPS, resolveLayoutStyle, splitLayoutProps } from '../utils/layoutStyle'
import { useSkeletonRadius } from '../components/feedback/SkeletonContext'

/**
 * Internal: takes a layout primitive's props and returns the resolved Layout
 * props as a memoized ViewStyle, plus the props that are not Layout props.
 * RN equivalent of Radix web's `extractProps(props, layoutPropDefs, marginPropDefs)`.
 */
export function useLayoutStyle<P extends LayoutProps>(props: P): { style: ViewStyle; rest: Omit<P, keyof LayoutProps> } {
  const [layout, rest] = splitLayoutProps(props)
  const metrics = useMetrics({ radius: layout.radius })
  const rc = useResolveColor()
  const values = LAYOUT_PROPS.map((key) => layout[key])
  const style = useMemo(
    () => resolveLayoutStyle(layout, metrics, rc),
    // `values` lists every Layout prop in a fixed order, so the deps array keeps its length
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metrics, rc, ...values],
  )
  // Inside a Skeleton: this primitive's own radius (or none → radius-1), like Radix's cascade
  useSkeletonRadius(typeof style.borderRadius === 'number' ? style.borderRadius : null)
  return { style, rest }
}
