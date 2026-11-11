import React from 'react'
import { View } from 'react-native'

/**
 * The ring of a base card (Card, CheckboxCards / RadioCards items), drawn over
 * the content like Radix's `::after` in `base-card.css`: it takes no layout
 * space, so content starts exactly at the card padding and an `Inset` with
 * `clip="padding-box"` runs under it. `width` 2 is RadioCards' checked outline.
 */
export function CardRing({ color, borderRadius, width = 1 }: { color: string; borderRadius: number; width?: number }) {
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
        borderRadius,
        borderWidth: width,
        borderColor: color,
      }}
    />
  )
}
