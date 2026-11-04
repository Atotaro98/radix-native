import React from 'react'
import { View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { TextContext } from './TextContext'
import { space } from '../../tokens/spacing'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlockquoteProps extends NativeViewProps, MarginProps {
  /** Text size token (1–9). Default: 3 (16px). */
  size?: FontSizeToken
  /** Font weight. Default: 'regular'. */
  weight?: TextWeight
  /** Text color. When not set: uses gray-12. */
  color?: AccentColor
  /** Increases color contrast when `color` is set (a11 → 12). */
  highContrast?: boolean
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Blockquote({
  size = 3,
  weight = 'regular',
  color,
  highContrast,
  truncate,
  wrap,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: BlockquoteProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Color ──────────────────────────────────────────────────────────────────
  const colors = useVariantColors('blockquote', { color, highContrast })
  const borderColor = colors.decoration
  const textColor = colors.text

  // Block text: ignores any surrounding text. Margins go on the container.
  const text = useTextStyle({ size, weight, color: textColor, maxFontSizeMultiplier, truncate, wrap })
  const resolvedSize = text.contextFontSize
  const { scaling: scalingFactor } = useMetrics()

  // ─── Border & padding (match Radix CSS: dynamic based on font size) ────────
  // Space tokens are scaled in Radix: --space-N: calc(Npx * var(--scaling))
  const s1 = space[1] * scalingFactor
  const s3 = space[3] * scalingFactor
  const s5 = space[5] * scalingFactor
  // Radix: border-left: max(var(--space-1), 0.25em) solid var(--accent-a6)
  const borderWidth = Math.max(s1, resolvedSize * 0.25)
  // Radix: padding-left: min(var(--space-5), max(var(--space-3), 0.5em))
  const paddingLeft = Math.min(s5, Math.max(s3, resolvedSize * 0.5))

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const containerStyle: ViewStyle = {
    borderLeftWidth: borderWidth,
    borderLeftColor: borderColor,
    paddingLeft,
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    ...margins,
  }

  return (
    <View {...rest} style={[containerStyle, style]}>
      <TextContext.Provider value={{ fontSize: resolvedSize }}>
        <RNText {...text.textProps} style={text.style}>
          {children}
        </RNText>
      </TextContext.Provider>
    </View>
  )
}
Blockquote.displayName = 'Blockquote'
