import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { BaseToggle } from '../internal/BaseToggle'
import type { AccentColor } from '../../tokens/colors/types'
import { ClassicOverlay } from '../internal/ClassicOverlay'
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

// ─── Indicator ────────────────────────────────────────────────────────────────

export interface RadioIndicatorProps {
  size: RadioSize
  variant: RadioVariant
  color?: AccentColor
  highContrast?: boolean
  checked: boolean
  disabled: boolean
}

/** Internal: the ring and its dot, drawn from the checked state alone. */
export function RadioIndicator({ size, variant, color, highContrast, checked, disabled }: RadioIndicatorProps) {
  const { px } = useMetrics()
  const radioSize = px(SIZE_PX[size])
  const dotSize = Math.round(radioSize * DOT_SCALE)
  const colors = useVariantColors('radio', { variant, color, highContrast, checked, disabled })
  // Radix: checked classic is a bevel (gradient + inset highlight), with no drop shadow.
  const isClassicBevel = variant === 'classic' && checked && !disabled

  const radioStyle = useMemo<ViewStyle>(() => ({
    width: radioSize,
    height: radioSize,
    borderRadius: radioSize / 2,
    backgroundColor: colors.bg,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  }), [radioSize, colors])

  return (
    <View style={radioStyle}>
      {isClassicBevel && <ClassicOverlay borderRadius={radioSize / 2} />}
      {colors.indicator && (
        <View
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            backgroundColor: colors.indicator,
          }}
        />
      )}
    </View>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Radio({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  defaultChecked = false,
  disabled = false,
  m, mx, my, mt, mr, mb, ml,
  ...rest
}: RadioProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { px } = useMetrics()
  const radioSize = px(SIZE_PX[size])

  return (
    <BaseToggle
      role="radio"
      {...rest}
      defaultChecked={defaultChecked}
      disabled={disabled}
      color={color}
      width={radioSize}
      height={radioSize}
      borderRadius={radioSize / 2}
      focusOffset={2}
      margins={margins}
    >
      {({ checked }) => (
        <RadioIndicator
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
Radio.displayName = 'Radio'
