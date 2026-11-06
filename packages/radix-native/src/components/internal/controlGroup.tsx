import React, { useMemo } from 'react'
import { Text as RNText, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { ToggleSurface, type ToggleKind } from './ToggleSurface'
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
  /** The Toggle's Indicator and geometry, shown next to a label. */
  kind: ToggleKind<IndicatorProps<S, V>>
}

/**
 * Internal: CheckboxGroup and RadioGroup — a Selection group of Toggles laid
 * out in a column (Radix: gap space-1). An item with a label is a single
 * row (a Toggle surface around the Indicator and the label); without one,
 * the Toggle itself is the item.
 */
export function createControlGroup<T extends SelectionType, S extends 1 | 2 | 3, V>({
  name,
  type,
  rootRole,
  itemRole,
  Control,
  kind,
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
      <LabeledRow
        role={itemRole}
        kind={kind}
        indicator={{ size, variant, color, highContrast, checked: item.checked, disabled: item.disabled }}
        onPress={item.select}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        margins={margins}
        style={style}
      >
        {children}
      </LabeledRow>
    )
  }
  Item.displayName = `${name}.Item`

  return Object.assign(Root, { Root, Item })
}

interface LabeledRowProps<S extends 1 | 2 | 3, V> {
  role: 'checkbox' | 'radio'
  kind: ToggleKind<IndicatorProps<S, V>>
  indicator: IndicatorProps<S, V>
  onPress: () => void
  maxFontSizeMultiplier?: number
  margins: ViewStyle
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}

/**
 * A labelled item: one Toggle surface around the Indicator and the label, so
 * the whole row is the touch target and is announced as one checkbox / radio
 * named by its label. Radix: label is gray-12 (gray-a8 disabled), Text size
 * 1–3 like the group, 0.5em away from the Indicator.
 */
function LabeledRow<S extends 1 | 2 | 3, V>({
  role,
  kind,
  indicator,
  onPress,
  maxFontSizeMultiplier,
  margins,
  style,
  children,
}: LabeledRowProps<S, V>) {
  const { size, color, checked, disabled } = indicator
  const labelColors = useVariantColors('controlLabel', { disabled })
  const label = useTextStyle({ size, color: labelColors.text, maxFontSizeMultiplier })
  const fontSize = label.style.fontSize ?? 0
  const gap = Math.round(fontSize / 2)

  return (
    <ToggleSurface
      role={role}
      checked={checked}
      disabled={disabled}
      onPress={onPress}
      color={color}
      indicator={{ kind, props: indicator }}
      labelLineHeight={label.style.lineHeight ?? fontSize}
      style={[{ flexDirection: 'row', alignItems: 'center', gap }, margins, style]}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <RNText style={label.style} {...label.textProps}>
          {children}
        </RNText>
      ) : (
        children
      )}
    </ToggleSurface>
  )
}
