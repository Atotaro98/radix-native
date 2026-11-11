import React, { useCallback } from 'react'
import type { GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import { ToggleSurface, useToggleGeometry, type CheckedState, type ToggleKind, type ToggleRole } from './ToggleSurface'
import { useSkeletonRadius } from '../feedback/SkeletonContext'

export type { CheckedState, ToggleRole }

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
}

type RoleProps =
  | ({ role: 'checkbox' } & ToggleState<CheckedState>)
  | ({ role: 'radio' | 'switch' } & ToggleState<boolean>)

export type BaseToggleProps<P extends { checked: CheckedState }> =
  RoleProps & Omit<NativePressableProps, 'children' | 'disabled'> & {
    disabled: boolean
    /** Accent color of the focus ring. */
    color?: AccentColor
    /** The Toggle's Indicator and its geometry. */
    kind: ToggleKind<P>
    /** Indicator props; the checked state is filled in here. */
    indicator: Omit<P, 'checked'>
    margins: ViewStyle
    style?: StyleProp<ViewStyle>
  }

/**
 * Internal: a standalone Toggle (Checkbox, Radio, Switch). Owns the checked
 * state (controlled or not) and what a press does for the role; everything
 * else — role, announced state, disabled gate, touch target, press scale,
 * focus ring — is the Toggle surface.
 */
export function BaseToggle<P extends { checked: CheckedState }>(props: BaseToggleProps<P>) {
  const {
    role,
    checked: checkedProp,
    defaultChecked,
    onCheckedChange,
    disabled,
    color,
    kind,
    indicator,
    margins,
    style,
    onPress,
    ...rest
  } = props

  const [checked, setChecked] = useControllableState<CheckedState>({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange as ((value: CheckedState) => void) | undefined,
  })

  const handlePress = useCallback((e: GestureResponderEvent) => {
    setChecked(NEXT[role])
    onPress?.(e)
  }, [setChecked, role, onPress])

  // A radio or switch never reaches 'indeterminate' (NEXT only yields booleans for them).
  const indicatorProps = { ...indicator, checked } as unknown as P

  // switch.css / base-checkbox.css / base-radio.css: --skeleton-radius-override is the Indicator's radius
  useSkeletonRadius(useToggleGeometry(kind.geometry, indicatorProps).borderRadius)

  return (
    <ToggleSurface
      role={role}
      {...rest}
      checked={checked}
      disabled={disabled}
      onPress={handlePress}
      color={color}
      indicator={{ kind, props: indicatorProps }}
      style={[margins, style]}
    />
  )
}
