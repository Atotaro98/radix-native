import React, { useCallback, useMemo } from 'react'
import type { StyleProp, ViewStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { getMinHitSlop } from '../../utils/hitSlop'
import { isDev } from '../../utils/env'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'
import { ClassicOverlay } from '../internal/ClassicOverlay'
import { FocusRing } from '../internal/FocusRing'
import { Spinner, type SpinnerSize } from '../feedback/Spinner'
import { getButtonColors } from './buttonColors'

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
  /**
   * Icon element. Icon-only buttons have no text for screen readers:
   * always pass an `accessibilityLabel` (a dev warning is logged otherwise).
   */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

/** Square dimension per size (same as Button height). */
const SIZE_PX: Record<IconButtonSize, number> = { 1: 24, 2: 32, 3: 40, 4: 48 }
/** Radius level per size. */
const SIZE_RADIUS_LEVEL: Record<IconButtonSize, RadiusLevel> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** Spinner size per button size. */
const SIZE_SPINNER: Record<IconButtonSize, SpinnerSize> = { 1: 1, 2: 2, 3: 2, 4: 3 }

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
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  accessibilityState,
  hitSlop,
  ...rest
}: IconButtonProps) {
  const { appearance, scaling, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const effectiveRadius = radiusProp ?? themeRadius
  const isDisabled = disabled || loading
  const prefix = color ?? 'accent'
  const isClassic = variant === 'classic'

  const { pressed, focused, scaleStyle, handlers } = useInteraction({
    enabled: !isDisabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  const resolvedSize = Math.round(SIZE_PX[size] * scalingMap[scaling])

  const hasLabel = !!rest.accessibilityLabel
  React.useEffect(() => {
    if (isDev && !hasLabel) {
      console.warn('[radix-native] IconButton has no `accessibilityLabel`; screen readers will announce it as an unlabeled button.')
    }
  }, [hasLabel])

  // ─── Radius ────────────────────────────────────────────────────────────────
  const borderRadius = Math.max(
    getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size]),
    getFullRadius(effectiveRadius),
  )

  // ─── Colors (shared with Button) ───────────────────────────────────────────
  const colors = useMemo(
    () => getButtonColors(rc, variant, prefix, highContrast, isDisabled),
    [rc, variant, prefix, highContrast, isDisabled],
  )
  const focusColor = rc(prefix, 8)

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!isDisabled) onPress?.(e)
    },
    [isDisabled, onPress],
  )

  // ─── Styles ────────────────────────────────────────────────────────────────
  const containerStyle = useMemo<ViewStyle>(() => ({
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: resolvedSize,
    height: resolvedSize,
    borderRadius,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    ...margins,
  }), [resolvedSize, borderRadius, colors.border, margins])

  const stateStyle: ViewStyle = {
    backgroundColor: pressed ? colors.pressedBg : colors.bg,
    opacity: pressed ? colors.pressedOpacity : undefined,
  }

  const classicEffect = isClassic
    ? getClassicEffect(appearance, { pressed, disabled: isDisabled && !loading })
    : undefined

  return (
    <AnimatedPressable
      accessibilityRole="button"
      hitSlop={hitSlop ?? getMinHitSlop(resolvedSize, resolvedSize)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      style={[scaleStyle, containerStyle, stateStyle, classicEffect, style]}
    >
      {isClassic && !isDisabled && <ClassicOverlay />}
      {loading ? (
        <Spinner size={SIZE_SPINNER[size]} color={colors.text} />
      ) : (
        React.Children.map(children, child =>
          React.isValidElement<{ color?: unknown }>(child) && child.props.color === undefined
            ? React.cloneElement(child as React.ReactElement<{ color?: string }>, { color: colors.text })
            : child,
        )
      )}
      <FocusRing visible={focused} color={focusColor} borderRadius={borderRadius} />
    </AnimatedPressable>
  )
}
IconButton.displayName = 'IconButton'
