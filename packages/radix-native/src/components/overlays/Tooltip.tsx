import React, { useCallback } from 'react'
import { Text as RNText, View } from 'react-native'
import type { DimensionValue, StyleProp, ViewStyle } from 'react-native'
import { useMetrics } from '../../hooks/useMetrics'
import { useTextStyle } from '../../hooks/useTextStyle'
import { useVariantColors } from '../../hooks/useVariantColors'
import { AnchoredContent, type AnchoredPlacementProps } from '../internal/AnchoredContent'
import { slot, useOverlayState, type SlotChild } from '../internal/overlayRoot'

export interface TooltipProps extends AnchoredPlacementProps {
  /** What the tooltip says. */
  content: React.ReactNode
  /** One element: the trigger. */
  children: SlotChild
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Radix's hover delay (200ms in Themes); on touch the long-press decides. Accepted for API parity. */
  delayDuration?: number
  width?: DimensionValue
  minWidth?: DimensionValue
  /** Default: 360. */
  maxWidth?: DimensionValue
  style?: StyleProp<ViewStyle>
  testID?: string
}

// Arrow: the primitive's 10 × 5 triangle, flush with the content edge
const ARROW_W = 10
const ARROW_H = 5
// tooltip.css: 140ms open, no close animation
const TIMING = { open: 140, close: 0 }

/**
 * Floating label that describes the element it points at, like Radix Themes
 * `Tooltip`: gray-12 with gray-1 text size 1, above the trigger, 4px away,
 * with an arrow. Radix shows it on hover / focus; on touch a long-press shows
 * it until the finger lifts (a tap still presses the trigger), and a string
 * `content` is also the trigger's accessibility hint.
 */
export function Tooltip({
  content, children, open: openProp, defaultOpen = false, onOpenChange, delayDuration: _delay,
  side = 'top', sideOffset = 4, align = 'center', alignOffset, avoidCollisions, collisionPadding = 10, sticky,
  width, minWidth, maxWidth = 360, style, testID,
}: TooltipProps) {
  const { open, setOpen, anchor } = useOverlayState({ open: openProp, defaultOpen, onOpenChange })
  const metrics = useMetrics()
  const colors = useVariantColors('tooltip', {})
  const text = useTextStyle({ size: 1, color: colors.text })
  const close = useCallback(() => setOpen(false), [setOpen])

  const trigger = slot(children, {
    onLongPress: () => setOpen(true),
    onPressOut: () => setOpen(false),
  }, anchor)
  const hint = typeof content === 'string' ? content : undefined

  return (
    <>
      {hint && React.isValidElement(trigger)
        ? React.cloneElement(trigger as React.ReactElement<{ accessibilityHint?: string }>, { accessibilityHint: hint })
        : trigger}
      <AnchoredContent
        open={open}
        onDismiss={close}
        anchor={anchor}
        timing={TIMING}
        side={side} sideOffset={sideOffset + ARROW_H} align={align} alignOffset={alignOffset}
        avoidCollisions={avoidCollisions} collisionPadding={collisionPadding} sticky={sticky}
        testID={testID}
      >
        {(placement, anchorRect) => {
          const placedSide = placement?.side ?? side
          const vertical = placedSide === 'top' || placedSide === 'bottom'
          // The arrow points at the anchor's centre, kept within the content
          const arrowAt = placement && anchorRect
            ? vertical
              ? anchorRect.x + anchorRect.width / 2 - placement.x
              : anchorRect.y + anchorRect.height / 2 - placement.y
            : 0
          return (
            <View
              accessibilityRole="text"
              style={[{
                width, minWidth, maxWidth,
                // padding: space-1 space-2; radius-2
                paddingVertical: metrics.space(1),
                paddingHorizontal: metrics.space(2),
                borderRadius: metrics.radius(2),
                backgroundColor: colors.bg,
              }, style]}
            >
              {typeof content === 'string' || typeof content === 'number'
                ? <RNText style={text.style} {...text.textProps}>{content}</RNText>
                : content}
              {placement ? <Arrow side={placedSide} at={arrowAt} color={colors.bg} /> : null}
            </View>
          )
        }}
      </AnchoredContent>
    </>
  )
}
Tooltip.displayName = 'Tooltip'

/** A 10 × 5 triangle on the content edge that faces the anchor, drawn with borders. */
function Arrow({ side, at, color }: { side: 'top' | 'right' | 'bottom' | 'left'; at: number; color: string }) {
  const half = ARROW_W / 2
  const base: ViewStyle = { position: 'absolute', width: 0, height: 0, borderStyle: 'solid', borderColor: 'transparent' }
  switch (side) {
    case 'top': // content above the anchor: the arrow hangs below, pointing down
      return <View style={[base, { bottom: -ARROW_H, left: at - half, borderTopWidth: ARROW_H, borderLeftWidth: half, borderRightWidth: half, borderTopColor: color }]} />
    case 'bottom':
      return <View style={[base, { top: -ARROW_H, left: at - half, borderBottomWidth: ARROW_H, borderLeftWidth: half, borderRightWidth: half, borderBottomColor: color }]} />
    case 'left':
      return <View style={[base, { right: -ARROW_H, top: at - half, borderLeftWidth: ARROW_H, borderTopWidth: half, borderBottomWidth: half, borderLeftColor: color }]} />
    case 'right':
      return <View style={[base, { left: -ARROW_H, top: at - half, borderRightWidth: ARROW_H, borderTopWidth: half, borderBottomWidth: half, borderRightColor: color }]} />
  }
}
