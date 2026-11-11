import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import { useInsetContext, type InsetValues } from './InsetContext'

// ─── Types ────────────────────────────────────────────────────────────────────

export type InsetSide = 'all' | 'x' | 'y' | 'top' | 'bottom' | 'left' | 'right'
export type InsetClip = 'border-box' | 'padding-box'
/** `'current'` = the container's own padding (Radix `rt-r-p-inset`), `'0'` = none. */
export type InsetPadding = 'current' | '0'

export interface InsetProps extends NativeViewProps, MarginProps {
  /** Which sides bleed to the container's edge. Default: 'all'. */
  side?: InsetSide
  /** Where the content is clipped. Default: 'border-box'. */
  clip?: InsetClip
  p?: InsetPadding
  px?: InsetPadding
  py?: InsetPadding
  pt?: InsetPadding
  pr?: InsetPadding
  pb?: InsetPadding
  pl?: InsetPadding
  style?: StyleProp<ViewStyle>
}

type Edge = 'top' | 'right' | 'bottom' | 'left'
type Corner = 'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft'

// inset.css .rt-Inset:where(.rt-r-side-*): the sides pulled out and the corners rounded
const SIDES: Record<InsetSide, { pull: Edge[]; round: Corner[] }> = {
  all: { pull: ['top', 'right', 'bottom', 'left'], round: ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] },
  x: { pull: ['left', 'right'], round: [] },
  y: { pull: ['top', 'bottom'], round: [] },
  top: { pull: ['top', 'left', 'right'], round: ['topLeft', 'topRight'] },
  bottom: { pull: ['bottom', 'left', 'right'], round: ['bottomLeft', 'bottomRight'] },
  left: { pull: ['left', 'top', 'bottom'], round: ['topLeft', 'bottomLeft'] },
  right: { pull: ['right', 'top', 'bottom'], round: ['topRight', 'bottomRight'] },
}

const MARGIN_KEY = { top: 'marginTop', right: 'marginRight', bottom: 'marginBottom', left: 'marginLeft' } as const
const PADDING_KEY = { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' } as const
const RADIUS_KEY = {
  topLeft: 'borderTopLeftRadius',
  topRight: 'borderTopRightRadius',
  bottomRight: 'borderBottomRightRadius',
  bottomLeft: 'borderBottomLeftRadius',
} as const

interface ResolveInput {
  side: InsetSide
  clip: InsetClip
  margins: ViewStyle
  padding: Partial<Record<Edge, InsetPadding>>
  inset: InsetValues
}

/**
 * Pure: Radix `inset.css` resolved against the container's Inset values.
 * - `border-box`: pulled by `--inset-padding-*`, corners `--inset-border-radius − --inset-border-width`.
 * - `padding-box`: pulled by `--inset-padding-* + --inset-border-width`, corners `--inset-border-radius`.
 * A pulled side's margin is `--margin-* − pull` (the consumer's margin still applies).
 * `p*="current"` reads the raw `--inset-padding-*` (`padding.css` `.rt-r-p*-inset`).
 */
export function resolveInsetStyle({ side, clip, margins, padding, inset }: ResolveInput): ViewStyle {
  const extra = clip === 'padding-box' ? inset.borderWidth : 0
  const radius = clip === 'padding-box' ? inset.borderRadius : Math.max(0, inset.borderRadius - inset.borderWidth)
  const { pull, round } = SIDES[side]
  const style: { -readonly [K in keyof ViewStyle]: ViewStyle[K] } = { overflow: 'hidden' }

  for (const edge of ['top', 'right', 'bottom', 'left'] as const) {
    const m = margins[MARGIN_KEY[edge]]
    if (pull.includes(edge) && m !== 'auto') {
      style[MARGIN_KEY[edge]] = (typeof m === 'number' ? m : 0) - (inset.padding[edge] + extra)
    } else if (m !== undefined) {
      style[MARGIN_KEY[edge]] = m
    }
    const p = padding[edge]
    if (p !== undefined) style[PADDING_KEY[edge]] = p === 'current' ? inset.padding[edge] : 0
  }
  for (const corner of ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const) {
    style[RADIUS_KEY[corner]] = round.includes(corner) ? radius : 0
  }
  return style
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Bleeds its content to the edge of the surrounding Card (and, later, Dialog,
 * Popover and HoverCard content), like Radix Themes `Inset`. Outside such a
 * container it only clips its content.
 */
export function Inset({
  side = 'all',
  clip = 'border-box',
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: InsetProps) {
  const inset = useInsetContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const top = pt ?? py ?? p
  const right = pr ?? px ?? p
  const bottom = pb ?? py ?? p
  const left = pl ?? px ?? p

  const insetStyle = useMemo(
    () => resolveInsetStyle({ side, clip, margins, padding: { top, right, bottom, left }, inset }),
    [side, clip, margins, top, right, bottom, left, inset],
  )

  return (
    <View style={[insetStyle, style]} {...rest}>
      {children}
    </View>
  )
}
Inset.displayName = 'Inset'
