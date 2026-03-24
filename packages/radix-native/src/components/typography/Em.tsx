import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMargins } from '../../hooks/useMargins'
import type { TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmProps extends NativeTextProps, MarginProps {
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Inline italic text. Can be nested inside `<Text>` for inline use. */
export function Em({
  truncate,
  wrap,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: EmProps) {
  const { maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  const emStyle: TextStyle = {
    fontStyle: 'italic',
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    ...margins,
  }

  return (
    <RNText
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      maxFontSizeMultiplier={effectiveMaxFont}
      style={[emStyle, style]}
      {...rest}
    />
  )
}
Em.displayName = 'Em'
