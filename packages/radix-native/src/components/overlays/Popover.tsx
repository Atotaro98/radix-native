import React, { createContext, useCallback, useContext, useMemo, useRef } from 'react'
import { ScrollView, View } from 'react-native'
import type { DimensionValue, GestureResponderEvent, StyleProp, ViewStyle } from 'react-native'
import { useControllableState } from '../../hooks/useControllableState'
import { useMetrics } from '../../hooks/useMetrics'
import { useVariantColors } from '../../hooks/useVariantColors'
import { shadowStyle } from '../../utils/shadow'
import { AnchoredContent, type AnchoredPlacementProps, type Measurable } from '../internal/AnchoredContent'
import { anchorSlot } from '../internal/anchorSlot'
import { CardRing } from '../internal/CardRing'
import { InsetContext, type InsetValues } from '../layout/InsetContext'
import type { RadiusLevel } from '../../tokens/radius'
import type { SpaceToken } from '../../tokens/spacing'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PopoverSize = 1 | 2 | 3 | 4

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

// popover.css .rt-PopoverContent:where(.rt-r-size-N)
const SIZES: Record<PopoverSize, { padding: SpaceToken; radius: RadiusLevel }> = {
  1: { padding: 3, radius: 4 },
  2: { padding: 4, radius: 4 },
  3: { padding: 5, radius: 5 },
  4: { padding: 6, radius: 5 },
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
  const metrics = useMetrics()
  const colors = useVariantColors('popperPanel', {})
  const cfg = SIZES[size]
  const padding = metrics.space(cfg.padding)
  const borderRadius = metrics.radius(cfg.radius)
  const inset = useMemo<InsetValues>(() => ({
    padding: { top: padding, right: padding, bottom: padding, left: padding }, borderWidth: 0, borderRadius: 0,
  }), [padding])
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
        <View
          accessibilityLabel={accessibilityLabel}
          style={[
            {
              width, minWidth, maxWidth, height, minHeight,
              // overflow: auto within the space left on the placed side
              maxHeight: maxHeight ?? placement?.availableHeight,
              borderRadius,
              backgroundColor: colors.panel,
            },
            shadowStyle(colors.shadow),
            style,
          ]}
        >
          <ScrollView bounces={false} style={{ borderRadius }} contentContainerStyle={{ padding }}>
            {/* The portal host is elsewhere in the tree: re-provide the Popover context to Close */}
            <PopoverContext.Provider value={ctx}>
              <InsetContext.Provider value={inset}>{children}</InsetContext.Provider>
            </PopoverContext.Provider>
          </ScrollView>
          <CardRing color={colors.ring} borderRadius={borderRadius} />
        </View>
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
