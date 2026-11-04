import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
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
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // Same color logic as Text (a Heading is never nested, so never inherits).
  const textColor = color ? rc(color, highContrast ? 12 : 'a11') : rc('gray', 12)

  // Block text: ignores any surrounding text, uses the tighter heading line heights.
  const text = useTextStyle({
    role: 'heading',
    size,
    weight,
    lineHeight: 'heading',
    color: textColor,
    maxFontSizeMultiplier,
    truncate,
    wrap,
    margins,
  })

  const headingStyle = React.useMemo<TextStyle>(
    () => (align ? { ...text.style, textAlign: align } : text.style),
    [text.style, align],
  )
  const contextValue = React.useMemo(() => ({ fontSize: text.contextFontSize }), [text.contextFontSize])

  return (
    <TextContext.Provider value={contextValue}>
      <RNText accessibilityRole="header" {...text.textProps} {...rest} style={[headingStyle, style]}>
        {children}
      </RNText>
    </TextContext.Provider>
  )
}
Heading.displayName = 'Heading'
