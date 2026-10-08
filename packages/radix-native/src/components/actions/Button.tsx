import React, { useCallback, useMemo } from 'react'
import { View, Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { useInteraction } from '../../hooks/useInteraction'
import { AnimatedPressable } from '../../hooks/usePressScale'
import { resolveFont } from '../../utils/resolveFont'
import { resolveTypography } from '../../utils/typography'
import { getMinHitSlop, MIN_TOUCH_TARGET } from '../../utils/hitSlop'
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

export type ButtonSize = 1 | 2 | 3 | 4
export type ButtonVariant = 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

export interface ButtonProps extends NativePressableProps, MarginProps {
  /** Button size (1–4). Default: 2. */
  size?: ButtonSize
  /** Visual variant. Default: 'solid'. */
  variant?: ButtonVariant
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
  /** Button content (usually a string). */
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings (Radix tokens) ─────────────────────────────────────────────

/** height per size: space-5, space-6, space-7, space-8 */
const SIZE_HEIGHT: Record<ButtonSize, number> = { 1: 24, 2: 32, 3: 40, 4: 48 }
/** horizontal padding per size */
const SIZE_PADDING_X: Record<ButtonSize, number> = { 1: 8, 2: 12, 3: 16, 4: 24 }
/** gap per size */
const SIZE_GAP: Record<ButtonSize, number> = { 1: 4, 2: 8, 3: 12, 4: 12 }
/** font-size index per button size */
const SIZE_FONT: Record<ButtonSize, 1 | 2 | 3 | 4> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** radius level per size */
const SIZE_RADIUS_LEVEL: Record<ButtonSize, RadiusLevel> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** Spinner size per button size (Radix: 1→1, 2→2, 3→2, 4→3) */
const SIZE_SPINNER: Record<ButtonSize, SpinnerSize> = { 1: 1, 2: 2, 3: 2, 4: 3 }

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
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
  onPressIn,
  onPressOut,
  onFocus,
  onBlur,
  accessibilityState,
  hitSlop,
  ...rest
}: ButtonProps) {
  const { appearance, scaling, fonts, radius: themeRadius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax ?? 2
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const effectiveRadius = radiusProp ?? themeRadius
  const isDisabled = disabled || loading
  const prefix = color ?? 'accent'

  const { pressed, focused, scaleStyle, handlers } = useInteraction({
    enabled: !isDisabled,
    onPressIn,
    onPressOut,
    onFocus,
    onBlur,
  })

  // ─── Typography ────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const typography = useMemo(() => resolveTypography(SIZE_FONT[size], scaling), [size, scaling])

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const isGhost = variant === 'ghost'
  const isClassic = variant === 'classic'
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)
  const resolvedPaddingX = Math.round(SIZE_PADDING_X[size] * scalingFactor)
  const resolvedGap = Math.round(SIZE_GAP[size] * scalingFactor)

  // ─── Radius ────────────────────────────────────────────────────────────────
  const borderRadius = Math.max(
    getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size]),
    getFullRadius(effectiveRadius),
  )

  // ─── Colors ────────────────────────────────────────────────────────────────
  const colors = useMemo(
    () => getButtonColors(rc, variant, prefix, highContrast, isDisabled),
    [rc, variant, prefix, highContrast, isDisabled],
  )
  const focusColor = rc(prefix, 8)

  // ─── Font family ───────────────────────────────────────────────────────────
  // Radix: only non-ghost uses font-weight: medium; ghost uses regular
  const font = resolveFont(
    isGhost ? fonts.regular : (fonts.medium ?? fonts.regular),
    isGhost ? '400' : '500',
  )

  const textStyle = useMemo<TextStyle>(() => ({
    ...typography,
    color: colors.text,
    fontWeight: font.fontWeight,
    fontFamily: font.fontFamily,
    flexShrink: 1,
  }), [typography, colors.text, font.fontWeight, font.fontFamily])

  // ─── Press handler ─────────────────────────────────────────────────────────
  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!isDisabled) onPress?.(e)
    },
    [isDisabled, onPress],
  )

  // ─── Styles ────────────────────────────────────────────────────────────────
  const containerStyle = useMemo<ViewStyle>(() => ({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    minHeight: resolvedHeight,
    paddingHorizontal: resolvedPaddingX,
    gap: resolvedGap,
    borderRadius,
    borderWidth: colors.border ? 1 : undefined,
    borderColor: colors.border,
    ...margins,
  }), [resolvedHeight, resolvedPaddingX, resolvedGap, borderRadius, colors.border, margins])

  const stateStyle: ViewStyle = {
    backgroundColor: pressed ? colors.pressedBg : colors.bg,
    opacity: pressed ? colors.pressedOpacity : undefined,
  }

  // Classic 3D effect (shadow + bevel)
  const classicStyle = isClassic
    ? getClassicEffect(appearance, { pressed, disabled: isDisabled && !loading })
    : undefined

  const content = renderContent(children, textStyle, colors.text, effectiveMaxFont)

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AnimatedPressable
      accessibilityRole="button"
      hitSlop={hitSlop ?? getMinHitSlop(MIN_TOUCH_TARGET, resolvedHeight)}
      {...rest}
      {...handlers}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      style={[scaleStyle, containerStyle, stateStyle, classicStyle, style]}
    >
      {isClassic && !isDisabled && <ClassicOverlay />}
      {loading ? (
        <>
          {/* Invisible children keep the button's dimensions while loading */}
          <View
            style={{ opacity: 0, flexDirection: 'row', alignItems: 'center', gap: resolvedGap }}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {content}
          </View>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Spinner size={SIZE_SPINNER[size]} color={colors.text} />
          </View>
        </>
      ) : (
        content
      )}
      <FocusRing visible={focused} color={focusColor} borderRadius={borderRadius} />
    </AnimatedPressable>
  )
}
Button.displayName = 'Button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Renders button children:
 * - Adjacent strings / numbers are merged into a single `<Text>` so
 *   `<Button>Hello {name}</Button>` reads as one label (no gap in between).
 * - Elements (icons) receive the button text color via `color` — but only
 *   when they don't set `color` themselves.
 */
export function renderContent(
  children: React.ReactNode,
  textStyle: TextStyle,
  iconColor: string,
  maxFontSizeMultiplier?: number,
): React.ReactNode {
  const nodes: React.ReactNode[] = []
  let textRun = ''

  const flushText = () => {
    if (textRun === '') return
    nodes.push(
      <RNText
        key={`text-${nodes.length}`}
        style={textStyle}
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
      >
        {textRun}
      </RNText>,
    )
    textRun = ''
  }

  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      textRun += String(child)
      return
    }
    flushText()
    if (React.isValidElement<{ color?: unknown }>(child)) {
      nodes.push(
        child.props.color === undefined
          ? React.cloneElement(child as React.ReactElement<{ color?: string }>, {
              key: child.key ?? `el-${nodes.length}`,
              color: iconColor,
            })
          : React.cloneElement(child, { key: child.key ?? `el-${nodes.length}` }),
      )
    } else if (child != null && typeof child !== 'boolean') {
      nodes.push(child)
    }
  })
  flushText()

  return nodes
}
