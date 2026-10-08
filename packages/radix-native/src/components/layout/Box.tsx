import React from 'react'
import { View } from 'react-native'
import type { ViewStyle, DimensionValue } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveSpace } from '../../utils/resolveSpace'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'
import type { ThemeColor, RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

export interface BoxProps extends NativeViewProps, MarginProps {
  // ─── Padding ──────────────────────────────────────────────────────
  p?: SpaceToken
  px?: SpaceToken
  py?: SpaceToken
  pt?: SpaceToken
  pr?: SpaceToken
  pb?: SpaceToken
  pl?: SpaceToken
  // ─── Size ─────────────────────────────────────────────────────────
  width?: DimensionValue
  minWidth?: DimensionValue
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  maxHeight?: DimensionValue
  // ─── Position ─────────────────────────────────────────────────────
  position?: 'relative' | 'absolute'
  top?: DimensionValue
  right?: DimensionValue
  bottom?: DimensionValue
  left?: DimensionValue
  // ─── Layout ───────────────────────────────────────────────────────
  overflow?: 'hidden' | 'visible' | 'scroll'
  flexBasis?: DimensionValue
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
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const sp = (token: SpaceToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const boxStyle: ViewStyle = {
    // Padding — specific > axis > all
    paddingTop:    sp(pt ?? py ?? p),
    paddingBottom: sp(pb ?? py ?? p),
    paddingLeft:   sp(pl ?? px ?? p),
    paddingRight:  sp(pr ?? px ?? p),
    // Margin
    ...margins,
    // Size
    width:     width,
    minWidth:  minWidth,
    maxWidth:  maxWidth,
    height:    height,
    minHeight: minHeight,
    maxHeight: maxHeight,
    // Position
    position, top: top, right: right,
    bottom: bottom, left: left,
    // Layout
    overflow: overflow as ViewStyle['overflow'],
    flexBasis: flexBasis,
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
