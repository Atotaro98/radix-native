import { StyleSheet } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { FocusRing } from '../../components/internal/FocusRing'
import { CardRing } from '../../components/internal/CardRing'
import { ClassicOverlay } from '../../components/internal/ClassicOverlay'

/** A rendered node, as `screen.UNSAFE_root` / `getBy*` return it. */
export interface TestNode {
  type: unknown
  props: Record<string, unknown> & { style?: unknown }
  findAll: (match: (node: TestNode) => boolean) => TestNode[]
}

/** The node's style, flattened. */
export const flat = (node: { props: { style?: unknown } }): ViewStyle & TextStyle =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) ?? {}

/** The visible focus rings inside `el`. */
export const focusRings = (el: unknown) =>
  (el as TestNode).findAll((n) => n.type === FocusRing && n.props.visible === true)

/** The card rings (`CardRing`) drawn inside `el`, by color and width. */
export const cardRings = (el: unknown) =>
  (el as TestNode).findAll((n) => n.type === CardRing)
    .map((n) => ({ color: n.props.color as string, width: (n.props.width as number | undefined) ?? 1 }))

/** Whether `el` draws the classic bevel. */
export const hasBevel = (el: unknown) => (el as TestNode).findAll((n) => n.type === ClassicOverlay).length > 0
