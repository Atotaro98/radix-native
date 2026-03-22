import React, { useState, useCallback, useMemo } from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'

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
  m, mx, my, mt, mr, mb, ml,
  style,
  onFocus: onFocusProp,
  onBlur: onBlurProp,
  ...rest
}: TextFieldProps) {
  const { scaling, fonts, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const [focused, setFocused] = useState(false)
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const effectiveRadius = radiusProp ?? themeRadius
  const prefix = color ?? 'accent'

  // ─── Typography ────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const fontIdx = SIZE_FONT[size]
  const resolvedFontSize = Math.round(fontSize[fontIdx] * scalingFactor)
  const resolvedLineHeight = Math.round(lineHeight[fontIdx] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[fontIdx] * resolvedFontSize

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)
  const resolvedPaddingX = Math.round(SIZE_PADDING_X[size] * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const level = SIZE_RADIUS_LEVEL[size]
  const borderRadius = Math.max(getRadius(effectiveRadius, level), getFullRadius(effectiveRadius))

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    if (disabled) {
      return {
        bg: variant === 'soft' ? rc('gray', 'a3') : rc('gray', 'a2'),
        border: variant === 'soft' ? 'transparent' : rc('gray', 'a6'),
        text: rc('gray', 'a11'),
        placeholder: rc('gray', 'a10'),
        placeholderOpacity: 0.5,
      }
    }
    const focusBorder = rc(prefix, 8)
    switch (variant) {
      case 'classic':
        return {
          bg: rc('gray', 1),
          border: focused ? focusBorder : rc('gray', 'a7'),
          text: rc('gray', 12),
          placeholder: rc('gray', 'a10'),
          placeholderOpacity: 1,
        }
      case 'surface':
        return {
          bg: rc('gray', 'surface'),
          border: focused ? focusBorder : rc('gray', 'a7'),
          text: rc('gray', 12),
          placeholder: rc('gray', 'a10'),
          placeholderOpacity: 1,
        }
      case 'soft':
        return {
          bg: rc(prefix, 'a3'),
          border: focused ? focusBorder : 'transparent',
          text: rc(prefix, 12),
          placeholder: rc(prefix, 'a10'),
          placeholderOpacity: 1,
        }
    }
  }, [variant, prefix, focused, disabled, rc])

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
    height: resolvedHeight,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: resolvedPaddingX,
    justifyContent: 'center',
    ...margins,
  }

  const inputStyle: TextStyle = {
    flex: 1,
    fontSize: resolvedFontSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color: colors.text,
    fontFamily: fonts.regular,
    padding: 0,
    opacity: disabled ? 1 : undefined,
  }

  return (
    <View style={[containerStyle, style]} accessibilityState={disabled ? { disabled: true } : undefined}>
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!disabled}
        {...rest}
      />
    </View>
  )
}
TextField.displayName = 'TextField'
