import React from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { getClassicEffect } from '../../utils/classicEffect'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { Text } from '../typography/Text'
import type { TextSize } from '../typography/Text'
import { ToggleSurface, type ToggleKind } from './ToggleSurface'
import { ColumnRows, AutoFitRows } from './ColumnRows'

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
 * focus ring on its edge). When the recipe has a checked border (RadioCards) it
 * is drawn as a 2px overlay ring over the 1px border, like Radix's `::after`
 * outline, so checking an item never moves its content — even when the
 * consumer overrides the padding through `style`.
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
  const { appearance, scaling, radius } = useThemeContext()
  const metrics = useMetrics()
  const colors = useVariantColors(recipe, { variant, color, highContrast, checked, disabled })

  const cfg = CARD_SIZE[size]
  const paddingX = metrics.px(cfg.paddingX)
  const paddingY = metrics.px(cfg.paddingY)
  const indicatorWidth = indicator ? indicator.kind.geometry(indicator.props, { scaling, radius }).width : 0
  const checkedBorder = checked && 'checkedBorder' in colors ? colors.checkedBorder : undefined
  const borderRadius = metrics.radius(cfg.radiusLevel)

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: paddingY,
    paddingRight: indicator ? paddingX * 2 + indicatorWidth : paddingX,
    paddingBottom: paddingY,
    paddingLeft: paddingX,
    borderRadius,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: checkedBorder ?? colors.border,
    backgroundColor: colors.bg,
  }

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
        variant === 'classic' && !disabled ? getClassicEffect(appearance) : undefined,
        style,
      ]}
    >
      {/* Plain strings must live inside <Text> in RN */}
      {typeof children === 'string' || typeof children === 'number'
        ? <Text size={cfg.fontSize} style={colors.text ? { color: colors.text } : undefined}>{children}</Text>
        : children}
      {indicator ? (
        // Trailing edge, vertically centered (Radix CSS)
        <View
          pointerEvents="none"
          style={{ position: 'absolute', right: paddingX, top: 0, bottom: 0, justifyContent: 'center' }}
        >
          <indicator.kind.Indicator {...indicator.props} />
        </View>
      ) : null}
      {checkedBorder ? <CheckedRing color={checkedBorder} borderRadius={borderRadius} /> : null}
    </ToggleSurface>
  )
}

/** `--radio-cards-item-border-width` / `--checkbox-cards-item-border-width`: 1px in both variants. */
const CARD_BORDER_WIDTH = 1
/** `.rt-RadioCardsItem[data-state='checked']::after { outline: 2px }`. */
const CHECKED_RING_WIDTH = 2

/**
 * Radix draws the checked ring as a 2px `outline` (offset -1px) on the `::after`
 * inset by the 1px border, so it covers the outer 2px of the card without
 * taking layout space. Absolute children are placed from the padding box, so
 * the overlay is pulled out by the border width to reach the card's edge.
 */
function CheckedRing({ color, borderRadius }: { color: string; borderRadius: number }) {
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        position: 'absolute',
        top: -CARD_BORDER_WIDTH,
        left: -CARD_BORDER_WIDTH,
        right: -CARD_BORDER_WIDTH,
        bottom: -CARD_BORDER_WIDTH,
        borderRadius,
        borderWidth: CHECKED_RING_WIDTH,
        borderColor: color,
      }}
    />
  )
}

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
