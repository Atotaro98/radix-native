import React, { useMemo } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import { createSelectionGroup } from '../internal/selectionGroup'
import { SelectionCard, SelectionCardGrid, type SelectionCardVariant } from '../internal/SelectionCard'
import type { SpaceToken } from '../../tokens/spacing'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { CheckboxToggle, type CheckboxSize } from './Checkbox'

export type CheckboxCardsVariant = SelectionCardVariant

interface Shared {
  size: CheckboxSize
  variant: CheckboxCardsVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'multiple', Shared>({ name: 'CheckboxCards', type: 'multiple' })

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface CheckboxCardsProps extends MarginProps {
  /** Card size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxCardsVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  /** Gap between cards as space token. Default: 4. */
  gap?: SpaceToken
  /** Controlled selected values. */
  value?: string[]
  /** Uncontrolled default selected values. */
  defaultValue?: string[]
  /** Called when the selected values change. */
  onValueChange?: (value: string[]) => void
  /** Disables every card. */
  disabled?: boolean
  /** Card items. */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface CheckboxCardsItemProps {
  /** Unique value identifying this card. */
  value: string
  /** Disables this card (a disabled group always wins). */
  disabled?: boolean
  /** Card content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Root ───────────────────────────────────────────────────────────────────────

function CheckboxCardsRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  columns,
  gap = 4,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxCardsProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const shared = useMemo<Shared>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

  return (
    <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
      <SelectionCardGrid
        role="group"
        columns={columns}
        gap={gap}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[margins, style]}
      >
        {children}
      </SelectionCardGrid>
    </Selection.Root>
  )
}
CheckboxCardsRoot.displayName = 'CheckboxCards.Root'

// ─── Item ───────────────────────────────────────────────────────────────────────

function CheckboxCardsItem({ value, disabled, children, style }: CheckboxCardsItemProps) {
  const item = Selection.useItem(value, disabled)
  const { size, variant, color, highContrast } = item.shared

  return (
    <SelectionCard
      recipe="checkboxCard"
      role="checkbox"
      size={size}
      checked={item.checked}
      disabled={item.disabled}
      onPress={item.select}
      variant={variant}
      color={color}
      highContrast={highContrast}
      indicator={{
        kind: CheckboxToggle,
        // Radix checkbox-cards.tsx always renders a surface Checkbox
        props: { size, variant: 'surface', color, highContrast, checked: item.checked, disabled: item.disabled },
      }}
      style={style}
    >
      {children}
    </SelectionCard>
  )
}
CheckboxCardsItem.displayName = 'CheckboxCards.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxCards = Object.assign(CheckboxCardsRoot, {
  Root: CheckboxCardsRoot,
  Item: CheckboxCardsItem,
})
