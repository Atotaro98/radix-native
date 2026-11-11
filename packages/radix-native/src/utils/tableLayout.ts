/**
 * Pure column sizing for Table — a stand-in for the browser's table layout
 * algorithm (RN has none). Widths are numbers or `'N%'` / `'Npx'` strings.
 */

export type TableLength = number | string

export interface TableCellSize {
  col: number
  /** The cell's natural (max-content) width, measured; auto layout only. */
  natural?: number
  width?: TableLength
  minWidth?: TableLength
  maxWidth?: TableLength
  /** In the table's first row (fixed layout reads only these). */
  firstRow: boolean
}

/** A number, `'Npx'` or `'N%'` of `basis`; undefined for anything else. */
export function resolveLength(value: TableLength | undefined, basis: number): number | undefined {
  if (value === undefined) return undefined
  if (typeof value === 'number') return value
  const n = parseFloat(value)
  if (Number.isNaN(n)) return undefined
  return value.trim().endsWith('%') ? (n / 100) * basis : n
}

/**
 * `layout="auto"`: each column is as wide as its widest cell (a cell's `width`
 * replaces its natural width, clamped by min / max); a table narrower than
 * the container grows every column in proportion, like `width: 100%`.
 * `layout="fixed"`: first-row cells with a width keep it; the other columns
 * share what is left equally.
 */
export function resolveColumnWidths(
  cells: TableCellSize[],
  columns: number,
  available: number,
  layout: 'auto' | 'fixed',
): number[] {
  const widths = new Array<number>(columns).fill(0)
  const len = (v: TableLength | undefined) => resolveLength(v, available)

  if (layout === 'fixed') {
    const set = new Array<boolean>(columns).fill(false)
    for (const cell of cells) {
      const w = len(cell.width)
      if (cell.firstRow && w !== undefined && cell.col < columns) {
        widths[cell.col] = w
        set[cell.col] = true
      }
    }
    const rest = set.filter((s) => !s).length
    const left = Math.max(0, available - widths.reduce((a, b) => a + b, 0))
    return widths.map((w, i) => (set[i] ? w : rest ? left / rest : 0))
  }

  for (const cell of cells) {
    if (cell.col >= columns) continue
    let w = len(cell.width) ?? cell.natural ?? 0
    const min = len(cell.minWidth)
    const max = len(cell.maxWidth)
    if (max !== undefined) w = Math.min(w, max)
    if (min !== undefined) w = Math.max(w, min)
    widths[cell.col] = Math.max(widths[cell.col], w)
  }
  const total = widths.reduce((a, b) => a + b, 0)
  if (total > 0 && total < available) return widths.map((w) => (w * available) / total)
  return widths
}
