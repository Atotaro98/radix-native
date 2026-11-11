import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle, StyleProp } from 'react-native'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { BaseToggle } from '../internal/BaseToggle'
import { useToggleGeometry, type ToggleKind } from '../internal/ToggleSurface'
import { resolveMetrics, type MetricsInput } from '../../utils/metrics'
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

/** The ring of a Radio for a size. */
function radioGeometry({ size }: { size: RadioSize }, theme: MetricsInput) {
  const diameter = resolveMetrics(theme).px(SIZE_PX[size])
  return { width: diameter, height: diameter, borderRadius: diameter / 2, focusOffset: 2 }
}

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
  const { width: radioSize } = useToggleGeometry(radioGeometry, { size })
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

/** Internal: the Radio's Indicator and geometry, for the Toggle surface. */
export const RadioToggle: ToggleKind<RadioIndicatorProps> = {
  geometry: radioGeometry,
  Indicator: RadioIndicator,
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

  return (
    <BaseToggle
      role="radio"
      {...rest}
      defaultChecked={defaultChecked}
      disabled={disabled}
      color={color}
      kind={RadioToggle}
      indicator={{ size, variant, color, highContrast, disabled }}
      margins={margins}
    />
  )
}
Radio.displayName = 'Radio'
