/**
 * Pure `item-aligned` placement of Select content (Radix SelectItemAlignedPosition):
 * the selected item's text sits over the trigger's value text, clamped inside
 * the boundary (CONTENT_MARGIN 10px). Rects are window coordinates.
 */

import type { Rect } from './popper'

export interface ItemAlignedInput {
  trigger: Rect
  /** Trigger padding-x: where its value text starts. */
  triggerPaddingX: number
  content: { width: number; height: number }
  boundary: Rect
  /** Content padding (all sides). */
  contentPadding: number
  /** Item padding-left: the indicator gutter before the item text. */
  itemPaddingLeft: number
  itemHeight: number
  /** Index among the items of the selected one (or the first enabled when none). */
  selectedIndex: number
  /** Labels / separators before the selected item, in px. */
  offsetBefore: number
}

export function placeItemAligned(i: ItemAlignedInput): { x: number; y: number } {
  // Left edges: the item text lines up with the trigger's value text
  const x = i.trigger.x + i.triggerPaddingX - i.contentPadding - i.itemPaddingLeft
  // Vertical centres: the selected item over the trigger
  const itemCenter = i.contentPadding + i.offsetBefore + i.selectedIndex * i.itemHeight + i.itemHeight / 2
  const y = i.trigger.y + i.trigger.height / 2 - itemCenter
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))
  return {
    x: clamp(x, i.boundary.x, i.boundary.x + i.boundary.width - i.content.width),
    y: clamp(y, i.boundary.y, i.boundary.y + i.boundary.height - i.content.height),
  }
}
