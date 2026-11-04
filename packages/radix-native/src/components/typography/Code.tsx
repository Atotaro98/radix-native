import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { TextContext, useParentText } from './TextContext'
import type { FontSizeToken } from '../../tokens/typography'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CodeVariant = 'solid' | 'soft' | 'outline' | 'ghost'

export interface CodeProps extends NativeTextProps, MarginProps {
  /** Text size token (1–9). Default: inherits context — set to 3 (16px) if no parent. */
  size?: FontSizeToken
  /**
   * Visual style.
   * 'soft'    → light accent background, accent-a11 text (default)
   * 'solid'   → filled accent-9 background, contrast text
   * 'outline' → transparent background with accent border
   * 'ghost'   → no background, no border
   */
  variant?: CodeVariant
  weight?: TextWeight
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast (a11 → 12 for text in soft/outline/ghost). */
  highContrast?: boolean
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  style?: StyleProp<TextStyle>
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline code. Can be nested inside `<Text>` for inline use.
 *
 * Note: In RN, `backgroundColor` on inline Text fills the tight text bounds
 * without padding/borderRadius support when nested. For block-level code with
 * full visual fidelity, wrap in a `<Box>` with explicit styling.
 */
export function Code({
  size,
  variant = 'soft',
  weight,
  color,
  highContrast,
  truncate,
  wrap,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: CodeProps) {
  const metrics = useMetrics()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Colors ─────────────────────────────────────────────────────────────────
  const colors = useVariantColors('code', { variant, color, highContrast })
  // Ghost without a color inherits: from the parent text, else body text gray-12.
  const isNested = useParentText() !== null
  const fallbackColor = useVariantColors('text', {}).text
  const textColor = colors.text ?? (isNested ? undefined : fallbackColor)
  const backgroundColor = colors.bg
  const borderColor = colors.border

  // ─── Text style ──────────────────────────────────────────────────────────────
  // Radix `--code-*`: 0.95em of the surrounding text (or of the size token when
  // set / standalone), monospace face (`fonts.code`, else system monospace).
  const text = useTextStyle({
    inline: true,
    role: 'code',
    size,
    weight,
    lineHeight: 'none',
    color: textColor,
    maxFontSizeMultiplier,
    truncate,
    wrap,
    margins,
  })
  const resolvedSize = text.contextFontSize

  // ─── Padding — Radix: 0.1em vertical, 0.25em horizontal. Ghost: no padding.
  const isGhost = variant === 'ghost'
  const paddingVertical   = isGhost ? 0 : Math.round(resolvedSize * 0.1)
  const paddingHorizontal = isGhost ? 0 : Math.round(resolvedSize * 0.25)

  // ─── Style ──────────────────────────────────────────────────────────────────
  const codeStyle: TextStyle = {
    ...text.style,
    backgroundColor,
    // Radix .rt-Code: border-radius: calc((0.5px + 0.2em) * var(--radius-factor))
    borderRadius:     (0.5 + 0.2 * resolvedSize) * metrics.radiusFactor,
    borderWidth:      borderColor ? 1 : undefined,
    borderColor,
    paddingVertical,
    paddingHorizontal,
  }

  return (
    <TextContext.Provider value={{ fontSize: resolvedSize }}>
      <RNText
        {...text.textProps}
        {...rest}
        style={[codeStyle, style]}
      />
    </TextContext.Provider>
  )
}
Code.displayName = 'Code'
