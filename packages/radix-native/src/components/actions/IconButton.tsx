import React, { useCallback, useMemo } from 'react'
import { Pressable, ActivityIndicator, View, Animated } from 'react-native'
import type { StyleProp, ViewStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { usePressScale } from '../../hooks/usePressScale'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type IconButtonSize = 1 | 2 | 3 | 4
export type IconButtonVariant = 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

export interface IconButtonProps extends NativePressableProps, MarginProps {
  /** Button size (1–4). Default: 2. */
  size?: IconButtonSize
  /** Visual variant. Default: 'solid'. */
  variant?: IconButtonVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Override the theme radius for this button. */
  radius?: RadiusToken
  /** Shows a loading spinner and disables the button. */
  loading?: boolean
  /** Disables the button. */
  disabled?: boolean
  /** Icon element. */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

/** Square dimension per size (same as Button height). */
const SIZE_PX: Record<IconButtonSize, number> = { 1: 24, 2: 32, 3: 40, 4: 48 }
/** Ghost padding per size. */
const GHOST_PADDING: Record<IconButtonSize, number> = { 1: 4, 2: 6, 3: 8, 4: 12 }
/** Radius level per size. */
const SIZE_RADIUS_LEVEL: Record<IconButtonSize, RadiusLevel> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** Spinner pixel size per button size. */
const SIZE_SPINNER: Record<IconButtonSize, number> = { 1: 16, 2: 20, 3: 20, 4: 24 }

// ─── Component ────────────────────────────────────────────────────────────────

export function IconButton({
  size = 2,
  variant = 'solid',
  color,
  highContrast,
  radius: radiusProp,
  loading = false,
  disabled = false,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
  onPress,
  ...rest
}: IconButtonProps) {
  const { appearance, scaling, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { scaleStyle, handlePressIn: scalePressIn, handlePressOut: scalePressOut } = usePressScale(!disabled && !loading)

  const effectiveRadius = radiusProp ?? themeRadius
  const isDisabled = disabled || loading
  const prefix = color ?? 'accent'

  const scalingFactor = scalingMap[scaling]
  const isGhost = variant === 'ghost'
  const resolvedSize = Math.round(SIZE_PX[size] * scalingFactor)
  const resolvedGhostPadding = Math.round(GHOST_PADDING[size] * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const level = SIZE_RADIUS_LEVEL[size]
  const borderRadius = Math.max(getRadius(effectiveRadius, level), getFullRadius(effectiveRadius))

  // ─── Colors (same logic as Button) ─────────────────────────────────────────

  const colors = useMemo(() => {
    if (isDisabled) {
      const disabledText = rc('gray', 'a8')
      switch (variant) {
        case 'classic':
          return { bg: rc('gray', 2), text: disabledText, border: undefined, pressedBg: rc('gray', 2) }
        case 'solid':
        case 'soft':
          return { bg: rc('gray', 'a3'), text: disabledText, border: undefined, pressedBg: rc('gray', 'a3') }
        case 'surface':
          return { bg: rc('gray', 'a2'), text: disabledText, border: rc('gray', 'a6'), pressedBg: rc('gray', 'a2') }
        case 'outline':
          return { bg: 'transparent', text: disabledText, border: rc('gray', 'a7'), pressedBg: 'transparent' }
        case 'ghost':
          return { bg: 'transparent', text: disabledText, border: undefined, pressedBg: 'transparent' }
      }
    }

    const hc = highContrast
    switch (variant) {
      case 'classic':
      case 'solid': {
        const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
        const text = hc ? rc('gray', 1) : rc(prefix, 'contrast')
        const pressedBg = hc ? rc(prefix, 12) : rc(prefix, 10)
        const pressedOpacity = hc ? 0.88 : undefined
        return { bg, text, border: undefined, pressedBg, pressedOpacity }
      }
      case 'soft': {
        const bg = rc(prefix, 'a3')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        return { bg, text, border: undefined, pressedBg: rc(prefix, 'a5') }
      }
      case 'surface': {
        const bg = rc(prefix, 'surface')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        return { bg, text, border: rc(prefix, 'a7'), pressedBg: rc(prefix, 'a3') }
      }
      case 'outline': {
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const border = hc ? rc('gray', 'a11') : rc(prefix, 'a8')
        return { bg: 'transparent', text, border, pressedBg: rc(prefix, 'a3') }
      }
      case 'ghost': {
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        return { bg: 'transparent', text, border: undefined, pressedBg: rc(prefix, 'a4') }
      }
    }
  }, [variant, prefix, highContrast, isDisabled, loading, rc])

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!isDisabled && onPress) onPress(e)
    },
    [isDisabled, onPress],
  )

  const isClassic = variant === 'classic'

  return (
    <Animated.View style={scaleStyle}>
      <Pressable
        onPress={handlePress}
        onPressIn={scalePressIn}
        onPressOut={scalePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        style={({ pressed }) => {
          const bg = pressed && !isDisabled ? colors.pressedBg : colors.bg
          const opacity = (pressed && !isDisabled && colors.pressedOpacity != null)
            ? colors.pressedOpacity
            : (isDisabled && !loading ? 1 : undefined)

          const containerStyle: ViewStyle = {
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'flex-start',
            overflow: 'hidden',
            width: isGhost ? undefined : resolvedSize,
            height: isGhost ? undefined : resolvedSize,
            padding: isGhost ? resolvedGhostPadding : undefined,
            backgroundColor: bg,
            borderRadius,
            borderWidth: colors.border ? 1 : undefined,
            borderColor: colors.border,
            opacity,
            // Margins
            ...margins,
          }

          const classicEffect = isClassic
            ? getClassicEffect(appearance, { pressed, disabled: isDisabled && !loading })
            : undefined

          return [containerStyle, classicEffect, style] as StyleProp<ViewStyle>
        }}
        {...rest}
      >
        {isClassic && !isDisabled && (
          <>
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(255,255,255,0.12)' }} />
            <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', backgroundColor: 'rgba(0,0,0,0.08)' }} />
          </>
        )}
        {loading ? (
          <ActivityIndicator size={Math.round(SIZE_SPINNER[size] * scalingFactor)} color={colors.text} />
        ) : (
          React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child as React.ReactElement<{ color?: string }>, { color: colors.text })
              : child
          )
        )}
      </Pressable>
    </Animated.View>
  )
}
IconButton.displayName = 'IconButton'
