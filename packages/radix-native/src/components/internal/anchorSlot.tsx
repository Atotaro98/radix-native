import React from 'react'
import type { GestureResponderEvent } from 'react-native'
import type { Measurable } from './AnchoredContent'

export type SlotChild = React.ReactElement<{
  onPress?: (e: GestureResponderEvent) => void
  onLongPress?: (e: GestureResponderEvent) => void
  ref?: React.Ref<unknown>
}>

const measurable = (node: unknown): node is Measurable =>
  !!node && typeof (node as Measurable).measureInWindow === 'function'

/**
 * Internal: Radix's `asChild` triggers. Clones the single child, composes the
 * handler (`onPress`, or `onLongPress` for Tooltip / HoverCard / ContextMenu)
 * after the child's own, and records the child's host instance as the anchor
 * — through its ref when it forwards one (React 19 passes `ref` as a prop),
 * else from the event's `currentTarget`.
 */
export function anchorSlot(
  children: SlotChild,
  anchor: React.MutableRefObject<Measurable | null>,
  handlers: {
    onPress?: (e: GestureResponderEvent) => void
    onLongPress?: (e: GestureResponderEvent) => void
  },
) {
  const child = React.Children.only(children)
  const childRef = child.props.ref
  const setAnchor = (node: Measurable) => { anchor.current = node }
  const capture = (e: GestureResponderEvent) => {
    if (measurable(e?.currentTarget)) setAnchor(e.currentTarget)
  }
  return React.cloneElement(child, {
    ref: (node: unknown) => {
      if (measurable(node)) setAnchor(node)
      if (typeof childRef === 'function') childRef(node)
      else if (childRef && typeof childRef === 'object') (childRef as React.MutableRefObject<unknown>).current = node
    },
    ...(handlers.onPress && {
      onPress: (e: GestureResponderEvent) => {
        child.props.onPress?.(e)
        capture(e)
        handlers.onPress!(e)
      },
    }),
    ...(handlers.onLongPress && {
      onLongPress: (e: GestureResponderEvent) => {
        child.props.onLongPress?.(e)
        capture(e)
        handlers.onLongPress!(e)
      },
    }),
  })
}
