import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import type { DimensionValue, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { AnchoredContent, type AnchoredPlacementProps, type Measurable } from '../internal/AnchoredContent'
import { anchorSlot } from '../internal/anchorSlot'
import { PopperPanel, type PanelSize } from '../internal/PopperPanel'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverSize = PanelSize

export interface PopoverRootProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Default: false — an outside touch closes the popover and still reaches what is underneath. */
  modal?: boolean
  children?: React.ReactNode
}

export interface PopoverSlotProps {
  children: React.ReactElement<{ onPress?: (e: GestureResponderEvent) => void }>
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

// ─── Context ──────────────────────────────────────────────────────────────────

interface PopoverContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  modal: boolean
  /** The trigger's (or Anchor's) host instance. */
  anchor: React.MutableRefObject<Measurable | null>
}

const PopoverContext = createContext<PopoverContextValue | null>(null)

function usePopover(part: string): PopoverContextValue {
  const ctx = useContext(PopoverContext)
  if (!ctx) throw new Error(`Popover.${part} must be used within Popover.Root`)
  return ctx
}

// ─── Parts ────────────────────────────────────────────────────────────────────

function PopoverRoot({ open: openProp, defaultOpen = false, onOpenChange, modal = false, children }: PopoverRootProps) {
  const [open, setOpen] = useControllableState<boolean>({ prop: openProp, defaultProp: defaultOpen, onChange: onOpenChange })
  const anchor = useRef<Measurable | null>(null)
  const value = useMemo(() => ({ open, setOpen: (o: boolean) => setOpen(o), modal, anchor }), [open, setOpen, modal])
  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>
}
PopoverRoot.displayName = 'Popover.Root'

/** One element; its `onPress` toggles the popover, and it is the anchor. */
function PopoverTrigger({ children }: PopoverSlotProps) {
  const ctx = usePopover('Trigger')
  return anchorSlot(children, ctx.anchor, { onPress: () => ctx.setOpen(!ctx.open) })
}
PopoverTrigger.displayName = 'Popover.Trigger'

/** Positions the content against this element instead of the Trigger. */
function PopoverAnchor({ children }: PopoverSlotProps) {
  const ctx = usePopover('Anchor')
  return anchorSlot(children, ctx.anchor, {})
}
PopoverAnchor.displayName = 'Popover.Anchor'

function PopoverClose({ children }: PopoverSlotProps) {
  const ctx = usePopover('Close')
  const child = React.Children.only(children)
  return React.cloneElement(child, {
    onPress: (e: GestureResponderEvent) => {
      child.props.onPress?.(e)
      ctx.setOpen(false)
    },
  })
}
PopoverClose.displayName = 'Popover.Close'

/**
 * Floating panel anchored to its trigger, like Radix Themes `Popover`: below,
 * aligned to the start, 8px away, at least as wide as the trigger, kept 10px
 * from the screen edges.
 */
function PopoverContent({
  size = 2,
  side = 'bottom', sideOffset = 8, align = 'start', alignOffset = 0,
  avoidCollisions, collisionPadding = 10, sticky,
  width, minWidth, maxWidth = 480, height, minHeight, maxHeight,
  style, testID, accessibilityLabel, children,
}: PopoverContentProps) {
  const ctx = usePopover('Content')
  const close = useCallback(() => ctx.setOpen(false), [ctx])

  return (
    <AnchoredContent
      open={ctx.open}
      onDismiss={close}
      anchor={ctx.anchor}
      modal={ctx.modal}
      matchAnchorWidth
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
          accessibilityLabel={accessibilityLabel}
        >
          {/* The portal host is elsewhere in the tree: re-provide the Popover context to Close */}
          <PopoverContext.Provider value={ctx}>{children}</PopoverContext.Provider>
        </PopperPanel>
      )}
    </AnchoredContent>
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
