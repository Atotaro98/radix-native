import { useMemo } from 'react'
import { useThemeContext } from './useThemeContext'
import { useResolveColor } from './useResolveColor'
import { resolveVariantColors } from '../utils/variantPalette'
import type { RecipeName, RecipeState, VariantColors } from '../utils/variantPalette'
import type { AccentColor } from '../tokens/colors/types'

export type VariantColorsInput<R extends RecipeName> =
  Omit<RecipeState<R>, 'appearance' | 'hasColor'> & { color?: AccentColor }

/**
 * Internal hook — the colors of a component's parts for its Variant and state,
 * from the Variant recipe `name` (`utils/variantPalette.ts`).
 */
export function useVariantColors<R extends RecipeName>(
  name: R,
  { color, ...state }: VariantColorsInput<R>,
): VariantColors<R> {
  const { appearance } = useThemeContext()
  const rc = useResolveColor()
  // State is a small flat object of primitives: key the memo on its values.
  const key = JSON.stringify(state)
  return useMemo(
    () => resolveVariantColors(
      name,
      { ...JSON.parse(key), appearance, hasColor: color !== undefined } as RecipeState<R>,
      { rc, color: color ?? 'accent', appearance },
    ),
    [name, key, color, appearance, rc],
  )
}
