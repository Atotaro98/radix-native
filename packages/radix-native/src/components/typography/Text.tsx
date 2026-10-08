import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { resolveTypography, getTextWrapProps } from '../../utils/typography'
import type { FontSizeToken } from '../../tokens/typography'
import { TextContext, useParentText } from './TextContext'
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
  /**
   * Text size token (1–9). Default: 3 (16px) — or, when nested inside another
   * text component, inherits the parent size (like Radix on the web).
   */
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
   * When not set: uses gray-12 (standard body text color), or inherits the
   * parent color when nested inside another text component.
   */
  color?: AccentColor
  /**
   * Increases color contrast when `color` is set: switches from a11 → solid 12.
   * Has no effect when `color` is not set (gray-12 is already maximum contrast).
   */
  highContrast?: boolean
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Text({
  size,
  weight,
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
}: TextProps) {
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const parent = useParentText()
  const isNested = parent !== null

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Nested without an explicit size → let RN text inheritance do its job.
  const typography = React.useMemo(
    () => (size !== undefined || !isNested ? resolveTypography(size ?? 3, scaling) : undefined),
    [size, isNested, scaling],
  )
  const contextFontSize = typography?.fontSize ?? parent?.fontSize ?? 0

  // ─── Color ──────────────────────────────────────────────────────────────────
  //   color + highContrast → {color}-12     (solid step 12 — maximum contrast)
  //   color prop           → {color}-a11    (alpha step 11 — accessible foreground)
  //   no color, nested     → inherited from the parent text
  //   no color             → gray-12        (standard body text)
  const textColor = color
    ? rc(color, highContrast ? 12 : 'a11')
    : isNested ? undefined : rc('gray', 12)

  // ─── Font family ─────────────────────────────────────────────────────────────
  // Each weight maps to its own fontFamily — in RN, fontWeight alone doesn't
  // load a different font file; the fontFamily must be registered per weight.
  const font = weight
    ? resolveFont(fonts[weight] ?? fonts.regular, FONT_WEIGHT[weight])
    : isNested ? undefined : resolveFont(fonts.regular, undefined)

  // ─── Style ──────────────────────────────────────────────────────────────────
  const textStyle = React.useMemo<TextStyle>(() => ({
    ...typography,
    color:      textColor,
    textAlign:  align,
    fontWeight: font?.fontWeight,
    fontFamily: font?.fontFamily,
    // Layout props are meaningless on nested (inline) text
    ...(isNested ? null : { flexShrink: 1, ...margins }),
  }), [typography, textColor, align, font?.fontWeight, font?.fontFamily, isNested, margins])

  const contextValue = React.useMemo(() => ({ fontSize: contextFontSize }), [contextFontSize])

  return (
    <TextContext.Provider value={contextValue}>
      <RNText
        {...getTextWrapProps(truncate, wrap)}
        maxFontSizeMultiplier={effectiveMaxFont}
        {...rest}
        style={[textStyle, style]}
      >
        {children}
      </RNText>
    </TextContext.Provider>
  )
}
Text.displayName = 'Text'
