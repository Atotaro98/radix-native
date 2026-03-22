import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { Pressable, View, Animated } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { usePressScale } from '../../hooks/usePressScale'
import { resolveSpace } from '../../utils/resolveSpace'
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

// ─── Root Types ───────────────────────────────────────────────────────────────

export interface RadioCardsProps extends MarginProps {
  size?: RadioSize
  variant?: RadioCardsVariant
  color?: AccentColor
  highContrast?: boolean
  columns?: number
  gap?: SpaceToken
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  children?: React.ReactNode
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
  columns = 1,
  gap: gapProp = 4,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioCardsProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internal

  const onItemSelect = useCallback((itemValue: string) => {
    if (!isControlled) setInternal(itemValue)
    onValueChange?.(itemValue)
  }, [isControlled, onValueChange])

  const ctx = useMemo<RadioCardsContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemSelect,
  }), [size, variant, color, highContrast, disabled, value, onItemSelect])

  const resolvedGap = resolveSpace(gapProp, scaling)

  return (
    <RadioCardsContext.Provider value={ctx}>
      <View
        style={[
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignSelf: 'flex-start',
            gap: resolvedGap,
            ...margins,
          },
          style,
        ]}
      >
        {children}
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
  const { scaling, radius } = useThemeContext()
  const rc = useResolveColor()
  const { scaleStyle, handlePressIn: scalePressIn, handlePressOut: scalePressOut } = usePressScale(!disabledProp && !groupDisabled)

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value === itemValue

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemSelect(itemValue)
  }, [isDisabled, onItemSelect, itemValue])

  const scalingFactor = scalingMap[scaling]
  const cfg = SIZE_CONFIG[size]
  const padding = Math.round(cfg.padding * scalingFactor)
  const borderRadius = getRadius(radius, cfg.radiusLevel)

  const prefix = color ?? 'accent'
  const hc = highContrast

  const bgColor = rc('gray', 'surface')
  const checkedBorder = hc ? rc(prefix, 12) : rc(prefix, 9)
  const borderWidth = isChecked ? 2 : 1
  const borderColor = isChecked ? checkedBorder : rc('gray', 'a6')

  const cardStyle: ViewStyle = {
    padding,
    borderRadius,
    borderWidth,
    borderColor,
    backgroundColor: bgColor,
    opacity: isDisabled ? 0.5 : undefined,
  }

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={scalePressIn}
        onPressOut={scalePressOut}
        disabled={isDisabled}
        accessibilityRole="radio"
        accessibilityState={{ checked: isChecked, disabled: isDisabled }}
        style={[cardStyle, style]}
      >
        {children}
      </Pressable>
    </Animated.View>
  )
}
RadioCardsItem.displayName = 'RadioCards.Item'

// ─── Compound export ──────────────────────────────────────────────────────────

export const RadioCards = Object.assign(RadioCardsRoot, {
  Root: RadioCardsRoot,
  Item: RadioCardsItem,
})
