import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { resolveTypography, getTextWrapProps } from '../../utils/typography'
import { headingLineHeight } from '../../tokens/typography'
import { TextContext } from './TextContext'
import type { FontSizeToken } from '../../tokens/typography'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeTextProps } from '../../types/nativeProps'
import type { TextWeight, TextAlign, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export type HeadingSize = FontSizeToken

export interface HeadingProps extends NativeTextProps, MarginProps {
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
  style?: StyleProp<TextStyle>
}

// ─── Constants ────────────────────────────────────────────────────────────────


// ─── Component ────────────────────────────────────────────────────────────────

export function Heading({
  size = 6,
  weight = 'bold',
  align,
  truncate,
  wrap,
  color,
  highContrast,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: HeadingProps) {
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Heading uses the same font size scale as Text but has its own tighter
  // line heights. Letter spacing values are identical to Text.
  const typography = React.useMemo(() => resolveTypography(size, scaling, headingLineHeight), [size, scaling])

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Same logic as Text.
  const textColor = color
    ? rc(color, highContrast ? 12 : 'a11')
    : rc('gray', 12)

  // ─── Font family ─────────────────────────────────────────────────────────────
  // Heading prefers fonts.heading, then the specific weight's font, then bold, then regular.
  const font = resolveFont(
    fonts.heading ?? fonts[weight] ?? fonts.bold ?? fonts.regular,
    FONT_WEIGHT[weight],
  )

  // ─── Wrapping / truncation ──────────────────────────────────────────────────

  // ─── Style ──────────────────────────────────────────────────────────────────
  const headingStyle = React.useMemo<TextStyle>(() => ({
    ...typography,
    color:                  textColor,
    textAlign:              align,
    fontWeight:             font.fontWeight,
    fontFamily:             font.fontFamily,
    flexShrink:    1,
    ...margins,
  }), [typography, textColor, align, font.fontWeight, font.fontFamily, margins])

  return (
    <TextContext.Provider value={{ fontSize: typography.fontSize }}>
      <RNText
        accessibilityRole="header"
        {...getTextWrapProps(truncate, wrap)}
        maxFontSizeMultiplier={effectiveMaxFont}
        {...rest}
        style={[headingStyle, style]}
      >
        {children}
      </RNText>
    </TextContext.Provider>
  )
}
Heading.displayName = 'Heading'
