import type { ResolveColorFn, ColorName } from '../../hooks/useResolveColor'
import { withAlpha } from '../../utils/alpha'

export type TextInputVariant = 'classic' | 'surface' | 'soft'

export interface TextInputColors {
  bg: string
  border: string
  text: string
  placeholder: string
}

/** Variant → colors shared by TextField and TextArea. */
export function getTextInputColors(
  rc: ResolveColorFn,
  variant: TextInputVariant,
  prefix: ColorName,
  focused: boolean,
  disabled: boolean,
): TextInputColors {
  if (disabled) {
    return {
      bg: variant === 'soft' ? rc('gray', 'a3') : rc('gray', 'a2'),
      border: variant === 'soft' ? 'transparent' : rc('gray', 'a6'),
      text: rc('gray', 'a11'),
      placeholder: withAlpha(rc('gray', 'a10'), 0.5),
    }
  }
  const focusBorder = rc(prefix, 8)
  switch (variant) {
    case 'classic':
    case 'surface':
      return {
        bg: rc('gray', 'surface'),
        border: focused ? focusBorder : rc('gray', 'a7'),
        text: rc('gray', 12),
        placeholder: rc('gray', 'a10'),
      }
    case 'soft':
      return {
        bg: rc(prefix, 'a3'),
        border: focused ? focusBorder : 'transparent',
        text: rc(prefix, 12),
        // Radix: placeholder is accent-12 at 60% opacity
        placeholder: withAlpha(rc(prefix, 12), 0.6),
      }
  }
}
