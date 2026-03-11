import React from 'react'
import { Text as RNText } from 'react-native'
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native'
import { resolveSpace } from '../../utils/resolveSpace'
import { useThemeContext } from '../../hooks/useThemeContext'
import type { MarginToken } from '../../tokens/spacing'
import type { TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StrongProps extends Omit<RNTextProps, 'style'> {
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
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline bold text. Can be nested inside `<Text>` for inline use.
 * Can be nested inside `<Text>` for inline use.
 * Uses `fonts.bold` when provided, otherwise `fontWeight: '700'`.
 */
export function Strong({
  truncate,
  wrap,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: StrongProps) {
  const { scaling, fonts } = useThemeContext()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  const strongStyle: TextStyle = {
    fontWeight: '700',
    fontFamily: fonts.bold ?? fonts.regular,
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }

  return (
    <RNText
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[strongStyle, style]}
      {...rest}
    />
  )
}
Strong.displayName = 'Strong'
