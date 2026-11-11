import React, { forwardRef } from 'react'
import { Platform, ScrollView, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useMargins } from '../../hooks/useMargins'
import type { RadiusToken } from '../../theme/theme.types'
import type { MarginProps } from '../../types/marginProps'
import type { NativeViewProps } from '../../types/nativeProps'

export type ScrollAreaSize = 1 | 2 | 3
export type ScrollAreaScrollbars = 'vertical' | 'horizontal' | 'both'
export type ScrollAreaType = 'auto' | 'always' | 'scroll' | 'hover'

export interface ScrollAreaProps extends NativeViewProps, MarginProps {
  /** Which axes scroll; the others don't. Default: 'both'. */
  scrollbars?: ScrollAreaScrollbars
  /**
   * When the scrollbars show. `always` keeps them visible where the platform
   * allows (Android); the rest show them while scrolling (`hover` has no touch meaning).
   */
  type?: ScrollAreaType
  /** Radix sizes its drawn scrollbar; native indicators can't be styled — accepted for API parity. */
  size?: ScrollAreaSize
  /** Radix rounds its drawn scrollbar thumb; no effect on native indicators. */
  radius?: RadiusToken
  /** Style of the content inside the scrolling area. */
  contentContainerStyle?: StyleProp<ViewStyle>
}

/**
 * Augments native scroll, like Radix Themes `ScrollArea`, on platform scroll
 * views: `scrollbars` decides the axes that scroll (an omitted axis doesn't),
 * and `both` nests a horizontal ScrollView in a vertical one (Android scrolls
 * one axis per view). The ref points at the outer ScrollView (Radix: the viewport).
 */
/** The outer ScrollView instance (Radix: the viewport). */
export type ScrollAreaRef = React.ComponentRef<typeof ScrollView>

export const ScrollArea = forwardRef<ScrollAreaRef, ScrollAreaProps>(function ScrollArea(
  {
    scrollbars = 'both',
    type = 'hover',
    size: _size,
    radius: _radius,
    contentContainerStyle,
    m, mx, my, mt, mr, mb, ml,
    style,
    children,
    ...rest
  },
  ref,
) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const always = type === 'always'
  const indicators = { persistentScrollbar: Platform.OS === 'android' && always }

  if (scrollbars === 'horizontal') {
    return (
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator
        {...indicators}
        style={[margins, style]}
        contentContainerStyle={contentContainerStyle}
        {...rest}
      >
        {children}
      </ScrollView>
    )
  }

  if (scrollbars === 'vertical') {
    return (
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator
        {...indicators}
        style={[margins, style]}
        contentContainerStyle={contentContainerStyle}
        {...rest}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <ScrollView ref={ref} showsVerticalScrollIndicator {...indicators} style={[margins, style]} {...rest}>
      <ScrollView horizontal showsHorizontalScrollIndicator {...indicators} nestedScrollEnabled>
        {/* A horizontal ScrollView lays children out in a row; the viewport stacks them like Radix's */}
        <View style={contentContainerStyle}>{children}</View>
      </ScrollView>
    </ScrollView>
  )
})
ScrollArea.displayName = 'ScrollArea'
