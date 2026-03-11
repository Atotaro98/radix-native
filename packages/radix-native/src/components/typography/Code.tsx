import React from 'react'
import { Text as RNText } from 'react-native'
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CodeVariant = 'solid' | 'soft' | 'outline' | 'ghost'

export interface CodeProps extends Omit<RNTextProps, 'style'> {
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

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_WEIGHT: Record<TextWeight, NonNullable<TextStyle['fontWeight']>> = {
  light:   '300',
  regular: '400',
  medium:  '500',
  bold:    '700',
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Inline code. Can be nested inside `<Text>` for inline use.
 * Can be nested inside `<Text>` for inline use.
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
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: CodeProps) {
  const { scaling, fonts, radius } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  // Rendered at 85% of the base size to visually match inline code conventions.
  const resolvedSize = Math.round(fontSize[size] * scalingFactor * 0.85)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color helpers ───────────────────────────────────────────────────────────
  // When `color` prop is set, use that color's steps; otherwise use 'accent-*'
  const prefix = color ?? 'accent'

  const textColor = (() => {
    switch (variant) {
      case 'solid':
        return rc(`${prefix}-contrast` as Parameters<typeof rc>[0])
      case 'soft':
      case 'outline':
      case 'ghost':
      default:
        return rc((highContrast ? `${prefix}-12` : `${prefix}-a11`) as Parameters<typeof rc>[0])
    }
  })()

  const backgroundColor = (() => {
    switch (variant) {
      case 'solid': return rc(`${prefix}-9` as Parameters<typeof rc>[0])
      case 'soft':  return rc(`${prefix}-a3` as Parameters<typeof rc>[0])
      default:      return undefined
    }
  })()

  const borderColor = variant === 'outline'
    ? rc(`${prefix}-a7` as Parameters<typeof rc>[0])
    : undefined

  // ─── Font family ─────────────────────────────────────────────────────────────
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const fontFamily = fonts.code ?? fonts[effectiveWeight] ?? fonts.regular

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Padding — proportional to font size (mirrors Radix's 0.1em / 0.35em) ───
  const paddingVertical   = Math.round(resolvedSize * 0.1)
  const paddingHorizontal = Math.round(resolvedSize * 0.35)

  // ─── Style ──────────────────────────────────────────────────────────────────
  const codeStyle: TextStyle = {
    fontSize:         resolvedSize,
    letterSpacing:    resolvedLetterSpacing,
    fontWeight:       weight ? FONT_WEIGHT[weight] : undefined,
    fontFamily,
    color:            textColor,
    backgroundColor,
    borderRadius:     getRadius(radius, 1),
    borderWidth:      borderColor ? 1 : undefined,
    borderColor,
    paddingVertical,
    paddingHorizontal,
    // Shrink to content width when used standalone (no-op when nested inline in Text).
    alignSelf:        variant !== 'ghost' ? 'flex-start' : undefined,
    // Margins
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }

  return (
    <RNText
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      style={[codeStyle, style]}
      {...rest}
    />
  )
}
Code.displayName = 'Code'
