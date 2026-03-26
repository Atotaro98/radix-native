import React from 'react'
import { useThemeContext } from './useThemeContext'
import { resolveColor } from '../utils/resolveColor'
import type { ThemeColor } from '../theme/theme.types'
import type { AccentColor } from '../tokens/colors/types'

// ─── Public types for the two-param form ──────────────────────────────────────

export type ColorName = AccentColor | 'accent' | 'gray'

export type SolidStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type AlphaStep =
  | 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6'
  | 'a7' | 'a8' | 'a9' | 'a10' | 'a11' | 'a12'

export type ColorStep = SolidStep | AlphaStep | 'contrast' | 'surface'

// ─── Overloaded return type ───────────────────────────────────────────────────

export interface ResolveColorFn {
  /** Resolve a full token: `rc('gray-1')`, `rc('accent-9')` */
  (token: ThemeColor): string
  /** Resolve by color + step: `rc('accent', 9)`, `rc(prefix, 'a3')` */
  (color: ColorName, step: ColorStep): string
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Internal hook — returns a memoized resolver function for components
 * that resolve many colors inside a single `useMemo`.
 * Not exported publicly — consumers should use `useColor` instead.
 */
export function useResolveColor(): ResolveColorFn {
  const { appearance, accentColor, resolvedGrayColor, colorOverrides } = useThemeContext()

  return React.useCallback(
    ((first: ThemeColor | ColorName, step?: ColorStep): string => {
      const token = step !== undefined ? `${first}-${step}` : first
      return resolveColor(token, appearance, accentColor, resolvedGrayColor, colorOverrides)
    }) as ResolveColorFn,
    [appearance, accentColor, resolvedGrayColor, colorOverrides],
  )
}
