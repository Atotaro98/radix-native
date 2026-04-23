import React from 'react'
import { Platform, View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont } from '../../utils/resolveFont'
import { fontSize, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type KbdVariant = 'classic' | 'soft'

export interface KbdProps extends MarginProps {
  /**
   * Text size token (1–9).
   *
   * In Radix web, Kbd uses `0.75em` to inherit from the parent.
   * In RN there are no relative units, so `size` sets the *parent* text size
   * and the Kbd font is derived as `fontSize[size] * 0.8` (matching Radix).
   */
  size?: FontSizeToken
  /** Visual variant. Default: `'classic'`. */
  variant?: KbdVariant
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Keyboard key indicator — styled to look like a physical key.
 *
 * Follows the Radix Themes Kbd API:
 * - `size` 1-9 (default 2)
 * - `variant` 'classic' (raised key with shadow) | 'soft' (flat tinted bg)
 * - Margin props: m, mx, my, mt, mr, mb, ml
 *
 * When nested inline inside `<Text>`, RN places the View's bottom at the
 * text baseline. We use `transform: translateY` to shift it into alignment
 * (marginBottom is ignored for inline Views in Text).
 */
export function Kbd({
  size = 2,
  variant = 'classic',
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
}: KbdProps) {
  const { scaling, fonts, radius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax ?? 2
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const sf = scalingMap[scaling]

  // Radix: font-size = 0.75em relative to parent (we use token * 0.75)
  const kbdFontSize = Math.round(fontSize[size] * sf * 0.75)
  // Radix: border-radius = radiusFactor * 0.35em (relative to kbdFontSize)
  const borderR = Math.max(2, Math.round(getRadius(radius, 2) * 0.35 * (kbdFontSize / 14)))
  // Radix: min-width 1.75em, line-height 1.7em (em = kbdFontSize)
  const minW = Math.round(kbdFontSize * 1.75)
  const kbdHeight = Math.round(kbdFontSize * 1.7)
  // Radix: padding 0.5em horizontal, 0.05em bottom
  const ph = Math.round(kbdFontSize * 0.5)
  const pb = Math.round(kbdFontSize * 0.05)

  // Inline alignment: shift down so Kbd centers with surrounding text.
  // In RN, inline View bottom = text baseline. Kbd sticks above by
  // (kbdHeight - ascender). We shift it down by that amount.
  const parentFontSize = Math.round(fontSize[size] * sf)
  const ascender = Math.round(parentFontSize * 0.82)
  const translateY = Math.round((kbdHeight - ascender) * 0.5)

  const isClassic = variant === 'classic'

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: kbdHeight,
    minWidth: minW,
    paddingHorizontal: ph,
    paddingBottom: pb,
    borderRadius: borderR,
    backgroundColor: isClassic ? rc('gray', 1) : rc('gray', 'a3'),
    // Classic uses border to approximate box-shadow outline + bottom shadow
    ...(isClassic
      ? {
          borderWidth: 1,
          borderColor: rc('gray', 'a5'),
          borderBottomWidth: 2,
          borderBottomColor: rc('gray', 'a7'),
        }
      : {}),
    transform: [{ translateY }],
    // iOS shadow approximates the outer drop shadow from Radix box-shadow
    ...(isClassic
      ? Platform.select({
          ios: {
            shadowColor: rc('gray', 12),
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.12,
            shadowRadius: 1,
          },
          android: {
            elevation: 1,
          },
        })
      : {}),
    ...margins,
  }

  const textStyle: TextStyle = {
    fontSize: kbdFontSize,
    // Radix uses the default (body) font, NOT monospace
    ...resolveFont(fonts.regular, '400'),
    color: rc('gray', 12),
    letterSpacing: letterSpacingEm[size] * kbdFontSize,
  }

  // Classic variant: thin highlight line at the top to simulate
  // the inset box-shadow highlight from Radix
  const highlightStyle: ViewStyle | null = isClassic
    ? {
        position: 'absolute',
        top: 0,
        left: 1,
        right: 1,
        height: 1,
        backgroundColor: rc('gray', 'a3'),
        borderTopLeftRadius: Math.max(0, borderR - 1),
        borderTopRightRadius: Math.max(0, borderR - 1),
      }
    : null

  return (
    <View style={[containerStyle, style]}>
      {highlightStyle && <View style={highlightStyle} />}
      <RNText style={textStyle} maxFontSizeMultiplier={effectiveMaxFont}>{children}</RNText>
    </View>
  )
}
Kbd.displayName = 'Kbd'
