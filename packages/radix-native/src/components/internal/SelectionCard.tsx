import React, { useMemo } from 'react'
import { Text as RNText, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useMargins } from '../../hooks/useMargins'
import { shadowStyle } from '../../utils/shadow'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { TextSize } from '../typography/Text'
import { ToggleSurface, type ToggleKind } from './ToggleSurface'
import { CardRing } from './CardRing'
import { AccessibleControlContext } from './accessibleControl'
import { InsetContext, type InsetValues } from '../layout/InsetContext'
import { ColumnRows, AutoFitRows } from './ColumnRows'
import { createSelectionGroup, type SelectionValue } from './selectionGroup'
import type { MarginProps } from '../../types/marginProps'

export type SelectionCardSize = 1 | 2 | 3
export type SelectionCardVariant = 'surface' | 'classic'

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
  const { scaling, radius } = useThemeContext()
  const metrics = useMetrics()
  const colors = useVariantColors(recipe, { variant, color, highContrast, checked, disabled })

  const cfg = CARD_SIZE[size]
  const paddingX = metrics.px(cfg.paddingX)
  const paddingY = metrics.px(cfg.paddingY)
  const indicatorWidth = indicator ? indicator.kind.geometry(indicator.props, { scaling, radius }).width : 0
  const checkedBorder = checked && 'checkedBorder' in colors ? colors.checkedBorder : undefined
  const borderRadius = metrics.radius(cfg.radiusLevel)
  // Plain-text children: Radix item font size, body text gray-12 unless the recipe sets one (disabled).
  const body = useVariantColors('text', {})
  const label = useTextStyle({ size: cfg.fontSize, color: colors.text ?? body.text })

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
    borderRadius,
    backgroundColor: colors.bg,
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
      style={[
        cardStyle,
        shadowStyle(colors.shadow),
        style,
      ]}
    >
      <AccessibleControlContext.Provider value>
        <InsetContext.Provider value={inset}>
          {/* Plain strings must live inside <Text> in RN */}
          {typeof children === 'string' || typeof children === 'number'
            ? <RNText style={[label.style, { flexShrink: 1 }]} {...label.textProps}>{children}</RNText>
            : children}
        </InsetContext.Provider>
      </AccessibleControlContext.Provider>
      {indicator ? (
        // Trailing edge, vertically centered (Radix CSS)
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: paddingX, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <indicator.kind.Indicator {...indicator.props} />
        </View>
      ) : null}
      {/* The ring is drawn over the content (Radix ::after); checked RadioCards draw a 2px outline instead */}
      {checkedBorder
        ? <CardRing color={checkedBorder} borderRadius={borderRadius} width={CHECKED_RING_WIDTH} />
        : <CardRing color={colors.border} borderRadius={borderRadius} />}
    </ToggleSurface>
  )
}

/** `--radio-cards-item-border-width` / `--checkbox-cards-item-border-width`: 1px in both variants. */
const CARD_BORDER_WIDTH = 1
/** `.rt-RadioCardsItem[data-state='checked']::after { outline: 2px }`. */
const CHECKED_RING_WIDTH = 2

interface SelectionCardGridProps {
  /** Number of equal-width columns; omitted = auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  gap: SpaceToken
  /** Radix: `group` for CheckboxCards, `radiogroup` for RadioCards. */
  role: 'group' | 'radiogroup'
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

// Radix radioCardsRootPropDefs / checkboxCardsRootPropDefs default
// `columns: 'repeat(auto-fit, minmax(160px, 1fr))'`: a plain 160px, not scaled by --scaling.
const AUTO_FIT_MIN_ITEM_WIDTH = 160

/** Internal: the grid of CheckboxCards / RadioCards (Radix `repeat(auto-fit, minmax(160px, 1fr))`). */

export function SelectionCardGrid({ columns, gap, role, accessibilityLabel, testID, style, children }: SelectionCardGridProps) {
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

export interface SelectionCardsProps<T extends SelectionType> extends MarginProps {
  /** Card size (1–3). Default: 2. */
  size?: SelectionCardSize
  /** Visual variant. Default: 'surface'. */
  variant?: SelectionCardVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  /** Gap between cards as space token. Default: 4. */
  gap?: SpaceToken
  /** Controlled selection: one value (RadioCards) or several (CheckboxCards). */
  value?: SelectionValue<T>
  /** Uncontrolled default selection. */
  defaultValue?: SelectionValue<T>
  /** Called when the selection changes. */
  onValueChange?: (value: SelectionValue<T>) => void
  /** Disables every card. */
  disabled?: boolean
  /** Card items. */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

export interface SelectionCardsItemProps {
  /** Unique value identifying this card. */
  value: string
  /** Disables this card (a disabled group always wins). */
  disabled?: boolean
  /** Card content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface Shared {
  size: SelectionCardSize
  variant: SelectionCardVariant
  color?: AccentColor
  highContrast?: boolean
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
  const Selection = createSelectionGroup<T, Shared>({ name, type })

  function Root({
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
  }: SelectionCardsProps<T>) {
    const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
    const shared = useMemo<Shared>(() => ({ size, variant, color, highContrast }), [size, variant, color, highContrast])

    return (
      <Selection.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} disabled={disabled} shared={shared}>
        <SelectionCardGrid
          role={rootRole}
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
  Root.displayName = `${name}.Root`

  function Item({ value, disabled, children, style }: SelectionCardsItemProps) {
    const item = Selection.useItem(value, disabled)
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
  Item.displayName = `${name}.Item`

  return Object.assign(Root, { Root, Item })
}
