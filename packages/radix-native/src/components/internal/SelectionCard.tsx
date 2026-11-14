import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { TextSize } from '../typography/Text'
import { ToggleSurface, useToggleGeometry, type ToggleKind } from './ToggleSurface'
import { paintSurface } from './surface'
import { InsetContext, type InsetValues } from '../layout/InsetContext'
import { ColumnRows, AutoFitRows } from './ColumnRows'
import {
  createSelectionFamily,
  renderItemLabel,
  type SelectionFamilyRootProps,
  type SelectionItem,
  type SelectionLayoutProps,
  type SelectionShared,
} from './selectionGroup'
import type { CardItemVariant } from '../../utils/variantPalette'

export type SelectionCardSize = 1 | 2 | 3
export type SelectionCardVariant = CardItemVariant

/**
 * Radix .rt-CheckboxCardsRoot / .rt-RadioCardsRoot :where(.rt-r-size-1/2/3), the
 * same in both families:
 * - item padding-x: var(--space-3/4/5) → 12 / 16 / 24px
 * - item padding-y: calc(var(--space-3) / 1.2), calc(var(--space-4) * 0.875),
 *   calc(var(--space-5) / 1.2) → 10 / 14 / 20px
 * - item font-size: var(--font-size-2/3/4); item radius: var(--radius-3/3/4)
 * A checkbox card's padding-right is padding-x * 2 + checkbox size, leaving
 * room for the Checkbox at the trailing edge.
 */
const CARD_SIZE: Record<SelectionCardSize, { paddingX: number; paddingY: number; fontSize: TextSize; radiusLevel: RadiusLevel }> = {
  1: { paddingX: 12, paddingY: 10, fontSize: 2, radiusLevel: 3 },
  2: { paddingX: 16, paddingY: 14, fontSize: 3, radiusLevel: 3 },
  3: { paddingX: 24, paddingY: 20, fontSize: 4, radiusLevel: 4 },
}

interface SelectionCardProps<P extends object> {
  /** Variant recipe: `checkboxCard` or `radioCard`. */
  recipe: 'checkboxCard' | 'radioCard'
  role: 'checkbox' | 'radio'
  /** The group's size: decides padding, font size of plain text and radius. */
  size: SelectionCardSize
  checked: boolean
  disabled: boolean
  onPress: () => void
  variant: SelectionCardVariant
  color?: AccentColor
  highContrast?: boolean
  /** Indicator shown at the trailing edge (checkbox cards), not interactive. */
  indicator?: { kind: ToggleKind<P>; props: P }
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Internal: a Selection card — CheckboxCards.Item and RadioCards.Item. Owns the
 * card's Radix size, recipe colors, classic effect, trailing Indicator and
 * plain-text children, on a Toggle surface (role, announced state, press scale,
 * focus ring on its edge). Like Radix's `base-card.css`, its 1px border — and
 * the 2px checked outline of RadioCards — is a ring drawn over the content, so
 * content starts at the item padding and checking an item never moves it, even
 * when the consumer overrides the padding through `style`. Provides the Inset
 * values (padding − border width) to an `Inset` inside it.
 */
export function SelectionCard<P extends object>({
  recipe,
  role,
  size,
  checked,
  disabled,
  onPress,
  variant,
  color,
  highContrast,
  indicator,
  children,
  style,
}: SelectionCardProps<P>) {
  const metrics = useMetrics()
  const colors = useVariantColors(recipe, { variant, color, highContrast, checked, disabled })

  const cfg = CARD_SIZE[size]
  const paddingX = metrics.px(cfg.paddingX)
  const paddingY = metrics.px(cfg.paddingY)
  const geometry = useToggleGeometry(indicator)
  const indicatorWidth = geometry?.width ?? 0
  const borderRadius = metrics.radius(cfg.radiusLevel)
  // The ring is drawn over the content (Radix ::after): checking a radio card swaps it for a
  // 2px outline (the recipe decides) without moving the content
  const surface = paintSurface(colors, borderRadius)
  // Plain-text children: Radix item font size, gray-12 (disabled gray-a9)
  const label = useTextStyle({ size: cfg.fontSize, color: colors.text })

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    // .rt-CheckboxCardsItem / .rt-RadioCardsItem: display flex, align-items center, gap space-2
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.space(2),
    paddingTop: paddingY,
    paddingRight: indicator ? paddingX * 2 + indicatorWidth : paddingX,
    paddingBottom: paddingY,
    paddingLeft: paddingX,
  }

  // base-card.css: --inset-padding-* = item padding − border width
  const paddingRight = cardStyle.paddingRight as number
  const inset = useMemo<InsetValues>(() => ({
    padding: {
      top: paddingY - CARD_BORDER_WIDTH,
      right: paddingRight - CARD_BORDER_WIDTH,
      bottom: paddingY - CARD_BORDER_WIDTH,
      left: paddingX - CARD_BORDER_WIDTH,
    },
    borderWidth: CARD_BORDER_WIDTH,
    borderRadius,
  }), [paddingX, paddingY, paddingRight, borderRadius])

