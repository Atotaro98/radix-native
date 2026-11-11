import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useLayoutStyle } from '../../hooks/useLayoutStyle'
import type { LayoutProps } from '../../types/layoutProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContainerSize = 1 | 2 | 3 | 4
export type ContainerAlign = 'left' | 'center' | 'right'

export interface ContainerProps extends NativeViewProps, LayoutProps {
  /** Max width of the content (448 / 688 / 880 / 1136px). Default: 4. */
  size?: ContainerSize
  /** Horizontal alignment of the content. Default: 'center'. */
  align?: ContainerAlign
  /** `'initial'` shows the container (Radix `display: flex`), `'none'` hides it. */
  display?: 'none' | 'initial'
}

// ─── Size mappings ────────────────────────────────────────────────────────────

// .radix-themes --container-1…4 — fixed px, not multiplied by --scaling
export const CONTAINER_MAX_WIDTH: Record<ContainerSize, number> = { 1: 448, 2: 688, 3: 880, 4: 1136 }

// container.tsx: left → start, right → end
const ALIGN: Record<ContainerAlign, ViewStyle['alignItems']> = { left: 'flex-start', center: 'center', right: 'flex-end' }

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Constrains the width of its content, like Radix Themes `Container`: an outer
 * column that takes the Layout props and an inner View (`.rt-ContainerInner`)
 * that takes the size props and the size's max width.
 */
export function Container({
  size = 4,
  align = 'center',
  display,
  width, minWidth, maxWidth, height, minHeight, maxHeight,
  children,
  ...props
}: ContainerProps) {
  const { style: layoutStyle, rest: { style, ...rest } } = useLayoutStyle(props)

  const outerStyle = useMemo<ViewStyle>(() => ({
    ...layoutStyle,
    // .rt-Container: display flex, column, align-items center, flex-shrink 0, flex-grow 1
    display: display === 'none' ? 'none' : 'flex',
    flexDirection: 'column',
    alignItems: ALIGN[align],
    flexGrow: layoutStyle.flexGrow ?? 1,
    flexShrink: layoutStyle.flexShrink ?? 0,
  }), [layoutStyle, display, align])

  // .rt-ContainerInner { width: 100% } + max-width: var(--container-N); size props win (utilities)
  const innerStyle = useMemo<ViewStyle>(() => ({
    width: width ?? '100%',
    maxWidth: maxWidth ?? CONTAINER_MAX_WIDTH[size],
    minWidth,
    height,
    minHeight,
    maxHeight,
  }), [width, maxWidth, size, minWidth, height, minHeight, maxHeight])

  return (
    <View style={[outerStyle, style]} {...rest}>
      <View style={innerStyle}>{children}</View>
    </View>
  )
}
Container.displayName = 'Container'
