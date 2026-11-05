import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { TextRole } from '../../utils/textStyle'
import type { TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

export interface InlineTextProps extends NativeTextProps, MarginProps {
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  style?: StyleProp<TextStyle>
}

/**
 * Internal: builds an inline typography module that only adds its Text role
 * (Em, Strong, Quote). Nested text inside it inherits its size, as in Radix.
 */
export function createInlineText(
  role: TextRole,
  displayName: string,
  renderChildren: (children: React.ReactNode) => React.ReactNode = (children) => children,
) {
  function InlineText({
    truncate,
    wrap,
    maxFontSizeMultiplier,
    m, mx, my, mt, mr, mb, ml,
    style,
    children,
    ...rest
  }: InlineTextProps) {
    const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
    const text = useTextStyle({ inline: true, role, maxFontSizeMultiplier, truncate, wrap, margins })
    return text.provide(
      <RNText {...text.textProps} {...rest} style={[text.style, style]}>
        {renderChildren(children)}
      </RNText>,
    )
  }
  InlineText.displayName = displayName
  return InlineText
}
