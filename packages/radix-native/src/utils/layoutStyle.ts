import type { ViewStyle } from 'react-native'
import type { LayoutProps } from '../types/layoutProps'
import type { MarginValue } from '../types/marginProps'
import type { ThemeColor } from '../theme/theme.types'
import type { SpaceToken } from '../tokens/spacing'
import type { Metrics } from './metrics'

/** Every Layout prop, so the list can't drift from the type. */
const LAYOUT_PROP_KEYS: Record<keyof LayoutProps, true> = {
  m: true, mx: true, my: true, mt: true, mr: true, mb: true, ml: true,
  p: true, px: true, py: true, pt: true, pr: true, pb: true, pl: true,
  width: true, minWidth: true, maxWidth: true,
  height: true, minHeight: true, maxHeight: true,
  position: true, top: true, right: true, bottom: true, left: true,
  overflow: true, flexBasis: true, flexShrink: true, flexGrow: true,
  bg: true, radius: true,
}

export const LAYOUT_PROPS = Object.keys(LAYOUT_PROP_KEYS) as (keyof LayoutProps)[]

/** Splits Layout props from the rest of a component's props. */
export function splitLayoutProps<P extends LayoutProps>(props: P): [LayoutProps, Omit<P, keyof LayoutProps>] {
  const layout: Record<string, unknown> = {}
  const rest: Record<string, unknown> = {}
  for (const key of Object.keys(props)) {
    if (key in LAYOUT_PROP_KEYS) layout[key] = props[key as keyof P]
    else rest[key] = props[key as keyof P]
  }
  return [layout as LayoutProps, rest as Omit<P, keyof LayoutProps>]
}

export function resolveMargin(value: MarginValue | undefined, space: Metrics['space']): ViewStyle['marginTop'] {
  if (value === undefined) return undefined
  if (value === 'auto') return 'auto'
  return space(value)
}

/**
 * Resolves Layout props into a ViewStyle with the Theme's Metrics.
 * `metrics` must carry the radius token to use (`resolveMetrics({ radius: props.radius ?? theme.radius })`).
 * Padding and margin: specific side > axis > all.
 */
export function resolveLayoutStyle(
  props: LayoutProps,
  metrics: Metrics,
  resolveColor: (token: ThemeColor) => string,
): ViewStyle {
  const { m, mx, my, mt, mr, mb, ml, p, px, py, pt, pr, pb, pl } = props
  const sp = (token: SpaceToken | undefined) => (token !== undefined ? metrics.space(token) : undefined)

  return {
    paddingTop: sp(pt ?? py ?? p),
    paddingBottom: sp(pb ?? py ?? p),
    paddingLeft: sp(pl ?? px ?? p),
    paddingRight: sp(pr ?? px ?? p),
    marginTop: resolveMargin(mt ?? my ?? m, metrics.space),
    marginBottom: resolveMargin(mb ?? my ?? m, metrics.space),
    marginLeft: resolveMargin(ml ?? mx ?? m, metrics.space),
    marginRight: resolveMargin(mr ?? mx ?? m, metrics.space),
    width: props.width,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
    height: props.height,
    minHeight: props.minHeight,
    maxHeight: props.maxHeight,
    position: props.position,
    top: props.top,
    right: props.right,
    bottom: props.bottom,
    left: props.left,
    overflow: props.overflow,
    flexBasis: props.flexBasis ?? undefined,
    flexShrink: props.flexShrink,
    flexGrow: props.flexGrow,
    backgroundColor: props.bg ? resolveColor(props.bg) : undefined,
    borderRadius: props.radius ? metrics.radius(4, 'pill') : undefined,
  }
}
