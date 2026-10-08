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
import { Checkbox, type CheckboxSize } from './Checkbox'

// ─── Types ──────────────────────────────────────────────────────────────────────

export type CheckboxCardsVariant = 'surface' | 'classic'

// ─── Context ──────────────────────────────────────────────────────────────────

interface CheckboxCardsContextValue {
  size: CheckboxSize
  variant: CheckboxCardsVariant
  color?: AccentColor
  highContrast?: boolean
  disabled: boolean
  value: string[]
  onItemToggle: (itemValue: string) => void
}

const CheckboxCardsContext = createContext<CheckboxCardsContextValue | null>(null)

/** Radix: item font-size per size (font-size-2 / 3 / 4). */
const SIZE_FONT: Record<1 | 2 | 3, TextSize> = { 1: 2, 2: 3, 3: 4 }

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface CheckboxCardsProps extends MarginProps {
  /** Card size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxCardsVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Number of equal-width columns. Default: auto-fit (cards ≥ 160px, like Radix). */
  columns?: number
  /** Gap between cards as space token. Default: 4. */
  gap?: SpaceToken
  /** Controlled selected values. */
  value?: string[]
  /** Uncontrolled default selected values. */
  defaultValue?: string[]
  /** Called when selected values change. */
  onValueChange?: (value: string[]) => void
  /** Disables all cards. */
  disabled?: boolean
  /** Card items. */
  children?: React.ReactNode
  /** Accessible name for the whole group. */
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
}

// ─── Item Types ─────────────────────────────────────────────────────────────────

export interface CheckboxCardsItemProps {
  /** Unique value identifying this card. */
  value: string
  /** Disables this individual card. */
  disabled?: boolean
  /** Card content. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size tokens (matching Radix CSS vars) ──────────────────────────────────────
// Radix uses: padding-left = space-3/4/5, padding-top/bottom = space-3/1.2, space-4*0.875, space-5/1.2
// checkbox-size = space-4*0.875, space-4, space-4*1.25
// padding-right = padding-left * 2 + checkbox-size

const SIZE_CONFIG: Record<CheckboxSize, {
  paddingLeft: number
  paddingY: number
  checkboxSize: number
  radiusLevel: 3 | 4
}> = {
  1: { paddingLeft: 12, paddingY: 10, checkboxSize: 14, radiusLevel: 3 },
  2: { paddingLeft: 16, paddingY: 14, checkboxSize: 16, radiusLevel: 3 },
  3: { paddingLeft: 24, paddingY: 20, checkboxSize: 20, radiusLevel: 4 },
}

// ─── Root Component ─────────────────────────────────────────────────────────────

function CheckboxCardsRoot({
  size = 2,
  variant = 'surface',
  color,
  highContrast,
  columns,
  gap: gapProp = 4,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  disabled = false,
  children,
  accessibilityLabel,
  testID,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxCardsProps) {
  const { scaling } = useThemeContext()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const [value, setValue] = useControllableState<string[]>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  })

  const onItemToggle = useCallback((itemValue: string) => {
    setValue(prev => prev.includes(itemValue)
      ? prev.filter(v => v !== itemValue)
      : [...prev, itemValue])
  }, [setValue])

  const ctx = useMemo<CheckboxCardsContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemToggle,
  }), [size, variant, color, highContrast, disabled, value, onItemToggle])

  const resolvedGap = resolveSpace(gapProp, scaling)

  return (
    <CheckboxCardsContext.Provider value={ctx}>
      <View accessibilityLabel={accessibilityLabel} testID={testID} style={[margins, style]}>
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
    </CheckboxCardsContext.Provider>
  )
}
CheckboxCardsRoot.displayName = 'CheckboxCards.Root'

// ─── Item Component ─────────────────────────────────────────────────────────────

function CheckboxCardsItem({
  value: itemValue,
  disabled: disabledProp,
  children,
  style,
}: CheckboxCardsItemProps) {
  const ctx = useContext(CheckboxCardsContext)
  if (!ctx) throw new Error('CheckboxCards.Item must be used within CheckboxCards.Root')

  const { size, variant, color, highContrast, disabled: groupDisabled, value, onItemToggle } = ctx
  const { appearance, scaling, radius } = useThemeContext()
  const rc = useResolveColor()

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value.includes(itemValue)
  const isClassic = variant === 'classic'
  const { focused, scaleStyle, handlers } = useInteraction({ enabled: !isDisabled })

  const handlePress = useCallback(() => {
    if (!isDisabled) onItemToggle(itemValue)
  }, [isDisabled, onItemToggle, itemValue])

  const scalingFactor = scalingMap[scaling]
  const cfg = SIZE_CONFIG[size]
  const paddingLeft = Math.round(cfg.paddingLeft * scalingFactor)
  const paddingY = Math.round(cfg.paddingY * scalingFactor)
  const checkboxSize = Math.round(cfg.checkboxSize * scalingFactor)
  // Radix CSS: padding-right = padding-left * 2 + checkbox-size
  const paddingRight = paddingLeft * 2 + checkboxSize
  const borderRadius = getRadius(radius, cfg.radiusLevel)

  // Card border & background — does NOT change on checked state (matches Radix)
  // Surface: box-shadow: 0 0 0 1px gray-a5 (simulated with borderWidth)
  // Classic: similar border + outer shadow
  const borderColor = isClassic ? rc('gray', 'a3') : rc('gray', 'a5')
  const bgColor = isClassic ? rc('gray', 2) : rc('gray', 'surface')

  const cardStyle: ViewStyle = {
    flexGrow: 1,
    position: 'relative',
    overflow: 'hidden',
    paddingLeft,
    paddingRight,
    paddingTop: paddingY,
    paddingBottom: paddingY,
    borderRadius,
    borderWidth: 1,
    borderColor,
    backgroundColor: bgColor,
    opacity: isDisabled ? 0.5 : undefined,
  }

  return (
    <AnimatedPressable
      {...handlers}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="checkbox"
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
      {/* Checkbox absolutely positioned on the right, matching Radix CSS */}
      <View
        pointerEvents="none"
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          right: paddingLeft,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
        }}
      >
        <Checkbox
          size={size}
          variant={isClassic ? 'classic' : 'surface'}
          color={color}
          highContrast={highContrast}
          checked={isChecked}
          disabled={isDisabled}
        />
      </View>
      <FocusRing visible={focused} color={rc(color ?? 'accent', 8)} borderRadius={borderRadius} />
    </AnimatedPressable>
  )
}
CheckboxCardsItem.displayName = 'CheckboxCards.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxCards = Object.assign(CheckboxCardsRoot, {
  Root: CheckboxCardsRoot,
  Item: CheckboxCardsItem,
})
