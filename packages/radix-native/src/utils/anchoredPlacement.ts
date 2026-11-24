/**
 * Pure placement of an Anchored overlay: from the anchor's window rect, the
 * content's size, the placement props and what the device reports (window,
 * safe area, keyboard, where the portal host starts, layout direction) to
 * where the content is drawn and how much room it has.
 *
 * Two strategies: Radix Popper (`place`, utils/popper) and Select's
 * `item-aligned` (Radix SelectItemAlignedPosition). Everything a caller would
 * otherwise have to prepare or correct lives here: the boundary, the RTL rule
 * for `align`, and the host origin.
 */

import { innerBoundary, place, type Align, type Padding, type Placement, type Rect, type Side, type Size } from './popper'

/** What the device reports while the overlay is open. */
export interface PlacementEnvironment {
  window: Size
  /** The Theme's `safeAreaInsets`. */
  insets: { top: number; right: number; bottom: number; left: number }
  /** The keyboard's top edge in the window while it is up: the content stays above it. */
  keyboardTop: number | null
  /** Where the portal host starts in the window: the content is drawn inside it. */
  origin: { x: number; y: number }
  /** Right-to-left layout direction. */
  rtl: boolean
}

export type PlacementStrategy =
  | { kind: 'popper' }
  | {
    /** The selected row's text over the anchor's value text, clamped inside the boundary. */
    kind: 'item-aligned'
    /** From the content's top to the centre of the aligned row. */
    rowCenter: number
    /** From the content's leading edge to the row's text (content padding + indicator gutter). */
    textInset: number
    /** From the anchor's leading edge to its value text (the trigger's padding-x). */
    anchorTextInset: number
  }

export interface AnchoredPlacementOptions {
  side: Side
  align: Align
  sideOffset: number
  alignOffset: number
  avoidCollisions: boolean
  collisionPadding: Padding
  sticky: 'partial' | 'always'
  /** Default: popper. */
  strategy?: PlacementStrategy
}

export interface AnchoredPlacement extends Placement {
  /** The content's physical left / top inside its portal host (`x` / `y` are window coordinates). */
  left: number
  top: number
}

/** Window minus safe area and the keyboard. */
export function placementBoundary(env: Pick<PlacementEnvironment, 'window' | 'insets' | 'keyboardTop'>): Rect {
  const { window, insets, keyboardTop } = env
  const bottom = Math.min(window.height - insets.bottom, keyboardTop ?? Infinity)
  return {
    x: insets.left,
    y: insets.top,
    width: window.width - insets.left - insets.right,
    height: Math.max(0, bottom - insets.top),
  }
}

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))

function placeItemAligned(
  anchor: Rect, content: Size, s: Extract<PlacementStrategy, { kind: 'item-aligned' }>, inner: Rect, rtl: boolean,
): Placement {
  // Text edges: the row's text lines up with the anchor's value text (on the right in RTL)
  const x = rtl
    ? anchor.x + anchor.width - s.anchorTextInset + s.textInset - content.width
    : anchor.x + s.anchorTextInset - s.textInset
  // Vertical centres: the aligned row over the anchor
  const y = anchor.y + anchor.height / 2 - s.rowCenter
  return {
    x: clamp(x, inner.x, inner.x + inner.width - content.width),
    y: clamp(y, inner.y, inner.y + inner.height - content.height),
    side: 'bottom',
    align: 'start',
    availableWidth: Math.max(0, inner.width),
    availableHeight: Math.max(0, inner.height),
    originX: content.width / 2,
    originY: content.height / 2,
  }
}

export function placeAnchored(anchor: Rect, content: Size, o: AnchoredPlacementOptions, env: PlacementEnvironment): AnchoredPlacement {
  const boundary = placementBoundary(env)
  let placement: Placement
  if (o.strategy?.kind === 'item-aligned') {
    placement = placeItemAligned(anchor, content, o.strategy, innerBoundary(boundary, o.collisionPadding), env.rtl)
  } else {
    // Radix `dir`: above / below the anchor, `start` is the right edge in RTL (left / right sides stay physical)
    const vertical = o.side === 'top' || o.side === 'bottom'
    const align = env.rtl && vertical && o.align !== 'center' ? (o.align === 'start' ? 'end' : 'start') : o.align
    placement = place(anchor, content, {
      side: o.side, align, sideOffset: o.sideOffset, alignOffset: o.alignOffset,
      avoidCollisions: o.avoidCollisions, collisionPadding: o.collisionPadding, sticky: o.sticky, boundary,
    })
  }
  return { ...placement, left: placement.x - env.origin.x, top: placement.y - env.origin.y }
}

/** Whether a window point is on the placed content. */
export function placementContains(placement: Pick<Placement, 'x' | 'y'>, content: Size, x: number, y: number): boolean {
  return x >= placement.x && x <= placement.x + content.width && y >= placement.y && y <= placement.y + content.height
}
