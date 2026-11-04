import React from 'react'
import { Text as RNText } from 'react-native'
import { useTextStyle } from '../../hooks/useTextStyle'
import type { WeightIntent } from '../../utils/textStyle'

export interface ControlLabelProps {
  /** Font size step of the label text. */
  size: 1 | 2 | 3 | 4
  weight: WeightIntent
  /** Text color; icons without their own `color` get it too. */
  color?: string
  maxFontSizeMultiplier?: number
  children?: React.ReactNode
}

/**
 * Internal: the Control label of a Button, IconButton or Badge — one row of
 * text runs and icons.
 * - Adjacent strings / numbers render as one `<Text>`, so
 *   `<Button>Hello {name}</Button>` reads as one label.
 * - Text is Compact text kept to one line; it shrinks and truncates when the
 *   control is narrower than its label.
 * - Elements (icons) receive `color` only when they don't set it themselves.
 */
export function ControlLabel({ size, weight, color, maxFontSizeMultiplier, children }: ControlLabelProps) {
  const text = useTextStyle({ size, weight, color, compact: true, truncate: true, maxFontSizeMultiplier })

  const nodes: React.ReactNode[] = []
  let textRun = ''

  const flushText = () => {
    if (textRun === '') return
    nodes.push(
      <RNText key={`text-${nodes.length}`} style={text.style} {...text.textProps}>
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
