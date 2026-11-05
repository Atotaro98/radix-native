import React, { useCallback } from 'react'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import { FocusRing } from './FocusRing'

export type CheckedState = boolean | 'indeterminate'
export type ToggleRole = 'checkbox' | 'radio' | 'switch'

/**
 * What a press does, per role (Radix):
 * - checkbox: indeterminate → checked, checked → unchecked
 * - radio: always checks; pressing a checked radio does not uncheck it
 * - switch: flips
 */
const NEXT: Record<ToggleRole, (prev: CheckedState) => CheckedState> = {
  checkbox: (prev) => prev !== true,
  radio: () => true,
  switch: (prev) => !prev,
}

interface ToggleState<T> {
  checked?: T
  defaultChecked: T
  onCheckedChange?: (checked: T) => void
  /** Draws the Indicator for the current checked state. */
  children: (state: { checked: T }) => React.ReactNode
}

type RoleProps =
  | ({ role: 'checkbox' } & ToggleState<CheckedState>)
  | ({ role: 'radio' | 'switch' } & ToggleState<boolean>)

export type BaseToggleProps = RoleProps & Omit<NativePressableProps, 'children' | 'disabled'> & {
  disabled: boolean
  /** Accent color of the focus ring. */
  color?: AccentColor
  /** Outer size of the Indicator; used for the touch target and the focus ring. */
  width: number
  height: number
  borderRadius: number
  /** Gap between the Indicator and the focus ring. */
  focusOffset: number
  margins: ViewStyle
  style?: StyleProp<ViewStyle>
}

/**
 * Internal: the behaviour shared by every Toggle (Checkbox, Radio, Switch).
 * Owns the checked state (controlled or not), what a press does for the role,
 * how the state is announced, the disabled gate, the minimum touch target, the
 * press scale and the focus ring. What the Toggle looks like is the Indicator
 * passed as `children`.
 */
export function BaseToggle(props: BaseToggleProps) {
  const {
    role,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    children,
    disabled,
    color,
    width,
    height,
    borderRadius,
    focusOffset,
    margins,
    style,
    onPress,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
    accessibilityState,
    hitSlop,
    ...rest
  } = props

  const { focused, scaleStyle, handlers } = useInteraction({
    enabled: !disabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })
  const focus = useVariantColors('focusRing', { color })

  const [checked, setChecked] = useControllableState<CheckedState>({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange as ((value: CheckedState) => void) | undefined,
  })

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    setChecked(NEXT[role])
    onPress?.(e)
  }, [disabled, setChecked, role, onPress])

  const renderIndicator = children as (state: { checked: CheckedState }) => React.ReactNode

  return (
    <AnimatedPressable
      accessibilityRole={role}
      hitSlop={hitSlop ?? getMinHitSlop(width, height)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{
        ...accessibilityState,
        checked: checked === 'indeterminate' ? 'mixed' : checked,
        disabled,
      }}
      style={[scaleStyle, { width, height, ...margins }, style]}
    >
      {renderIndicator({ checked })}
      <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} offset={focusOffset} />
    </AnimatedPressable>
  )
}
