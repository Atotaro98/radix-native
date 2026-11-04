import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useControllableState } from '../../hooks/useControllableState'

type SelectionType = 'single' | 'multiple'

/** The value of a Selection group: one option, or several. */
export type SelectionValue<T extends SelectionType> = T extends 'single' ? string : string[]

export interface SelectionRootProps<T extends SelectionType, Shared> {
  value?: SelectionValue<T>
  defaultValue?: SelectionValue<T>
  onValueChange?: (value: SelectionValue<T>) => void
  /** Disables every item; an item cannot re-enable itself. */
  disabled?: boolean
  /** Props every item inherits (size, variant, color, …). */
  shared: Shared
  children?: React.ReactNode
}

export interface SelectionItem<Shared> {
  checked: boolean
  disabled: boolean
  /** Single: selects this item. Multiple: toggles it. No-op when disabled. */
  select: () => void
  shared: Shared
}

interface ContextValue<Shared> {
  shared: Shared
  disabled: boolean
  isChecked: (value: string) => boolean
  select: (value: string) => void
}

/**
 * Internal: the semantics of a Selection group, as Radix's CheckboxGroup /
 * RadioGroup primitives — the value (one or several), controlled or not,
 * and what items inherit. Each family gets its own instance, so an item only
 * connects to a Root of the same family. Rendering stays with the family.
 */
export function createSelectionGroup<T extends SelectionType, Shared>({ name, type }: { name: string; type: T }) {
  const Context = createContext<ContextValue<Shared> | null>(null)
  const empty = (type === 'single' ? '' : []) as SelectionValue<T>

  function SelectionRoot({ value: valueProp, defaultValue, onValueChange, disabled = false, shared, children }: SelectionRootProps<T, Shared>) {
    const [value, setValue] = useControllableState<SelectionValue<T>>({
      prop: valueProp,
      defaultProp: defaultValue ?? empty,
      onChange: onValueChange,
    })

    const select = useCallback((item: string) => {
      if (type === 'single') {
        setValue(item as SelectionValue<T>)
        return
      }
      // Functional update: two quick toggles never work on a stale array.
      setValue(prev => {
        const list = prev as string[]
        return (list.includes(item) ? list.filter(v => v !== item) : [...list, item]) as SelectionValue<T>
      })
    }, [setValue])

    const ctx = useMemo<ContextValue<Shared>>(() => ({
      shared,
      disabled,
      isChecked: item => (type === 'single' ? value === item : (value as string[]).includes(item)),
      select,
    }), [shared, disabled, value, select])

    return <Context.Provider value={ctx}>{children}</Context.Provider>
  }

  function useSelectionItem(value: string, disabled?: boolean): SelectionItem<Shared> {
    const ctx = useContext(Context)
    if (!ctx) throw new Error(`${name}.Item must be used within ${name}.Root`)
    const isDisabled = ctx.disabled || disabled === true
    const { select: selectValue } = ctx
    const select = useCallback(() => {
      if (!isDisabled) selectValue(value)
    }, [isDisabled, selectValue, value])
    return { checked: ctx.isChecked(value), disabled: isDisabled, select, shared: ctx.shared }
  }

  return { Root: SelectionRoot, useItem: useSelectionItem }
}
