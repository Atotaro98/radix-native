import React, { useCallback, useMemo } from 'react'
import { Pressable, ActivityIndicator, View } from 'react-native'
import { Text as RNText } from 'react-native'
import type {
  PressableProps,
  StyleProp,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { resolveSpace } from '../../utils/resolveSpace'
import { fontSize, lineHeight, letterSpacingEm } from '../../tokens/typography'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { MarginToken } from '../../tokens/spacing'
import type { AccentColor } from '../../tokens/colors/types'
import { getClassicEffect } from '../../utils/classicEffect'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonSize = 1 | 2 | 3 | 4
export type ButtonVariant = 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
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
  /** Button content (usually a string). */
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

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
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
}: ButtonProps) {
  const { appearance, scaling, fonts, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()

  const effectiveRadius = radiusProp ?? themeRadius
  const isDisabled = disabled || loading
  const prefix = color ?? 'accent'

  // ─── Space helper ──────────────────────────────────────────────────────────
  const sp = (token: MarginToken | undefined): number | undefined =>
    token !== undefined ? resolveSpace(token, scaling) : undefined

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
  type C = Parameters<typeof rc>[0]

  const colors = useMemo(() => {
    // Radix: loading sets [data-disabled], so both disabled AND loading use disabled styling
    if (isDisabled) {
      const disabledText = rc('gray-a8' as C)
      switch (variant) {
        case 'classic':
          return {
            bg: rc('gray-2' as C),
            text: disabledText,
            border: undefined,
            pressedBg: rc('gray-2' as C),
          }
        case 'solid':
        case 'soft':
          return {
            bg: rc('gray-a3' as C),
            text: disabledText,
            border: undefined,
            pressedBg: rc('gray-a3' as C),
          }
        case 'surface':
          return {
            bg: rc('gray-a2' as C),
            text: disabledText,
            border: rc('gray-a6' as C),
            pressedBg: rc('gray-a2' as C),
          }
        case 'outline':
          return {
            bg: 'transparent',
            text: disabledText,
            border: rc('gray-a7' as C),
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
        const bg = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-9` as C)
        const text = hc ? rc('gray-1' as C) : rc(`${prefix}-contrast` as C)
        const pressedBg = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-10` as C)
        // highContrast: accent-12 bg and pressedBg are identical, use opacity for press feedback
        const pressedOpacity = hc ? 0.88 : undefined
        return { bg, text, border: undefined, pressedBg, pressedOpacity }
      }
      case 'soft': {
        const bg = rc(`${prefix}-a3` as C)
        const text = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-a11` as C)
        const pressedBg = rc(`${prefix}-a5` as C)
        return { bg, text, border: undefined, pressedBg }
      }
      case 'surface': {
        const bg = rc(`${prefix}-surface` as C)
        const text = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-a11` as C)
        const border = rc(`${prefix}-a7` as C)
        const pressedBg = rc(`${prefix}-a3` as C)
        return { bg, text, border, pressedBg }
      }
      case 'outline': {
        const text = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-a11` as C)
        // Radix highContrast: double inset shadow with accent-a7 + gray-a11
        const border = hc ? rc('gray-a11' as C) : rc(`${prefix}-a8` as C)
        const pressedBg = hc ? rc(`${prefix}-a3` as C) : rc(`${prefix}-a2` as C)
        return { bg: 'transparent', text, border, pressedBg }
      }
      case 'ghost': {
        const text = hc ? rc(`${prefix}-12` as C) : rc(`${prefix}-a11` as C)
        const pressedBg = rc(`${prefix}-a4` as C)
        return { bg: 'transparent', text, border: undefined, pressedBg }
      }
    }
  }, [variant, prefix, highContrast, isDisabled, loading, rc])

  // ─── Font family ───────────────────────────────────────────────────────────
  // Radix: only non-ghost uses font-weight: medium; ghost uses regular
  const fontFamily = isGhost ? (fonts.regular) : (fonts.medium ?? fonts.regular)

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
    <Pressable
      onPress={handlePress}
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
          height: isGhost ? undefined : resolvedHeight,
          paddingHorizontal: resolvedPaddingX,
          paddingVertical: isGhost ? resolvedPaddingY : undefined,
          gap: resolvedGap,
          backgroundColor: bg,
          borderRadius,
          borderWidth: colors.border ? 1 : undefined,
          borderColor: colors.border,
          opacity,
          // Margins
          marginTop: sp(mt ?? my ?? m),
          marginBottom: sp(mb ?? my ?? m),
          marginLeft: sp(ml ?? mx ?? m),
          marginRight: sp(mr ?? mx ?? m),
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
              fontWeight: isGhost ? '400' : '500',
              fontFamily,
            })}
          </View>
          {/* Spinner overlay */}
          <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="small" color={colors.text} />
          </View>
        </View>
      ) : (
        renderContent(children, {
          fontSize: resolvedFontSize,
          lineHeight: resolvedLineHeight,
          letterSpacing: resolvedLetterSpacing,
          color: colors.text,
          fontWeight: isGhost ? '400' : '500',
          fontFamily,
        })
      )}
    </Pressable>
  )
}
Button.displayName = 'Button'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderContent(children: React.ReactNode, textStyle: TextStyle): React.ReactNode {
  if (typeof children === 'string' || typeof children === 'number') {
    return <RNText style={textStyle}>{children}</RNText>
  }
  return children
}
