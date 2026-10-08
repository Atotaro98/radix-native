import React from 'react'
import { Text as RNText, Linking } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont, FONT_WEIGHT } from '../../utils/resolveFont'
import { resolveTypography, getTextWrapProps } from '../../utils/typography'
import { isDev } from '../../utils/env'
import type { FontSizeToken } from '../../tokens/typography'
import { TextContext, useParentText } from './TextContext'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { TextWeight, TextWrap } from './Text'
import type { NativeTextProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Controls underline visibility.
 * 'auto'   → standalone: no underline (Radix shows it on hover; RN has no hover).
 *             Inside running text or with highContrast: underline visible.
 * 'always' → underline always visible
 * 'hover'  → no underline (hover never fires in RN)
 * 'none'   → no underline
 */
export type LinkUnderline = 'auto' | 'always' | 'hover' | 'none'

export interface LinkProps extends NativeTextProps, MarginProps {
  /** Text size token (1–9). Default: inherits the parent text size, or 3 (16px) when standalone. */
  size?: FontSizeToken
  weight?: TextWeight
  /** Truncates text with an ellipsis when it overflows. */
  truncate?: boolean
  /** Controls text wrapping. 'pretty'/'balance' are not supported in React Native, no-op. */
  wrap?: TextWrap
  /**
   * Underline visibility. Default: 'auto'.
   * 'auto' → no underline, unless highContrast is set or the link is nested in text.
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Link({
  size,
  weight,
  truncate,
  wrap,
  underline = 'auto',
  color,
  highContrast,
  href,
  onPress,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: LinkProps) {
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const parent = useParentText()
  const isNested = parent !== null

  // ─── Typography ─────────────────────────────────────────────────────────────
  // Nested without an explicit size → inherit the surrounding text size.
  const typography = React.useMemo(
    () => (size !== undefined || !isNested ? resolveTypography(size ?? 3, scaling) : undefined),
    [size, isNested, scaling],
  )
  const contextFontSize = typography?.fontSize ?? parent?.fontSize ?? 0

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Radix: colored links use a11, highContrast → step 12. Same as Text.
  const prefix = color ?? 'accent'
  const linkColor = rc(prefix, highContrast ? 12 : 'a11')

  // ─── Font family ─────────────────────────────────────────────────────────────
  const font = weight
    ? resolveFont(fonts[weight] ?? fonts.regular, FONT_WEIGHT[weight])
    : isNested ? undefined : resolveFont(fonts.regular, undefined)

  // ─── Underline ──────────────────────────────────────────────────────────────
  // Radix CSS rules for .rt-underline-auto:
  //   - hover (web only) → underline
  //   - .rt-high-contrast → underline always, color: accent-a6
  //   - inside colored parent (data-accent-color) → underline always
  // In RN there is no hover, so 'auto' shows the underline for highContrast and
  // for links inside running text (otherwise only color would distinguish them,
  // which fails WCAG 1.4.1 "Use of Color").
  const showUnderline =
    underline === 'always' || (underline === 'auto' && (!!highContrast || isNested))
  const textDecorationLine: TextStyle['textDecorationLine'] =
    showUnderline ? 'underline' : 'none'
  // Radix: accent-a5 for normal underline, accent-a6 for highContrast
  const textDecorationColor = showUnderline
    ? rc(prefix, highContrast ? 'a6' : 'a5')
    : undefined

  // ─── Press handler ──────────────────────────────────────────────────────────
  const handlePress = React.useCallback(
    (e: Parameters<NonNullable<LinkProps['onPress']>>[0]) => {
      if (onPress) {
        onPress(e)
      } else if (href) {
        void Linking.openURL(href).catch(() => {
          if (isDev) console.warn(`[Link] Failed to open URL: ${href}`)
        })
      }
    },
    [onPress, href],
  )

  // ─── Style ──────────────────────────────────────────────────────────────────
  const linkStyle = React.useMemo<TextStyle>(() => ({
    ...typography,
    color:      linkColor,
    fontWeight: font?.fontWeight,
    fontFamily: font?.fontFamily,
    textDecorationLine,
    textDecorationColor,
    ...(isNested ? null : { flexShrink: 1, ...margins }),
  }), [typography, linkColor, font?.fontWeight, font?.fontFamily, textDecorationLine, textDecorationColor, isNested, margins])

  const contextValue = React.useMemo(() => ({ fontSize: contextFontSize }), [contextFontSize])

  return (
    <TextContext.Provider value={contextValue}>
      <RNText
        accessibilityRole="link"
        {...getTextWrapProps(truncate, wrap)}
        maxFontSizeMultiplier={effectiveMaxFont}
        {...rest}
        onPress={handlePress}
        style={[linkStyle, style]}
      >
        {children}
      </RNText>
    </TextContext.Provider>
  )
}
Link.displayName = 'Link'
