import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import { ClassicOverlay } from '../internal/ClassicOverlay'
import { FocusRing } from '../internal/FocusRing'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckboxSize = 1 | 2 | 3
export type CheckboxVariant = 'classic' | 'surface' | 'soft'
export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps extends NativePressableProps, MarginProps {
  /** Checkbox size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled checked state. */
  checked?: CheckedState
  /** Uncontrolled default checked state. */
  defaultChecked?: CheckedState
  /** Called when the checked state changes. */
  onCheckedChange?: (checked: CheckedState) => void
  /** Disables the checkbox. */
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

/** Checkbox size in px (space-4 = 16, scaled by 0.875 / 1 / 1.25) */
export const CHECKBOX_SIZE: Record<CheckboxSize, number> = { 1: 14, 2: 16, 3: 20 }
/** Indicator (check/dash) size in px */
const INDICATOR_SIZE: Record<CheckboxSize, number> = { 1: 9, 2: 10, 3: 12 }
/** Radius multiplier per size (relative to radius-level-1) */
const RADIUS_MULT: Record<CheckboxSize, number> = { 1: 0.875, 2: 1, 3: 1.25 }

// ─── Component ────────────────────────────────────────────────────────────────

export function Checkbox({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  checked: checkedProp,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  style,
  onPress,
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  accessibilityState,
  hitSlop,
  ...rest
}: CheckboxProps) {
  const { appearance } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { focused, scaleStyle, handlers } = useInteraction({
    enabled: !disabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  // ─── Controlled / uncontrolled ─────────────────────────────────────────────
  const [checkedState, setChecked] = useControllableState<CheckedState>({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
  })
  const isChecked = checkedState === true
  const isIndeterminate = checkedState === 'indeterminate'
  const isActive = isChecked || isIndeterminate

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const metrics = useMetrics()
  const boxSize = metrics.px(CHECKBOX_SIZE[size])
  const indicatorSize = metrics.px(INDICATOR_SIZE[size])
  // Radix: --checkbox-border-radius: calc(var(--radius-1) * 0.875 | 1 | 1.25)
  const borderRadius = metrics.radius(1) * RADIUS_MULT[size]


  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useVariantColors('checkbox', { variant, color, highContrast, checked: isActive, disabled })
  const focus = useVariantColors('focusRing', { color })

  // ─── Toggle ────────────────────────────────────────────────────────────────
  // Radix: indeterminate → checked, checked → unchecked
  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    setChecked(prev => prev !== true)
    onPress?.(e)
  }, [disabled, setChecked, onPress])

  // ─── Classic effect ────────────────────────────────────────────────────────
  const isClassic = variant === 'classic'
  // Radix: the raised bevel belongs to the checked state; unchecked classic is
  // sunken (shadow-1), drawn by the border color from the recipe.
  const classicStyle = isClassic && isActive && !disabled
    ? getClassicEffect(appearance, {})
    : undefined

  // ─── Styles ────────────────────────────────────────────────────────────────
  const boxStyle = useMemo<ViewStyle>(() => ({
    width: boxSize,
    height: boxSize,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...margins,
  }), [boxSize, borderRadius, colors, margins])

  const strokeWidth = Math.max(2, Math.round(indicatorSize * 0.18))
  const indicatorColor = colors.indicator

  return (
    <AnimatedPressable
      accessibilityRole="checkbox"
      hitSlop={hitSlop ?? getMinHitSlop(boxSize, boxSize)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{
        ...accessibilityState,
        checked: isIndeterminate ? 'mixed' : isChecked,
        disabled,
      }}
      style={[scaleStyle, boxStyle, classicStyle, style]}
    >
      {/* Classic gradient simulation when checked */}
      {isClassic && isActive && !disabled && <ClassicOverlay borderRadius={borderRadius} />}
      {isActive && (
        isIndeterminate ? (
          <View style={{
            width: indicatorSize * 0.6,
            height: strokeWidth,
            backgroundColor: indicatorColor,
            borderRadius: strokeWidth / 2,
          }} />
        ) : (
          <View style={{
            width: indicatorSize * 0.55,
            height: indicatorSize * 0.35,
            borderLeftWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
            borderColor: indicatorColor,
            transform: [{ rotate: '-45deg' }],
            marginTop: -indicatorSize * 0.1,
          }} />
        )
      )}
      <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} offset={2} />
    </AnimatedPressable>
  )
}
Checkbox.displayName = 'Checkbox'
