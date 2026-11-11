/**
 * Pure placement of an Anchored overlay next to its anchor — a port of the
 * Radix Popper middleware order (Floating UI): offset → shift (with
 * limitShift when sticky="partial") → flip → size → transform origin.
 * Rects are window coordinates.
 */

export type Side = 'top' | 'right' | 'bottom' | 'left'
export type Align = 'start' | 'center' | 'end'

export interface Rect { x: number; y: number; width: number; height: number }
export interface Size { width: number; height: number }
export type Padding = number | Partial<Record<Side, number>>

export interface PlaceOptions {
  side: Side
  align: Align
  sideOffset: number
  alignOffset: number
  /** Window minus safe area; the content stays `collisionPadding` inside it. */
  boundary: Rect
  collisionPadding: Padding
  avoidCollisions: boolean
  sticky: 'partial' | 'always'
}

export interface Placement {
  x: number
  y: number
  /** The side actually used (after flipping) — animations key off it. */
  side: Side
  align: Align
  /** Space between the anchor and the boundary on the placed side, minus padding. */
  availableWidth: number
  availableHeight: number
  /** Transform origin in content coordinates: the anchor-facing edge, at the align point. */
  originX: number
  originY: number
}

const OPPOSITE: Record<Side, Side> = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }

export function resolvePadding(p: Padding): Record<Side, number> {
  if (typeof p === 'number') return { top: p, right: p, bottom: p, left: p }
  return { top: p.top ?? 0, right: p.right ?? 0, bottom: p.bottom ?? 0, left: p.left ?? 0 }
}

const vertical = (side: Side) => side === 'top' || side === 'bottom'

/** Position before collisions: on `side`, aligned by `align`, offset by sideOffset / alignOffset. */
function basePosition(anchor: Rect, content: Size, side: Side, align: Align, sideOffset: number, alignOffset: number) {
  let x = 0
  let y = 0
  if (vertical(side)) {
    y = side === 'bottom' ? anchor.y + anchor.height + sideOffset : anchor.y - content.height - sideOffset
    x = align === 'start' ? anchor.x : align === 'end' ? anchor.x + anchor.width - content.width : anchor.x + (anchor.width - content.width) / 2
    x += align === 'end' ? -alignOffset : alignOffset
  } else {
    x = side === 'right' ? anchor.x + anchor.width + sideOffset : anchor.x - content.width - sideOffset
    y = align === 'start' ? anchor.y : align === 'end' ? anchor.y + anchor.height - content.height : anchor.y + (anchor.height - content.height) / 2
    y += align === 'end' ? -alignOffset : alignOffset
  }
  return { x, y }
}

/** How far the content overflows the padded boundary on its own side. */
function sideOverflow(pos: { x: number; y: number }, content: Size, side: Side, inner: Rect): number {
  switch (side) {
    case 'bottom': return pos.y + content.height - (inner.y + inner.height)
    case 'top': return inner.y - pos.y
    case 'right': return pos.x + content.width - (inner.x + inner.width)
    case 'left': return inner.x - pos.x
  }
}

export function place(anchor: Rect, content: Size, o: PlaceOptions): Placement {
  const pad = resolvePadding(o.collisionPadding)
  const inner: Rect = {
    x: o.boundary.x + pad.left,
    y: o.boundary.y + pad.top,
    width: o.boundary.width - pad.left - pad.right,
    height: o.boundary.height - pad.top - pad.bottom,
  }

  let side = o.side
  let pos = basePosition(anchor, content, side, o.align, o.sideOffset, o.alignOffset)

  // flip: to the opposite side when the preferred side overflows and the other overflows less
  if (o.avoidCollisions && sideOverflow(pos, content, side, inner) > 0) {
    const other = OPPOSITE[side]
    const otherPos = basePosition(anchor, content, other, o.align, o.sideOffset, o.alignOffset)
    if (sideOverflow(otherPos, content, other, inner) < sideOverflow(pos, content, side, inner)) {
      side = other
      pos = otherPos
    }
  }

  // RN addition: when neither side fits (a sub-menu on a phone), keep the content on
  // screen on the side axis too, over its anchor, instead of overflowing like Floating UI
  if (o.avoidCollisions && sideOverflow(pos, content, side, inner) > 0) {
    pos = vertical(side)
      ? { ...pos, y: Math.min(Math.max(pos.y, inner.y), inner.y + inner.height - content.height) }
      : { ...pos, x: Math.min(Math.max(pos.x, inner.x), inner.x + inner.width - content.width) }
  }

  // shift along the alignment axis, kept inside the padded boundary
  if (o.avoidCollisions) {
    if (vertical(side)) {
      let x = Math.min(Math.max(pos.x, inner.x), inner.x + inner.width - content.width)
      // limitShift (sticky partial): never detach from the anchor
      if (o.sticky === 'partial') x = Math.min(Math.max(x, anchor.x - content.width), anchor.x + anchor.width)
      pos = { ...pos, x }
    } else {
      let y = Math.min(Math.max(pos.y, inner.y), inner.y + inner.height - content.height)
      if (o.sticky === 'partial') y = Math.min(Math.max(y, anchor.y - content.height), anchor.y + anchor.height)
      pos = { ...pos, y }
    }
  }

  // size: available space between the anchor and the padded boundary on the placed side
  const availableHeight = side === 'bottom'
    ? inner.y + inner.height - (anchor.y + anchor.height + o.sideOffset)
    : side === 'top' ? anchor.y - o.sideOffset - inner.y : inner.height
  const availableWidth = side === 'right'
    ? inner.x + inner.width - (anchor.x + anchor.width + o.sideOffset)
    : side === 'left' ? anchor.x - o.sideOffset - inner.x : inner.width

  // transform origin on the anchor-facing edge, at the align point (0% / 50% / 100%)
  const along = o.align === 'start' ? 0 : o.align === 'end' ? 1 : 0.5
  const originX = vertical(side) ? along * content.width : side === 'right' ? 0 : content.width
  const originY = vertical(side) ? (side === 'bottom' ? 0 : content.height) : along * content.height

  return {
    x: pos.x, y: pos.y, side, align: o.align,
    availableWidth: Math.max(0, availableWidth), availableHeight: Math.max(0, availableHeight),
    originX, originY,
  }
}
