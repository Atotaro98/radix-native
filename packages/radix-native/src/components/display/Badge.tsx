import React, { useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import type { ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont } from '../../utils/resolveFont'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type BadgeSize = 1 | 2 | 3
export type BadgeVariant = 'solid' | 'soft' | 'surface' | 'outline'

export interface BadgeProps extends NativeViewProps, MarginProps {
  /** Badge size (1–3). Default: 1. */
  size?: BadgeSize
  /** Visual variant. Default: 'soft'. */
  variant?: BadgeVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  /** Badge content (usually a string). */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

const SIZE_HEIGHT: Record<BadgeSize, number> = { 1: 20, 2: 24, 3: 28 }
const SIZE_PADDING_X: Record<BadgeSize, number> = { 1: 6, 2: 8, 3: 10 }
const SIZE_GAP: Record<BadgeSize, number> = { 1: 6, 2: 6, 3: 8 }
const SIZE_FONT: Record<BadgeSize, 1 | 2 | 3> = { 1: 1, 2: 1, 3: 2 }
const SIZE_RADIUS_LEVEL: Record<BadgeSize, RadiusLevel> = { 1: 1, 2: 2, 3: 2 }

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  size = 1,
  variant = 'soft',
  color,
  highContrast,
  radius: radiusProp,
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: BadgeProps) {
  const { scaling, fonts, radius: themeRadius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax ?? 2
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const effectiveRadius = radiusProp ?? themeRadius
  const prefix = color ?? 'accent'

  // ─── Dimensions ─────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const fontIdx = SIZE_FONT[size]
  const resolvedFontSize = Math.round(fontSize[fontIdx] * scalingFactor)
  const resolvedLineHeight = Math.round(lineHeight[fontIdx] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[fontIdx] * resolvedFontSize
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)
  const resolvedPaddingX = Math.round(SIZE_PADDING_X[size] * scalingFactor)
  const resolvedGap = Math.round(SIZE_GAP[size] * scalingFactor)

  // ─── Radius ─────────────────────────────────────────────────────────────
  const borderRadius = Math.max(
    getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size]),
    getFullRadius(effectiveRadius),
  )

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    const hc = highContrast
    switch (variant) {
      case 'solid': {
        const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
        const text = hc ? rc(prefix, 1) : rc(prefix, 'contrast')
        return { bg, text, border: undefined }
      }
      case 'soft': {
        const bg = rc(prefix, 'a3')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        return { bg, text, border: undefined }
      }
      case 'surface': {
        const bg = rc(prefix, 'surface')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const border = rc(prefix, 'a6')
        return { bg, text, border }
      }
      case 'outline': {
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const border = rc(prefix, 'a8')
        return { bg: 'transparent', text, border }
      }
    }
  }, [variant, prefix, highContrast, rc])

  // ─── Styles ─────────────────────────────────────────────────────────────
  const containerStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingX,
    gap: resolvedGap,
    backgroundColor: colors.bg,
    borderRadius,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    ...margins,
  }), [resolvedHeight, resolvedPaddingX, resolvedGap, colors, borderRadius, margins])

  const textStyle = useMemo<TextStyle>(() => ({
    fontSize: resolvedFontSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    ...resolveFont(fonts.medium ?? fonts.regular, '500'),
    color: colors.text,
  }), [resolvedFontSize, resolvedLineHeight, resolvedLetterSpacing, fonts, colors.text])

  return (
    <View style={[containerStyle, style]} {...rest}>
      {renderContent(children, textStyle, effectiveMaxFont)}
    </View>
  )
}
Badge.displayName = 'Badge'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderContent(children: React.ReactNode, textStyle: TextStyle, maxFontSizeMultiplier?: number): React.ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return <RNText style={textStyle} maxFontSizeMultiplier={maxFontSizeMultiplier}>{children}</RNText>
  }
  return children
}
