import { useThemeContext } from './useThemeContext'
import { resolveColor } from '../utils/resolveColor'
import type { ThemeColor } from '../theme/theme.types'
import type { ColorName, ColorStep } from './useResolveColor'

// ─── Overloads ───────────────────────────────────────────────────────────────

/**
 * Resolves a theme color token to a hex string.
 *
 * @example
 * // Single-param (full token):
 * const bg = useColor('accent-9')
 * const border = useColor('gray-6')
 *
 * // Two-param (color + step):
 * const text = useColor('accent', 'contrast')
 * const surface = useColor('gray', 'surface')
 */
export function useColor(token: ThemeColor): string
export function useColor(color: ColorName, step: ColorStep): string
export function useColor(first: ThemeColor | ColorName, step?: ColorStep): string {
  const { appearance, accentColor, resolvedGrayColor, colorOverrides } = useThemeContext()
  const token = step !== undefined ? `${first}-${step}` : first
  return resolveColor(token, appearance, accentColor, resolvedGrayColor, colorOverrides)
}
