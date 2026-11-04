import React, { useState, useCallback } from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { useVariantColors } from '../../hooks/useVariantColors'
import { FocusRing } from '../internal/FocusRing'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextFieldSize = 1 | 2 | 3
export type TextFieldVariant = 'classic' | 'surface' | 'soft'

export interface TextFieldProps extends Omit<TextInputProps, 'style'>, MarginProps {
  /** Input size (1–3). Default: 2. */
  size?: TextFieldSize
  /** Visual variant. Default: 'surface'. */
  variant?: TextFieldVariant
  /** Accent color (used for focus ring). Default: theme accent. */
  color?: AccentColor
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Disables the input. */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

const SIZE_HEIGHT: Record<TextFieldSize, number> = { 1: 24, 2: 32, 3: 40 }
const SIZE_PADDING_X: Record<TextFieldSize, number> = { 1: 6, 2: 8, 3: 12 }
const SIZE_FONT: Record<TextFieldSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const SIZE_RADIUS_LEVEL: Record<TextFieldSize, RadiusLevel> = { 1: 2, 2: 2, 3: 3 }

// ─── Component ────────────────────────────────────────────────────────────────

export function TextField({
  size = 2,
  variant = 'surface',
  color,
  radius: radiusProp,
  disabled = false,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  editable,
  accessibilityState,
  ...rest
}: TextFieldProps) {
  const { scaling, radius: themeRadius } = useThemeContext()
  const [focused, setFocused] = useState(false)
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const effectiveRadius = radiusProp ?? themeRadius

  const scalingFactor = scalingMap[scaling]

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)
  const resolvedPaddingX = Math.round(SIZE_PADDING_X[size] * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const level = SIZE_RADIUS_LEVEL[size]
  const borderRadius = Math.max(getRadius(effectiveRadius, level), getFullRadius(effectiveRadius))

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useVariantColors('textField', { variant, color, focused, disabled })

  // ─── Focus handlers ───────────────────────────────────────────────────────
  const onFocus = useCallback<NonNullable<TextInputProps['onFocus']>>((e) => {
    if (disabled) return
    setFocused(true)
    onFocusProp?.(e)
  }, [onFocusProp, disabled])

  const onBlur = useCallback<NonNullable<TextInputProps['onBlur']>>((e) => {
    setFocused(false)
    onBlurProp?.(e)
  }, [onBlurProp])

  // ─── Styles ────────────────────────────────────────────────────────────────
  const containerStyle: ViewStyle = {
    minHeight: resolvedHeight,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: resolvedPaddingX,
    justifyContent: 'center',
    ...margins,
  }

  // Compact text; single-line inputs set no line height (iOS shifts the text).
  const text = useTextStyle({
    size: SIZE_FONT[size],
    lineHeight: 'none',
    color: colors.text,
    compact: true,
    maxFontSizeMultiplier,
  })

  const inputStyle: TextStyle = {
    ...text.style,
    width: '100%',
    padding: 0,
  }

  return (
    <View style={[containerStyle, style]}>
      <TextInput
        {...text.textProps}
        {...rest}
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!disabled && editable !== false}
        accessibilityState={{ ...accessibilityState, disabled }}
      />
      {/* 1px border + 1px inner ring = Radix 2px focus outline */}
      <FocusRing visible={focused} color={colors.border} borderRadius={Math.max(0, borderRadius - 1)} width={1} />
    </View>
  )
}
TextField.displayName = 'TextField'
