import React, { useCallback, useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import { FocusRing } from '../internal/FocusRing'
import { scalingMap } from '../../tokens/scaling'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type RadioSize = 1 | 2 | 3
export type RadioVariant = 'classic' | 'surface' | 'soft'

export interface RadioProps extends NativePressableProps, MarginProps {
  /** Radio size (1–3). Default: 2. */
  size?: RadioSize
  /** Visual variant. Default: 'surface'. */
  variant?: RadioVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled checked state. */
  checked?: boolean
  /** Uncontrolled default checked state. */
  defaultChecked?: boolean
  /**
   * Called when the radio becomes checked. Like a native radio input, pressing
   * an already-checked radio does not uncheck it.
   */
  onCheckedChange?: (checked: boolean) => void
  /** Disables the radio. */
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings (Radix: space-4 * 0.875 / 1 / 1.25) ──────────────────────

const SIZE_PX: Record<RadioSize, number> = { 1: 14, 2: 16, 3: 20 }
const DOT_SCALE = 0.4

// ─── Component ────────────────────────────────────────────────────────────────

export function Radio({
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
}: RadioProps) {
  const { appearance, scaling } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { focused, scaleStyle, handlers } = useInteraction({
    enabled: !disabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  // Controlled / uncontrolled
  const [checked, setChecked] = useControllableState({
    prop: checkedProp,
    defaultProp: defaultChecked,
    onChange: onCheckedChange,
  })

  const prefix = color ?? 'accent'
  const scalingFactor = scalingMap[scaling]
  const radioSize = Math.round(SIZE_PX[size] * scalingFactor)
  const dotSize = Math.round(radioSize * DOT_SCALE)

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    const hc = highContrast
    if (disabled) {
      return {
        bg: rc('gray', 'a3'),
        border: rc('gray', 'a6'),
        showBorder: true,
        dot: checked ? rc('gray', 'a8') : undefined,
      }
    }
    switch (variant) {
      case 'classic':
      case 'surface': {
        if (checked) {
          const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
          const dot = hc ? rc(prefix, 1) : rc(prefix, 'contrast')
          return { bg, border: undefined, showBorder: false, dot }
        }
        return {
          bg: rc('gray', 'surface'),
          border: rc('gray', 'a7'),
          showBorder: true,
          dot: undefined,
        }
      }
      case 'soft': {
        const bg = rc(prefix, 'a4')
        const dot = checked
          ? (hc ? rc(prefix, 12) : rc(prefix, 'a11'))
          : undefined
        return { bg, border: undefined, showBorder: false, dot }
      }
    }
  }, [variant, prefix, highContrast, checked, disabled, rc])

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (disabled) return
    setChecked(true)
    onPress?.(e)
  }, [disabled, setChecked, onPress])

  const isClassic = variant === 'classic'
  const classicStyle = isClassic && checked && !disabled
    ? getClassicEffect(appearance, {})
    : undefined

  // ─── Styles ─────────────────────────────────────────────────────────────
  const radioStyle = useMemo<ViewStyle>(() => ({
    width: radioSize,
    height: radioSize,
    borderRadius: radioSize / 2,
    backgroundColor: colors.bg,
    borderWidth: colors.showBorder ? 1 : undefined,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...margins,
  }), [radioSize, colors, margins])

  return (
    <AnimatedPressable
      accessibilityRole="radio"
      hitSlop={hitSlop ?? getMinHitSlop(radioSize, radioSize)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, checked, disabled }}
      style={[scaleStyle, radioStyle, classicStyle, style]}
    >
      {colors.dot && (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.dot,
          }}
        />
      )}
      <FocusRing visible={focused} color={rc(color ?? 'accent', 8)} borderRadius={radioSize / 2} offset={2} />
    </AnimatedPressable>
  )
}
Radio.displayName = 'Radio'
