import React, { useCallback, useMemo } from 'react'
import { Pressable, ActivityIndicator, View, Animated } from 'react-native'
import { Text as RNText } from 'react-native'
import type { StyleProp, ViewStyle, TextStyle, GestureResponderEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont } from '../../utils/resolveFont'
import { usePressScale } from '../../hooks/usePressScale'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'
import type { NativePressableProps } from '../../types/nativeProps'
import type { MarginProps } from '../../types/marginProps'

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
/** horizontal padding per size (non-ghost) */
const SIZE_PADDING_X: Record<ButtonSize, number> = { 1: 8, 2: 12, 3: 16, 4: 24 }
/** horizontal padding per size (ghost) — smaller than non-ghost */
const GHOST_PADDING_X: Record<ButtonSize, number> = { 1: 8, 2: 8, 3: 12, 4: 16 }
/** vertical padding per size (ghost only) */
const GHOST_PADDING_Y: Record<ButtonSize, number> = { 1: 4, 2: 4, 3: 6, 4: 8 }
/** gap per size (non-ghost) */
const SIZE_GAP: Record<ButtonSize, number> = { 1: 4, 2: 8, 3: 12, 4: 12 }
/** gap per size (ghost) — smaller than non-ghost */
const GHOST_GAP: Record<ButtonSize, number> = { 1: 4, 2: 4, 3: 8, 4: 8 }
/** font-size index per button size */
const SIZE_FONT: Record<ButtonSize, 1 | 2 | 3 | 4> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** radius level per size */
const SIZE_RADIUS_LEVEL: Record<ButtonSize, RadiusLevel> = { 1: 1, 2: 2, 3: 3, 4: 4 }
/** Spinner pixel size per button size (Radix: 1→1, 2→2, 3→2, 4→3) */
const SIZE_SPINNER: Record<ButtonSize, number> = { 1: 16, 2: 20, 3: 20, 4: 24 }

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
  ...rest
}: ButtonProps) {
  const { appearance, scaling, fonts, radius: themeRadius, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const effectiveMaxFont = maxFontSizeMultiplier ?? globalMax ?? 2
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const { scaleStyle, handlePressIn: scalePressIn, handlePressOut: scalePressOut } = usePressScale(!disabled && !loading)

  const effectiveRadius = radiusProp ?? themeRadius
  const isDisabled = disabled || loading
  const prefix = color ?? 'accent'

  // ─── Typography ────────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const fontIdx = SIZE_FONT[size]
  const resolvedFontSize = Math.round(fontSize[fontIdx] * scalingFactor)
  const resolvedLineHeight = Math.round(lineHeight[fontIdx] * scalingFactor)
  const resolvedLetterSpacing = letterSpacingEm[fontIdx] * resolvedFontSize

  // ─── Dimensions ────────────────────────────────────────────────────────────
  const isGhost = variant === 'ghost'
  const resolvedHeight = Math.round(SIZE_HEIGHT[size] * scalingFactor)
  const resolvedPaddingX = Math.round(
    (isGhost ? GHOST_PADDING_X[size] : SIZE_PADDING_X[size]) * scalingFactor,
  )
  const resolvedPaddingY = isGhost ? Math.round(GHOST_PADDING_Y[size] * scalingFactor) : 0
  const resolvedGap = Math.round(
    (isGhost ? GHOST_GAP[size] : SIZE_GAP[size]) * scalingFactor,
  )

  // ─── Radius ────────────────────────────────────────────────────────────────
  const level = SIZE_RADIUS_LEVEL[size]
  const borderRadius = Math.max(getRadius(effectiveRadius, level), getFullRadius(effectiveRadius))

  // ─── Color helpers ─────────────────────────────────────────────────────────

  const colors = useMemo(() => {
    // Radix: loading sets [data-disabled], so both disabled AND loading use disabled styling
    if (isDisabled) {
      const disabledText = rc('gray', 'a8')
      switch (variant) {
        case 'classic':
          return {
            bg: rc('gray', 2),
            text: disabledText,
            border: undefined,
            pressedBg: rc('gray', 2),
          }
        case 'solid':
        case 'soft':
          return {
            bg: rc('gray', 'a3'),
            text: disabledText,
            border: undefined,
            pressedBg: rc('gray', 'a3'),
          }
        case 'surface':
          return {
            bg: rc('gray', 'a2'),
            text: disabledText,
            border: rc('gray', 'a6'),
            pressedBg: rc('gray', 'a2'),
          }
        case 'outline':
          return {
            bg: 'transparent',
            text: disabledText,
            border: rc('gray', 'a7'),
            pressedBg: 'transparent',
          }
        case 'ghost':
          return {
            bg: 'transparent',
            text: disabledText,
            border: undefined,
            pressedBg: 'transparent',
          }
      }
    }

    // Active variant colors
    const hc = highContrast

    switch (variant) {
      case 'classic':
      case 'solid': {
        const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
        const text = hc ? rc('gray', 1) : rc(prefix, 'contrast')
        const pressedBg = hc ? rc(prefix, 12) : rc(prefix, 10)
        // highContrast: accent-12 bg and pressedBg are identical, use opacity for press feedback
        const pressedOpacity = hc ? 0.88 : undefined
        return { bg, text, border: undefined, pressedBg, pressedOpacity }
      }
      case 'soft': {
        const bg = rc(prefix, 'a3')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const pressedBg = rc(prefix, 'a5')
        return { bg, text, border: undefined, pressedBg }
      }
      case 'surface': {
        const bg = rc(prefix, 'surface')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const border = rc(prefix, 'a7')
        const pressedBg = rc(prefix, 'a3')
        return { bg, text, border, pressedBg }
      }
      case 'outline': {
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        // Radix highContrast: double inset shadow with accent-a7 + gray-a11
        const border = hc ? rc('gray', 'a11') : rc(prefix, 'a8')
        const pressedBg = rc(prefix, 'a3')
        return { bg: 'transparent', text, border, pressedBg }
      }
      case 'ghost': {
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        const pressedBg = rc(prefix, 'a4')
        return { bg: 'transparent', text, border: undefined, pressedBg }
      }
    }
  }, [variant, prefix, highContrast, isDisabled, loading, rc])

  // ─── Font family ───────────────────────────────────────────────────────────
  // Radix: only non-ghost uses font-weight: medium; ghost uses regular
  const font = resolveFont(
    isGhost ? fonts.regular : (fonts.medium ?? fonts.regular),
    isGhost ? '400' : '500',
  )

  // ─── Press handler ─────────────────────────────────────────────────────────
  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (!isDisabled && onPress) onPress(e)
    },
    [isDisabled, onPress],
  )

  // ─── Variant flags ──────────────────────────────────────────────────────────
  const isClassic = variant === 'classic'

  // ─── Render ────────────────────────────────────────────────────────────────
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
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: 'flex-start',
          overflow: 'hidden',
          minHeight: isGhost ? undefined : resolvedHeight,
          paddingHorizontal: resolvedPaddingX,
          paddingVertical: isGhost ? resolvedPaddingY : undefined,
          gap: resolvedGap,
          backgroundColor: bg,
          borderRadius,
          borderWidth: colors.border ? 1 : undefined,
          borderColor: colors.border,
          opacity,
          // Margins
          ...margins,
        }

        // Classic 3D effect (shadow + bevel)
        const classicStyle = isClassic
          ? getClassicEffect(appearance, { pressed, disabled: isDisabled && !loading })
          : undefined

        return [containerStyle, classicStyle, style] as StyleProp<ViewStyle>
      }}
      {...rest}
    >
      {/* Classic gradient simulation: light overlay on top, dark on bottom */}
      {isClassic && !isDisabled && (
        <>
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              backgroundColor: 'rgba(255,255,255,0.12)',
            }}
          />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '50%',
              backgroundColor: 'rgba(0,0,0,0.08)',
            }}
          />
        </>
      )}
      {loading ? (
        <View style={{ position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {/* Invisible children to maintain dimensions */}
          <View style={{ opacity: 0, flexDirection: 'row', alignItems: 'center', gap: resolvedGap }}>
            {renderContent(children, {
              fontSize: resolvedFontSize,
              lineHeight: resolvedLineHeight,
              letterSpacing: resolvedLetterSpacing,
              color: colors.text,
              fontWeight: font.fontWeight,
              fontFamily: font.fontFamily,
            }, colors.text, effectiveMaxFont)}
          </View>
          {/* Spinner overlay */}
          <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size={Math.round(SIZE_SPINNER[size] * scalingFactor)} color={colors.text} />
          </View>
        </View>
      ) : (
        renderContent(children, {
          fontSize: resolvedFontSize,
          lineHeight: resolvedLineHeight,
          letterSpacing: resolvedLetterSpacing,
          color: colors.text,
          fontWeight: font.fontWeight,
          fontFamily: font.fontFamily,
        }, colors.text, effectiveMaxFont)
      )}
    </Pressable>
    </Animated.View>
  )
}
Button.displayName = 'Button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderContent(children: React.ReactNode, textStyle: TextStyle, iconColor: string, maxFontSizeMultiplier?: number): React.ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return <RNText style={textStyle} maxFontSizeMultiplier={maxFontSizeMultiplier}>{children}</RNText>
  }
  return React.Children.map(children, child =>
    React.isValidElement(child)
      ? React.cloneElement(child as React.ReactElement<{ color?: string }>, { color: iconColor })
      : child
  )
}
