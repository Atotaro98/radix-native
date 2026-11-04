import { useEffect, useMemo } from 'react'
import { useThemeContext } from './useThemeContext'
import { useParentText } from '../components/typography/TextContext'
import { resolveTextStyle, type ResolvedTextStyle, type TextStyleRequest } from '../utils/textStyle'
import { isDev } from '../utils/env'

export interface UseTextStyleOptions extends TextStyleRequest {
  /**
   * Inline text joins the surrounding radix-native text: it inherits size and
   * face from it and drops layout props. Block text (Heading, Blockquote,
   * control labels) ignores any parent. Default: false.
   */
  inline?: boolean
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
  compact,
  maxFontSizeMultiplier,
  truncate,
  wrap,
  margins,
}: UseTextStyleOptions): ResolvedTextStyle {
  const { scaling, fonts, maxFontSizeMultiplier: globalMax } = useThemeContext()
  const contextParent = useParentText()
  const parentFontSize = inline ? contextParent?.fontSize : undefined

  const resolved = useMemo(
    () =>
      resolveTextStyle(
        { scaling, fonts, maxFontSizeMultiplier: globalMax },
        { role, size, defaultSize, sizeAdjust, weight, lineHeight, color, compact, maxFontSizeMultiplier, truncate, wrap, margins },
        parentFontSize === undefined ? null : { fontSize: parentFontSize },
      ),
    [scaling, fonts, globalMax, role, size, defaultSize, sizeAdjust, weight, lineHeight, color, compact,
      maxFontSizeMultiplier, truncate, wrap, margins, parentFontSize],
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

  return resolved
}
