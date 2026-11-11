import React from 'react'
import { Text, View } from 'react-native'
import type { ViewStyle } from 'react-native'
import type { NativeViewProps } from '../../types/nativeProps'
import { textOf } from '../internal/accessibleControl'

export type VisuallyHiddenProps = NativeViewProps

/**
 * Radix `VISUALLY_HIDDEN_STYLES` (position absolute, 1×1, margin −1, overflow
 * hidden) — RN has no `clip`, so `opacity: 0` hides the 1px left over. The
 * content stays in the accessibility tree, unlike `display: 'none'`.
 */
export const VISUALLY_HIDDEN_STYLE: ViewStyle = {
  position: 'absolute',
  borderWidth: 0,
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  opacity: 0,
}

/**
 * Hides content on screen while keeping it readable by screen readers, like
 * Radix `VisuallyHidden`. Strings are wrapped in a Text. `style` is merged
 * after the hidden style, as in Radix.
 */
export function VisuallyHidden({ style, children, ...rest }: VisuallyHiddenProps) {
  return (
    <View style={[VISUALLY_HIDDEN_STYLE, style]} {...rest}>
      {typeof children === 'string' || typeof children === 'number' ? <Text numberOfLines={1}>{children}</Text> : children}
    </View>
  )
}
VisuallyHidden.displayName = 'VisuallyHidden'
/** Inside a control, the hidden text is part of the control's name. */
VisuallyHidden.accessibleName = (props: VisuallyHiddenProps) => textOf(props.children)
