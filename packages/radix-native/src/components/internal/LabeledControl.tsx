import React from 'react'
import { Pressable, View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, AccessibilityRole } from 'react-native'
import { useInteraction } from '../../hooks/useInteraction'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { AccentColor } from '../../tokens/colors/types'
import { FocusRing } from './FocusRing'

interface LabeledControlProps {
  role: Extract<AccessibilityRole, 'checkbox' | 'radio'>
  checked: boolean
  disabled: boolean
  onPress: () => void
  /** The visual control (Checkbox / Radio), rendered non-interactive. */
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
  const rc = useResolveColor()
  const { focused, handlers } = useInteraction({ enabled: !disabled })
  const label = useTextStyle({
    size,
    color: disabled ? rc('gray', 'a8') : rc('gray', 12),
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
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {control}
      </View>
      {typeof children === 'string' || typeof children === 'number' ? (
        <RNText style={label.style} {...label.textProps}>
          {children}
        </RNText>
      ) : (
        children
      )}
      <FocusRing visible={focused} color={rc(color ?? 'accent', 8)} borderRadius={4} offset={2} />
    </Pressable>
  )
}
