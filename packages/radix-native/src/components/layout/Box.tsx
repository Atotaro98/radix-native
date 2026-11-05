import React from 'react'
import { View } from 'react-native'
import { useLayoutStyle } from '../../hooks/useLayoutStyle'
import type { LayoutProps } from '../../types/layoutProps'
import type { NativeViewProps } from '../../types/nativeProps'

export interface BoxProps extends NativeViewProps, LayoutProps {}

/** Fundamental layout primitive backed by a View. */
export function Box(props: BoxProps) {
  const { style: layoutStyle, rest: { style, ...rest } } = useLayoutStyle(props)
  return <View style={[layoutStyle, style]} {...rest} />
}
Box.displayName = 'Box'
