import React from 'react'
import { useThemeContext } from './useThemeContext'
import { resolveColor } from '../utils/resolveColor'
import type { ThemeColor } from '../theme/theme.types'

/**
 * Returns a resolver function bound to the current theme context.
 * Use this to resolve ThemeColor tokens to hex strings inside components.
 *
 * @example
 * const rc = useResolveColor()
 * const bg = rc('gray-1')
 * const accent = rc('accent-9')
 * const blue = rc('blue-5')
 */
export function useResolveColor(): (color: ThemeColor) => string {
  const { appearance, accentColor, resolvedGrayColor, colorOverrides } = useThemeContext()

  return React.useCallback(
    (color: ThemeColor) =>
      resolveColor(color, appearance, accentColor, resolvedGrayColor, colorOverrides),
    [appearance, accentColor, resolvedGrayColor, colorOverrides],
  )
}
