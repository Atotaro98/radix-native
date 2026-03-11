import React from 'react'
import { Text as RNText, Linking } from 'react-native'
import type { TextProps as RNTextProps, StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import type { TextWeight, TextWrap } from './Text'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Controls underline visibility.
 * 'auto'   → no underline by default (Radix shows on hover; RN has no hover).
 *             highContrast forces underline visible (matches Radix .rt-high-contrast).
 * 'always' → underline always visible
 * 'hover'  → no underline (hover never fires in RN)
 * 'none'   → no underline
 */
export type LinkUnderline = 'auto' | 'always' | 'hover' | 'none'

export interface LinkProps extends Omit<RNTextProps, 'style'> {
  /** Text size token (1–9). Default: inherits — set to 3 (16px) if no parent. */
  size?: FontSizeToken
  weight?: TextWeight
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  /**
   * Underline visibility. Default: 'auto'.
   * 'auto' → no underline, unless highContrast is set.
   * 'hover' → no underline (hover does not exist on mobile).
   */
  underline?: LinkUnderline
  /** Accent color for the link. Default: theme accent (accent-11). */
  color?: AccentColor
  /** Switches color to step 12 and forces underline visible in 'auto' mode. */
  highContrast?: boolean
  /**
   * RN-only: URL opened via Linking.openURL when pressed.
   * If both `href` and `onPress` are provided, `onPress` takes precedence.
   */
  href?: string
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

export function Link({
  size = 3,
  weight,
  truncate,
  wrap,
  underline = 'auto',
  color,
  highContrast,
  href,
  onPress,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: LinkProps) {
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const resolvedSize        = Math.round(fontSize[size] * scalingFactor)
  const resolvedLineHeight  = Math.round(lineHeight[size] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Radix: accent links use a11 (vibrant foreground), highContrast → step 12.
  // Gray links always use gray-12 (distinguishes via underline/weight, not color).
  const prefix = color ?? 'accent'
  const isGray = color === 'gray'
  const linkColor = rc(
    isGray || highContrast ? `${prefix}-12` : `${prefix}-a11`,
  )

  // ─── Font family ─────────────────────────────────────────────────────────────
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const fontFamily = fonts[effectiveWeight] ?? fonts.regular

  // ─── Underline ──────────────────────────────────────────────────────────────
  // Radix CSS rules for .rt-underline-auto:
  //   - hover (web only) → underline
  //   - .rt-high-contrast → underline always, color: accent-a6
  //   - inside colored parent (data-accent-color) → underline always
  // In RN there is no hover, so 'auto' only shows underline for highContrast.
  // 'always' → underline, 'hover'/'none' → no underline.
  const showUnderline =
    underline === 'always' || (underline === 'auto' && !!highContrast)
  const textDecorationLine: TextStyle['textDecorationLine'] =
    showUnderline ? 'underline' : 'none'
  // Radix: accent-a5 for normal underline, accent-a6 for highContrast
  const textDecorationColor = showUnderline
    ? rc(highContrast ? `${prefix}-a6` : `${prefix}-a5`)
    : undefined

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Press handler ──────────────────────────────────────────────────────────
  const handlePress = React.useCallback(
    (e: Parameters<NonNullable<RNTextProps['onPress']>>[0]) => {
      if (onPress) {
        onPress(e)
      } else if (href) {
        void Linking.openURL(href)
      }
    },
    [onPress, href],
  )

  // ─── Style ──────────────────────────────────────────────────────────────────
  const linkStyle: TextStyle = {
    fontSize:      resolvedSize,
    lineHeight:    resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color:         linkColor,
    fontWeight:    weight ? FONT_WEIGHT[weight] : undefined,
    fontFamily,
    textDecorationLine,
    textDecorationColor,
    // RN defaults flexShrink to 0; CSS defaults to 1. Without this, text
    // inside a Flex row overflows instead of wrapping to the available width.
    flexShrink:    1,
    // Margins
    marginTop:    sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft:   sp(ml ?? mx ?? m),
    marginRight:  sp(mr ?? mx ?? m),
  }

  return (
    <RNText
      accessibilityRole="link"
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={handlePress}
      style={[linkStyle, style]}
      {...rest}
    />
  )
}
Link.displayName = 'Link'
