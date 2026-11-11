import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { AnchoredContent, type AnchoredPlacementProps, type Measurable } from '../internal/AnchoredContent'
import { anchorSlot, type SlotChild } from '../internal/anchorSlot'
import { PopperPanel } from '../internal/PopperPanel'

export type HoverCardSize = 1 | 2 | 3

export interface HoverCardRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
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

interface HoverCardContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  anchor: React.MutableRefObject<Measurable | null>
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null)

function useHoverCard(part: string) {
  const ctx = useContext(HoverCardContext)
  if (!ctx) throw new Error(`HoverCard.${part} must be used within HoverCard.Root`)
  return ctx
}

function HoverCardRoot({ open: openProp, defaultOpen = false, onOpenChange, children }: HoverCardRootProps) {
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | null>(null)
  const value = useMemo(() => ({ open, setOpen: (o: boolean) => setOpen(o), anchor }), [open, setOpen])
  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>
}
HoverCardRoot.displayName = 'HoverCard.Root'

/** One element. On touch a long-press opens the card (Radix opens on hover); a tap still does what the child does. */
function HoverCardTrigger({ children }: { children: SlotChild }) {
  const ctx = useHoverCard('Trigger')
  return anchorSlot(children, ctx.anchor, { onLongPress: () => ctx.setOpen(true) })
}
HoverCardTrigger.displayName = 'HoverCard.Trigger'

/**
 * Previews content behind a link, like Radix Themes `HoverCard`: a panel below
 * the trigger (8px, aligned to the start) with a lighter shadow than Popover.
 * Closes on an outside touch or the Android back button.
 */
function HoverCardContent({
  size = 2,
  side = 'bottom', sideOffset = 8, align = 'start', alignOffset = 0,
  avoidCollisions, collisionPadding = 10, sticky,
  width, minWidth, maxWidth = 480, height, minHeight, maxHeight,
  style, testID, children,
}: HoverCardContentProps) {
  const ctx = useHoverCard('Content')
  const close = useCallback(() => ctx.setOpen(false), [ctx])
  return (
    <AnchoredContent
      open={ctx.open}
      onDismiss={close}
      anchor={ctx.anchor}
      side={side} sideOffset={sideOffset} align={align} alignOffset={alignOffset}
      avoidCollisions={avoidCollisions} collisionPadding={collisionPadding} sticky={sticky}
      testID={testID}
    >
      {(placement) => (
        <PopperPanel
          size={size}
          width={width} minWidth={minWidth} maxWidth={maxWidth} height={height} minHeight={minHeight} maxHeight={maxHeight}
          availableHeight={placement?.availableHeight}
          style={style}
        >
          <HoverCardContext.Provider value={ctx}>{children}</HoverCardContext.Provider>
        </PopperPanel>
      )}
    </AnchoredContent>
  )
}
HoverCardContent.displayName = 'HoverCard.Content'

export const HoverCard = Object.assign(HoverCardRoot, {
  Root: HoverCardRoot,
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
})
