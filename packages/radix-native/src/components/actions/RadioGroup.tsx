import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useControllableState } from '../../hooks/useControllableState'
import { resolveSpace } from '../../utils/resolveSpace'
import { resolveTypography } from '../../utils/typography'
import { scalingMap } from '../../tokens/scaling'
import { LabeledControl } from '../internal/LabeledControl'
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
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ───────────────────────────────────────────────────────────────

export interface RadioGroupItemProps extends MarginProps {
  /** Unique value for this option. */
  value: string
  /** Disables this item. */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
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
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [value, onItemSelect] = useControllableState<string>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  const ctx = useMemo<RadioGroupContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemSelect,
  }), [size, variant, color, highContrast, disabled, value, onItemSelect])

  return (
    <RadioGroupContext.Provider value={ctx}>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={accessibilityLabel}
        testID={testID}
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
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: RadioGroupItemProps) {
  const ctx = useContext(RadioGroupContext)
  if (!ctx) throw new Error('RadioGroup.Item must be used within RadioGroup.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemSelect } = ctx
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value === itemValue

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemSelect(itemValue)
  }, [isDisabled, onItemSelect, itemValue])

  const gap = Math.round(LABEL_GAP[size] * scalingMap[scaling])

  if (children == null) {
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
    ...resolveTypography(LABEL_FONT_SIZE[size], scaling),
    color: isDisabled ? rc('gray', 'a8') : rc('gray', 12),
    fontFamily: fonts.regular,
    flexShrink: 1,
  }

  return (
    <LabeledControl
      role="radio"
      checked={isChecked}
      disabled={isDisabled}
      onPress={handlePress}
      control={
        <Radio
          size={size}
          variant={variant}
          color={color}
          highContrast={highContrast}
          checked={isChecked}
          disabled={isDisabled}
        />
      }
      gap={gap}
      labelStyle={labelStyle}
      focusColor={rc(color ?? 'accent', 8)}
      maxFontSizeMultiplier={effectiveMaxFont}
      margins={margins}
      style={style}
    >
      {children}
    </LabeledControl>
  )
}
RadioGroupItem.displayName = 'RadioGroup.Item'

// ─── Compound export ──────────────────────────────────────────────────────────

export const RadioGroup = Object.assign(RadioGroupRoot, {
  Root: RadioGroupRoot,
  Item: RadioGroupItem,
})
