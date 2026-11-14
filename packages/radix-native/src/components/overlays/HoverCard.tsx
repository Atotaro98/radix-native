import React, { useCallback } from 'react'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import type { AnchoredPlacementProps } from '../internal/AnchoredContent'
import { createOverlayContext, slot, useOverlayState, type OverlayState, type OverlayStateProps, type SlotChild } from '../internal/overlayRoot'
import { PopperContent, usePanelSize } from '../internal/PopperContent'

export type HoverCardSize = 1 | 2 | 3

export interface HoverCardRootProps extends OverlayStateProps {
  /** Radix's hover delays have no touch meaning; accepted for API parity. */
  openDelay?: number
  closeDelay?: number
  children?: React.ReactNode
}

export interface HoverCardContentProps extends AnchoredPlacementProps {
  /** Default: 2. */
  size?: HoverCardSize
  width?: DimensionValue
  minWidth?: DimensionValue
  /** Default: 480. */
  maxWidth?: DimensionValue
  height?: DimensionValue
  minHeight?: DimensionValue
  maxHeight?: DimensionValue
  style?: StyleProp<ViewStyle>
  testID?: string
  children?: React.ReactNode
}

const HoverCard_ = createOverlayContext<OverlayState>('HoverCard')

function HoverCardRoot({ openDelay: _open, closeDelay: _close, children, ...state }: HoverCardRootProps) {
  return <HoverCard_.Provider value={useOverlayState(state)}>{children}</HoverCard_.Provider>
}
HoverCardRoot.displayName = 'HoverCard.Root'

/** One element. On touch a long-press opens the card (Radix opens on hover); a tap still does what the child does. */
function HoverCardTrigger({ children }: { children: SlotChild }) {
  const ctx = HoverCard_.use('Trigger')
  return slot(children, { onLongPress: () => ctx.setOpen(true) }, ctx.anchor)
}
HoverCardTrigger.displayName = 'HoverCard.Trigger'

/**
 * Previews content behind a link, like Radix Themes `HoverCard`: a panel below
 * the trigger (8px, aligned to the start) with a lighter shadow than Popover.
 * Closes on an outside touch or the Android back button.
 */
function HoverCardContent({
  size = 2, side = 'bottom', sideOffset = 8, align = 'start', maxWidth = 480, ...props
}: HoverCardContentProps) {
  const ctx = HoverCard_.use('Content')
  const close = useCallback(() => ctx.setOpen(false), [ctx])
  return (
    <PopperContent
      {...usePanelSize(size)}
      inset
      open={ctx.open}
      onDismiss={close}
      anchor={ctx.anchor}
      side={side} sideOffset={sideOffset} align={align} maxWidth={maxWidth}
      {...props}
    />
  )
}
HoverCardContent.displayName = 'HoverCard.Content'

export const HoverCard = Object.assign(HoverCardRoot, {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
})
