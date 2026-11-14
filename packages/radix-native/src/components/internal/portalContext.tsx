import React, { createContext, useContext, useRef } from 'react'
import { ThemeContext } from '../../theme/ThemeContext'

/**
 * The contexts portalled content keeps from where its Portal sits in the tree,
 * as React's `createPortal` keeps every context on the web: the Theme (Radix
 * Themes' `Portal → Theme asChild`) and the state of the components around it
 * (an overlay's open state, a menu's content and radio group, a Select's look).
 *
 * Contexts that stand for CSS inheritance (Text style nesting, Inset values,
 * Skeleton, AccessibleControl) are deliberately not bridged: on the web a
 * portal leaves the DOM subtree, so those do not reach portalled content there
 * either.
 *
 * The list grows as modules load (with inline requires, possibly after a
 * Portal mounted); each Portal reads the list it saw on mount, so its hook
 * order never changes. A context registered later cannot be around it anyway.
 * Contexts are registered by a stable key, so a module re-run by Fast Refresh
 * gets its existing context back instead of a new one the mounted Portals
 * would not carry.
 */
const registry = new Map<string, React.Context<unknown>>([['Theme', ThemeContext as React.Context<unknown>]])
let bridged: React.Context<unknown>[] = Array.from(registry.values())

/** The component-state context registered under `key` (created on first use); portalled content keeps it. */
export function createPortalContext<T>(key: string, defaultValue: T): React.Context<T> {
  const existing = registry.get(key)
  if (existing) return existing as React.Context<T>
  const context = createContext<T>(defaultValue)
  registry.set(key, context as React.Context<unknown>)
  bridged = Array.from(registry.values())
  return context
}

/** Reads every bridged context here; returns a function that re-provides them around portalled content. */
export function useBridgedContexts(): (node: React.ReactNode) => React.ReactNode {
  const contexts = useRef(bridged.slice()).current
  // `contexts` is fixed for this instance (see above): hook order never changes
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const values = contexts.map((context) => useContext(context))
  return (node) =>
    values.reduceRight<React.ReactNode>((inner, value, i) => {
      const { Provider } = contexts[i]
      return <Provider value={value}>{inner}</Provider>
    }, node)
}
