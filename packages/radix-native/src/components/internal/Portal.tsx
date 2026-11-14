import React, { createContext, useCallback, useContext, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import type { GestureResponderEvent } from 'react-native'
import { useBridgedContexts } from './portalContext'

/** An open Anchored overlay, for outside-touch and back-button dismissal (Radix DismissableLayer). */
export interface Layer {
  /** Modal layers have their own backdrop; outside touches never reach layers below them. */
  modal: boolean
  /** Whether a window point is inside the layer (its content) or its anchor (the trigger toggles itself). */
  contains: (x: number, y: number) => boolean
  dismiss: () => void
}

interface PortalHostValue {
  mount: (key: number, node: React.ReactNode) => void
  unmount: (key: number) => void
  addLayer: (layer: Layer) => () => void
}

const PortalHostContext = createContext<PortalHostValue | null>(null)

export interface PortalHostHandle {
  /** Dismisses the top layer; false when there is none. A Modal overlay asks before closing itself. */
  dismissTop: () => boolean
}

/**
 * Internal: where portalled overlays draw — above `children`, filling the host.
 * The root Theme mounts one; every Modal overlay (Dialog, AlertDialog) mounts
 * its own inside its native window, so an Anchored overlay opened from a
 * Dialog draws above that Dialog.
 *
 * It also keeps the open layers: a touch anywhere is seen in the capture phase
 * (and let through) to dismiss non-modal layers it lands outside of, like
 * Radix's pointer-down-outside; the root host gives the Android back button
 * (Radix: Escape) to the top layer.
 */
export const PortalHost = React.forwardRef<PortalHostHandle, { children?: React.ReactNode; handlesBack?: boolean }>(
  function PortalHost({ children, handlesBack = false }, ref) {
    const [nodes, setNodes] = useState<Map<number, React.ReactNode>>(() => new Map())
    const layers = useRef<Layer[]>([])

    const mount = useCallback((key: number, node: React.ReactNode) => {
      setNodes((prev) => new Map(prev).set(key, node))
    }, [])
    const unmount = useCallback((key: number) => {
      setNodes((prev) => {
        if (!prev.has(key)) return prev
        const next = new Map(prev)
        next.delete(key)
        return next
      })
    }, [])
    const addLayer = useCallback((layer: Layer) => {
      layers.current = [...layers.current, layer]
      return () => { layers.current = layers.current.filter((l) => l !== layer) }
    }, [])

    const dismissTop = useCallback(() => {
      const top = layers.current[layers.current.length - 1]
      if (!top) return false
      top.dismiss()
      return true
    }, [])
    useImperativeHandle(ref, () => ({ dismissTop }), [dismissTop])

    useEffect(() => {
      if (!handlesBack) return
      const sub = BackHandler.addEventListener('hardwareBackPress', dismissTop)
      return () => sub.remove()
    }, [handlesBack, dismissTop])

    // Capture phase: dismiss the non-modal layers the touch lands outside of; never claim the touch
    const onCapture = useCallback((e: GestureResponderEvent) => {
      const { pageX, pageY } = e.nativeEvent
      for (let i = layers.current.length - 1; i >= 0; i--) {
        const layer = layers.current[i]
        if (layer.modal || layer.contains(pageX, pageY)) break
        layer.dismiss()
      }
      return false
    }, [])

    const value = useMemo(() => ({ mount, unmount, addLayer }), [mount, unmount, addLayer])

    return (
      <PortalHostContext.Provider value={value}>
        <View style={{ flex: 1 }} onStartShouldSetResponderCapture={onCapture}>
          {children}
          {nodes.size > 0 ? (
            <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
              {Array.from(nodes.entries()).map(([key, node]) => (
                <React.Fragment key={key}>{node}</React.Fragment>
              ))}
            </View>
          ) : null}
        </View>
      </PortalHostContext.Provider>
    )
  },
)

export function usePortalHost(): PortalHostValue | null {
  return useContext(PortalHostContext)
}

let nextKey = 0

/**
 * Internal: renders `children` in the nearest PortalHost. The content keeps
 * the bridged contexts where the Portal sits in the tree, not the host's: the
 * Theme (Radix Themes' `Portal → Theme asChild`) and the state of the
 * components around it (see `portalContext`), as `createPortal` does on the web.
 */
export function Portal({ children }: { children?: React.ReactNode }) {
  const host = useContext(PortalHostContext)
  const bridge = useBridgedContexts()
  const key = useRef(nextKey++).current
  const node = bridge(children)

  useLayoutEffect(() => {
    if (!host) return
    host.mount(key, node)
  }, [host, key, node])
  useLayoutEffect(() => () => host?.unmount(key), [host, key])

  // No host (outside a Theme): render in place
  return host ? null : <>{children}</>
}
