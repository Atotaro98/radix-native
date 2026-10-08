import React from 'react'
import type { GestureResponderEvent, NativeSyntheticEvent, TargetedEvent } from 'react-native'
import { usePressScale } from './usePressScale'

type PressHandler = (event: GestureResponderEvent) => void
type FocusHandler = (event: NativeSyntheticEvent<TargetedEvent>) => void

interface UseInteractionParams {
  /** When false, no pressed state, scale or focus ring is shown. */
  enabled: boolean
  /** Consumer handlers — always called, composed with the internal ones. */
  onPressIn?: PressHandler
  onPressOut?: PressHandler
  onFocus?: FocusHandler
  onBlur?: FocusHandler
}

/**
 * Internal hook shared by every pressable component.
 *
 * - Tracks `pressed` (for pressed background colors) and `focused`
 *   (keyboard / TV / web focus, for the focus ring).
 * - Drives the press-scale animation.
 * - Composes the consumer's `onPressIn` / `onPressOut` / `onFocus` / `onBlur`
 *   with the internal handlers, so passing them never breaks the component.
 */
export function useInteraction({ enabled, onPressIn, onPressOut, onFocus, onBlur }: UseInteractionParams) {
  const [pressed, setPressed] = React.useState(false)
  const [focused, setFocused] = React.useState(false)
  const { scaleStyle, handlePressIn: scaleIn, handlePressOut: scaleOut } = usePressScale(enabled)

  const handlePressIn = React.useCallback<PressHandler>(
    (e) => {
      if (enabled) setPressed(true)
      scaleIn()
      onPressIn?.(e)
    },
    [enabled, scaleIn, onPressIn],
  )

  const handlePressOut = React.useCallback<PressHandler>(
    (e) => {
      setPressed(false)
      scaleOut()
      onPressOut?.(e)
    },
    [scaleOut, onPressOut],
  )

  const handleFocus = React.useCallback<FocusHandler>(
    (e) => {
      setFocused(true)
      onFocus?.(e)
    },
    [onFocus],
  )

  const handleBlur = React.useCallback<FocusHandler>(
    (e) => {
      setFocused(false)
      onBlur?.(e)
    },
    [onBlur],
  )

  return {
    pressed: enabled && pressed,
    focused: enabled && focused,
    scaleStyle,
    handlers: {
      onPressIn: handlePressIn,
      onPressOut: handlePressOut,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  }
}
