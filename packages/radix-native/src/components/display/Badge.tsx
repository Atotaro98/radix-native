import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'
import { ControlLabel } from '../internal/ControlLabel'

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
  /** Badge content: text, icons, or both (its Control label). */
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
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const metrics = useMetrics({ radius: radiusProp })

  // ─── Dimensions ─────────────────────────────────────────────────────────
  const resolvedHeight = metrics.px(SIZE_HEIGHT[size])
  const resolvedPaddingX = metrics.px(SIZE_PADDING_X[size])
  const resolvedGap = metrics.px(SIZE_GAP[size])

  // ─── Radius ─────────────────────────────────────────────────────────────
  const borderRadius = metrics.radius(SIZE_RADIUS_LEVEL[size], 'pill')

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useVariantColors('badge', { variant, color, highContrast })

  // ─── Styles ─────────────────────────────────────────────────────────────
  const containerStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingX,
    gap: resolvedGap,
    backgroundColor: colors.bg,
    borderRadius,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    ...margins,
  }), [resolvedHeight, resolvedPaddingX, resolvedGap, colors, borderRadius, margins])

  return (
    <View style={[containerStyle, style]} {...rest}>
      {/* Radix: badge text is medium weight. */}
      <ControlLabel size={SIZE_FONT[size]} weight="medium" color={colors.text} maxFontSizeMultiplier={maxFontSizeMultiplier}>
        {children}
      </ControlLabel>
    </View>
  )
}
Badge.displayName = 'Badge'
