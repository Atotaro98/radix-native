import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

/**
 * Internal: the parts of a compound component, known to its root wherever
 * they sit in the tree — also inside a consumer's own component, where
 * scanning `children` cannot see them (Radix `Collection`).
 *
 * Parts register in a layout effect, so the root knows them before the first
 * paint; `items` is in the order they mounted, which is tree order for parts
 * mounted together. A part mounted later goes last, whatever its place in the
 * tree: where order matters and parts come and go, key the root's content.
 */
export interface Collection<T> {
  /** The registered parts, in mount order. */
  items: readonly T[]
  register: (key: object, item: T) => () => void
  /** Replaces a registered part, keeping its place; nothing changes when it is shallowly equal. */
  update: (key: object, item: T) => void
}

const shallowEqual = (a: object, b: object) => {
  const keys = Object.keys(a) as (keyof typeof a)[]
  return keys.length === Object.keys(b).length && keys.every((k) => Object.is(a[k], (b as typeof a)[k]))
}

export function useCollection<T extends object>(): Collection<T> {
  const map = useRef(new Map<object, T>())
  const [items, setItems] = useState<readonly T[]>([])
  const sync = useCallback(() => setItems(Array.from(map.current.values())), [])

  const register = useCallback((key: object, item: T) => {
    map.current.set(key, item)
    sync()
    return () => {
      if (map.current.delete(key)) sync()
    }
  }, [sync])

  const update = useCallback((key: object, item: T) => {
    const prev = map.current.get(key)
    if (!prev || prev === item || shallowEqual(prev, item)) return
    map.current.set(key, item)
    sync()
  }, [sync])

  return useMemo(() => ({ items, register, update }), [items, register, update])
}

/** Internal: registers this part in its root's collection while `enabled`; a changed `item` updates it in place. */
export function useCollectionItem<T extends object>(
  collection: Pick<Collection<T>, 'register' | 'update'> | null | undefined,
  item: T,
  enabled = true,
): void {
  const key = useRef({}).current
  const latest = useRef(item)
  latest.current = item
  const register = collection?.register
  const update = collection?.update
  useLayoutEffect(() => {
    if (!enabled || !register) return
    return register(key, latest.current)
  }, [enabled, register, key])
  // Every render: `update` ignores an item that is shallowly the same
  useLayoutEffect(() => {
    if (enabled && update) update(key, latest.current)
  })
}
