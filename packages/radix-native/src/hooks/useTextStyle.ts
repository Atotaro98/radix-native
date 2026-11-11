import { createElement, useCallback, useEffect, useMemo, type ReactNode } from 'react'
import { useThemeContext } from './useThemeContext'
import { TextContext, useParentText } from '../components/typography/TextContext'
import { resolveTextStyle, type ResolvedTextStyle, type TextStyleRequest } from '../utils/textStyle'
import { isDev } from '../utils/env'
import { RADIUS_FACTOR } from '../tokens/radius'

export interface UseTextStyleOptions extends TextStyleRequest {
  /**
   * Inline text joins the surrounding radix-native text: it inherits size and
   * face from it and drops layout props. Block text (Heading, Blockquote,
   * control labels) ignores any parent. Default: false.
   */
  inline?: boolean
}

export interface TextStyleResult extends ResolvedTextStyle {
  /** Whether this text sits inside another radix-native text (always false for block text). */
  isNested: boolean
  /** Wraps the rendered text so nested typography inherits from it (memoized `TextContext`). */
  provide: (children: ReactNode) => ReactNode
  /** A length of `k` em (Radix `Nem`) on this text's own size, rounded to whole pixels. */
  em: (k: number) => number
  /**
   * A radius relative to this text's size, Radix `calc((offsetPx + k·em) * var(--radius-factor))`
   * with the Theme's radius factor. Not rounded, like every other radius.
   */
  radius: (k: number, offsetPx?: number) => number
}

const warnedMissingFaces = new Set<string>()

/**
 * Text style for one piece of text — the single entry point every
 * text-rendering module uses. Reads the theme and `TextContext`, delegates to
 * `resolveTextStyle`, and warns once (dev only) when a requested weight has no
 * configured face.
 *
 * Internal: not exported from the package.
 */
export function useTextStyle({
  inline = false,
  role,
  size,
  defaultSize,
  sizeAdjust,
  weight,
  lineHeight,
  color,
  standaloneColor,
  compact,
  maxFontSizeMultiplier,
  truncate,
  wrap,
  margins,
}: UseTextStyleOptions): TextStyleResult {
  const { scaling, fonts, radius: radiusToken, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const contextParent = useParentText()
  const parent = inline ? contextParent : null
  const parentFontSize = parent?.fontSize
  const parentRole = parent?.role

  const resolved = useMemo(
    () =>
      resolveTextStyle(
        { scaling, fonts, maxFontSizeMultiplier: globalMax },
        { role, size, defaultSize, sizeAdjust, weight, lineHeight, color, standaloneColor, compact, maxFontSizeMultiplier, truncate, wrap, margins },
        parentFontSize === undefined ? null : { fontSize: parentFontSize, role: parentRole },
      ),
    [scaling, fonts, globalMax, role, size, defaultSize, sizeAdjust, weight, lineHeight, color, standaloneColor, compact,
      maxFontSizeMultiplier, truncate, wrap, margins, parentFontSize, parentRole],
  )

  const { missingFace } = resolved
  const roleName = role ?? 'default'
  useEffect(() => {
    if (!isDev || missingFace === undefined) return
    const key = `${roleName}:${missingFace}`
    if (warnedMissingFaces.has(key)) return
    warnedMissingFaces.add(key)
    console.warn(
      `[radix-native] No font face configured for weight "${missingFace}" ` +
        `(text role "${roleName}"); rendering with fonts.regular. ` +
        `Add it to <Theme fonts={{ ${missingFace}: '…' }}>.`,
    )
  }, [missingFace, roleName])

  const contextValue = useMemo(
    () => ({ fontSize: resolved.contextFontSize, role: roleName }),
    [resolved.contextFontSize, roleName],
  )
  const provide = useCallback(
    (children: ReactNode) => createElement(TextContext.Provider, { value: contextValue }, children),
    [contextValue],
  )

  const fontSize = resolved.contextFontSize
  const radiusFactor = RADIUS_FACTOR[radiusToken]
  const em = useCallback((k: number) => Math.round(k * fontSize), [fontSize])
  const radius = useCallback(
    (k: number, offsetPx = 0) => (offsetPx + k * fontSize) * radiusFactor,
    [fontSize, radiusFactor],
  )

  return { ...resolved, isNested: parentFontSize !== undefined, provide, em, radius }
}
