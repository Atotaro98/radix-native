import React, { useCallback, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { Text as RNText } from 'react-native'
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CheckboxSize = 1 | 2 | 3
export type CheckboxVariant = 'classic' | 'surface' | 'soft'
export type CheckedState = boolean | 'indeterminate'

export interface CheckboxProps extends Omit<PressableProps, 'style' | 'children'> {
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
  // ─── Margin props ──────────────────────────────────────────────────────────
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
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
  ...rest
}: CheckboxProps) {
  const { appearance, scaling, radius } = useThemeContext()
  const rc = useResolveColor()

  // ─── Controlled / uncontrolled ─────────────────────────────────────────────
  const [internal, setInternal] = React.useState<CheckedState>(defaultChecked)
  const isControlled = checkedProp !== undefined
  const checkedState = isControlled ? checkedProp : internal
  const isChecked = checkedState === true
  const isIndeterminate = checkedState === 'indeterminate'
  const isActive = isChecked || isIndeterminate

  // ─── Space helper ──────────────────────────────────────────────────────────
  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const boxSize = Math.round(SIZE_PX[size] * scalingFactor)
  const indicatorSize = Math.round(INDICATOR_SIZE[size] * scalingFactor)
  const borderRadius = Math.round(getRadius(radius, 1) * RADIUS_MULT[size])

  const prefix = color ?? 'accent'
  type C = Parameters<typeof rc>[0]

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    if (disabled) {
      const indicator = isActive ? rc('gray-a8' as C) : undefined
      switch (variant) {
        case 'classic':
        case 'surface':
          return {
            bg: rc('gray-a3' as C),
            border: rc('gray-a6' as C),
            indicator,
            showBorder: true,
          }
        case 'soft':
          return {
            bg: rc('gray-a3' as C),
            border: undefined,
            indicator,
            showBorder: false,
          }
      }
    }

    const hc = highContrast

    switch (variant) {
      case 'classic':
      case 'surface': {
        if (isActive) {
          const bg = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-9` as C)
          const indicator = hc ? rc(`${prefix}-1` as C) : rc(`${prefix}-contrast` as C)
          return { bg, border: undefined, indicator, showBorder: false }
        }
        return {
          bg: rc('gray-surface' as C),
          border: rc('gray-a7' as C),
          indicator: undefined,
          showBorder: true,
        }
      }
      case 'soft': {
        const bg = rc(`${prefix}-a5` as C)
        const indicator = isActive
          ? (hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-a11` as C))
          : undefined
        return { bg, border: undefined, indicator, showBorder: false }
      }
    }
  }, [variant, prefix, highContrast, isActive, disabled, rc])

  // ─── Toggle ────────────────────────────────────────────────────────────────
  const handlePress = useCallback(() => {
    if (disabled) return
    const next: CheckedState = isChecked ? false : true
    if (!isControlled) setInternal(next)
    onCheckedChange?.(next)
  }, [disabled, isChecked, isControlled, onCheckedChange])

  // ─── Classic effect ────────────────────────────────────────────────────────
  const isClassic = variant === 'classic'
  const classicStyle = isClassic
    ? getClassicEffect(appearance, { disabled })
    : undefined

  // ─── Styles ────────────────────────────────────────────────────────────────
  const boxStyle: ViewStyle = {
    width: boxSize,
    height: boxSize,
    borderRadius,
    backgroundColor: colors.bg,
    borderWidth: colors.showBorder ? 1 : undefined,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    // Margins
    marginTop: sp(mt ?? my ?? m),
    marginBottom: sp(mb ?? my ?? m),
    marginLeft: sp(ml ?? mx ?? m),
    marginRight: sp(mr ?? mx ?? m),
  }

  const indicatorStyle: TextStyle = {
    fontSize: indicatorSize,
    lineHeight: indicatorSize + 2,
    color: colors.indicator,
    fontWeight: '700',
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{
        checked: isIndeterminate ? 'mixed' : isChecked,
        disabled,
      }}
      style={[boxStyle, classicStyle, style]}
      {...rest}
    >
      {/* Classic gradient simulation when checked — wrapped with overflow:hidden for borderRadius clipping */}
      {isClassic && isActive && !disabled && (
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0, overflow: 'hidden', borderRadius }}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(0,0,0,0.08)' }} />
        </View>
      )}
      {isActive && (
        <RNText style={indicatorStyle}>
          {isIndeterminate ? '\u2013' : '\u2713'}
        </RNText>
      )}
    </Pressable>
  )
}
Checkbox.displayName = 'Checkbox'
