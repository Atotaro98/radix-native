import React from 'react'

type SetStateAction<T> = T | ((prev: T) => T)

interface UseControllableStateParams<T> {
  /** Controlled value. When `undefined`, the hook manages its own state. */
  prop: T | undefined
  /** Initial value for uncontrolled usage. */
  defaultProp: T
  /** Called with the next value whenever it changes. */
  onChange?: (value: T) => void
}

/**
 * Controlled / uncontrolled state in one hook (same contract as Radix's
 * `useControllableState`).
 *
 * The setter accepts a value or an updater function and always reads the
 * latest value, so rapid consecutive updates (e.g. toggling two checkboxes
 * before a re-render) never work on a stale snapshot.
 */
export function useControllableState<T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>): [T, (next: SetStateAction<T>) => void] {
  const [uncontrolled, setUncontrolled] = React.useState<T>(defaultProp)
  const isControlled = prop !== undefined
  const value = isControlled ? (prop as T) : uncontrolled

  const valueRef = React.useRef(value)
  valueRef.current = value

  const setValue = React.useCallback(
    (next: SetStateAction<T>) => {
      const resolved =
        typeof next === 'function' ? (next as (prev: T) => T)(valueRef.current) : next
      if (Object.is(resolved, valueRef.current)) return
      valueRef.current = resolved
      if (!isControlled) setUncontrolled(resolved)
      onChange?.(resolved)
    },
    [isControlled, onChange],
  )

  return [value, setValue]
}
