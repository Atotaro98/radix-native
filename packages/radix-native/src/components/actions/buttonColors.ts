import type { ResolveColorFn, ColorName } from '../../hooks/useResolveColor'

export type ButtonLikeVariant = 'classic' | 'solid' | 'soft' | 'surface' | 'outline' | 'ghost'

export interface ButtonColors {
  bg: string
  text: string
  border?: string
  pressedBg: string
  /** Extra press feedback when the pressed bg cannot change (high-contrast solid). */
  pressedOpacity?: number
}

/**
 * Variant → color mapping shared by Button and IconButton (they use the exact
 * same Radix base-button styles). Loading counts as disabled, like Radix's
 * `[data-disabled]`.
 */
export function getButtonColors(
  rc: ResolveColorFn,
  variant: ButtonLikeVariant,
  prefix: ColorName,
  highContrast: boolean | undefined,
  disabled: boolean,
): ButtonColors {
  if (disabled) {
    const text = rc('gray', 'a8')
    switch (variant) {
      case 'classic':
        return { bg: rc('gray', 2), text, pressedBg: rc('gray', 2) }
      case 'solid':
      case 'soft':
        return { bg: rc('gray', 'a3'), text, pressedBg: rc('gray', 'a3') }
      case 'surface':
        return { bg: rc('gray', 'a2'), text, border: rc('gray', 'a6'), pressedBg: rc('gray', 'a2') }
      case 'outline':
        return { bg: 'transparent', text, border: rc('gray', 'a7'), pressedBg: 'transparent' }
      case 'ghost':
        return { bg: 'transparent', text, pressedBg: 'transparent' }
    }
  }

  const hc = !!highContrast
  switch (variant) {
    case 'classic':
    case 'solid':
      return {
        bg: hc ? rc(prefix, 12) : rc(prefix, 9),
        text: hc ? rc('gray', 1) : rc(prefix, 'contrast'),
        pressedBg: hc ? rc(prefix, 12) : rc(prefix, 10),
        // accent-12 has no darker step: fall back to opacity for press feedback
        pressedOpacity: hc ? 0.88 : undefined,
      }
    case 'soft':
      return {
        bg: rc(prefix, 'a3'),
        text: hc ? rc(prefix, 12) : rc(prefix, 'a11'),
        pressedBg: rc(prefix, 'a5'),
      }
    case 'surface':
      return {
        bg: rc(prefix, 'surface'),
        text: hc ? rc(prefix, 12) : rc(prefix, 'a11'),
        border: rc(prefix, 'a7'),
        pressedBg: rc(prefix, 'a3'),
      }
    case 'outline':
      return {
        bg: 'transparent',
        text: hc ? rc(prefix, 12) : rc(prefix, 'a11'),
        // Radix highContrast: double inset shadow accent-a7 + gray-a11 → single border
        border: hc ? rc('gray', 'a11') : rc(prefix, 'a8'),
        pressedBg: rc(prefix, 'a3'),
      }
    case 'ghost':
      return {
        bg: 'transparent',
        text: hc ? rc(prefix, 12) : rc(prefix, 'a11'),
        pressedBg: rc(prefix, 'a4'),
      }
  }
}
