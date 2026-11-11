import React from 'react'
import { View } from 'react-native'
import type { NativeViewProps } from '../../types/nativeProps'

export interface AspectRatioProps extends NativeViewProps {
  /** Width ÷ height. Default: 1. */
  ratio?: number
}

/**
 * Displays content within a desired ratio, like Radix `AspectRatio`: full
 * width of its parent, height = width ÷ ratio. Like Radix, it takes no margin
 * or Layout props. Children fill it with `flex: 1` or `width/height: '100%'`.
 */
export function AspectRatio({ ratio = 1, style, ...rest }: AspectRatioProps) {
  return <View style={[{ width: '100%', aspectRatio: ratio }, style]} {...rest} />
}
AspectRatio.displayName = 'AspectRatio'
