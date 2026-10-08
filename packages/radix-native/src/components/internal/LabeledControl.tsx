import React from 'react'
import { Pressable, View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle, AccessibilityRole } from 'react-native'
import { useInteraction } from '../../hooks/useInteraction'
import { FocusRing } from './FocusRing'

interface LabeledControlProps {
  role: Extract<AccessibilityRole, 'checkbox' | 'radio'>
  checked: boolean
  disabled: boolean
  onPress: () => void
  /** The visual control (Checkbox / Radio), rendered non-interactive. */
  control: React.ReactNode
  gap: number
  labelStyle: TextStyle
  focusColor: string
  maxFontSizeMultiplier?: number
  margins: ViewStyle
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

/**
 * Row with a control + label that behaves as a single accessible element
 * (the whole row is the touch target and is announced as one checkbox/radio
 * with the label as its name). Shared by CheckboxGroup.Item and RadioGroup.Item.
 */
export function LabeledControl({
  role,
  checked,
  disabled,
  onPress,
  control,
  gap,
  labelStyle,
  focusColor,
  maxFontSizeMultiplier,
  margins,
  style,
  children,
}: LabeledControlProps) {
  const { focused, handlers } = useInteraction({ enabled: !disabled })

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
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {control}
      </View>
      {typeof children === 'string' || typeof children === 'number' ? (
        <RNText style={labelStyle} maxFontSizeMultiplier={maxFontSizeMultiplier}>
          {children}
        </RNText>
      ) : (
        children
      )}
      <FocusRing visible={focused} color={focusColor} borderRadius={4} offset={2} />
    </Pressable>
  )
}
