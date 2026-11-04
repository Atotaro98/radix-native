import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMargins } from '../../hooks/useMargins'
import { resolveSpace } from '../../utils/resolveSpace'
import { LabeledControl } from '../internal/LabeledControl'
import { createSelectionGroup } from '../internal/selectionGroup'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { Radio, type RadioSize, type RadioVariant } from './Radio'

interface Shared {
  size: RadioSize
  variant: RadioVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'single', Shared>({ name: 'RadioGroup', type: 'single' })

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface RadioGroupProps extends MarginProps {
  /** Radio size (1–3). Default: 2. */
  size?: RadioSize
  /** Visual variant. Default: 'surface'. */
  variant?: RadioVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled selected value. */
  value?: string
  /** Uncontrolled default selected value. */
  defaultValue?: string
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void
  /** Disables every item in the group. */
  disabled?: boolean
  /** Group children (RadioGroup.Item). */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface RadioGroupItemProps extends MarginProps {
  /** Unique value identifying this item. */
  value: string
  /** Disables this item (a disabled group always wins). */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  /** Label text or custom content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Root ───────────────────────────────────────────────────────────────────────

function RadioGroupRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const shared = useMemo<Shared>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

  return (
    <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        // Radix: column, gap space-1
        style={[{ flexDirection: 'column', gap: resolveSpace(1, scaling) }, margins, style]}
      >
        {children}
      </View>
    </Selection.Root>
  )
}
RadioGroupRoot.displayName = 'RadioGroup.Root'

// ─── Item ───────────────────────────────────────────────────────────────────────

function RadioGroupItem({
  value,
  disabled,
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupItemProps) {
  const item = Selection.useItem(value, disabled)
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { size, variant, color, highContrast } = item.shared

  // No label: the control itself is the item.
  if (children == null) {
    return (
      <Radio
        size={size}
        variant={variant}
        color={color}
        highContrast={highContrast}
        checked={item.checked}
        disabled={item.disabled}
        onPress={item.select}
        m={m} mx={mx} my={my} mt={mt} mr={mr} mb={mb} ml={ml}
        style={style}
      />
    )
  }

  return (
    <LabeledControl
      role="radio"
      checked={item.checked}
      disabled={item.disabled}
      onPress={item.select}
      control={
        <Radio size={size} variant={variant} color={color} highContrast={highContrast} checked={item.checked} disabled={item.disabled} />
      }
      size={size}
      color={color}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      margins={margins}
      style={style}
    >
      {children}
    </LabeledControl>
  )
}
RadioGroupItem.displayName = 'RadioGroup.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
})
