/**
 * Curated subsets of React Native native props.
 *
 * Components extend these instead of ViewProps / PressableProps / TextProps
 * to keep VSCode autocomplete clean — only commonly-used native props are
 * exposed. Users who need rare native props can cast via `as any`.
 */
import type {
  ViewStyle,
  TextStyle,
  StyleProp,
  LayoutChangeEvent,
  GestureResponderEvent,
  AccessibilityRole,
  AccessibilityState,
  Insets,
} from 'react-native'

// ─── View-based components ───────────────────────────────────────────────────

export interface NativeViewProps {
  children?: React.ReactNode
  style?: StyleProp<ViewStyle>
  testID?: string
  nativeID?: string
  accessible?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: AccessibilityRole
  accessibilityState?: AccessibilityState
  onLayout?: (event: LayoutChangeEvent) => void
  pointerEvents?: 'auto' | 'none' | 'box-none' | 'box-only'
  hitSlop?: Insets | number
  focusable?: boolean
}

// ─── Pressable-based components ──────────────────────────────────────────────

export interface NativePressableProps extends NativeViewProps {
  onPress?: (event: GestureResponderEvent) => void
  onPressIn?: (event: GestureResponderEvent) => void
  onPressOut?: (event: GestureResponderEvent) => void
  onLongPress?: (event: GestureResponderEvent) => void
  delayLongPress?: number
  disabled?: boolean
}

// ─── Text-based components ───────────────────────────────────────────────────

export interface NativeTextProps {
  children?: React.ReactNode
  style?: StyleProp<TextStyle>
  testID?: string
  nativeID?: string
  accessible?: boolean
  accessibilityLabel?: string
  accessibilityHint?: string
  accessibilityRole?: AccessibilityRole
  selectable?: boolean
  onPress?: (event: GestureResponderEvent) => void
}
