import React, { useMemo, useState, useCallback } from 'react'
import { View, Image, Text as RNText } from 'react-native'
import type { ViewStyle, TextStyle, ImageStyle, StyleProp, ImageProps } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useResolveColor } from '../../hooks/useResolveColor'
import { useMargins } from '../../hooks/useMargins'
import { resolveFont } from '../../utils/resolveFont'
import { scalingMap } from '../../tokens/scaling'
import { getRadius, getFullRadius } from '../../tokens/radius'
import type { RadiusToken, RadiusLevel } from '../../tokens/radius'
import type { AccentColor } from '../../tokens/colors/types'
import type { FontSizeToken } from '../../tokens/typography'
import { fontSize, letterSpacingEm } from '../../tokens/typography'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AvatarSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type AvatarVariant = 'solid' | 'soft'

type ImageStatus = 'idle' | 'loaded' | 'error'

export interface AvatarProps extends NativeViewProps, MarginProps {
  /** Image source (URI string or require()). */
  src?: string | number | { uri: string }
  /** Fallback content when image is unavailable. Usually 1–2 characters. */
  fallback: React.ReactNode
  /** Avatar size (1–9). Default: 3. */
  size?: AvatarSize
  /** Visual variant for fallback. Default: 'soft'. */
  variant?: AvatarVariant
  /** Accent color. Default: theme accent. */
  color?: AccentColor
  /** Increases color contrast with the background. */
  highContrast?: boolean
  /** Override the theme radius. */
  radius?: RadiusToken
  style?: StyleProp<ViewStyle>
}

// ─── Size mappings ────────────────────────────────────────────────────────────

const SIZE_PX: Record<AvatarSize, number> = {
  1: 24, 2: 32, 3: 40, 4: 48, 5: 64, 6: 80, 7: 96, 8: 128, 9: 160,
}
/** Font-size token for 1-letter fallbacks. */
const SIZE_FONT_ONE: Record<AvatarSize, FontSizeToken> = {
  1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 7, 8: 8, 9: 9,
}
/** Font-size token for 2-letter fallbacks (smaller). */
const SIZE_FONT_TWO: Record<AvatarSize, FontSizeToken> = {
  1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 7, 7: 7, 8: 8, 9: 9,
}
const SIZE_RADIUS_LEVEL: Record<AvatarSize, RadiusLevel> = {
  1: 2, 2: 2, 3: 3, 4: 3, 5: 4, 6: 5, 7: 5, 8: 6, 9: 6,
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Avatar({
  src,
  fallback,
  size = 3,
  variant = 'soft',
  color,
  highContrast,
  radius: radiusProp,
  m, mx, my, mt, mr, mb, ml,
  style,
  ...rest
}: AvatarProps) {
  const { scaling, fonts, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  // ─── Image loading state (mirrors Radix idle → loaded | error) ──────────
  // Normalize src to a primitive key for stable comparison (avoids infinite
  // reset when parent passes inline { uri } objects).
  const srcKey = typeof src === 'string' ? src : typeof src === 'number' ? src : src?.uri
  const [status, setStatus] = useState<ImageStatus>('idle')
  const [prevSrcKey, setPrevSrcKey] = useState(srcKey)
  if (srcKey !== prevSrcKey) {
    setPrevSrcKey(srcKey)
    setStatus('idle')
  }

  const prefix = color ?? 'accent'

  // ─── Dimensions ─────────────────────────────────────────────────────────
  const scalingFactor = scalingMap[scaling]
  const boxSize = Math.round(SIZE_PX[size] * scalingFactor)

  // ─── Radius ─────────────────────────────────────────────────────────────
  const effectiveRadius = radiusProp ?? themeRadius
  const borderRadius = Math.max(
    getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size]),
    getFullRadius(effectiveRadius),
  )

  // ─── Colors ─────────────────────────────────────────────────────────────
  const colors = useMemo(() => {
    const hc = highContrast
    switch (variant) {
      case 'solid': {
        const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
        const text = hc ? rc(prefix, 1) : rc(prefix, 'contrast')
        return { bg, text }
      }
      case 'soft': {
        const bg = rc(prefix, 'a3')
        const text = hc ? rc(prefix, 12) : rc(prefix, 'a11')
        return { bg, text }
      }
    }
  }, [variant, prefix, highContrast, rc])

  // ─── Image source ───────────────────────────────────────────────────────
  const imageSource = useMemo((): ImageProps['source'] | undefined => {
    if (!src) return undefined
    if (typeof src === 'string') return { uri: src }
    return src
  }, [src])

  // ─── Callbacks ──────────────────────────────────────────────────────────
  const handleLoad = useCallback(() => setStatus('loaded'), [])
  const handleError = useCallback(() => setStatus('error'), [])

  // ─── Styles ─────────────────────────────────────────────────────────────
  const containerStyle = useMemo<ViewStyle>(() => ({
    width: boxSize,
    height: boxSize,
    borderRadius,
    backgroundColor: status === 'loaded' ? undefined : colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...margins,
  }), [boxSize, borderRadius, status, colors.bg, margins])

  const imageStyle = useMemo<ImageStyle>(() => ({
    position: 'absolute',
    width: boxSize,
    height: boxSize,
    borderRadius,
  }), [boxSize, borderRadius])

  const textStyle = useMemo<TextStyle>(() => {
    const letterCount = typeof fallback === 'string' ? fallback.length : 0
    const fontToken = letterCount === 2 ? SIZE_FONT_TWO[size] : SIZE_FONT_ONE[size]
    const resolvedFontSize = Math.round(fontSize[fontToken] * scalingFactor)
    return {
      fontSize: resolvedFontSize,
      letterSpacing: letterSpacingEm[fontToken] * resolvedFontSize,
      lineHeight: resolvedFontSize,
      ...resolveFont(fonts.medium ?? fonts.regular, '500'),
      textTransform: 'uppercase',
      color: colors.text,
    }
  }, [size, scalingFactor, fallback, fonts.medium, fonts.regular, colors.text])

  // ─── Derived state ──────────────────────────────────────────────────────
  const showFallback = !src || status === 'error'

  return (
    <View style={[containerStyle, style]} accessibilityRole="image" {...rest}>
      {/* Fallback: shown only when no src or image failed */}
      {showFallback && (
        typeof fallback === 'string' || typeof fallback === 'number'
          ? <RNText style={textStyle}>{fallback}</RNText>
          : React.isValidElement(fallback)
            ? React.cloneElement(fallback as React.ReactElement<{ color?: string }>, { color: colors.text })
            : fallback
      )}

      {/* Image: always mounted when src exists — hidden until loaded */}
      {imageSource && status !== 'error' && (
        <Image
          source={imageSource}
          style={[imageStyle, status !== 'loaded' && { opacity: 0 }]}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </View>
  )
}
Avatar.displayName = 'Avatar'
