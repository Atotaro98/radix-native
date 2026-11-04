/** WCAG 2.x contrast helpers (with alpha compositing for Radix `a*` steps). */
import { compositeRGBA, parseColor, formatColor } from '../../utils/colorMath'
import type { RGBA } from '../../utils/colorMath'

function parse(color: string): RGBA {
  const parsed = parseColor(color)
  if (!parsed) throw new Error(`Unparseable color: ${color}`)
  return parsed
}

/** Composites `fg` (possibly translucent) over an opaque `bg`. */
export function composite(fg: string, bg: string): RGBA {
  return compositeRGBA(parse(fg), { ...parse(bg), a: 1 })
}

function luminance({ r, g, b }: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Contrast ratio of `fg` drawn over `bg` (`fg` may have alpha; translucent `bg` is put on white). */
export function contrastRatio(fg: string, bg: string): number {
  const background = composite(bg, '#ffffff')
  const foreground = composite(fg, formatColor(background))
  const l1 = luminance(foreground)
  const l2 = luminance(background)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}
