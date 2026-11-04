import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMargins } from '../../hooks/useMargins'
import { createSelectionGroup } from '../internal/selectionGroup'
import { SelectionCard, SelectionCardGrid, type SelectionCardVariant } from '../internal/SelectionCard'
import type { TextSize } from '../typography/Text'
import { scalingMap } from '../../tokens/scaling'
import type { SpaceToken } from '../../tokens/spacing'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { Checkbox, type CheckboxSize } from './Checkbox'

export type CheckboxCardsVariant = SelectionCardVariant

interface Shared {
  size: CheckboxSize
  variant: CheckboxCardsVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'multiple', Shared>({ name: 'CheckboxCards', type: 'multiple' })

/** Radix: item font-size per size (font-size-2 / 3 / 4). */
const SIZE_FONT: Record<1 | 2 | 3, TextSize> = { 1: 2, 2: 3, 3: 4 }

// Radix: padding-left = space-3/4/5, padding-y = space-3/1.2, space-4*0.875, space-5/1.2,
// checkbox-size = space-4*0.875, space-4, space-4*1.25,
// padding-right = padding-left * 2 + checkbox-size
const SIZE_CONFIG: Record<CheckboxSize, { paddingLeft: number; paddingY: number; checkboxSize: number; radiusLevel: 3 | 4 }> = {
  1: { paddingLeft: 12, paddingY: 10, checkboxSize: 14, radiusLevel: 3 },
  2: { paddingLeft: 16, paddingY: 14, checkboxSize: 16, radiusLevel: 3 },
  3: { paddingLeft: 24, paddingY: 20, checkboxSize: 20, radiusLevel: 4 },
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
  const { scaling } = useThemeContext()
  const { size, variant, color, highContrast } = item.shared
  const cfg = SIZE_CONFIG[size]
  const factor = scalingMap[scaling]
  const paddingLeft = Math.round(cfg.paddingLeft * factor)
  const paddingY = Math.round(cfg.paddingY * factor)
  const paddingRight = paddingLeft * 2 + Math.round(cfg.checkboxSize * factor)

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
      fontSize={SIZE_FONT[size]}
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
