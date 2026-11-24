import React, { useEffect, useMemo, useRef } from 'react'
import { physical } from '../../utils/rtl'
import { Pressable, StyleSheet, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'
import { placementContains, type AnchoredPlacementOptions, type PlacementStrategy } from '../../utils/anchoredPlacement'
import type { Align, Padding, Placement, Rect, Side } from '../../utils/popper'
import type { Anchor } from './overlayRoot'
import { Portal, usePortalHost } from './Portal'
import { useEnterExit, usePresence, type PresenceTiming } from './presence'
import { useAnchoredPlacement } from './useAnchoredPlacement'

export interface AnchoredPlacementProps {
  side?: Side
  sideOffset?: number
  align?: Align
  alignOffset?: number
  /** Default: true. */
  avoidCollisions?: boolean
  /** Default: 10 (Radix Themes). */
  collisionPadding?: Padding
  /** Default: 'partial'. */
  sticky?: 'partial' | 'always'
}

export interface AnchoredContentProps extends AnchoredPlacementProps {
  open: boolean
  onDismiss: () => void
  /** The anchor (read on open): a host instance to measure, or a fixed window rect (ContextMenu's touch point). */
  anchor: Anchor
  /** A full-screen transparent backdrop swallows outside touches (menus, Select, Popover modal). */
  modal?: boolean
  /** Opening / closing animation (Radix `.rt-PopperContent`); Tooltip opens faster and closes instantly. */
  timing?: PresenceTiming
  /** Content min-width = the anchor's width (Popover, Select). */
  matchAnchorWidth?: boolean
  /** Default: the Popper rules. Select's `item-aligned` puts its selected row over the anchor instead. */
  strategy?: PlacementStrategy
  style?: StyleProp<ViewStyle>
  /** Gets the placement (max-height from the available space), the anchor's window rect and the content's size (Tooltip's arrow). */
  children: (placement: Placement | null, anchor: Rect | null, size: { width: number; height: number } | null) => React.ReactNode
  testID?: string
}

// animations.css: popper content opens in 160ms, closes in 100ms
const POPPER_TIMING: PresenceTiming = { open: 160, close: 100 }

/**
 * Internal: an Anchored overlay's content in the nearest portal host, placed
 * next to its anchor (utils/anchoredPlacement, via useAnchoredPlacement), hidden until
 * measured, animated toward the anchor (slide 4px + scale 0.97 + fade; none
 * under Reduce Motion), and registered as a layer so an outside touch or the
 * Android back button dismisses it.
 */
export function AnchoredContent(props: AnchoredContentProps) {
  const { present, onExited } = usePresence(props.open)
  if (!present) return null
  return (
    <Portal>
      <Placed {...props} onExited={onExited} />
    </Portal>
  )
}

function Placed({
  open, onDismiss, anchor, modal = false, timing = POPPER_TIMING, matchAnchorWidth, strategy,
  side = 'bottom', sideOffset = 0, align = 'center', alignOffset = 0,
  avoidCollisions = true, collisionPadding = 10, sticky = 'partial',
  style, children, testID, onExited,
}: AnchoredContentProps & { onExited: () => void }) {
  const host = usePortalHost()
  const options = useMemo<AnchoredPlacementOptions>(
    () => ({ side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, sticky, strategy }),
    [side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, sticky, strategy],
  )
  const { placement, anchorRect, size, maxWidth, onLayout } = useAnchoredPlacement(anchor, options)

  // Layer: outside touch (non-modal) and back button dismiss it
  const dismissRef = useRef(onDismiss)
  dismissRef.current = onDismiss
  const placed = useRef({ placement, anchorRect, size })
  placed.current = { placement, anchorRect, size }
  useEffect(() => {
    if (!host || !open) return
    return host.addLayer({
      modal,
      // The anchor counts as inside: the trigger toggles the overlay itself
      contains: (x, y) => {
        const { placement: p, anchorRect: a, size: s } = placed.current
        return (!!a && placementContains(a, a, x, y)) || (!!p && !!s && placementContains(p, s, x, y))
      },
      dismiss: () => dismissRef.current(),
    })
  // `onDismiss` is read through a ref: a new callback must not re-add the layer (it would jump above the layers opened after it)
  }, [host, open, modal])

  // Animation toward the placed side, once placed
  const isPlaced = placement !== null
  const progress = useEnterExit({ open, ready: isPlaced, timing, onExited })

  const placedSide = placement?.side ?? side
  // item-aligned content is not a .rt-PopperContent: it only fades
  const slides = strategy?.kind !== 'item-aligned'
  const animated = useAnimatedStyle(() => {
    const t = 1 - progress.value
    // rt-slide-from-{side}: 4px toward the anchor, scale 0.97
    const dx = !slides ? 0 : placedSide === 'left' ? 4 * t : placedSide === 'right' ? -4 * t : 0
    const dy = !slides ? 0 : placedSide === 'top' ? 4 * t : placedSide === 'bottom' ? -4 * t : 0
    if (!slides) return { opacity: progress.value }
    return { opacity: progress.value, transform: [{ translateX: dx }, { translateY: dy }, { scale: 1 - 0.03 * t }] }
  })

  return (
    // While closing (the exit animation), touches go through to what is underneath, like Radix's
    // closed content: a tap right after dismissing reaches the page instead of the fading layer
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'box-none' : 'none'}>
      {modal && open ? <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessible={false} testID={testID ? `${testID}-backdrop` : undefined} /> : null}
      <Animated.View
        testID={testID}
        onLayout={onLayout}
        accessibilityViewIsModal={modal}
        // VoiceOver's escape gesture (two-finger scrub) is Radix's Escape
        onAccessibilityEscape={onDismiss}
        style={[
          {
            position: 'absolute',
            // Window coordinates: the physical left, also in RTL
            ...physical({ left: placement?.left ?? 0 }),
            top: placement?.top ?? 0,
            // Hidden until placed, like Radix's off-screen pre-measure
            opacity: isPlaced ? undefined : 0,
            minWidth: matchAnchorWidth ? anchorRect?.width : undefined,
            maxWidth,
          },
          placement ? { transformOrigin: [placement.originX, placement.originY, 0] } : undefined,
          animated,
          style,
        ]}
      >
        {children(placement, anchorRect, size)}
      </Animated.View>
    </View>
  )
}
