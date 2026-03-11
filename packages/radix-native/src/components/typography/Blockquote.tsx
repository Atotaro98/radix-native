import React from 'react'
import { View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize as fontSizeMap, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { space } from '../../tokens/spacing'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockquoteProps {
  /** Text size token (1–9). Default: 3 (16px). */
  size?: FontSizeToken
  /** Font weight. Default: 'regular'. */
  weight?: TextWeight
  /** Text color. When not set: uses gray-12. */
  color?: AccentColor
  /** Increases color contrast when `color` is set (a11 → 12). */
  highContrast?: boolean
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  // ─── Margin props ──────────────────────────────────────────────────────────
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_WEIGHT: Record<TextWeight, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Blockquote({
  size = 3,
  weight = 'regular',
  color,
  highContrast,
  truncate,
  wrap,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
}: BlockquoteProps) {
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const resolvedSize        = Math.round(fontSizeMap[size] * scalingFactor)
  const resolvedLineHeight  = Math.round(lineHeight[size] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Radix scopes --accent-a6 per-component via data-accent-color.
  // In RN we resolve the border color from the explicit color prop (or accent fallback).
  const borderColor = rc(color ? `${color}-a6` : 'accent-a6')
  const textColor = color
    ? rc(highContrast ? `${color}-12` : `${color}-a11`)
    : rc('gray-12')

  // ─── Font family ─────────────────────────────────────────────────────────────
  const fontFamily = fonts[weight] ?? fonts.regular

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Border & padding (match Radix CSS: dynamic based on font size) ────────
  // Space tokens are scaled in Radix: --space-N: calc(Npx * var(--scaling))
  const s1 = space[1] * scalingFactor
  const s3 = space[3] * scalingFactor
  const s5 = space[5] * scalingFactor
  // Radix: border-left: max(var(--space-1), 0.25em) solid var(--accent-a6)
  const borderWidth = Math.max(s1, resolvedSize * 0.25)
  // Radix: padding-left: min(var(--space-5), max(var(--space-3), 0.5em))
  const paddingLeft = Math.min(s5, Math.max(s3, resolvedSize * 0.5))

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const containerStyle: ViewStyle = {
    borderLeftWidth: borderWidth,
    borderLeftColor: borderColor,
    paddingLeft,
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    // Margins
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }

  const textStyle: TextStyle = {
    fontSize:      resolvedSize,
    lineHeight:    resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    fontWeight:    FONT_WEIGHT[weight],
    fontFamily,
    color:         textColor,
  }

  return (
    <View style={[containerStyle, style]}>
      <RNText
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        style={textStyle}
      >
        {children}
      </RNText>
    </View>
  )
}
Blockquote.displayName = 'Blockquote'
