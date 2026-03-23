import React from 'react'
import { Text as RNText, Linking } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { FontSizeToken } from '../../tokens/typography'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { TextWeight, TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'

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

export interface LinkProps extends NativeTextProps, MarginProps {
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
  style?: StyleProp<TextStyle>
}

// ─── Constants ────────────────────────────────────────────────────────────────


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
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Typography ─────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const resolvedSize        = Math.round(fontSize[size] * scalingFactor)
  const resolvedLineHeight  = Math.round(lineHeight[size] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[size] * resolvedSize

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Radix: colored links use a11, highContrast → step 12. Same as Text.
  const prefix = color ?? 'accent'
  const linkColor = rc(prefix, highContrast ? 12 : 'a11')

  // ─── Font family ─────────────────────────────────────────────────────────────
  const effectiveWeight: TextWeight = weight ?? 'regular'
  const font = resolveFont(fonts[effectiveWeight] ?? fonts.regular, weight ? FONT_WEIGHT[weight] : undefined)

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
    ? rc(prefix, highContrast ? 'a6' : 'a5')
    : undefined

  // ─── Wrapping / truncation ──────────────────────────────────────────────────
  const numberOfLines = truncate ? 1 : wrap === 'nowrap' ? 1 : undefined
  const ellipsizeMode = truncate ? 'tail' : wrap === 'nowrap' ? 'clip' : undefined

  // ─── Press handler ──────────────────────────────────────────────────────────
  const handlePress = React.useCallback(
    (e: Parameters<NonNullable<LinkProps['onPress']>>[0]) => {
      if (onPress) {
        onPress(e)
      } else if (href) {
        void Linking.openURL(href).catch(() => {
          if (__DEV__) console.warn(`[Link] Failed to open URL: ${href}`)
        })
      }
    },
    [onPress, href],
  )

  // ─── Style ──────────────────────────────────────────────────────────────────
  const linkStyle = React.useMemo<TextStyle>(() => ({
    fontSize:      resolvedSize,
    lineHeight:    resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color:         linkColor,
    fontWeight:    font.fontWeight,
    fontFamily:    font.fontFamily,
    textDecorationLine,
    textDecorationColor,
    flexShrink:    1,
    ...margins,
  }), [resolvedSize, resolvedLineHeight, resolvedLetterSpacing, linkColor, font.fontWeight, font.fontFamily, textDecorationLine, textDecorationColor, margins])

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
