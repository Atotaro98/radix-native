import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { resolveSpace } from '../../utils/resolveSpace'
import { getClassicEffect } from '../../utils/classicEffect'
import { ColumnRows, AutoFitRows } from '../internal/ColumnRows'
import { FocusRing } from '../internal/FocusRing'
import { Text } from '../typography/Text'
import type { TextSize } from '../typography/Text'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import type { RadioSize } from './Radio'

// ─── Types ──────────────────────────────────────────────────────────────────────

export type RadioCardsVariant = 'surface' | 'classic'

// ─── Context ──────────────────────────────────────────────────────────────────

interface RadioCardsContextValue {
  size: RadioSize
  variant: RadioCardsVariant
  color?: AccentColor
  highContrast?: boolean
  disabled: boolean
  value: string
  onItemSelect: (itemValue: string) => void
}

const RadioCardsContext = createContext<RadioCardsContextValue | null>(null)

/** Radix: item font-size per size (font-size-2 / 3 / 4). */
const SIZE_FONT: Record<1 | 2 | 3, TextSize> = { 1: 2, 2: 3, 3: 4 }

// ─── Root Types ───────────────────────────────────────────────────────────────

export interface RadioCardsProps extends MarginProps {
  size?: RadioSize
  variant?: RadioCardsVariant
  color?: AccentColor
  highContrast?: boolean
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  gap?: SpaceToken
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ───────────────────────────────────────────────────────────────

export interface RadioCardsItemProps {
  value: string
  disabled?: boolean
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size config ──────────────────────────────────────────────────────────────

const SIZE_CONFIG: Record<RadioSize, { padding: number; radiusLevel: 1 | 2 | 3 }> = {
  1: { padding: 12, radiusLevel: 2 },
  2: { padding: 16, radiusLevel: 3 },
  3: { padding: 24, radiusLevel: 3 },
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function RadioCardsRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  columns,
  gap: gapProp = 4,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children,
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioCardsProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [value, onItemSelect] = useControllableState<string>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  const ctx = useMemo<RadioCardsContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemSelect,
  }), [size, variant, color, highContrast, disabled, value, onItemSelect])

  const resolvedGap = resolveSpace(gapProp, scaling)

  return (
    <RadioCardsContext.Provider value={ctx}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[margins, style]}
      >
        {columns !== undefined ? (
          <ColumnRows columns={columns} columnGap={resolvedGap} rowGap={resolvedGap} alignItems="stretch">
            {children}
          </ColumnRows>
        ) : (
          // Radix default: repeat(auto-fit, minmax(160px, 1fr))
          <AutoFitRows minItemWidth={Math.round(160 * scalingMap[scaling])} gap={resolvedGap}>
            {children}
          </AutoFitRows>
        )}
      </View>
    </RadioCardsContext.Provider>
  )
}
RadioCardsRoot.displayName = 'RadioCards.Root'

// ─── Item ─────────────────────────────────────────────────────────────────────

function RadioCardsItem({
  value: itemValue,
  disabled: disabledProp,
  children,
  style,
}: RadioCardsItemProps) {
  const ctx = useContext(RadioCardsContext)
  if (!ctx) throw new Error('RadioCards.Item must be used within RadioCards.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemSelect } = ctx
  const { appearance, scaling, radius } = useThemeContext()
  const rc = useResolveColor()

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value === itemValue
  const isClassic = variant === 'classic'
  const { focused, scaleStyle, handlers } = useInteraction({ enabled: !isDisabled })

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemSelect(itemValue)
  }, [isDisabled, onItemSelect, itemValue])

  const scalingFactor = scalingMap[scaling]
  const cfg = SIZE_CONFIG[size]
  const padding = Math.round(cfg.padding * scalingFactor)
  const borderRadius = getRadius(radius, cfg.radiusLevel)

  const prefix = color ?? 'accent'
  const hc = highContrast

  const bgColor = isClassic ? rc('gray', 2) : rc('gray', 'surface')
  const checkedBorder = hc ? rc(prefix, 12) : rc(prefix, 9)
  const borderWidth = isChecked ? 2 : 1
  const borderColor = isChecked ? checkedBorder : rc('gray', isClassic ? 'a3' : 'a6')

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    // Compensate the thicker checked border so content doesn't shift
    padding: padding - (borderWidth - 1),
    borderRadius,
    borderWidth,
    borderColor,
    backgroundColor: bgColor,
    opacity: isDisabled ? 0.5 : undefined,
  }

  return (
    <AnimatedPressable
      {...handlers}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      style={[
        scaleStyle,
        cardStyle,
        isClassic && !isDisabled ? getClassicEffect(appearance) : undefined,
        style,
      ]}
    >
      {/* Plain strings must live inside <Text> in RN */}
      {typeof children === 'string' || typeof children === 'number'
        ? <Text size={SIZE_FONT[size]}>{children}</Text>
        : children}
      <FocusRing visible={focused} color={rc(prefix, 8)} borderRadius={borderRadius} />
    </AnimatedPressable>
  )
}
RadioCardsItem.displayName = 'RadioCards.Item'

// ─── Compound export ──────────────────────────────────────────────────────────

export const RadioCards = Object.assign(RadioCardsRoot, {
  Root: RadioCardsRoot,
  Item: RadioCardsItem,
})
