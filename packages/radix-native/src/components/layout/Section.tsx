import React, { useMemo } from 'react'
import { View } from 'react-native'
import type { ViewStyle } from 'react-native'
import { useLayoutStyle } from '../../hooks/useLayoutStyle'
import { useMetrics } from '../../hooks/useMetrics'
import type { LayoutProps } from '../../types/layoutProps'
import type { NativeViewProps } from '../../types/nativeProps'

// ─── Types ────────────────────────────────────────────────────────────────────

export type SectionSize = 1 | 2 | 3 | 4

export interface SectionProps extends NativeViewProps, LayoutProps {
  /** Vertical padding (space-5 / space-7 / space-9 / 80px). Default: 3. */
  size?: SectionSize
  /** `'initial'` shows the section, `'none'` hides it. */
  display?: 'none' | 'initial'
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Denotes a section of page content with consistent vertical spacing, like
 * Radix Themes `Section`. Padding props override the size's padding.
 */
export function Section({ size = 3, display, ...props }: SectionProps) {
  const { style: layoutStyle, rest: { style, ...rest } } = useLayoutStyle(props)
  const metrics = useMetrics()

  // section.css .rt-Section:where(.rt-r-size-1…4): padding-top/bottom
  // var(--space-5), var(--space-7), var(--space-9), calc(80px * var(--scaling))
  const padding = size === 4 ? metrics.px(80) : metrics.space(size === 1 ? 5 : size === 2 ? 7 : 9)

  const sectionStyle = useMemo<ViewStyle>(() => ({
    ...layoutStyle,
    paddingTop: layoutStyle.paddingTop ?? padding,
    paddingBottom: layoutStyle.paddingBottom ?? padding,
    flexShrink: layoutStyle.flexShrink ?? 0,
    ...(display === 'none' && { display: 'none' }),
  }), [layoutStyle, padding, display])

  return <View style={[sectionStyle, style]} {...rest} />
}
Section.displayName = 'Section'
