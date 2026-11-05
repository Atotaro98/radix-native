import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { ClassicOverlay } from '../internal/ClassicOverlay'
import { BaseToggle, type CheckedState } from '../internal/BaseToggle'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckboxSize = 1 | 2 | 3
export type CheckboxVariant = 'classic' | 'surface' | 'soft'
export type { CheckedState }

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

// ─── Geometry ─────────────────────────────────────────────────────────────────

function useCheckboxBox(size: CheckboxSize) {
  const metrics = useMetrics()
  return {
    boxSize: metrics.px(CHECKBOX_SIZE[size]),
    indicatorSize: metrics.px(INDICATOR_SIZE[size]),
    // Radix: --checkbox-border-radius: calc(var(--radius-1) * 0.875 | 1 | 1.25)
    borderRadius: metrics.radius(1) * RADIUS_MULT[size],
  }
}

// ─── Indicator ────────────────────────────────────────────────────────────────

export interface CheckboxIndicatorProps {
  size: CheckboxSize
  variant: CheckboxVariant
  color?: AccentColor
  highContrast?: boolean
  checked: CheckedState
  disabled: boolean
}

/** Internal: the box and its check / dash, drawn from the checked state alone. */
export function CheckboxIndicator({ size, variant, color, highContrast, checked, disabled }: CheckboxIndicatorProps) {
  const { boxSize, indicatorSize, borderRadius } = useCheckboxBox(size)
  const isIndeterminate = checked === 'indeterminate'
  const isActive = checked !== false
  const colors = useVariantColors('checkbox', { variant, color, highContrast, checked: isActive, disabled })

  // Radix: checked classic is a bevel (gradient + inset highlight), with no drop
  // shadow; unchecked classic is sunken (shadow-1), drawn by the border color.
  const isClassicBevel = variant === 'classic' && isActive && !disabled

  const boxStyle = useMemo<ViewStyle>(() => ({
    width: boxSize,
    height: boxSize,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  }), [boxSize, borderRadius, colors])

  const strokeWidth = Math.max(2, Math.round(indicatorSize * 0.18))
  const indicatorColor = colors.indicator

  return (
    <View style={boxStyle}>
      {isClassicBevel && <ClassicOverlay borderRadius={borderRadius} />}
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
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Checkbox({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  defaultChecked = false,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  ...rest
}: CheckboxProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { boxSize, borderRadius } = useCheckboxBox(size)

  return (
    <BaseToggle
      role="checkbox"
      {...rest}
      defaultChecked={defaultChecked}
      disabled={disabled}
      color={color}
      width={boxSize}
      height={boxSize}
      borderRadius={borderRadius}
      focusOffset={2}
      margins={margins}
    >
      {({ checked }) => (
        <CheckboxIndicator
          size={size}
          variant={variant}
          color={color}
          highContrast={highContrast}
          checked={checked}
          disabled={disabled}
        />
      )}
    </BaseToggle>
  )
}
Checkbox.displayName = 'Checkbox'
