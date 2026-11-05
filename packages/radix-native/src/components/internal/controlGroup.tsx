import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { LabeledControl } from './LabeledControl'
import { createSelectionGroup, type SelectionValue } from './selectionGroup'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'

type SelectionType = 'single' | 'multiple'

interface Shared<S, V> {
  size: S
  variant: V
  color?: AccentColor
  highContrast?: boolean
}

type IndicatorProps<S, V> = Shared<S, V> & { checked: boolean; disabled: boolean }
type ControlProps<S, V> = IndicatorProps<S, V> & MarginProps & {
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

export interface ControlGroupProps<T extends SelectionType, S, V> extends MarginProps {
  /** Control size (1–3). Default: 2. */
  size?: S
  /** Visual variant. Default: 'surface'. */
  variant?: V
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled selection: one value (RadioGroup) or several (CheckboxGroup). */
  value?: SelectionValue<T>
  /** Uncontrolled default selection. */
  defaultValue?: SelectionValue<T>
  /** Called when the selection changes. */
  onValueChange?: (value: SelectionValue<T>) => void
  /** Disables every item in the group. */
  disabled?: boolean
  /** Group children (`.Item`). */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

export interface ControlGroupItemProps extends MarginProps {
  /** Unique value identifying this item. */
  value: string
  /** Disables this item (a disabled group always wins). */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  /** Label text or custom content. When omitted, the control itself is the item. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface ControlGroupConfig<T extends SelectionType, S, V> {
  name: string
  type: T
  /** Role of the group container (Radix: `group` for CheckboxGroup, `radiogroup` for RadioGroup). */
  rootRole: 'group' | 'radiogroup'
  /** Accessibility role of each item. */
  itemRole: 'checkbox' | 'radio'
  /** The Toggle rendered for an item without a label. */
  Control: React.ComponentType<ControlProps<S, V>>
  /** The Indicator shown next to a label. */
  Indicator: React.ComponentType<IndicatorProps<S, V>>
}

/**
 * Internal: CheckboxGroup and RadioGroup — a Selection group of Toggles laid
 * out in a column (Radix: gap space-1). An item with a label is a single
 * LabeledControl row; without one, the Toggle itself is the item.
 */
export function createControlGroup<T extends SelectionType, S, V>({
  name,
  type,
  rootRole,
  itemRole,
  Control,
  Indicator,
}: ControlGroupConfig<T, S, V>) {
  const Selection = createSelectionGroup<T, Shared<S, V>>({ name, type })

  function Root({
    size = 2 as S,
    variant = 'surface' as V,
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
  }: ControlGroupProps<T, S, V>) {
    const { space } = useMetrics()
    const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
    const shared = useMemo<Shared<S, V>>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

    return (
      <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
        <View
          role={rootRole}
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
  Root.displayName = `${name}.Root`

  function Item({
    value,
    disabled,
    maxFontSizeMultiplier,
    children,
    m, mx, my, mt, mr, mb, ml,
    style,
  }: ControlGroupItemProps) {
    const item = Selection.useItem(value, disabled)
    const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
    const { size, variant, color, highContrast } = item.shared

    // No label: the control itself is the item.
    if (children == null) {
      return (
        <Control
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
        role={itemRole}
        checked={item.checked}
        disabled={item.disabled}
        onPress={item.select}
        control={
          <Indicator size={size} variant={variant} color={color} highContrast={highContrast} checked={item.checked} disabled={item.disabled} />
        }
        size={size as 1 | 2 | 3}
        color={color}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        margins={margins}
        style={style}
      >
        {children}
      </LabeledControl>
    )
  }
  Item.displayName = `${name}.Item`

  return Object.assign(Root, { Root, Item })
}
