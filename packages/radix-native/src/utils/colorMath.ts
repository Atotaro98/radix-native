/**
 * Color compositing for stacked translucent layers.
 *
 * Radix often paints one part with several layers (a background color plus
 * background-image gradients, or two inset rings). React Native has one
 * `backgroundColor` / `borderColor` per view, so we flatten the stack into a
 * single color with standard "source-over" alpha compositing.
 */

export interface RGBA { r: number; g: number; b: number; a: number }

/** Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa`, `rgb()`, `rgba()` and `transparent`. */
export function parseColor(color: string): RGBA | null {
  const value = color.trim().toLowerCase()
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
  if (value === 'white') return { r: 255, g: 255, b: 255, a: 1 }
  if (value === 'black') return { r: 0, g: 0, b: 0, a: 1 }
  if (value.startsWith('#')) {
    let body = value.slice(1)
    if (body.length === 3 || body.length === 4) body = body.split('').map(c => c + c).join('')
    if ((body.length !== 6 && body.length !== 8) || !/^[0-9a-f]+$/.test(body)) return null
    return {
      r: parseInt(body.slice(0, 2), 16),
      g: parseInt(body.slice(2, 4), 16),
      b: parseInt(body.slice(4, 6), 16),
      a: body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1,
    }
  }
  const match = /^rgba?\(([^)]+)\)$/.exec(value)
  if (!match) return null
  const parts = match[1].split(/[\s,/]+/).filter(Boolean).map(Number)
  if (parts.length < 3 || parts.some(n => Number.isNaN(n))) return null
  return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] ?? 1 }
}

export function formatColor({ r, g, b, a }: RGBA): string {
  const hex = (v: number) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')
  const alpha = Math.round(Math.min(1, Math.max(0, a)) * 255)
  return '#' + hex(r) + hex(g) + hex(b) + (alpha === 255 ? '' : hex(alpha))
}

/** `top` painted over `bottom` (both may be translucent). */
export function compositeRGBA(top: RGBA, bottom: RGBA): RGBA {
  const a = top.a + bottom.a * (1 - top.a)
  if (a === 0) return { r: 0, g: 0, b: 0, a: 0 }
  const mix = (t: number, b: number) => (t * top.a + b * bottom.a * (1 - top.a)) / a
  return { r: mix(top.r, bottom.r), g: mix(top.g, bottom.g), b: mix(top.b, bottom.b), a }
}

/**
 * Flattens layers listed top-most first into one color.
 * If any layer cannot be parsed (e.g. a named color override), the top layer wins.
 */
export function compositeLayers(layers: readonly string[]): string {
  if (layers.length === 1) return layers[0]
  const parsed = layers.map(parseColor)
  if (parsed.some(p => p === null)) return layers[0]
  const result = (parsed as RGBA[]).reduceRight((bottom, top) => compositeRGBA(top, bottom))
  return formatColor(result)
}

/** Multiplies a color's alpha by `opacity` (Radix `opacity` on a layer). */
export function fadeColor(color: string, opacity: number): string {
  const parsed = parseColor(color)
  if (!parsed) return color
  return formatColor({ ...parsed, a: parsed.a * opacity })
}
