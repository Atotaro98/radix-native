import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { LayoutChangeEvent } from 'react-native'

/**
 * Internal: CSS grid columns that size to their widest cell (`auto`, `1fr` with
 * `min-width: max-content`, subgrid) have no RN equivalent. Cells register,
 * report their natural width, and all take the widest. `ready` stays false
 * until every registered cell has reported, so the parent can hide the first
 * frame instead of showing unaligned cells (ColumnRows avoids measuring for
 * the same reason; here there is no other way to know the widest cell).
 */
export interface WidestCells {
  /** Widest reported width, or null before the first report. */
  widest: number | null
  /** True once every registered cell has been measured. */
  ready: boolean
  register: (id: object) => () => void
  report: (id: object, width: number) => void
}

export function useWidest(): WidestCells {
  const widths = useRef(new Map<object, number>())
  const [widest, setWidest] = useState<number | null>(null)
  const [registered, setRegistered] = useState(0)
  const [measured, setMeasured] = useState(0)

  const max = () => (widths.current.size ? Math.max(...Array.from(widths.current.values())) : null)

  const register = useCallback((id: object) => {
    setRegistered((n) => n + 1)
    return () => {
      setRegistered((n) => n - 1)
      if (widths.current.delete(id)) {
        setMeasured((n) => n - 1)
        setWidest(max())
      }
    }
  }, [])

  const report = useCallback((id: object, width: number) => {
    if (!widths.current.has(id)) setMeasured((n) => n + 1)
    widths.current.set(id, width)
    setWidest(max())
  }, [])

  return useMemo(
    () => ({ widest, ready: measured >= registered, register, report }),
    [widest, measured, registered, register, report],
  )
}

/**
 * Internal: one cell of `useWidest`. Registers before the first paint and
 * returns the `onLayout` for the View that wraps the cell's natural content;
 * `minWidth` is counted like a grid cell's own width.
 */
export function useWidestCell(cells: Pick<WidestCells, 'register' | 'report'>, enabled = true, minWidth = 0) {
  const id = useRef({}).current
  const { register, report } = cells
  useLayoutEffect(() => (enabled ? register(id) : undefined), [enabled, register, id])
  return useCallback(
    (e: LayoutChangeEvent) => report(id, Math.max(e.nativeEvent.layout.width, minWidth)),
    [report, id, minWidth],
  )
}
