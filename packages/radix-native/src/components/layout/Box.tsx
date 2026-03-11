import React from 'react'
import { View } from 'react-native'
import type { ViewProps, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { SpaceToken, MarginToken } from '../../tokens/spacing'
import type { ThemeColor, RadiusToken } from '../../theme/theme.types'

export interface BoxProps extends ViewProps {
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
  // ─── RN-only theme props ───────────────────────────────────────────
  /** Background color from the theme token system */
  bg?: ThemeColor
  /** Border radius using the theme radius token (level 4 — card-sized) */
  radius?: RadiusToken
}

/** Fundamental layout primitive backed by a View. */
export function Box({
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
}: BoxProps) {
  const { scaling } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | SpaceToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const boxStyle: ViewStyle = {
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

  return <View style={[boxStyle, style]} {...rest} />
}
Box.displayName = 'Box'
