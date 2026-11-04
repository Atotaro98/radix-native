import React from 'react'
import { Text as RNText, Linking } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
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
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const isNested = useParentText() !== null

  // ─── Color ──────────────────────────────────────────────────────────────────
  // Radix: colored links use a11, highContrast → step 12. Same as Text.
  const colors = useVariantColors('link', { color, highContrast })
  const linkColor = colors.text

  const text = useTextStyle({
    inline: true,
    size,
    weight,
    color: linkColor,
    maxFontSizeMultiplier,
    truncate,
    wrap,
    margins,
  })

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
  const textDecorationColor = showUnderline ? colors.decoration : undefined

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
  const linkStyle = React.useMemo<TextStyle>(
    () => ({ ...text.style, textDecorationLine, textDecorationColor }),
    [text.style, textDecorationLine, textDecorationColor],
  )
  const contextValue = React.useMemo(() => ({ fontSize: text.contextFontSize }), [text.contextFontSize])

  return (
    <TextContext.Provider value={contextValue}>
      <RNText
        accessibilityRole="link"
        {...text.textProps}
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
