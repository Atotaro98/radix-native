import React from 'react'
import { Platform, View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { FontSizeToken } from '../../tokens/typography'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

import type { KbdVariant } from '../../utils/variantPalette'
export type { KbdVariant }

export interface KbdProps extends NativeViewProps, MarginProps {
  /**
   * Text size token (1–9).
   *
   * In Radix web, Kbd uses `0.75em` to inherit from the parent.
   * In RN there are no relative units, so `size` sets the *parent* text size
   * and the Kbd font is derived as `fontSize[size] * 0.75` (matching Radix).
   * When omitted inside a Text, the surrounding text size is used.
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
  size,
  variant = 'classic',
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  children,
  ...rest
}: KbdProps) {
  const colors = useVariantColors('kbd', { variant })
  const metrics = useMetrics()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // Radix: 0.75em of the surrounding text, default (body) font — not monospace.
  // Explicit size (or standalone, default 2) uses the token instead.
  const text = useTextStyle({
    inline: true,
    size,
    defaultSize: 2,
    sizeAdjust: 0.75,
    weight: 'regular',
    lineHeight: 'none',
    color: colors.text,
    compact: true,
    maxFontSizeMultiplier,
  })
  const kbdFontSize = text.contextFontSize
  // Radix .rt-Kbd: border-radius: calc(var(--radius-factor) * 0.35em)
  const borderR = metrics.radiusFactor * 0.35 * kbdFontSize
  // Radix: min-width 1.75em, line-height 1.7em (em = kbdFontSize)
  const minW = Math.round(kbdFontSize * 1.75)
  const kbdHeight = Math.round(kbdFontSize * 1.7)
  // Radix: padding 0.5em horizontal, 0.05em bottom
  const ph = Math.round(kbdFontSize * 0.5)
  const pb = Math.round(kbdFontSize * 0.05)

  // Inline alignment: shift down so Kbd centers with surrounding text.
  // In RN, inline View bottom = text baseline. Kbd sticks above by
  // (kbdHeight - ascender). We shift it down by that amount.
  const parentFontSize = Math.round(text.baseFontSize)
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
    backgroundColor: colors.bg,
    // Classic uses border to approximate box-shadow outline + bottom shadow
    ...(isClassic
      ? {
          borderWidth: 1,
          borderColor: colors.ring,
          borderBottomWidth: 2,
          borderBottomColor: colors.bottomEdge,
        }
      : {}),
    transform: [{ translateY }],
    // iOS shadow approximates the outer drop shadow from Radix box-shadow
    ...(isClassic
      ? Platform.select({
          ios: {
            shadowColor: colors.shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: colors.shadowOpacity,
            shadowRadius: 1,
          },
          android: {
            elevation: 1,
          },
        })
      : {}),
    ...margins,
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
        backgroundColor: colors.highlight,
        borderTopLeftRadius: Math.max(0, borderR - 1),
        borderTopRightRadius: Math.max(0, borderR - 1),
      }
    : null

  return (
    <View {...rest} style={[containerStyle, style]}>
      {highlightStyle && <View style={highlightStyle} />}
      <RNText {...text.textProps} style={text.style}>{children}</RNText>
    </View>
  )
}
Kbd.displayName = 'Kbd'
