import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrongProps extends NativeTextProps, MarginProps {
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline bold text. Can be nested inside `<Text>` for inline use.
 * Face: `fonts.strong`, else `fonts.bold`, else `fontWeight: '700'` on the system font
 * (Radix `--strong-font-*`).
 */
export function Strong({
  truncate,
  wrap,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: StrongProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const text = useTextStyle({ inline: true, role: 'strong', maxFontSizeMultiplier, truncate, wrap, margins })

  return (
    <RNText {...text.textProps} {...rest} style={[text.style, style]} />
  )
}
Strong.displayName = 'Strong'
