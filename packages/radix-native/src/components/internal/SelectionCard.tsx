import React from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle, AccessibilityRole } from 'react-native'
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
  role: Extract<AccessibilityRole, 'checkbox' | 'radio'>
  checked: boolean
  disabled: boolean
  onPress: () => void
  variant: SelectionCardVariant
  color?: AccentColor
  highContrast?: boolean
  /** Font size of plain-text children. */
  fontSize: TextSize
  radiusLevel: RadiusLevel
  /** Padding at 1px border; a thicker checked border is compensated. */
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
 * drawn 2px wide, with the padding reduced so content does not shift.
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
  const borderWidth = checkedBorder ? 2 : 1
  const inset = borderWidth - 1
  const borderRadius = metrics.radius(radiusLevel)

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingTop: padding.top - inset,
    paddingRight: padding.right - inset,
    paddingBottom: padding.bottom - inset,
    paddingLeft: padding.left - inset,
    borderRadius,
    borderWidth,
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
      <FocusRing visible={focused} color={focus.ring} borderRadius={borderRadius} />
    </AnimatedPressable>
  )
}

interface SelectionCardGridProps {
  /** Number of equal-width columns; omitted = auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  gap: SpaceToken
  role?: Extract<AccessibilityRole, 'radiogroup'>
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
  children?: React.ReactNode
}

/** Internal: the grid of CheckboxCards / RadioCards (Radix `repeat(auto-fit, minmax(160px, 1fr))`). */
export function SelectionCardGrid({ columns, gap, role, accessibilityLabel, testID, style, children }: SelectionCardGridProps) {
  const { px, space } = useMetrics()
  const resolvedGap = space(gap)
  return (
    <View accessibilityRole={role} accessibilityLabel={accessibilityLabel} testID={testID} style={style}>
      {columns !== undefined ? (
        <ColumnRows columns={columns} columnGap={resolvedGap} rowGap={resolvedGap} alignItems="stretch">
          {children}
        </ColumnRows>
      ) : (
        <AutoFitRows minItemWidth={px(160)} gap={resolvedGap}>
          {children}
        </AutoFitRows>
      )}
    </View>
  )
}
