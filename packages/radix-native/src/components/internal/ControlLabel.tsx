import React from 'react'
import { StyleSheet, Text as RNText, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { WeightIntent } from '../../utils/textStyle'
import type { TextSize } from '../typography/Text'

export interface ControlLabelProps {
  /** Font size step of the label text. */
  size: TextSize
  weight: WeightIntent
  /** Replaces the size's letter spacing, in em (tabs: −0.01em active, 0 inactive). */
  letterSpacingEm?: number
  /**
   * Default: true — shrink and truncate when the control is narrower than its
   * label. Off where the control always takes the label's width (tab triggers,
   * SegmentedControl items): on Android a one-line truncated text there can be
   * measured a little narrower than it draws and lose its end to an ellipsis.
   */
  truncate?: boolean
  /** Text color; icons without their own `color` get it too. */
  color?: string
  maxFontSizeMultiplier?: number
  children?: React.ReactNode
}

/**
 * Internal: the Control label of a Button, IconButton, Badge, tab trigger,
 * SegmentedControl item or menu / Select item — one row of text runs and icons.
 * - Adjacent strings / numbers render as one `<Text>`, so
 *   `<Button>Hello {name}</Button>` reads as one label.
 * - Text is Compact text kept to one line; it shrinks and truncates when the
 *   control is narrower than its label (unless `truncate` is off).
 * - Elements (icons) receive `color` only when they don't set it themselves.
 */
export function ControlLabel({ size, weight, letterSpacingEm, truncate = true, color, maxFontSizeMultiplier, children }: ControlLabelProps) {
  const text = useTextStyle({ size, weight, color, compact: true, truncate, maxFontSizeMultiplier })
  const style = letterSpacingEm === undefined ? text.style : [text.style, { letterSpacing: letterSpacingEm * text.contextFontSize }]

  const nodes: React.ReactNode[] = []
  let textRun = ''

  const flushText = () => {
    if (textRun === '') return
    nodes.push(
      <RNText key={`text-${nodes.length}`} style={style} {...text.textProps}>
        {textRun}
      </RNText>,
    )
    textRun = ''
  }

  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') {
      textRun += String(child)
      return
    }
    flushText()
    if (React.isValidElement<{ color?: unknown }>(child)) {
      const key = child.key ?? `el-${nodes.length}`
      nodes.push(
        child.props.color === undefined && color !== undefined
          ? React.cloneElement(child as React.ReactElement<{ color?: string }>, { key, color })
          : React.cloneElement(child, { key }),
      )
    } else if (child != null && typeof child !== 'boolean') {
      nodes.push(child)
    }
  })
  flushText()

  return <>{nodes}</>
}

const HIDDEN = { importantForAccessibility: 'no-hide-descendants', accessibilityElementsHidden: true } as const

/**
 * Internal: Radix renders a tab trigger's label
 * in both weights so its width never changes between active and inactive.
 * Reserves the width of the wider of `label('medium')` and `label('regular')`
 * (the regular copy has no height: with the active −0.01em letter spacing,
 * Roboto's medium is not always wider, and a narrower box would clip the
 * inactive label on Android), then draws `children` over that box. `style` is
 * the label row's own (padding, gap), applied to every copy.
 */
export function WeightReserve({ label, style, children }: {
  label: (weight: 'medium' | 'regular') => React.ReactNode
  style?: StyleProp<ViewStyle>
  children: React.ReactNode
}) {
  return (
    <View>
      <View style={[style, { opacity: 0 }]} {...HIDDEN}>{label('medium')}</View>
      <View style={[style, { height: 0, paddingVertical: 0, overflow: 'hidden', opacity: 0 }]} {...HIDDEN}>{label('regular')}</View>
      <View style={[style, StyleSheet.absoluteFill, { justifyContent: 'center' }]}>{children}</View>
    </View>
  )
}
