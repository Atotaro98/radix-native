import React, { useState, useCallback, useMemo } from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type TextAreaSize = 1 | 2 | 3
export type TextAreaVariant = 'classic' | 'surface' | 'soft'

export interface TextAreaProps extends Omit<TextInputProps, 'style' | 'multiline'>, MarginProps {
  /** Input size (1–3). Default: 2. */
  size?: TextAreaSize
  /** Visual variant. Default: 'surface'. */
  variant?: TextAreaVariant
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

const SIZE_PADDING_X: Record<TextAreaSize, number> = { 1: 6, 2: 8, 3: 12 }
const SIZE_PADDING_Y: Record<TextAreaSize, number> = { 1: 4, 2: 6, 3: 8 }
const SIZE_FONT: Record<TextAreaSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const SIZE_RADIUS_LEVEL: Record<TextAreaSize, RadiusLevel> = { 1: 2, 2: 2, 3: 3 }

// ─── Component ────────────────────────────────────────────────────────────────

export function TextArea({
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
  ...rest
}: TextAreaProps) {
  const { scaling, fonts, radius: themeRadius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax ?? 1.5
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
  const resolvedPaddingX = Math.round(SIZE_PADDING_X[size] * scalingFactor)
  const resolvedPaddingY = Math.round(SIZE_PADDING_Y[size] * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const level = SIZE_RADIUS_LEVEL[size]
  const borderRadius = getRadius(effectiveRadius, level)

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
          bg: rc('gray', 'surface'),
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
      case 'soft': {
        const placeholderBase = rc(prefix, 12)
        const placeholderColor = placeholderBase.startsWith('#')
          ? placeholderBase + '99'
          : placeholderBase
        return {
          bg: rc(prefix, 'a3'),
          border: focused ? focusBorder : 'transparent',
          text: rc(prefix, 12),
          placeholder: placeholderColor,
          placeholderOpacity: 1,
        }
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
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: resolvedPaddingX,
    paddingVertical: resolvedPaddingY,
    ...margins,
  }

  const inputStyle: TextStyle = {
    fontSize: resolvedFontSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color: colors.text,
    fontFamily: fonts.regular,
    padding: 0,
    textAlignVertical: 'top',
    minHeight: resolvedLineHeight * 3,
  }

  return (
    <View style={[containerStyle, style]} accessibilityState={disabled ? { disabled: true } : undefined}>
      <TextInput
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        maxFontSizeMultiplier={effectiveMaxFont}
        multiline
        onFocus={onFocus}
        onBlur={onBlur}
        editable={!disabled}
        {...rest}
      />
    </View>
  )
}
TextArea.displayName = 'TextArea'
