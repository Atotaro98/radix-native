/**
 * Applies an alpha multiplier to a hex color (`#rgb`, `#rrggbb`, `#rrggbbaa`).
 * Non-hex colors (rgb(), named colors…) are returned unchanged.
 */
export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim()
  if (!hex.startsWith('#')) return color
  let body = hex.slice(1)
  if (body.length === 3 || body.length === 4) {
    body = body.split('').map(c => c + c).join('')
  }
  if (body.length !== 6 && body.length !== 8) return color
  if (!/^[0-9a-fA-F]+$/.test(body)) return color
  const base = body.slice(0, 6)
  const currentAlpha = body.length === 8 ? parseInt(body.slice(6), 16) / 255 : 1
  const next = Math.round(Math.min(1, Math.max(0, currentAlpha * alpha)) * 255)
  return `#${base}${next.toString(16).padStart(2, '0')}`
}
