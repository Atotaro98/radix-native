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

export interface AccessibleControl {
  /** The control's `accessibilityLabel`: the consumer's, else the content's name when the platform cannot read it by itself. */
  accessibilityLabel: string | undefined
  /** The name the content gives (empty when it gives none). */
  name: string
  /** Wraps the control's content so accessible parts inside contribute only their label. */
  wrap: (content: React.ReactNode) => React.ReactNode
}

/**
 * Internal: what every control announced as one element does with its content
 * (BaseButton, a pressable Card, the Toggle surface, tab and segmented items,
 * menu and Select items). It reads the content's name like a browser
 * (`accessibleNameOf`), passes it as the label when part of it is hidden — or
 * always with `forceName` (a loading button, whose label is invisible) — unless
 * the consumer set one, and marks the content as inside an accessible control.
 */
export function useAccessibleControl(
  children: React.ReactNode,
  consumerLabel: string | undefined,
  { forceName = false }: { forceName?: boolean } = {},
): AccessibleControl {
  const content = React.useMemo(() => accessibleNameOf(children), [children])
  return {
    accessibilityLabel: consumerLabel ?? (content.hidden || forceName ? content.name || undefined : undefined),
    name: content.name,
    wrap: wrapInAccessibleControl,
  }
}

function wrapInAccessibleControl(content: React.ReactNode): React.ReactNode {
  return React.createElement(AccessibleControlContext.Provider, { value: true }, content)
}
