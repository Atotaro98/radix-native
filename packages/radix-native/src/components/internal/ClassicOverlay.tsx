import React from 'react'
import { View } from 'react-native'

interface ClassicOverlayProps {
  /** Clip radius — needed when the host does not use `overflow: 'hidden'`. */
  borderRadius?: number
}

/**
 * Approximates Radix's "classic" gradient (light top half, dark bottom half)
 * with two translucent overlays. Purely decorative and hidden from a11y.
 */
export function ClassicOverlay({ borderRadius }: ClassicOverlayProps) {
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        borderRadius,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          backgroundColor: 'rgba(255,255,255,0.12)',
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '50%',
          backgroundColor: 'rgba(0,0,0,0.08)',
        }}
      />
    </View>
  )
}
