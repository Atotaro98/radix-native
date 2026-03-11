import React from 'react'
import { View } from 'react-native'
import type { ViewProps, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { SpaceToken, MarginToken } from '../../tokens/spacing'
import type { ThemeColor, RadiusToken } from '../../theme/theme.types'

// ─── Flex-specific value types ────────────────────────────────────────────────

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse'
export type FlexAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch'
export type FlexJustify = 'start' | 'center' | 'end' | 'between'
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse'

// ─── Alignment helpers ────────────────────────────────────────────────────────

const ALIGN_MAP: Record<FlexAlign, ViewStyle['alignItems']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  baseline: 'baseline',
  stretch: 'stretch',
}

const JUSTIFY_MAP: Record<FlexJustify, ViewStyle['justifyContent']> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface FlexProps extends ViewProps {
  // ─── Flex-specific ────────────────────────────────────────────────
  direction?: FlexDirection
  align?: FlexAlign
  justify?: FlexJustify
  wrap?: FlexWrap
  gap?: SpaceToken
  gapX?: SpaceToken
  gapY?: SpaceToken
  // ─── Padding ──────────────────────────────────────────────────────
  p?: SpaceToken
  px?: SpaceToken
  py?: SpaceToken
  pt?: SpaceToken
  pr?: SpaceToken
  pb?: SpaceToken
  pl?: SpaceToken
  // ─── Margin ───────────────────────────────────────────────────────
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
  // ─── Size ─────────────────────────────────────────────────────────
  width?: number | string
  minWidth?: number | string
  maxWidth?: number | string
  height?: number | string
  minHeight?: number | string
  maxHeight?: number | string
  // ─── Position ─────────────────────────────────────────────────────
  position?: 'relative' | 'absolute'
  top?: number | string
  right?: number | string
  bottom?: number | string
  left?: number | string
  // ─── Layout ───────────────────────────────────────────────────────
  overflow?: 'hidden' | 'visible' | 'scroll'
  flexBasis?: number | string
  flexShrink?: number
  flexGrow?: number
  // ─── RN-only theme props ──────────────────────────────────────────
  bg?: ThemeColor
  radius?: RadiusToken
}

/** Flexbox layout primitive. Renders as a View with display: flex (the RN default). */
export function Flex({
  direction, align, justify, wrap,
  gap, gapX, gapY,
  p, px, py, pt, pr, pb, pl,
  m, mx, my, mt, mr, mb, ml,
  width, minWidth, maxWidth,
  height, minHeight, maxHeight,
  position,
  top, right, bottom, left,
  overflow,
  flexBasis, flexShrink, flexGrow,
  bg,
  radius,
  style,
  ...rest
}: FlexProps) {
  const { scaling } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | SpaceToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const flexStyle: ViewStyle = {
    // Flex-specific
    flexDirection: direction,
    alignItems: align ? ALIGN_MAP[align] : undefined,
    justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
    flexWrap: wrap,
    rowGap: sp(gapY ?? gap),
    columnGap: sp(gapX ?? gap),
    // Padding — specific > axis > all
    paddingTop:    sp(pt ?? py ?? p),
    paddingBottom: sp(pb ?? py ?? p),
    paddingLeft:   sp(pl ?? px ?? p),
    paddingRight:  sp(pr ?? px ?? p),
    // Margin — specific > axis > all
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
    // Size
    width:     width     as ViewStyle['width'],
    minWidth:  minWidth  as ViewStyle['minWidth'],
    maxWidth:  maxWidth  as ViewStyle['maxWidth'],
    height:    height    as ViewStyle['height'],
    minHeight: minHeight as ViewStyle['minHeight'],
    maxHeight: maxHeight as ViewStyle['maxHeight'],
    // Position
    position, top: top as ViewStyle['top'], right: right as ViewStyle['right'],
    bottom: bottom as ViewStyle['bottom'], left: left as ViewStyle['left'],
    // Layout
    overflow: overflow as ViewStyle['overflow'],
    flexBasis: flexBasis as ViewStyle['flexBasis'],
    flexShrink, flexGrow,
    // Theme
    backgroundColor: bg ? rc(bg) : undefined,
    borderRadius: radius
      ? (radius === 'full' ? getFullRadius(radius) : getRadius(radius, 4))
      : undefined,
  }

  return <View style={[flexStyle, style]} {...rest} />
}
Flex.displayName = 'Flex'
