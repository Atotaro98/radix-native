import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, headingLineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextAlign, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeadingSize = FontSizeToken

export interface HeadingProps {
  /** Heading size token (1–9). Default: 6 (24px). */
  size?: HeadingSize
  /** Font weight. Default: 'bold'. */
  weight?: TextWeight
  /** Text alignment. */
  align?: TextAlign
  /** Truncates text with an ellipsis when it overflows its container. */
  truncate?: boolean
  /**
   * Controls text wrapping.
   * 'nowrap' → single line with clip. 'pretty'/'balance' → not supported in React Native, no-op.
   */
  wrap?: TextWrap
  /**
   * Text color from the theme palette.
   * No color → gray-12; color → {color}-a11; color + highContrast → {color}-12.
   */
  color?: AccentColor
  /** Increases color contrast when `color` is set (a11 → solid 12). */
  highContrast?: boolean
  // ─── Margin props ──────────────────────────────────────────────────────────
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
  style?: StyleProp<TextStyle>
  children?: React.ReactNode
  accessibilityLabel?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_WEIGHT: Record<TextWeight, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Heading({
  size = 6,
  weight = 'bold',
  align,
  truncate,
  wrap,
  color,
  highContrast,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: HeadingProps) {
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Heading uses the same font size scale as Text but has its own tighter
  // line heights. Letter spacing values are identical to Text.
  const scalingFactor = scalingMap[scaling]
  const resolvedSize          = Math.round(fontSize[size] * scalingFactor)
  const resolvedLineHeight    = Math.round(headingLineHeight[size] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Same logic as Text.
  const textColor = color
    ? rc(highContrast ? `${color}-12` : `${color}-a11`)
    : rc('gray-12')

  // ─── Font family ─────────────────────────────────────────────────────────────
  // Heading prefers fonts.heading, then the specific weight's font, then bold, then regular.
  const effectiveWeight: TextWeight = weight ?? 'bold'
  const fontFamily = fonts.heading ?? fonts[effectiveWeight] ?? fonts.bold ?? fonts.regular

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Style ──────────────────────────────────────────────────────────────────
  const headingStyle: TextStyle = {
    fontSize:               resolvedSize,
    lineHeight:             resolvedLineHeight,
    letterSpacing:          resolvedLetterSpacing,
    color:                  textColor,
    textAlign:              align,
    fontWeight:             FONT_WEIGHT[weight],
    fontFamily,
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    // Margins
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }

  return (
    <RNText
      accessibilityRole="header"
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[headingStyle, style]}
      {...rest}
    >
      {children}
    </RNText>
  )
}
Heading.displayName = 'Heading'
