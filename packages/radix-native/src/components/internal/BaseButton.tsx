import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useMargins } from '../../hooks/useMargins'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { useVariantColors } from '../../hooks/useVariantColors'
import { MIN_TOUCH_TARGET } from '../../utils/hitSlop'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'
import { Spinner, type SpinnerSize } from '../feedback/Spinner'
import { paintSurface } from './surface'
import { ControlLabel } from './ControlLabel'
import { useControl } from './control'
import { isDev } from '../../utils/env'
import { useSkeletonRadius } from '../feedback/SkeletonContext'
import type { ButtonVariant } from '../../utils/variantPalette'

export type BaseButtonSize = 1 | 2 | 3 | 4
export type BaseButtonVariant = ButtonVariant

export interface BaseButtonProps extends NativePressableProps, MarginProps {
  /** Button size (1–4). Default: 2. */
  size?: BaseButtonSize
  /** Visual variant. Default: 'solid'. */
  variant?: BaseButtonVariant
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
  /** Specifies the largest possible scale a font can reach. */
  maxFontSizeMultiplier?: number
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

interface InternalProps extends BaseButtonProps {
  /** IconButton: a square of the button's height instead of a padded row. */
  iconOnly?: boolean
}

// ─── Size mappings (Radix tokens) ─────────────────────────────────────────────

/** Height (and IconButton side) per size: space-5, space-6, space-7, space-8. */
const SIZE_HEIGHT: Record<BaseButtonSize, number> = { 1: 24, 2: 32, 3: 40, 4: 48 }
/** Button horizontal padding per size. */
const SIZE_PADDING_X: Record<BaseButtonSize, number> = { 1: 8, 2: 12, 3: 16, 4: 24 }
/** Button gap between label parts per size. */
const SIZE_GAP: Record<BaseButtonSize, number> = { 1: 4, 2: 8, 3: 12, 4: 12 }
const SIZE_RADIUS_LEVEL: Record<BaseButtonSize, RadiusLevel> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** Radix: 1→1, 2→2, 3→2, 4→3. */
const SIZE_SPINNER: Record<BaseButtonSize, SpinnerSize> = { 1: 1, 2: 2, 3: 2, 4: 3 }

const FILL: ViewStyle = { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }

/**
 * Internal: the shared body of Button and IconButton (Radix `BaseButton`).
 * Owns interaction state, Variant recipe colors, the classic effect, loading,
 * the focus ring, the minimum touch target and the order consumer props merge in.
 */
export function BaseButton({
  iconOnly = false,
  size = 2,
  variant = 'solid',
  color,
  highContrast,
  radius: radiusProp,
  loading = false,
  disabled = false,
  maxFontSizeMultiplier,
  children,
  m, mx, my, mt, mr, mb, ml,
  style,
  onPress,
  ...rest
}: InternalProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const isDisabled = disabled || loading
  const metrics = useMetrics({ radius: radiusProp })
  const height = metrics.px(SIZE_HEIGHT[size])
  const gap = metrics.px(SIZE_GAP[size])
  const borderRadius = metrics.radius(SIZE_RADIUS_LEVEL[size], 'pill')
  useSkeletonRadius(borderRadius)

  // The name a browser reads from the content (text, AccessibleIcon labels, VisuallyHidden text).
  // Passed explicitly when part of it is hidden or the label is invisible (loading): Android
  // does not read hidden content into a button's name by itself.
  const control = useControl({
    props: rest,
    children,
    role: 'button',
    onPress,
    disabled: isDisabled,
    state: { busy: loading },
    touchTarget: { width: iconOnly ? height : MIN_TOUCH_TARGET, height },
    focusRing: { color, borderRadius },
    forceName: loading,
  })
  const { pressed } = control

  const colors = useVariantColors('button', { variant, color, highContrast, disabled: isDisabled, pressed })

  const containerStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...(iconOnly
      ? { width: height, height }
      : { minHeight: height, paddingHorizontal: metrics.px(SIZE_PADDING_X[size]), gap }),
    ...margins,
  }), [iconOnly, height, size, metrics, gap, margins])

  // The recipe already picked the pressed background, opacity and lift
  const surface = paintSurface(colors, borderRadius)

  const unlabeled = iconOnly && !control.pressableProps.accessibilityLabel && control.name === ''
  React.useEffect(() => {
    if (isDev && unlabeled) {
      console.warn('[radix-native] IconButton has no `accessibilityLabel`; screen readers will announce it as an unlabeled button.')
    }
  }, [unlabeled])

  // Radix: Button text is medium, except ghost which is regular.
  const label = (
    <ControlLabel
      size={size}
      weight={variant === 'ghost' ? 'regular' : 'medium'}
      color={colors.text}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
    >
      {children}
    </ControlLabel>
  )

  return (
    <AnimatedPressable
      {...control.pressableProps}
      style={[control.scaleStyle, containerStyle, surface.style, style]}
    >
      {surface.under}
      {control.wrap(loading ? (
          <>
            {/* Radix: the label stays in place (keeping the size) and readable by
                screen readers, but invisible; the spinner sits on top. */}
            <View style={{ opacity: 0, flexDirection: 'row', alignItems: 'center', gap }}>{label}</View>
            <View style={FILL} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Spinner size={SIZE_SPINNER[size]} color={colors.text} />
            </View>
          </>
        ) : (
          label
        ))}
      {control.focusRing}
    </AnimatedPressable>
  )
}
