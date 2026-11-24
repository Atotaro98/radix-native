import React from 'react'

/**
 * The library's own components, by the root of their `displayName`. Their
 * `color` names a Theme color (or they have none), so a color string must
 * never be handed to them. `__tests__/tint.test.tsx` walks the public exports
 * and fails when one is missing here.
 */
const LIBRARY_NAMES = new Set([
  'AlertDialog', 'AspectRatio', 'Avatar', 'Badge', 'Blockquote', 'Box', 'Button', 'Callout', 'Card', 'Checkbox',
  'CheckboxCards', 'CheckboxGroup', 'Code', 'Container', 'ContextMenu', 'DataList', 'Dialog', 'DropdownMenu', 'Em',
  'Flex', 'Grid', 'Heading', 'HoverCard', 'IconButton', 'Inset', 'Kbd', 'Link', 'Popover', 'Progress', 'Quote',
  'Radio', 'RadioCards', 'RadioGroup', 'ScrollArea', 'Section', 'SegmentedControl', 'Select', 'Separator', 'Skeleton',
  'Slider', 'Spinner', 'Strong', 'Switch', 'TabNav', 'Table', 'Tabs', 'Text', 'TextArea', 'TextField', 'Theme',
  'ThemeControls', 'Tooltip', 'VisuallyHidden',
])

/** Whether `type` is one of the library's own components (AccessibleIcon aside: it passes a color string on to its icon). */
export function isLibraryComponent(type: unknown): boolean {
  if (type == null || (typeof type !== 'function' && typeof type !== 'object')) return false
  const name = (type as { displayName?: string }).displayName ?? ''
  return LIBRARY_NAMES.has(name.split('.')[0])
}

/**
 * Internal: React Native has no `currentColor`, so content that should take
 * the surrounding text color (an icon in a Control label, a Callout icon, a
 * TextField slot) is handed it as its `color` prop. Only an element that can
 * take a color string and sets none of its own gets it: host elements,
 * fragments and the library's own components are returned as they are.
 */
export function tint<P>(element: React.ReactElement<P>, color: string | undefined): React.ReactElement<P> {
  if (color === undefined) return element
  if (typeof element.type === 'string' || element.type === React.Fragment) return element
  if ((element.props as { color?: unknown }).color !== undefined) return element
  if (isLibraryComponent(element.type)) return element
  return React.cloneElement(element as React.ReactElement<{ color?: string }>, { color }) as React.ReactElement<P>
}

/** `tint` over every element of `children`; anything else passes through. */
export function tintChildren(children: React.ReactNode, color: string | undefined): React.ReactNode {
  return React.Children.map(children, (child) => (React.isValidElement(child) ? tint(child, color) : child))
}
