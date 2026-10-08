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
import { Checkbox, type CheckboxSize, type CheckboxVariant } from './Checkbox'

// ─── Context ──────────────────────────────────────────────────────────────────

interface CheckboxGroupContextValue {
  size: CheckboxSize
  variant: CheckboxVariant
  color?: AccentColor
  highContrast?: boolean
  disabled: boolean
  value: string[]
  onItemToggle: (itemValue: string) => void
}

const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null)

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface CheckboxGroupProps extends MarginProps {
  /** Checkbox size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Controlled selected values. */
  value?: string[]
  /** Uncontrolled default selected values. */
  defaultValue?: string[]
  /** Called when selected values change. */
  onValueChange?: (value: string[]) => void
  /** Disables all checkboxes in the group. */
  disabled?: boolean
  /** Group children (CheckboxGroup.Item). */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface CheckboxGroupItemProps extends MarginProps {
  /** Unique value identifying this item. */
  value: string
  /** Disables this individual item. */
  disabled?: boolean
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  /** Label text or custom content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Font size mapping per checkbox size ────────────────────────────────────────

const LABEL_FONT_SIZE: Record<CheckboxSize, 1 | 2 | 3> = { 1: 1, 2: 2, 3: 3 }
const LABEL_GAP: Record<CheckboxSize, number> = { 1: 4, 2: 6, 3: 8 }

// ─── Root Component ─────────────────────────────────────────────────────────────

function CheckboxGroupRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  disabled = false,
  children,
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxGroupProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [value, setValue] = useControllableState<string[]>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  // Functional update: two quick toggles never work on a stale array
  const onItemToggle = useCallback((itemValue: string) => {
    setValue(prev => prev.includes(itemValue)
      ? prev.filter(v => v !== itemValue)
      : [...prev, itemValue])
  }, [setValue])

  const ctx = useMemo<CheckboxGroupContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemToggle,
  }), [size, variant, color, highContrast, disabled, value, onItemToggle])

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <View
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        style={[
          { flexDirection: 'column', gap: resolveSpace(2, scaling) },
          margins,
          style,
        ]}
      >
        {children}
      </View>
    </CheckboxGroupContext.Provider>
  )
}
CheckboxGroupRoot.displayName = 'CheckboxGroup.Root'

// ─── Item Component ─────────────────────────────────────────────────────────────

function CheckboxGroupItem({
  value: itemValue,
  disabled: disabledProp,
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxGroupItemProps) {
  const ctx = useContext(CheckboxGroupContext)
  if (!ctx) throw new Error('CheckboxGroup.Item must be used within CheckboxGroup.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemToggle } = ctx
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value.includes(itemValue)

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemToggle(itemValue)
  }, [isDisabled, onItemToggle, itemValue])

  const gap = Math.round(LABEL_GAP[size] * scalingMap[scaling])

  const control = (
    <Checkbox
      size={size}
      variant={variant}
      color={color}
      highContrast={highContrast}
      checked={isChecked}
      disabled={isDisabled}
    />
  )

  if (children == null) {
    return (
      <Checkbox
        size={size}
        variant={variant}
        color={color}
        highContrast={highContrast}
        checked={isChecked}
        onCheckedChange={handlePress}
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
      role="checkbox"
      checked={isChecked}
      disabled={isDisabled}
      onPress={handlePress}
      control={control}
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
CheckboxGroupItem.displayName = 'CheckboxGroup.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
})
