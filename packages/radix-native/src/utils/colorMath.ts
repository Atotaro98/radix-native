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

// ─── OKLab mixing (CSS `color-mix(in oklab, …)`) ─────────────────────────────

const toLinear = (v: number) => {
  const c = v / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}
const fromLinear = (linear: number) => {
  // Out-of-gamut results clip to sRGB, like browsers do for hex output
  const c = Math.min(1, Math.max(0, linear))
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)
}

function rgbToOklab({ r, g, b }: RGBA): [number, number, number] {
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b)
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb)
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb)
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToRgb([L, A, B]: [number, number, number]): Omit<RGBA, 'a'> {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3
  return {
    r: fromLinear(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: fromLinear(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: fromLinear(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  }
}

/**
 * CSS `color-mix(in oklab, a, b <weightB>)`: `weightB` (0–1) of `b`, the rest
 * of `a`, interpolated in OKLab with premultiplied alpha.
 * If either color cannot be parsed (e.g. a named color override), `b` wins.
 */
export function mixOklab(a: string, b: string, weightB: number): string {
  const pa = parseColor(a)
  const pb = parseColor(b)
  if (!pa || !pb) return b
  const wa = 1 - weightB
  const alpha = pa.a * wa + pb.a * weightB
  if (alpha === 0) return formatColor({ r: 0, g: 0, b: 0, a: 0 })
  const la = rgbToOklab(pa)
  const lb = rgbToOklab(pb)
  const lab: [number, number, number] = [0, 1, 2].map(
    i => (la[i] * pa.a * wa + lb[i] * pb.a * weightB) / alpha,
  ) as [number, number, number]
  return formatColor({ ...oklabToRgb(lab), a: alpha })
}
