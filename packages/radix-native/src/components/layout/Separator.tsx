import React, { useMemo } from 'react'
import { View, StyleSheet } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { scalingMap } from '../../tokens/scaling'
import type { AccentColor } from '../../tokens/colors/types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SeparatorSize = 1 | 2 | 3 | 4

export interface SeparatorProps extends NativeViewProps, MarginProps {
  /** Separator size (1–4). Controls the length, not thickness. Default: 1. */
  size?: SeparatorSize
  /** Color. Default: 'gray'. */
  color?: AccentColor
  /** Orientation. Default: 'horizontal'. */
  orientation?: 'horizontal' | 'vertical'
  /** When true, hidden from screen readers. Default: true. */
  decorative?: boolean
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

const SIZE_LENGTH: Record<SeparatorSize, number | undefined> = {
  1: 16,
  2: 32,
  3: 64,
  4: undefined,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Separator({
  size = 1,
  color,
  orientation = 'horizontal',
  decorative = true,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: SeparatorProps) {
  const { scaling } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const prefix = color ?? 'gray'
  const bgColor = rc(prefix, 'a6')

  const scalingFactor = scalingMap[scaling]
  const length = SIZE_LENGTH[size]
  const resolvedLength = length !== undefined ? Math.round(length * scalingFactor) : undefined
  const isHorizontal = orientation === 'horizontal'

  const separatorStyle = useMemo<ViewStyle>(() => ({
    backgroundColor: bgColor,
    flexShrink: 0,
    ...(isHorizontal
      ? { height: StyleSheet.hairlineWidth, width: resolvedLength ?? '100%' }
      : { width: StyleSheet.hairlineWidth, height: resolvedLength ?? '100%' }),
    ...margins,
  }), [bgColor, isHorizontal, resolvedLength, margins])

  return (
    <View
      accessibilityRole={decorative ? 'none' : undefined}
      aria-hidden={decorative ? true : undefined}
      style={[separatorStyle, style]}
      {...rest}
    />
  )
}
Separator.displayName = 'Separator'
