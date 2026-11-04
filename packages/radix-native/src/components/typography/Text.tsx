import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { WeightIntent, TextWrapMode } from '../../utils/textStyle'
import type { FontSizeToken } from '../../tokens/typography'
import { TextContext, useParentText } from './TextContext'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeTextProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextSize = FontSizeToken
export type TextWeight = WeightIntent
export type TextAlign = 'left' | 'center' | 'right'
/** 'pretty' and 'balance' are not supported in React Native and have no effect. */
export type TextWrap = TextWrapMode

export interface TextProps extends NativeTextProps, MarginProps {
  /**
   * Text size token (1–9). Default: 3 (16px) — or, when nested inside another
   * text component, inherits the parent size (like Radix on the web).
   */
  size?: TextSize
  /**
   * Font weight. Each weight maps to its own fontFamily when configured in ThemeFonts;
   * a weight with no configured face renders with `fonts.regular` and warns in development.
   */
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
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const isNested = useParentText() !== null

  // ─── Color ──────────────────────────────────────────────────────────────────
  //   color + highContrast → {color}-12     (solid step 12 — maximum contrast)
  //   color prop           → {color}-a11    (alpha step 11 — accessible foreground)
  //   no color, nested     → inherited from the parent text
  //   no color             → gray-12        (standard body text)
  const textColor = color
    ? rc(color, highContrast ? 12 : 'a11')
    : isNested ? undefined : rc('gray', 12)

  const text = useTextStyle({
    inline: true,
    size,
    weight,
    color: textColor,
    maxFontSizeMultiplier,
    truncate,
    wrap,
    margins,
  })

  const textStyle = React.useMemo<TextStyle>(
    () => (align ? { ...text.style, textAlign: align } : text.style),
    [text.style, align],
  )
  const contextValue = React.useMemo(() => ({ fontSize: text.contextFontSize }), [text.contextFontSize])

  return (
    <TextContext.Provider value={contextValue}>
      <RNText {...text.textProps} {...rest} style={[textStyle, style]}>
        {children}
      </RNText>
    </TextContext.Provider>
  )
}
Text.displayName = 'Text'
