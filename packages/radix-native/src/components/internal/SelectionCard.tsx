import React from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getClassicEffect } from '../../utils/classicEffect'
import type { SpaceToken } from '../../tokens/spacing'
import type { RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { Text } from '../typography/Text'
import type { TextSize } from '../typography/Text'
import { FocusRing } from './FocusRing'
import { ColumnRows, AutoFitRows } from './ColumnRows'

/** Radix CheckboxCards / RadioCards: item font-size per size (font-size-2 / 3 / 4). */
export const SELECTION_CARD_FONT_SIZE: Record<1 | 2 | 3, TextSize> = { 1: 2, 2: 3, 3: 4 }

export type SelectionCardVariant = 'surface' | 'classic'

interface SelectionCardProps {
  /** Variant recipe: `checkboxCard` or `radioCard`. */
  recipe: 'checkboxCard' | 'radioCard'
  role: 'checkbox' | 'radio'
  checked: boolean
  disabled: boolean
  onPress: () => void
  variant: SelectionCardVariant
  color?: AccentColor
  highContrast?: boolean
  /** Font size of plain-text children. */
  fontSize: TextSize
  radiusLevel: RadiusLevel
  /** Padding inside the 1px border (the checked ring is an overlay, it never changes layout). */
  padding: { top: number; right: number; bottom: number; left: number }
  /** Extra visual (e.g. the Checkbox on the right), not interactive. */
  indicator?: React.ReactNode
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Internal: the shell shared by CheckboxCards.Item and RadioCards.Item — the
 * pressable card, its recipe colors, the classic effect, the focus ring and
 * plain-text children. When the recipe has a checked border (RadioCards) it is
 * drawn as a 2px overlay ring over the 1px border, like Radix's `::after`
 * outline, so checking an item never moves its content — even when the
 * consumer overrides the padding through `style`.
 */
export function SelectionCard({
  recipe,
  role,
  checked,
  disabled,
  onPress,
  variant,
  color,
  highContrast,
  fontSize,
  radiusLevel,
  padding,
  indicator,
  children,
  style,
}: SelectionCardProps) {
  const { appearance } = useThemeContext()
  const { focused, scaleStyle, handlers } = useInteraction({ enabled: !disabled })
  const metrics = useMetrics()
  const colors = useVariantColors(recipe, { variant, color, highContrast, checked, disabled })
  const focus = useVariantColors('focusRing', { color })

  const checkedBorder = checked && 'checkedBorder' in colors ? colors.checkedBorder : undefined
  const borderRadius = metrics.radius(radiusLevel)

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: padding.top,
    paddingRight: padding.right,
    paddingBottom: padding.bottom,
    paddingLeft: padding.left,
    borderRadius,
    borderWidth: CARD_BORDER_WIDTH,
    borderColor: checkedBorder ?? colors.border,
    backgroundColor: colors.bg,
  }

  return (
    <AnimatedPressable
      {...handlers}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{ checked, disabled }}
      style={[
        scaleStyle,
        cardStyle,
        variant === 'classic' && !disabled ? getClassicEffect(appearance) : undefined,
        style,
      ]}
    >
      {/* Plain strings must live inside <Text> in RN */}
      {typeof children === 'string' || typeof children === 'number'
        ? <Text size={fontSize} style={colors.text ? { color: colors.text } : undefined}>{children}</Text>
        : children}
      {indicator}
      {checkedBorder ? <CheckedRing color={checkedBorder} borderRadius={borderRadius} /> : null}
      <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} />
    </AnimatedPressable>
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
