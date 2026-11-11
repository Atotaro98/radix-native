import React, { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ThemeContext } from '../../theme/ThemeContext'
import type { ThemeContextValue } from '../../theme/theme.types'

interface PortalHostValue {
  mount: (key: number, node: React.ReactNode) => void
  unmount: (key: number) => void
}

const PortalHostContext = createContext<PortalHostValue | null>(null)

/**
 * Internal: where portalled overlays draw — above `children`, filling the host.
 * The root Theme mounts one; every Modal overlay (Dialog, AlertDialog) mounts
 * its own inside its native window, so an Anchored overlay opened from a
 * Dialog draws above that Dialog (a Modal is a separate window).
 */
export function PortalHost({ children }: { children?: React.ReactNode }) {
  const [nodes, setNodes] = useState<Map<number, React.ReactNode>>(() => new Map())
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
  const value = useMemo(() => ({ mount, unmount }), [mount, unmount])

  return (
    <PortalHostContext.Provider value={value}>
      {children}
      {nodes.size > 0 ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {Array.from(nodes.entries()).map(([key, node]) => (
            <React.Fragment key={key}>{node}</React.Fragment>
          ))}
        </View>
      ) : null}
    </PortalHostContext.Provider>
  )
}

let nextKey = 0

/**
 * Internal: renders `children` in the nearest PortalHost. Like Radix Themes'
 * `Portal → Theme asChild`, the content keeps the Theme where the Portal sits
 * in the tree, not the host's.
 */
export function Portal({ children }: { children?: React.ReactNode }) {
  const host = useContext(PortalHostContext)
  const theme = useContext(ThemeContext)
  const key = useRef(nextKey++).current

  useLayoutEffect(() => {
    if (!host) return
    host.mount(key, <PortalTheme theme={theme}>{children}</PortalTheme>)
  }, [host, key, theme, children])
  useLayoutEffect(() => () => host?.unmount(key), [host, key])

  // No host (outside a Theme): render in place
  return host ? null : <>{children}</>
}

function PortalTheme({ theme, children }: { theme: ThemeContextValue | undefined; children: React.ReactNode }) {
  return theme ? <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider> : <>{children}</>
}
