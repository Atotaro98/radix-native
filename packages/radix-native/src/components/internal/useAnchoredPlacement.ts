import { useCallback, useEffect, useMemo, useState } from 'react'
import { Dimensions, Keyboard, useWindowDimensions } from 'react-native'
import type { LayoutChangeEvent } from 'react-native'
import { useThemeContext } from '../../hooks/useThemeContext'
import { placeAnchored, placementBoundary, type AnchoredPlacement, type AnchoredPlacementOptions } from '../../utils/anchoredPlacement'
import type { Rect, Size } from '../../utils/popper'
import { isRTL } from '../../utils/rtl'
import type { Anchor, Measurable } from './overlayRoot'
import { usePortalHost } from './Portal'

const isRect = (a: Measurable | Rect): a is Rect => 'x' in a && 'width' in a

export interface AnchoredPlacementState {
  /** Null until both the anchor and the content have been measured. */
  placement: AnchoredPlacement | null
  /** The anchor's window rect. */
  anchorRect: Rect | null
  /** The content's measured size. */
  size: Size | null
  /** The widest the content may be. */
  maxWidth: number
  /** For the content's own view: its size is what gets placed. */
  onLayout: (e: LayoutChangeEvent) => void
}

/**
 * Internal: where an open Anchored overlay's content goes. Reads the device —
 * the anchor's window rect, the portal host's origin, the window, the Theme's
 * safe area, the keyboard — and re-reads it when the screen rotates or the
 * keyboard moves; the rules are the pure `placeAnchored`.
 */
export function useAnchoredPlacement(anchor: Anchor, options: AnchoredPlacementOptions): AnchoredPlacementState {
  const host = usePortalHost()
  const { safeAreaInsets: insets } = useThemeContext()
  const window = useWindowDimensions()
  const [anchorRect, setAnchorRect] = useState<Rect | null>(null)
  const [size, setSize] = useState<Size | null>(null)
  const [origin, setOrigin] = useState({ x: 0, y: 0 })
  const [keyboardTop, setKeyboardTop] = useState<number | null>(null)

  // Measured on open and on rotation / keyboard (the backdrop or outside dismissal stops scrolling)
  useEffect(() => {
    const measure = () => {
      const a = anchor.current
      if (a) {
        if (isRect(a)) setAnchorRect(a)
        else a.measureInWindow((x, y, width, height) => setAnchorRect({ x, y, width, height }))
      }
      host?.measureOrigin((x, y) => setOrigin((prev) => (prev.x === x && prev.y === y ? prev : { x, y })))
    }
    measure()
    // After the frame: the anchor has its new layout by then (rotation, a view moved by the keyboard)
    const later = () => requestAnimationFrame(measure)
    const subs = [
      Dimensions.addEventListener('change', later),
      Keyboard.addListener('keyboardDidShow', (e) => { setKeyboardTop(e.endCoordinates.screenY); later() }),
      Keyboard.addListener('keyboardDidHide', () => { setKeyboardTop(null); later() }),
    ]
    return () => subs.forEach((s) => s.remove())
  }, [anchor, host])

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout
    setSize((prev) => (prev && prev.width === width && prev.height === height ? prev : { width, height }))
  }, [])

  const { width, height } = window
  const env = useMemo(
    () => ({ window: { width, height }, insets, keyboardTop, origin, rtl: isRTL() }),
    [width, height, insets, keyboardTop, origin],
  )
  const placement = useMemo(
    () => (anchorRect && size ? placeAnchored(anchorRect, size, options, env) : null),
    [anchorRect, size, options, env],
  )
  return { placement, anchorRect, size, maxWidth: placementBoundary(env).width - 20, onLayout }
}
