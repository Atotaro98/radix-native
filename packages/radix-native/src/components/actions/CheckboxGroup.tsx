import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { LabeledControl } from '../internal/LabeledControl'
import { createSelectionGroup } from '../internal/selectionGroup'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { Checkbox, CheckboxIndicator, type CheckboxSize, type CheckboxVariant } from './Checkbox'

interface Shared {
  size: CheckboxSize
  variant: CheckboxVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'multiple', Shared>({ name: 'CheckboxGroup', type: 'multiple' })

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface CheckboxGroupProps extends MarginProps {
  /** Checkbox size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled selected values. */
  value?: string[]
  /** Uncontrolled default selected values. */
  defaultValue?: string[]
  /** Called when the selected values change. */
  onValueChange?: (value: string[]) => void
  /** Disables every item in the group. */
  disabled?: boolean
  /** Group children (CheckboxGroup.Item). */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface CheckboxGroupItemProps extends MarginProps {
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

function CheckboxGroupRoot({
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
}: CheckboxGroupProps) {
  const { space } = useMetrics()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const shared = useMemo<Shared>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

  return (
    <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
      <View
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        // Radix: column, gap space-1
        style={[{ flexDirection: 'column', gap: space(1) }, margins, style]}
      >
        {children}
      </View>
    </Selection.Root>
  )
}
CheckboxGroupRoot.displayName = 'CheckboxGroup.Root'

// ─── Item ───────────────────────────────────────────────────────────────────────

function CheckboxGroupItem({
  value,
  disabled,
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxGroupItemProps) {
  const item = Selection.useItem(value, disabled)
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { size, variant, color, highContrast } = item.shared

  // No label: the control itself is the item.
  if (children == null) {
    return (
      <Checkbox
        size={size}
        variant={variant}
        color={color}
        highContrast={highContrast}
        checked={item.checked}
        disabled={item.disabled}
        onCheckedChange={item.select}
        m={m} mx={mx} my={my} mt={mt} mr={mr} mb={mb} ml={ml}
        style={style}
      />
    )
  }

  return (
    <LabeledControl
      role="checkbox"
      checked={item.checked}
      disabled={item.disabled}
      onPress={item.select}
      control={
        <CheckboxIndicator size={size} variant={variant} color={color} highContrast={highContrast} checked={item.checked} disabled={item.disabled} />
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
CheckboxGroupItem.displayName = 'CheckboxGroup.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
})
