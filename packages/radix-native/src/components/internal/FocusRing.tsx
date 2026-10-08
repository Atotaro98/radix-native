import React from 'react'
import { View } from 'react-native'

interface FocusRingProps {
  visible: boolean
  color: string
  borderRadius: number
  /** Ring thickness. Radix uses a 2px focus outline. */
  width?: number
  /**
   * Distance drawn outside the host (like CSS `outline-offset`). Only use it on
   * hosts without `overflow: 'hidden'`; otherwise keep 0 (inset ring).
   */
  offset?: number
}

/**
 * Visible focus indicator for keyboard, switch-control, TV and web focus
 * (RN has no `:focus-visible` / `outline`). Drawn inset so it is never clipped
 * by `overflow: 'hidden'` on the host — pass `offset` for small controls
 * (checkbox, radio, switch) so the ring surrounds them instead.
 */
export function FocusRing({ visible, color, borderRadius, width = 2, offset = 0 }: FocusRingProps) {
  if (!visible) return null
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        position: 'absolute',
        top: -offset,
        left: -offset,
        right: -offset,
        bottom: -offset,
        borderRadius: borderRadius + offset,
        borderWidth: width,
        borderColor: color,
      }}
    />
  )
}
