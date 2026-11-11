import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native'
import Animated, { Easing, runOnJS, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated'
import { useThemeContext } from '../../hooks/useThemeContext'
import { place, type Align, type Padding, type Placement, type Rect, type Side } from '../../utils/popper'
import { Portal, usePortalHost } from './Portal'

/** Something that can report where it is on screen (a host component instance). */
export interface Measurable {
  measureInWindow: (cb: (x: number, y: number, width: number, height: number) => void) => void
}

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
  anchor: React.RefObject<Measurable | Rect | null>
  /** A full-screen transparent backdrop swallows outside touches (menus, Select, Popover modal). */
  modal?: boolean
  /** Opening / closing animation (Radix `.rt-PopperContent`); Tooltip opens faster and closes instantly. */
  timing?: { open: number; close: number }
  /** Content min-width = the anchor's width (Popover, Select). */
  matchAnchorWidth?: boolean
  /**
   * Replaces the Popper rules (Select's `item-aligned`): gets the anchor, the
   * content size and the padded boundary, returns the content's top-left.
   */
  placeOverride?: (anchor: Rect, content: { width: number; height: number }, boundary: Rect) => { x: number; y: number }
  style?: StyleProp<ViewStyle>
  /** Gets the placement (max-height from the available space) and the anchor's window rect (Tooltip's arrow). */
  children: (placement: Placement | null, anchor: Rect | null) => React.ReactNode
  testID?: string
}

// animations.css: cubic-bezier(0.16, 1, 0.3, 1); popper content opens in 160ms, closes in 100ms
const EASE = Easing.bezier(0.16, 1, 0.3, 1)
const POPPER_TIMING = { open: 160, close: 100 }

const isRect = (a: Measurable | Rect): a is Rect => 'x' in a && 'width' in a

/**
 * Internal: an Anchored overlay's content in the nearest portal host, placed
 * next to its anchor with the Radix Popper rules (utils/popper), hidden until
 * measured, animated toward the anchor (slide 4px + scale 0.97 + fade; none
 * under Reduce Motion), and registered as a layer so an outside touch or the
 * Android back button dismisses it.
 */
export function AnchoredContent(props: AnchoredContentProps) {
  // Presence: stay mounted until the exit animation ends
  const [present, setPresent] = useState(props.open)
  useEffect(() => { if (props.open) setPresent(true) }, [props.open])
  if (!present) return null
  return (
    <Portal>
      <Placed {...props} onExited={() => setPresent(false)} />
    </Portal>
  )
}

function Placed({
  open, onDismiss, anchor, modal = false, timing = POPPER_TIMING, matchAnchorWidth, placeOverride,
  side = 'bottom', sideOffset = 0, align = 'center', alignOffset = 0,
  avoidCollisions = true, collisionPadding = 10, sticky = 'partial',
  style, children, testID, onExited,
}: AnchoredContentProps & { onExited: () => void }) {
  const host = usePortalHost()
  const { safeAreaInsets: insets } = useThemeContext()
  const window = useWindowDimensions()
  const reducedMotion = useReducedMotion()
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null)
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  // Measure the anchor on open and on rotation (the backdrop / outside dismissal stops scrolling)
  const measure = useCallback(() => {
    const a = anchor.current
    if (!a) return
    if (isRect(a)) setAnchorRect(a)
    else a.measureInWindow((x, y, width, height) => setAnchorRect({ x, y, width, height }))
  }, [anchor])
  useEffect(() => {
    measure()
    const sub = Dimensions.addEventListener('change', measure)
    return () => sub.remove()
  }, [measure])

  const placement = useMemo<Placement | null>(() => {
    if (!anchorRect || !size) return null
    if (placeOverride) {
      const pad = typeof collisionPadding === 'number' ? collisionPadding : 10
      const inner = {
        x: insets.left + pad, y: insets.top + pad,
        width: window.width - insets.left - insets.right - 2 * pad,
        height: window.height - insets.top - insets.bottom - 2 * pad,
      }
      const { x, y } = placeOverride(anchorRect, size, inner)
      return { x, y, side: 'bottom', align: 'start', availableWidth: inner.width, availableHeight: inner.height, originX: size.width / 2, originY: size.height / 2 }
    }
    return place(anchorRect, size, {
      side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, sticky,
      boundary: {
        x: insets.left, y: insets.top,
        width: window.width - insets.left - insets.right,
        height: window.height - insets.top - insets.bottom,
      },
    })
  }, [anchorRect, size, side, align, sideOffset, alignOffset, avoidCollisions, collisionPadding, sticky, insets, window, placeOverride])

  // Layer: outside touch (non-modal) and back button dismiss it
  const placementRef = useRef(placement)
  placementRef.current = placement
  const anchorRef = useRef(anchorRect)
  anchorRef.current = anchorRect
  useEffect(() => {
    if (!host || !open) return
    const inside = (r: Rect | null, x: number, y: number) => !!r && x >= r.x && x <= r.x + r.width && y >= r.y && y <= r.y + r.height
    return host.addLayer({
      modal,
      contains: (x, y) => {
        const p = placementRef.current
        const s = sizeRef.current
        return inside(anchorRef.current, x, y) || (!!p && !!s && inside({ x: p.x, y: p.y, width: s.width, height: s.height }, x, y))
      },
      dismiss: onDismiss,
    })
  }, [host, open, modal, onDismiss])
  const sizeRef = useRef(size)
  sizeRef.current = size

  // Animation toward the placed side
  const progress = useSharedValue(0)
  const placed = placement !== null
  useEffect(() => {
    if (open && placed) {
      progress.value = reducedMotion || !timing.open ? 1 : withTiming(1, { duration: timing.open, easing: EASE })
    } else if (!open) {
      if (reducedMotion || !timing.close) {
        onExited()
        return
      }
      progress.value = withTiming(0, { duration: timing.close, easing: EASE }, (done) => {
        if (done) runOnJS(onExited)()
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, placed, reducedMotion])

  const placedSide = placement?.side ?? side
  // item-aligned content is not a .rt-PopperContent: it only fades
  const slides = !placeOverride
  const animated = useAnimatedStyle(() => {
    const t = 1 - progress.value
    // rt-slide-from-{side}: 4px toward the anchor, scale 0.97
    const dx = !slides ? 0 : placedSide === 'left' ? 4 * t : placedSide === 'right' ? -4 * t : 0
    const dy = !slides ? 0 : placedSide === 'top' ? 4 * t : placedSide === 'bottom' ? -4 * t : 0
    if (!slides) return { opacity: progress.value }
    return { opacity: progress.value, transform: [{ translateX: dx }, { translateY: dy }, { scale: 1 - 0.03 * t }] }
  })

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }))
  }, [])

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {modal ? <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessible={false} testID={testID ? `${testID}-backdrop` : undefined} /> : null}
      <Animated.View
        testID={testID}
        onLayout={onLayout}
        accessibilityViewIsModal={modal}
        style={[
          {
            position: 'absolute',
            left: placement?.x ?? 0,
            top: placement?.y ?? 0,
            // Hidden until placed, like Radix's off-screen pre-measure
            opacity: placed ? undefined : 0,
            minWidth: matchAnchorWidth ? anchorRect?.width : undefined,
            maxWidth: window.width - insets.left - insets.right - 20,
          },
          placement ? { transformOrigin: [placement.originX, placement.originY, 0] } : undefined,
          animated,
          style,
        ]}
      >
        {children(placement, anchorRect)}
      </Animated.View>
    </View>
  )
}
