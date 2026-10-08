import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import { ClassicOverlay } from '../internal/ClassicOverlay'
import { FocusRing } from '../internal/FocusRing'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
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
const SIZE_PX: Record<CheckboxSize, number> = { 1: 14, 2: 16, 3: 20 }
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
  const { appearance, scaling, radius } = useThemeContext()
  const rc = useResolveColor()
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
  const scalingFactor = scalingMap[scaling]
  const boxSize = Math.round(SIZE_PX[size] * scalingFactor)
  const indicatorSize = Math.round(INDICATOR_SIZE[size] * scalingFactor)
  const borderRadius = Math.round(getRadius(radius, 1) * RADIUS_MULT[size])

  const prefix = color ?? 'accent'

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    if (disabled) {
      const indicator = isActive ? rc('gray', 'a8') : undefined
      switch (variant) {
        case 'classic':
        case 'surface':
          return {
            bg: rc('gray', 'a3'),
            border: rc('gray', 'a6'),
            indicator,
            showBorder: true,
          }
        case 'soft':
          return {
            bg: rc('gray', 'a3'),
            border: undefined,
            indicator,
            showBorder: false,
          }
      }
    }

    const hc = highContrast

    switch (variant) {
      case 'classic': {
        if (isActive) {
          const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
          const indicator = hc ? rc(prefix, 1) : rc(prefix, 'contrast')
          return { bg, border: undefined, indicator, showBorder: false }
        }
        return {
          bg: rc('gray', 'surface'),
          border: rc('gray', 'a3'),
          indicator: undefined,
          showBorder: true,
        }
      }
      case 'surface': {
        if (isActive) {
          const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
          const indicator = hc ? rc(prefix, 1) : rc(prefix, 'contrast')
          return { bg, border: undefined, indicator, showBorder: false }
        }
        return {
          bg: rc('gray', 'surface'),
          border: rc('gray', 'a7'),
          indicator: undefined,
          showBorder: true,
        }
      }
      case 'soft': {
        const bg = rc(prefix, 'a5')
        const indicator = isActive
          ? (hc ? rc(prefix, 12) : rc(prefix, 'a11'))
          : undefined
        return { bg, border: undefined, indicator, showBorder: false }
      }
    }
  }, [variant, prefix, highContrast, isActive, disabled, rc])

  // ─── Toggle ────────────────────────────────────────────────────────────────
  // Radix: indeterminate → checked, checked → unchecked
  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    setChecked(prev => prev !== true)
    onPress?.(e)
  }, [disabled, setChecked, onPress])

  // ─── Classic effect ────────────────────────────────────────────────────────
  const isClassic = variant === 'classic'
  const classicStyle = isClassic
    ? getClassicEffect(appearance, { disabled })
    : undefined

  // ─── Styles ────────────────────────────────────────────────────────────────
  const boxStyle = useMemo<ViewStyle>(() => ({
    width: boxSize,
    height: boxSize,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.showBorder ? 1 : undefined,
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
      <FocusRing visible={focused} color={rc(prefix, 8)} borderRadius={borderRadius} offset={2} />
    </AnimatedPressable>
  )
}
Checkbox.displayName = 'Checkbox'
