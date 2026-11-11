import React from 'react'
import { Text as RNText } from 'react-native'
import type { StyleProp, TextStyle } from 'react-native'
import { Text } from '../typography/Text'
import { Link } from '../typography/Link'
import { Code } from '../typography/Code'
import { Em } from '../typography/Em'
import { Strong } from '../typography/Strong'
import { Quote } from '../typography/Quote'
import { Kbd } from '../typography/Kbd'

/** Components that render as text and nest inside one RN Text (inheriting its size). */
const INLINE_TEXT = new Set<unknown>([Text, Link, Code, Em, Strong, Quote, Kbd])

export interface InlineTextStyle {
  textStyle: StyleProp<TextStyle>
  textProps: object
  provide: (children: React.ReactNode) => React.ReactNode
}

/**
 * Internal: on the web a container's font (a `dl`, a `table`) reaches every
 * descendant; RN only inherits inside a Text. Runs of strings and text
 * components are merged into one Text in the container's Text style; other
 * elements (Badge, Button, Flex) render as they are.
 */
export function renderInlineText(children: React.ReactNode, style: InlineTextStyle, color: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let run: React.ReactNode[] = []
  const flush = () => {
    if (run.length === 0) return
    nodes.push(
      <RNText key={`t${nodes.length}`} style={[style.textStyle, { color, flexShrink: 1 }]} {...style.textProps}>
        {style.provide(run)}
      </RNText>,
    )
    run = []
  }
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string' || typeof child === 'number') run.push(child)
    else if (React.isValidElement(child) && INLINE_TEXT.has(child.type)) run.push(React.cloneElement(child, { key: child.key ?? `i${run.length}` }))
    else if (child != null && typeof child !== 'boolean') {
      flush()
      nodes.push(child)
    }
  })
  flush()
  return nodes
}
