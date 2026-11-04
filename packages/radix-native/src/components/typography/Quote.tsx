import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QuoteProps extends NativeTextProps, MarginProps {
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline quoted text. Wraps children with typographic curly quotes (" ").
 * Can be nested inside `<Text>` for inline use.
 * Radix `--quote-*`: serif italic at 1.18× the surrounding size, −0.025em tracking.
 * Face: `fonts.quote`, else the system serif.
 */
export function Quote({
  truncate,
  wrap,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: QuoteProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const text = useTextStyle({ inline: true, role: 'quote', maxFontSizeMultiplier, truncate, wrap, margins })

  return (
    <RNText {...text.textProps} {...rest} style={[text.style, style]}>
      {'\u201c'}{children}{'\u201d'}
    </RNText>
  )
}
Quote.displayName = 'Quote'
