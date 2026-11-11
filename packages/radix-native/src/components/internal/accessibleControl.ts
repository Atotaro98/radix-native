import React, { createContext, useContext } from 'react'

/**
 * True inside a control that screen readers announce as one element (a button,
 * a pressable Card). Content there must not become its own accessibility
 * element — on Android an `accessible` child turns into a separate focus stop —
 * so it contributes only its label, which the control reads as part of its name.
 */
export const AccessibleControlContext = createContext(false)

export function useIsInsideAccessibleControl(): boolean {
  return useContext(AccessibleControlContext)
}

/**
 * A component whose part of an accessible name is not what it renders — AccessibleIcon (its
 * `label`), VisuallyHidden (its hidden text) — declares it as a static `accessibleName`.
 */
export type NameSource<P> = { accessibleName?: (props: P) => string | undefined }

/**
 * The name a control's content gives it, like a browser computes a button's name from its
 * text: strings and numbers, AccessibleIcon labels and VisuallyHidden text, in order.
 * `hidden` says whether any part comes from content the platform cannot read into the
 * control's name by itself (Android skips a non-accessible View's label and hidden text),
 * so the control must pass the name as its `accessibilityLabel`. Custom components are
 * read through their `children` only.
 */
export function accessibleNameOf(node: React.ReactNode): { name: string; hidden: boolean } {
  const parts: string[] = []
  let hidden = false
  const walk = (n: React.ReactNode) => {
    React.Children.forEach(n, (child) => {
      if (typeof child === 'string' || typeof child === 'number') {
        const text = String(child).trim()
        if (text) parts.push(text)
      } else if (React.isValidElement<{ children?: React.ReactNode; accessibilityElementsHidden?: boolean }>(child)) {
        if (child.props.accessibilityElementsHidden) return
        const source = (child.type as NameSource<unknown>).accessibleName
        if (typeof source === 'function') {
          const text = source(child.props)?.trim()
          if (text) parts.push(text)
          hidden = true
        } else {
          walk(child.props.children)
        }
      }
    })
  }
  walk(node)
  return { name: parts.join(' '), hidden }
}

/** Text content of a node (strings and numbers), for `accessibleName` implementations. */
export function textOf(node: React.ReactNode): string {
  return accessibleNameOf(node).name
}
