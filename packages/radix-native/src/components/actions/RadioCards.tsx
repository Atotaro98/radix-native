import React, { useMemo } from 'react'
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
import type { RadioSize } from './Radio'

export type RadioCardsVariant = SelectionCardVariant

interface Shared {
  size: RadioSize
  variant: RadioCardsVariant
  color?: AccentColor
  highContrast?: boolean
}

const Selection = createSelectionGroup<'single', Shared>({ name: 'RadioCards', type: 'single' })

/** Radix: item font-size per size (font-size-2 / 3 / 4). */
const SIZE_FONT: Record<1 | 2 | 3, TextSize> = { 1: 2, 2: 3, 3: 4 }

const SIZE_CONFIG: Record<RadioSize, { padding: number; radiusLevel: 2 | 3 }> = {
  1: { padding: 12, radiusLevel: 2 },
  2: { padding: 16, radiusLevel: 3 },
  3: { padding: 24, radiusLevel: 3 },
}

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface RadioCardsProps extends MarginProps {
  /** Card size (1–3). Default: 2. */
  size?: RadioSize
  /** Visual variant. Default: 'surface'. */
  variant?: RadioCardsVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  /** Gap between cards as space token. Default: 4. */
  gap?: SpaceToken
  /** Controlled selected value. */
  value?: string
  /** Uncontrolled default selected value. */
  defaultValue?: string
  /** Called when the selected value changes. */
  onValueChange?: (value: string) => void
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

export interface RadioCardsItemProps {
  /** Unique value identifying this card. */
  value: string
  /** Disables this card (a disabled group always wins). */
  disabled?: boolean
  /** Card content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Root ───────────────────────────────────────────────────────────────────────

function RadioCardsRoot({
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
}: RadioCardsProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const shared = useMemo<Shared>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

  return (
    <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
      <SelectionCardGrid
      role="radiogroup"
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
RadioCardsRoot.displayName = 'RadioCards.Root'

// ─── Item ───────────────────────────────────────────────────────────────────────

function RadioCardsItem({ value, disabled, children, style }: RadioCardsItemProps) {
  const item = Selection.useItem(value, disabled)
  const { scaling } = useThemeContext()
  const { size, variant, color, highContrast } = item.shared
  const cfg = SIZE_CONFIG[size]
  const padding = Math.round(cfg.padding * scalingMap[scaling])

  return (
    <SelectionCard
      recipe="radioCard"
      role="radio"
      checked={item.checked}
      disabled={item.disabled}
      onPress={item.select}
      variant={variant}
      color={color}
      highContrast={highContrast}
      fontSize={SIZE_FONT[size]}
      radiusLevel={cfg.radiusLevel}
      padding={{ top: padding, right: padding, bottom: padding, left: padding }}
      style={style}
    >
      {children}
    </SelectionCard>
  )
}
RadioCardsItem.displayName = 'RadioCards.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const RadioCards = Object.assign(RadioCardsRoot, {
  Root: RadioCardsRoot,
  Item: RadioCardsItem,
})
