import React, { useContext, useMemo, useRef } from 'react'
import type { GestureResponderEvent } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import type { Rect } from '../../utils/popper'
import { createPortalContext } from './portalContext'

/** Something that can report where it is on screen (a host component instance). */
export interface Measurable {
  measureInWindow: (cb: (x: number, y: number, width: number, height: number) => void) => void
}

/** Where an Anchored overlay is placed from: a host instance to measure on open, or a fixed window rect (ContextMenu's touch point). */
export type Anchor = React.MutableRefObject<Measurable | Rect | null>

export interface OverlayStateProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/** The state every overlay root holds: open or not (controlled or not) and, for Anchored overlays, its anchor. */
export interface OverlayState {
  open: boolean
  setOpen: (open: boolean) => void
  anchor: Anchor
}

/** Internal: an overlay root's state (Popover, HoverCard, Tooltip, menus and sub-menus, Select, Dialog). */
export function useOverlayState({ open: openProp, defaultOpen = false, onOpenChange }: OverlayStateProps): OverlayState {
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | Rect | null>(null)
  return useMemo(() => ({ open, setOpen: (o: boolean) => setOpen(o), anchor }), [open, setOpen])
}

/**
 * Internal: an overlay's context. It is bridged across the portal, so every
 * part (a Close inside Content, a radio item in a sub-menu) reads it wherever
 * it renders; `use(part)` throws outside the root, naming the part.
 */
export function createOverlayContext<T>(name: string, root = `${name}.Root`) {
  const Context = createPortalContext<T | null>(`${name} in ${root}`, null)
  function use(part: string): T {
    const ctx = useContext(Context)
    if (!ctx) throw new Error(`${name}.${part} must be used within ${root}`)
    return ctx
  }
  return { Provider: Context.Provider, Context, use }
}

const measurable = (node: unknown): node is Measurable =>
  !!node && typeof (node as Measurable).measureInWindow === 'function'

/** A ref callback that records a host instance as the anchor. */
export function anchorRef(anchor: Anchor) {
  return (node: unknown) => {
    if (measurable(node)) anchor.current = node
  }
}

type Handler = (e: GestureResponderEvent) => void
type HandlerName = 'onPress' | 'onLongPress' | 'onPressOut'

export type SlotChild = React.ReactElement<Partial<Record<HandlerName, Handler>> & { ref?: React.Ref<unknown> }>

/**
 * Internal: Radix's `asChild` parts (Trigger, Anchor, Close). Clones the single
 * child and composes the handlers after the child's own. With an `anchor`, it
 * also records the child's host instance there — through its ref when it
 * forwards one (React 19 passes `ref` as a prop), else from the event's
 * `currentTarget`.
 */
export function slot(children: SlotChild, handlers: Partial<Record<HandlerName, Handler>>, anchor?: Anchor) {
  const child = React.Children.only(children)
  const childRef = child.props.ref
  const capture = (e: GestureResponderEvent) => {
    if (anchor && measurable(e?.currentTarget)) anchor.current = e.currentTarget
  }
  const composed = Object.fromEntries(
    (Object.keys(handlers) as HandlerName[]).map((name) => [
      name,
      (e: GestureResponderEvent) => {
        child.props[name]?.(e)
        capture(e)
        handlers[name]!(e)
      },
    ]),
  )
  if (!anchor) return React.cloneElement(child, composed)
  const record = anchorRef(anchor)
  return React.cloneElement(child, {
    ref: (node: unknown) => {
      record(node)
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') (childRef as React.MutableRefObject<unknown>).current = node
    },
    ...composed,
  })
}
