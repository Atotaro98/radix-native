import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { fontSize, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
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

// ─── Constants ────────────────────────────────────────────────────────────────


// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline code. Can be nested inside `<Text>` for inline use.
 *
 * Note: In RN, `backgroundColor` on inline Text fills the tight text bounds
 * without padding/borderRadius support when nested. For block-level code with
 * full visual fidelity, wrap in a `<Box>` with explicit styling.
 */
export function Code({
  size = 3,
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
  const { scaling, fonts, radius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  // Radix: inline code renders at 0.95em relative to parent font.
  const resolvedSize = Math.round(fontSize[size] * scalingFactor * 0.95)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color helpers ───────────────────────────────────────────────────────────
  // When `color` prop is set, use that color's steps; otherwise use 'accent-*'
  const prefix = color ?? 'accent'

  const hc = highContrast

  const textColor = (() => {
    switch (variant) {
      case 'solid':
        return hc ? rc(prefix, 1) : rc(prefix, 'contrast')
      case 'soft':
      case 'outline':
      case 'ghost':
      default:
        return hc ? rc(prefix, 12) : rc(prefix, 'a11')
    }
  })()

  const backgroundColor = (() => {
    switch (variant) {
      case 'solid': return hc ? rc(prefix, 12) : rc(prefix, 9)
      case 'soft':  return rc(prefix, 'a3')
      default:      return undefined
    }
  })()

  const borderColor = variant === 'outline'
    ? rc(prefix, 'a8')
    : undefined

  // ─── Font family ─────────────────────────────────────────────────────────────
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const font = resolveFont(fonts.code ?? fonts[effectiveWeight] ?? fonts.regular, weight ? FONT_WEIGHT[weight] : undefined)

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Padding — Radix: 0.1em vertical, 0.25em horizontal. Ghost: no padding.
  const isGhost = variant === 'ghost'
  const paddingVertical   = isGhost ? 0 : Math.round(resolvedSize * 0.1)
  const paddingHorizontal = isGhost ? 0 : Math.round(resolvedSize * 0.25)

  // ─── Style ──────────────────────────────────────────────────────────────────
  const codeStyle: TextStyle = {
    fontSize:         resolvedSize,
    letterSpacing:    resolvedLetterSpacing,
    fontWeight:       font.fontWeight,
    fontFamily:       font.fontFamily,
    color:            textColor,
    backgroundColor,
    borderRadius:     getRadius(radius, 1),
    borderWidth:      borderColor ? 1 : undefined,
    borderColor,
    paddingVertical,
    paddingHorizontal,
    // Margins
    ...margins,
  }

  return (
    <RNText
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      maxFontSizeMultiplier={effectiveMaxFont}
      style={[codeStyle, style]}
      {...rest}
    />
  )
}
Code.displayName = 'Code'
