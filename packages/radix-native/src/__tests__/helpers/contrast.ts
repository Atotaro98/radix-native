/** WCAG 2.x contrast helpers (with alpha compositing for Radix `a*` steps). */

interface RGBA { r: number; g: number; b: number; a: number }

export function parseHex(hex: string): RGBA {
  let body = hex.replace('#', '')
  if (body.length === 3 || body.length === 4) body = body.split('').map(c => c + c).join('')
  const r = parseInt(body.slice(0, 2), 16)
  const g = parseInt(body.slice(2, 4), 16)
  const b = parseInt(body.slice(4, 6), 16)
  const a = body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1
  return { r, g, b, a }
}

/** Composites `fg` (possibly translucent) over an opaque `bg`. */
export function composite(fg: string, bg: string): RGBA {
  const f = parseHex(fg)
  const b = parseHex(bg)
  return {
    r: f.r * f.a + b.r * (1 - f.a),
    g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a),
    a: 1,
  }
}

function luminance({ r, g, b }: RGBA): number {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/** Contrast ratio of `fg` drawn over `bg` (both hex; `fg` may have alpha). */
export function contrastRatio(fg: string, bg: string): number {
  const background = composite(bg, '#ffffff') // bg itself is expected opaque
  const toHex = (c: RGBA) =>
    '#' + [c.r, c.g, c.b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
  const foreground = composite(fg, toHex(background))
  const l1 = luminance(foreground)
  const l2 = luminance(background)
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]
  return (hi + 0.05) / (lo + 0.05)
}
