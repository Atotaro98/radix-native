import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { getTextWrapProps } from '../../utils/typography'
import { SYSTEM_MONOSPACE } from '../../utils/fonts'
import { TextContext, useParentText } from './TextContext'
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
  const { scaling, fonts, radius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Radix: inline code renders at 0.95em of the surrounding text. With an
  // explicit size (or when standalone, default 3) the token is used instead.
  const parent = useParentText()
  const scalingFactor = scalingMap[scaling]
  const resolvedSize = size === undefined && parent
    ? Math.round(parent.fontSize * 0.95)
    : Math.round(fontSize[size ?? 3] * scalingFactor * 0.95)
  const resolvedLetterSpacing = letterSpacingEm[size ?? 3] * resolvedSize

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
  // Code always uses a monospace face: `fonts.code`, else the system monospace
  const font = resolveFont(fonts.code ?? SYSTEM_MONOSPACE, FONT_WEIGHT[effectiveWeight])

  // ─── Wrapping / truncation ──────────────────────────────────────────────────

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
    <TextContext.Provider value={{ fontSize: resolvedSize }}>
      <RNText
        {...getTextWrapProps(truncate, wrap)}
        maxFontSizeMultiplier={effectiveMaxFont}
        {...rest}
        style={[codeStyle, style]}
      />
    </TextContext.Provider>
  )
}
Code.displayName = 'Code'
