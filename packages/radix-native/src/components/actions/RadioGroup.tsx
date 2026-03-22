import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import { Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import type { MarginProps } from '../../types/marginProps'
import type { AccentColor } from '../../tokens/colors/types'
import { Radio, type RadioSize, type RadioVariant } from './Radio'

// ─── Context ──────────────────────────────────────────────────────────────────

interface RadioGroupContextValue {
  size: RadioSize
  variant: RadioVariant
  color?: AccentColor
  highContrast?: boolean
  disabled: boolean
  value: string
  onItemSelect: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null)

// ─── Root Types ───────────────────────────────────────────────────────────────

export interface RadioGroupProps extends MarginProps {
  /** Radio size (1–3). Default: 2. */
  size?: RadioSize
  /** Visual variant. Default: 'surface'. */
  variant?: RadioVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast. */
  highContrast?: boolean
  /** Controlled selected value. */
  value?: string
  /** Uncontrolled default selected value. */
  defaultValue?: string
  /** Called when selected value changes. */
  onValueChange?: (value: string) => void
  /** Disables all radios. */
  disabled?: boolean
  /** Group children (RadioGroup.Item). */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ───────────────────────────────────────────────────────────────

export interface RadioGroupItemProps extends MarginProps {
  /** Unique value for this option. */
  value: string
  /** Disables this item. */
  disabled?: boolean
  /** Label text or custom content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Font size mapping per radio size ─────────────────────────────────────────

const LABEL_FONT_SIZE: Record<RadioSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const LABEL_GAP: Record<RadioSize, number> = { 1: 4, 2: 6, 3: 8 }

// ─── Root ─────────────────────────────────────────────────────────────────────

function RadioGroupRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  value: valueProp,
  defaultValue = '',
  onValueChange,
  disabled = false,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [internal, setInternal] = React.useState(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internal

  const onItemSelect = useCallback((itemValue: string) => {
    if (!isControlled) setInternal(itemValue)
    onValueChange?.(itemValue)
  }, [isControlled, onValueChange])

  const ctx = useMemo<RadioGroupContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemSelect,
  }), [size, variant, color, highContrast, disabled, value, onItemSelect])

  return (
    <RadioGroupContext.Provider value={ctx}>
      <View
        style={[
          { flexDirection: 'column', gap: resolveSpace(1, scaling) },
          margins,
          style,
        ]}
      >
        {children}
      </View>
    </RadioGroupContext.Provider>
  )
}
RadioGroupRoot.displayName = 'RadioGroup.Root'

// ─── Item ─────────────────────────────────────────────────────────────────────

function RadioGroupItem({
  value: itemValue,
  disabled: disabledProp,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupItemProps) {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) throw new Error('RadioGroup.Item must be used within RadioGroup.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemSelect } = ctx
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value === itemValue

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemSelect(itemValue)
  }, [isDisabled, onItemSelect, itemValue])

  const scalingFactor = scalingMap[scaling]
  const fontIdx = LABEL_FONT_SIZE[size]
  const resolvedFontSize = Math.round(fontSize[fontIdx] * scalingFactor)
  const resolvedLineHeight = Math.round(lineHeight[fontIdx] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[fontIdx] * resolvedFontSize
  const gap = Math.round(LABEL_GAP[size] * scalingFactor)

  const textColor = rc('gray', 12)
  const fontFamily = fonts.regular

  const hasLabel = children != null

  if (!hasLabel) {
    return (
      <Radio
        size={size}
        variant={variant}
        color={color}
        highContrast={highContrast}
        checked={isChecked}
        onPress={handlePress}
        disabled={isDisabled}
        m={m} mx={mx} my={my} mt={mt} mr={mr} mb={mb} ml={ml}
        style={style}
      />
    )
  }

  const labelStyle: TextStyle = {
    fontSize: resolvedFontSize,
    lineHeight: resolvedLineHeight,
    letterSpacing: resolvedLetterSpacing,
    color: isDisabled ? rc('gray', 'a8') : textColor,
    fontFamily,
  }

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap,
          ...margins,
        },
        style,
      ]}
    >
      <View pointerEvents="none" importantForAccessibility="no-hide-descendants">
        <Radio
          size={size}
          variant={variant}
          color={color}
          highContrast={highContrast}
          checked={isChecked}
          disabled={isDisabled}
        />
      </View>
      {typeof children === 'string' || typeof children === 'number' ? (
        <RNText style={labelStyle}>{children}</RNText>
      ) : (
        children
      )}
    </Pressable>
  )
}
RadioGroupItem.displayName = 'RadioGroup.Item'

// ─── Compound export ──────────────────────────────────────────────────────────

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
})
