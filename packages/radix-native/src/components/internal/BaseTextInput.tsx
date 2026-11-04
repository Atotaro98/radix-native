import React from 'react'
import { TextInput, View } from 'react-native'
import type { TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useInteraction } from '../../hooks/useInteraction'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useControllableState } from '../../hooks/useControllableState'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { FocusRing } from './FocusRing'

export type BaseTextInputSize = 1 | 2 | 3
export type BaseTextInputVariant = 'classic' | 'surface' | 'soft'

export interface BaseTextInputProps extends Omit<TextInputProps, 'style' | 'multiline'>, MarginProps {
  /** Input size (1–3). Default: 2. */
  size?: BaseTextInputSize
  /** Visual variant. Default: 'surface'. */
  variant?: BaseTextInputVariant
  /** Accent color (used for the focus ring and the soft variant). Default: theme accent. */
  color?: AccentColor
  /** Override the theme radius. */
  radius?: RadiusToken
  /** Disables the input. */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  style?: StyleProp<ViewStyle>
}

interface InternalProps extends BaseTextInputProps {
  /** TextArea: several lines, top-aligned, at least three lines tall. */
  multiline?: boolean
}

// ─── Size mappings (Radix tokens) ─────────────────────────────────────────────

/** TextField height: space-5, space-6, space-7. */
const SIZE_HEIGHT: Record<BaseTextInputSize, number> = { 1: 24, 2: 32, 3: 40 }
const SIZE_PADDING_X: Record<BaseTextInputSize, number> = { 1: 6, 2: 8, 3: 12 }
/** TextArea vertical padding. */
const SIZE_PADDING_Y: Record<BaseTextInputSize, number> = { 1: 4, 2: 6, 3: 8 }
const SIZE_FONT: Record<BaseTextInputSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const SIZE_RADIUS_LEVEL: Record<BaseTextInputSize, RadiusLevel> = { 1: 2, 2: 2, 3: 3 }

/**
 * Internal: the shared body of TextField and TextArea (a Text input).
 * Owns sizes, Variant recipe colors, focus (via useInteraction), the Text
 * style and the order consumer props merge in. Read-only (`readOnly` or
 * `editable={false}`) looks disabled, as in Radix, but is not reported as
 * disabled to screen readers.
 *
 * The native input always receives `value` (internal state when the consumer
 * passes `defaultValue` or nothing). React Native on iOS repaints only the text
 * it gets from React when the text style changes: a multiline input keeps text
 * the user typed in the old color (dark text after switching to dark mode), and
 * an uncontrolled input snaps back to `defaultValue`.
 */
export function BaseTextInput({
  multiline = false,
  size = 2,
  variant = 'surface',
  color,
  radius: radiusProp,
  disabled = false,
  maxFontSizeMultiplier,
  m, mx, my, mt, mr, mb, ml,
  style,
  onFocus,
  onBlur,
  editable,
  readOnly,
  accessibilityState,
  value: valueProp,
  defaultValue,
  onChangeText,
  ...rest
}: InternalProps) {
  const { scaling, radius: themeRadius } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { focused, handlers } = useInteraction({ enabled: !disabled, onFocus, onBlur })

  const [value, setValue] = useControllableState({
    prop: valueProp,
    defaultProp: defaultValue ?? '',
    onChange: onChangeText,
  })

  const isReadOnly = readOnly === true || editable === false
  const scalingFactor = scalingMap[scaling]
  const effectiveRadius = radiusProp ?? themeRadius
  const radius = getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size])
  // Radix: TextField is max(radius, full); TextArea uses the plain radius.
  const borderRadius = multiline ? radius : Math.max(radius, getFullRadius(effectiveRadius))

  const colors = useVariantColors(multiline ? 'textArea' : 'textField', {
    variant,
    color,
    focused,
    disabled: disabled || isReadOnly,
  })

  // Compact text. Single-line inputs set no line height (iOS shifts the text);
  // multiline uses body line heights.
  const text = useTextStyle({
    size: SIZE_FONT[size],
    lineHeight: multiline ? 'body' : 'none',
    color: colors.text,
    compact: true,
    maxFontSizeMultiplier,
  })

  const containerStyle: ViewStyle = {
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Math.round(SIZE_PADDING_X[size] * scalingFactor),
    ...(multiline
      ? { paddingVertical: Math.round(SIZE_PADDING_Y[size] * scalingFactor) }
      : { minHeight: Math.round(SIZE_HEIGHT[size] * scalingFactor), justifyContent: 'center' }),
    ...margins,
  }

  const inputStyle: TextStyle = {
    ...text.style,
    padding: 0,
    ...(multiline
      ? { textAlignVertical: 'top', minHeight: (text.style.lineHeight ?? 0) * 3 }
      : { width: '100%' }),
  }

  return (
    <View style={[containerStyle, style]}>
      <TextInput
        {...text.textProps}
        {...rest}
        onFocus={handlers.onFocus}
        onBlur={handlers.onBlur}
        value={value}
        onChangeText={setValue}
        multiline={multiline}
        style={inputStyle}
        placeholderTextColor={colors.placeholder}
        readOnly={readOnly}
        editable={!disabled && editable !== false}
        accessibilityState={{ ...accessibilityState, disabled }}
      />
      {/* 1px border + 1px inner ring = Radix 2px focus outline */}
      <FocusRing visible={focused} color={colors.border} borderRadius={Math.max(0, borderRadius - 1)} width={1} />
    </View>
  )
}
