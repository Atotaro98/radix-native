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
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface CheckboxGroupItemProps extends MarginProps {
  /** Unique value identifying this item. */
  value: string
  /** Disables this individual item. */
  disabled?: boolean
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
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxGroupProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [internal, setInternal] = React.useState<string[]>(defaultValue)
  const isControlled = valueProp !== undefined
  const value = isControlled ? valueProp : internal

  const onItemToggle = useCallback((itemValue: string) => {
    const next = value.includes(itemValue)
      ? value.filter(v => v !== itemValue)
      : [...value, itemValue]
    if (!isControlled) setInternal(next)
    onValueChange?.(next)
  }, [value, isControlled, onValueChange])

  const ctx = useMemo<CheckboxGroupContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemToggle,
  }), [size, variant, color, highContrast, disabled, value, onItemToggle])

  return (
    <CheckboxGroupContext.Provider value={ctx}>
      <View
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
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxGroupItemProps) {
  const ctx = useContext(CheckboxGroupContext)
  if (!ctx) throw new Error('CheckboxGroup.Item must be used within CheckboxGroup.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemToggle } = ctx
  const { scaling, fonts } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value.includes(itemValue)

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemToggle(itemValue)
  }, [isDisabled, onItemToggle, itemValue])

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
      <Checkbox
        size={size}
        variant={variant}
        color={color}
        highContrast={highContrast}
        checked={isChecked}
        onCheckedChange={() => onItemToggle(itemValue)}
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
      accessibilityRole="checkbox"
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
        <Checkbox
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
CheckboxGroupItem.displayName = 'CheckboxGroup.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxGroup = Object.assign(CheckboxGroupRoot, {
  Root: CheckboxGroupRoot,
  Item: CheckboxGroupItem,
})
