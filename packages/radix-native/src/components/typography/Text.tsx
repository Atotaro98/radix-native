import React from 'react'
import { Text as RNText } from 'react-native'
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { FontSizeToken } from '../../tokens/typography'
import type { SpaceToken, MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextSize = FontSizeToken
export type TextWeight = 'light' | 'regular' | 'medium' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'
/** 'pretty' and 'balance' are not supported in React Native and have no effect. */
export type TextWrap = 'wrap' | 'nowrap' | 'pretty' | 'balance'

export interface TextProps extends Omit<RNTextProps, 'style'> {
  /** Text size token (1–9). Default: 3 (16px). */
  size?: TextSize
  /** Font weight. Each weight maps to its own fontFamily when configured in ThemeFonts. */
  weight?: TextWeight
  /** Text alignment. */
  align?: TextAlign
  /** Truncates text with an ellipsis when it overflows its container. */
  truncate?: boolean
  /**
   * Controls text wrapping.
   * 'nowrap' → single line with clip (no ellipsis).
   * 'pretty' / 'balance' → not supported in React Native, no-op.
   */
  wrap?: TextWrap
  /**
   * Text color from the theme palette.
   * When set: uses alpha step a11 (accessible foreground).
   * When not set: uses gray-12 (standard body text color).
   */
  color?: AccentColor
  /**
   * Increases color contrast when `color` is set: switches from a11 → solid 12.
   * Has no effect when `color` is not set (gray-12 is already maximum contrast).
   */
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
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_WEIGHT: Record<TextWeight, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Text({
  size = 3,
  weight,
  align,
  truncate,
  wrap,
  color,
  highContrast,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: TextProps) {
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const resolvedSize        = Math.round(fontSize[size] * scalingFactor)
  const resolvedLineHeight  = Math.round(lineHeight[size] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color ──────────────────────────────────────────────────────────────────
  //   no color prop        → gray-12        (standard body text)
  //   color prop           → {color}-a11    (alpha step 11 — accessible foreground)
  //   color + highContrast → {color}-12     (solid step 12 — maximum contrast)
  const textColor = color
    ? rc(highContrast ? `${color}-12` : `${color}-a11`)
    : rc('gray-12')

  // ─── Font family ─────────────────────────────────────────────────────────────
  // Each weight maps to its own fontFamily — in RN, fontWeight alone doesn't
  // load a different font file; the fontFamily must be registered per weight.
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const fontFamily = fonts[effectiveWeight] ?? fonts.regular

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  // truncate takes precedence over wrap
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Style ──────────────────────────────────────────────────────────────────
  const textStyle = React.useMemo<TextStyle>(() => ({
    fontSize:      resolvedSize,
    lineHeight:    resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color:         textColor,
    textAlign:     align,
    fontWeight:    weight ? FONT_WEIGHT[weight] : undefined,
    fontFamily,
    flexShrink:    1,
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }), [resolvedSize, resolvedLineHeight, resolvedLetterSpacing, textColor, align, weight, fontFamily, mt, my, m, mb, ml, mx, mr, scaling])

  return (
    <RNText
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[textStyle, style]}
      {...rest}
    />
  )
}
Text.displayName = 'Text'
