import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { LayoutChangeEvent, ViewStyle } from 'react-native'

/**
 * Internal: Measured columns. CSS sizes a column to its cells (grid `auto`,
 * `1fr` with `min-width: max-content`, subgrid, table layout); RN has no
 * equivalent. Cells register with what the column rule needs to know about
 * them, report their natural width, and the owner resolves the columns from
 * `cells`. `ready` stays false until every registered cell has reported, so
 * the owner can hide the first frame instead of showing unaligned cells
 * (ColumnRows avoids measuring for the same reason; here there is no other way).
 *
 * DataList labels and SegmentedControl items take the widest (`useWidest`);
 * Table resolves its columns with `utils/tableLayout`.
 */
export interface MeasuredCells<Meta extends object = object> {
  /** Every registered cell, in registration order, with its natural width once reported. */
  cells: readonly (Meta & { natural?: number })[]
  /** True once every registered cell has been measured. */
  ready: boolean
  register: (id: object, meta: Meta) => () => void
  /** Replaces a registered cell's meta, keeping what it has measured. */
  update: (id: object, meta: Meta) => void
  report: (id: object, natural: number) => void
}

export function useMeasuredCells<Meta extends object = object>(): MeasuredCells<Meta> {
  const map = useRef(new Map<object, Meta & { natural?: number }>())
  const [version, setVersion] = useState(0)
  const bump = useCallback(() => setVersion((v) => v + 1), [])

  const register = useCallback((id: object, meta: Meta) => {
    map.current.set(id, { ...meta, natural: map.current.get(id)?.natural })
    bump()
    return () => {
      if (map.current.delete(id)) bump()
    }
  }, [bump])

  const update = useCallback((id: object, meta: Meta) => {
    const cell = map.current.get(id)
    if (!cell) return
    map.current.set(id, { ...meta, natural: cell.natural })
    bump()
  }, [bump])

  const report = useCallback((id: object, natural: number) => {
    const cell = map.current.get(id)
    if (!cell || cell.natural === natural) return
    map.current.set(id, { ...cell, natural })
    bump()
  }, [bump])

  return useMemo(() => {
    void version
    const cells = Array.from(map.current.values())
    return { cells, ready: cells.every((c) => c.natural !== undefined), register, update, report }
  }, [version, register, update, report])
}

const NO_META = {}

/**
 * Internal: one cell of Measured columns. Registers before the first paint
 * and returns the `onLayout` for the View that wraps the cell's natural
 * content (see `naturalWidthStyle`). `meta` must be memoized; changing it
 * keeps the measured width. `minWidth` is counted like a grid cell's own width.
 */
export function useMeasuredCell<Meta extends object>(
  cells: Pick<MeasuredCells<Meta>, 'register' | 'update' | 'report'>,
  { meta, enabled = true, minWidth = 0 }: { meta: Meta; enabled?: boolean; minWidth?: number },
) {
  const id = useRef({}).current
  const { register, update, report } = cells
  const latest = useRef(meta)
  latest.current = meta
  useLayoutEffect(() => (enabled ? register(id, latest.current) : undefined), [enabled, register, id])
  useLayoutEffect(() => { if (enabled) update(id, meta) }, [enabled, update, id, meta])
  return useCallback(
    (e: LayoutChangeEvent) => report(id, Math.max(e.nativeEvent.layout.width, minWidth)),
    [report, id, minWidth],
  )
}

/**
 * The style of the View that measures a cell's natural (max-content) width.
 * Only a cell that sets its own width wraps inside it; the others report
 * their natural width even when it outgrows the column, so the column widens.
 */
export function naturalWidthStyle(ownsWidth: boolean): ViewStyle {
  return { flexDirection: 'row', maxWidth: ownsWidth ? '100%' : undefined }
}

/** Measured columns where every cell takes the widest: one grid `auto` column, or equal `1fr` columns. */
export interface WidestCells extends Pick<MeasuredCells, 'ready' | 'register' | 'update' | 'report'> {
  /** Widest reported width, or null before the first report. */
  widest: number | null
}

export function useWidest(): WidestCells {
  const { cells, ready, register, update, report } = useMeasuredCells()
  const widest = useMemo(() => {
    const measured = cells.flatMap((c) => (c.natural === undefined ? [] : [c.natural]))
    return measured.length ? Math.max(...measured) : null
  }, [cells])
  return useMemo(() => ({ widest, ready, register, update, report }), [widest, ready, register, update, report])
}

/** Internal: one cell of `useWidest`. */
export function useWidestCell(cells: Pick<WidestCells, 'register' | 'update' | 'report'>, enabled = true, minWidth = 0) {
  return useMeasuredCell(cells, { meta: NO_META, enabled, minWidth })
}
