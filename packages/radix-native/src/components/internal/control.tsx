import React, { useCallback } from 'react'
import type { AccessibilityRole, AccessibilityState, GestureResponderEvent, Insets, NativeSyntheticEvent, TargetedEvent } from 'react-native'
import { useInteraction } from '../../hooks/useInteraction'
import { useVariantColors } from '../../hooks/useVariantColors'
import { getMinHitSlop } from '../../utils/hitSlop'
import type { AccentColor } from '../../tokens/colors/types'
import { useAccessibleControl } from './accessibleControl'
import { FocusRing } from './FocusRing'

type PressHandler = (event: GestureResponderEvent) => void
type FocusHandler = (event: NativeSyntheticEvent<TargetedEvent>) => void

/** The consumer props a control takes over (the rest pass through untouched). */
export interface ControlConsumerProps {
  onPressIn?: PressHandler
  onPressOut?: PressHandler
  onFocus?: FocusHandler
  onBlur?: FocusHandler
  accessibilityLabel?: string
  accessibilityState?: AccessibilityState
  hitSlop?: Insets | number
}

export interface UseControlOptions<R extends ControlConsumerProps> {
  /** Every prop the consumer passed that is not the control's own (handlers, a11y, testID…). */
  props: R
  /** The content, which names the control for screen readers. */
  children: React.ReactNode
  /** The default role; the consumer may override it. */
  role: AccessibilityRole
  /** Not called while disabled. */
  onPress?: PressHandler
  disabled?: boolean
  /** Internal accessibility state; wins over the consumer's. `disabled` is added. */
  state?: AccessibilityState
  /** The control's visible box, grown to the minimum touch target unless the consumer sets `hitSlop`. */
  touchTarget?: { width: number; height: number }
  /** The 2px focus outline: its accent color, the edge it follows and how far outside it sits. */
  focusRing: { color?: AccentColor; borderRadius: number; offset?: number }
  /** Always pass the content's name as the label (a loading button, whose label is invisible). */
  forceName?: boolean
}

export interface Control<R> {
  pressed: boolean
  focused: boolean
  /** The press scale (only for controls drawn on `AnimatedPressable`). */
  scaleStyle: ReturnType<typeof useInteraction>['scaleStyle']
  /** Spread onto the pressable, before `style` and `ref`. */
  pressableProps: Omit<R, keyof ControlConsumerProps> & {
    accessibilityRole: AccessibilityRole
    accessibilityLabel: string | undefined
    accessibilityState: AccessibilityState
    hitSlop: Insets | number | undefined
    disabled: boolean
    onPress: PressHandler | undefined
    onPressIn: PressHandler
    onPressOut: PressHandler
    onFocus: FocusHandler
    onBlur: FocusHandler
  }
  /** The content's name ('' when it gives none). */
  name: string
  /** Wraps the content so accessible parts inside contribute only their label. */
  wrap: (content: React.ReactNode) => React.ReactNode
  /** The focus ring, to render last inside the edge it follows. */
  focusRing: React.ReactElement
}

/**
 * Internal: the shell of every pressable control (BaseButton, a pressable Card,
 * the Toggle surface, tab triggers, SegmentedControl items, the Select trigger,
 * menu / Select rows). Owns pressed and focus state, the press scale, the name
 * screen readers read from the content, the minimum touch target, the disabled
 * gate, the focus ring and the order consumer props merge in: defaults first,
 * then the consumer's props, then the composed handlers and the internal state,
 * which wins. Focus is reported whether or not the control uses the press scale.
 */
export function useControl<R extends ControlConsumerProps>({
  props,
  children,
  role,
  onPress,
  disabled = false,
  state,
  touchTarget,
  focusRing,
  forceName,
}: UseControlOptions<R>): Control<R> {
  const { onPressIn, onPressOut, onFocus, onBlur, accessibilityLabel, accessibilityState, hitSlop, ...rest } = props
  const a11y = useAccessibleControl(children, accessibilityLabel, { forceName })
  const { pressed, focused, scaleStyle, handlers } = useInteraction({ enabled: !disabled, onPressIn, onPressOut, onFocus, onBlur })
  const focusColor = useVariantColors('focusRing', { color: focusRing.color }).ring

  const handlePress = useCallback((e: GestureResponderEvent) => {
    if (!disabled) onPress?.(e)
  }, [disabled, onPress])

  return {
    pressed,
    focused,
    scaleStyle,
    pressableProps: {
      accessibilityRole: role,
      hitSlop: hitSlop ?? (touchTarget ? getMinHitSlop(touchTarget.width, touchTarget.height) : undefined),
      ...rest,
      ...handlers,
      onPress: onPress ? handlePress : undefined,
      disabled,
      accessibilityLabel: a11y.accessibilityLabel,
      accessibilityState: { ...accessibilityState, ...state, disabled },
    },
    name: a11y.name,
    wrap: a11y.wrap,
    focusRing: <FocusRing visible={focused} color={focusColor} borderRadius={focusRing.borderRadius} offset={focusRing.offset} />,
  }
}
