import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { FontSizeToken } from '../../tokens/typography'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeTextProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextSize = FontSizeToken
export type TextWeight = 'light' | 'regular' | 'medium' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'
/** 'pretty' and 'balance' are not supported in React Native and have no effect. */
export type TextWrap = 'wrap' | 'nowrap' | 'pretty' | 'balance'

export interface TextProps extends NativeTextProps, MarginProps {
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
  style?: StyleProp<TextStyle>
}

// ─── Constants ────────────────────────────────────────────────────────────────


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
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

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
    ? rc(color, highContrast ? 12 : 'a11')
    : rc('gray', 12)

  // ─── Font family ─────────────────────────────────────────────────────────────
  // Each weight maps to its own fontFamily — in RN, fontWeight alone doesn't
  // load a different font file; the fontFamily must be registered per weight.
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const font = resolveFont(fonts[effectiveWeight] ?? fonts.regular, weight ? FONT_WEIGHT[weight] : undefined)

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
    fontWeight:    font.fontWeight,
    fontFamily:    font.fontFamily,
    flexShrink:    1,
    ...margins,
  }), [resolvedSize, resolvedLineHeight, resolvedLetterSpacing, textColor, align, font.fontWeight, font.fontFamily, margins])

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
