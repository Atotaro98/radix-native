import React from 'react'
import { Pressable, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useInteraction } from '../../hooks/useInteraction'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { AccentColor } from '../../tokens/colors/types'
import { FocusRing } from './FocusRing'

interface LabeledControlProps {
  role: 'checkbox' | 'radio'
  checked: boolean
  disabled: boolean
  onPress: () => void
  /** The Indicator of the Toggle (CheckboxIndicator / RadioIndicator). */
  control: React.ReactNode
  /** Group size: the label is Text size 1–3, as in Radix. */
  size: 1 | 2 | 3
  color?: AccentColor
  maxFontSizeMultiplier?: number
  margins: ViewStyle
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

/**
 * Row with a control + label that behaves as a single accessible element
 * (the whole row is the touch target and is announced as one checkbox/radio
 * with the label as its name). Shared by CheckboxGroup.Item and RadioGroup.Item.
 * Radix: label is gray-12 (gray-a8 disabled), 0.5em away from the control.
 */
export function LabeledControl({
  role,
  checked,
  disabled,
  onPress,
  control,
  size,
  color,
  maxFontSizeMultiplier,
  margins,
  style,
  children,
}: LabeledControlProps) {
  const { focused, handlers } = useInteraction({ enabled: !disabled })
  const focus = useVariantColors('focusRing', { color })
  const labelColors = useVariantColors('controlLabel', { disabled })
  const label = useTextStyle({
    size,
    color: labelColors.text,
    maxFontSizeMultiplier,
  })
  const gap = Math.round((label.style.fontSize ?? 0) / 2)

  return (
    <Pressable
      onFocus={handlers.onFocus}
      onBlur={handlers.onBlur}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{ checked, disabled }}
      style={[{ flexDirection: 'row', alignItems: 'center', gap, ...margins }, style]}
    >
      {control}
      {typeof children === 'string' || typeof children === 'number' ? (
        <RNText style={label.style} {...label.textProps}>
          {children}
        </RNText>
      ) : (
        children
      )}
      <FocusRing visible={focused} color={focus.ring} borderRadius={4} offset={2} />
    </Pressable>
  )
}
