import React, { useCallback, useMemo } from 'react'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import type { AnchoredPlacementProps } from '../internal/AnchoredContent'
import { createOverlayContext, slot, useOverlayState, type OverlayState, type OverlayStateProps, type SlotChild } from '../internal/overlayRoot'
import { PopperContent, usePanelSize, type PanelSize } from '../internal/PopperContent'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverSize = PanelSize

export interface PopoverRootProps extends OverlayStateProps {
  /** Default: false — an outside touch closes the popover and still reaches what is underneath. */
  modal?: boolean
  children?: React.ReactNode
}

export interface PopoverSlotProps {
  children: SlotChild
}

export interface PopoverContentProps extends AnchoredPlacementProps {
  /** Default: 2. */
  size?: PopoverSize
  width?: DimensionValue
  minWidth?: DimensionValue
  /** Default: 480. */
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  maxHeight?: DimensionValue
  style?: StyleProp<ViewStyle>
  testID?: string
  accessibilityLabel?: string
  children?: React.ReactNode
}

const Popover_ = createOverlayContext<OverlayState & { modal: boolean }>('Popover')

// ─── Parts ────────────────────────────────────────────────────────────────────

function PopoverRoot({ modal = false, children, ...state }: PopoverRootProps) {
  const overlay = useOverlayState(state)
  const value = useMemo(() => ({ ...overlay, modal }), [overlay, modal])
  return <Popover_.Provider value={value}>{children}</Popover_.Provider>
}
PopoverRoot.displayName = 'Popover.Root'

/** One element; its `onPress` toggles the popover, and it is the anchor. */
function PopoverTrigger({ children }: PopoverSlotProps) {
  const ctx = Popover_.use('Trigger')
  return slot(children, { onPress: () => ctx.setOpen(!ctx.open) }, ctx.anchor)
}
PopoverTrigger.displayName = 'Popover.Trigger'

/** Positions the content against this element instead of the Trigger. */
function PopoverAnchor({ children }: PopoverSlotProps) {
  const ctx = Popover_.use('Anchor')
  return slot(children, {}, ctx.anchor)
}
PopoverAnchor.displayName = 'Popover.Anchor'

function PopoverClose({ children }: PopoverSlotProps) {
  const ctx = Popover_.use('Close')
  return slot(children, { onPress: () => ctx.setOpen(false) })
}
PopoverClose.displayName = 'Popover.Close'

/**
 * Floating panel anchored to its trigger, like Radix Themes `Popover`: below,
 * aligned to the start, 8px away, at least as wide as the trigger, kept 10px
 * from the screen edges.
 */
function PopoverContent({
  size = 2, side = 'bottom', sideOffset = 8, align = 'start', maxWidth = 480, ...props
}: PopoverContentProps) {
  const ctx = Popover_.use('Content')
  const close = useCallback(() => ctx.setOpen(false), [ctx])
  return (
    <PopperContent
      {...usePanelSize(size)}
      inset
      open={ctx.open}
      onDismiss={close}
      anchor={ctx.anchor}
      modal={ctx.modal}
      matchAnchorWidth
      side={side} sideOffset={sideOffset} align={align} maxWidth={maxWidth}
      {...props}
    />
  )
}
PopoverContent.displayName = 'Popover.Content'

export const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Anchor: PopoverAnchor,
  Content: PopoverContent,
  Close: PopoverClose,
})