  return (
    <ToggleSurface
      role={role}
      checked={checked}
      disabled={disabled}
      onPress={onPress}
      color={color}
      borderRadius={borderRadius}
      style={[cardStyle, surface.style, style]}
    >
      <InsetContext.Provider value={inset}>
          {/* Plain strings must live inside <Text> in RN */}
          {renderItemLabel(children, label, { flexShrink: 1 })}
      </InsetContext.Provider>
      {indicator && geometry ? (
        // Trailing edge, vertically centered (Radix CSS)
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: paddingX, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <indicator.kind.Indicator {...indicator.props} geometry={geometry} />
        </View>
      ) : null}
      {surface.over}
    </ToggleSurface>
  )
}

/** `--radio-cards-item-border-width` / `--checkbox-cards-item-border-width`: 1px in both variants. */
const CARD_BORDER_WIDTH = 1

/** The Root props CheckboxCards and RadioCards add to a Selection group's. */
export interface CardGridProps {
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  /** Gap between cards as space token. Default: 4. */
  gap?: SpaceToken
}

// Radix radioCardsRootPropDefs / checkboxCardsRootPropDefs default
// `columns: 'repeat(auto-fit, minmax(160px, 1fr))'`: a plain 160px, not scaled by --scaling.
const AUTO_FIT_MIN_ITEM_WIDTH = 160

/** Internal: the grid of CheckboxCards / RadioCards (Radix `repeat(auto-fit, minmax(160px, 1fr))`). */

export function SelectionCardGrid({ role, accessibilityLabel, testID, style, extra: { columns, gap = 4 }, children }: SelectionLayoutProps<CardGridProps>) {
  const { space } = useMetrics()
  const resolvedGap = space(gap)
  return (
    <View role={role} accessibilityLabel={accessibilityLabel} testID={testID} style={style}>
      {columns !== undefined ? (
        <ColumnRows columns={columns} columnGap={resolvedGap} rowGap={resolvedGap} alignItems="stretch">
          {children}
        </ColumnRows>
      ) : (
        <AutoFitRows minItemWidth={AUTO_FIT_MIN_ITEM_WIDTH} gap={resolvedGap}>
          {children}
        </AutoFitRows>
      )}
    </View>
  )
}

// ─── Factory ────────────────────────────────────────────────────────────────────

type SelectionType = 'single' | 'multiple'

/** CheckboxCards / RadioCards Root props (sizes 1–3, default 2; default variant 'surface'). */
export type SelectionCardsProps<T extends SelectionType> =
  SelectionFamilyRootProps<T, SelectionCardSize, SelectionCardVariant> & CardGridProps

export interface SelectionCardsItemProps {
  /** Unique value identifying this card. */
  value: string
  /** Disables this card (a disabled group always wins). */
  disabled?: boolean
  /** Card content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

/** Props of a card's trailing Indicator. Radix checkbox-cards.tsx always renders a surface Checkbox. */
interface CardIndicatorProps {
  size: SelectionCardSize
  variant: 'surface'
  color?: AccentColor
  highContrast?: boolean
  checked: boolean
  disabled: boolean
}

interface SelectionCardsConfig<T extends SelectionType> {
  name: string
  type: T
  /** Role of the grid (Radix: `group` for CheckboxCards, `radiogroup` for RadioCards). */
  rootRole: 'group' | 'radiogroup'
  /** Accessibility role of each card. */
  itemRole: 'checkbox' | 'radio'
  recipe: 'checkboxCard' | 'radioCard'
  /** The Toggle shown at each card's trailing edge, if any (CheckboxCards). */
  kind?: ToggleKind<CardIndicatorProps>
}

/**
 * Internal: CheckboxCards and RadioCards — a Selection group of Selection
 * cards laid out in a grid. Both families are one call each.
 */
export function createSelectionCards<T extends SelectionType>({
  name,
  type,
  rootRole,
  itemRole,
  recipe,
  kind,
}: SelectionCardsConfig<T>) {
  function ItemView({ item, children, style }: SelectionCardsItemProps & { item: SelectionItem<SelectionShared<SelectionCardSize, SelectionCardVariant>> }) {
    const { size, variant, color, highContrast } = item.shared
    return (
      <SelectionCard
        recipe={recipe}
        role={itemRole}
        size={size}
        checked={item.checked}
        disabled={item.disabled}
        onPress={item.select}
        variant={variant}
        color={color}
        highContrast={highContrast}
        indicator={kind && {
          kind,
          props: { size, variant: 'surface', color, highContrast, checked: item.checked, disabled: item.disabled },
        }}
        style={style}
      >
        {children}
      </SelectionCard>
    )
  }

  return createSelectionFamily<T, SelectionCardSize, SelectionCardVariant, CardGridProps, SelectionCardsItemProps>({
    name,
    type,
    rootRole,
    size: 2,
    Layout: SelectionCardGrid,
    Item: ItemView,
  })
}
