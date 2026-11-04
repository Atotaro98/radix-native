import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { createSelectionGroup } from '../internal/selectionGroup'
import { SelectionCard, SelectionCardGrid, SELECTION_CARD_FONT_SIZE, type SelectionCardVariant } from '../internal/SelectionCard'
import type { SpaceToken } from '../../tokens/spacing'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { Checkbox, CHECKBOX_SIZE, type CheckboxSize } from './Checkbox'

export type CheckboxCardsVariant = SelectionCardVariant

interface Shared {
  size: CheckboxSize
  variant: CheckboxCardsVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'multiple', Shared>({ name: 'CheckboxCards', type: 'multiple' })

// Radix: padding-left = space-3/4/5, padding-y = space-3/1.2, space-4*0.875, space-5/1.2,
// padding-right = padding-left * 2 + checkbox-size (CHECKBOX_SIZE)
const SIZE_CONFIG: Record<CheckboxSize, { paddingLeft: number; paddingY: number; radiusLevel: 3 | 4 }> = {
  1: { paddingLeft: 12, paddingY: 10, radiusLevel: 3 },
  2: { paddingLeft: 16, paddingY: 14, radiusLevel: 3 },
  3: { paddingLeft: 24, paddingY: 20, radiusLevel: 4 },
}

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
  const { px } = useMetrics()
  const { size, variant, color, highContrast } = item.shared
  const cfg = SIZE_CONFIG[size]
  const paddingLeft = px(cfg.paddingLeft)
  const paddingY = px(cfg.paddingY)
  const paddingRight = paddingLeft * 2 + px(CHECKBOX_SIZE[size])

  return (
    <SelectionCard
      recipe="checkboxCard"
      role="checkbox"
      checked={item.checked}
      disabled={item.disabled}
      onPress={item.select}
      variant={variant}
      color={color}
      highContrast={highContrast}
      fontSize={SELECTION_CARD_FONT_SIZE[size]}
      radiusLevel={cfg.radiusLevel}
      padding={{ top: paddingY, right: paddingRight, bottom: paddingY, left: paddingLeft }}
      indicator={
        // Checkbox on the right, vertically centered (Radix CSS)
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          style={{ position: 'absolute', right: paddingLeft, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <Checkbox
            size={size}
            variant="surface" // Radix checkbox-cards.tsx always renders a surface Checkbox
            color={color}
            highContrast={highContrast}
            checked={item.checked}
            disabled={item.disabled}
          />
        </View>
      }
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
