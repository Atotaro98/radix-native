import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { Pressable, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { scalingMap } from '../../tokens/scaling'
import { getRadius } from '../../tokens/radius'
import type { MarginToken, SpaceToken } from '../../tokens/spacing'
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

// ─── Root Types ─────────────────────────────────────────────────────────────────

export interface CheckboxCardsProps {
  /** Card size (1–3). Default: 2. */
  size?: CheckboxSize
  /** Visual variant. Default: 'surface'. */
  variant?: CheckboxCardsVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Number of columns. Default: 1. */
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
  // ─── Margin props ──────────────────────────────────────────────────────────
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
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
  columns = 1,
  gap: gapProp = 4,
  value: valueProp,
  defaultValue = [],
  onValueChange,
  disabled = false,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
}: CheckboxCardsProps) {
  const { scaling } = useThemeContext()

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

  const ctx = useMemo<CheckboxCardsContextValue>(() => ({
    size, variant, color, highContrast, disabled, value, onItemToggle,
  }), [size, variant, color, highContrast, disabled, value, onItemToggle])

  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

  const resolvedGap = resolveSpace(gapProp, scaling)

  return (
    <CheckboxCardsContext.Provider value={ctx}>
      <View
        style={[
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: resolvedGap,
            marginTop: sp(mt ?? my ?? m),
            marginBottom: sp(mb ?? my ?? m),
            marginLeft: sp(ml ?? mx ?? m),
            marginRight: sp(mr ?? mx ?? m),
          },
          style,
        ]}
      >
        {React.Children.map(children, child => (
          <View style={{
            flexBasis: columns > 1 ? `${100 / columns}%` as unknown as number : undefined,
            flexGrow: 1,
            flexShrink: 1,
            minWidth: 0,
          }}>
            {child}
          </View>
        ))}
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
  const { scaling, radius } = useThemeContext()
  const rc = useResolveColor()

  const isDisabled = disabledProp ?? groupDisabled
  const isChecked = value.includes(itemValue)

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

  type C = Parameters<typeof rc>[0]

  // Card border & background — does NOT change on checked state (matches Radix)
  // Surface: box-shadow: 0 0 0 1px gray-a5 (simulated with borderWidth)
  // Classic: similar border + outer shadow
  const borderColor = rc('gray-a5' as C)
  const bgColor = rc('gray-surface' as C)

  const cardStyle: ViewStyle = {
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
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isChecked, disabled: isDisabled }}
      style={[cardStyle, style]}
    >
      {children}
      {/* Checkbox absolutely positioned on the right, matching Radix CSS */}
      <View style={{
        position: 'absolute',
        right: paddingLeft,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
      }}>
        <Checkbox
          size={size}
          variant="surface"
          color={color}
          highContrast={highContrast}
          checked={isChecked}
          onCheckedChange={() => onItemToggle(itemValue)}
          disabled={isDisabled}
        />
      </View>
    </Pressable>
  )
}
CheckboxCardsItem.displayName = 'CheckboxCards.Item'

// ─── Compound export ────────────────────────────────────────────────────────────

export const CheckboxCards = Object.assign(CheckboxCardsRoot, {
  Root: CheckboxCardsRoot,
  Item: CheckboxCardsItem,
})
