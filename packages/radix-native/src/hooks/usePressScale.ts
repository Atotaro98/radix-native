import { useRef, useCallback } from 'react'
import { Animated, Easing } from 'react-native'

/**
 * Provides a subtle scale-down animation on press for interactive components.
 * Returns an Animated style to apply to the wrapper and press handlers.
 *
 * @example
 * const { scaleStyle, handlePressIn, handlePressOut } = usePressScale()
 *
 * <Animated.View style={scaleStyle}>
 *   <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
 *     ...
 *   </Pressable>
 * </Animated.View>
 */
export function usePressScale(enabled = true) {
  const scaleRef = useRef<Animated.Value | null>(null)
  if (scaleRef.current === null) {
    scaleRef.current = new Animated.Value(1)
  }
  const scale = scaleRef.current

  const handlePressIn = useCallback(() => {
    if (!enabled) return
    Animated.timing(scale, {
      toValue: 0.97,
      duration: 80,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [enabled, scale])

  const handlePressOut = useCallback(() => {
    if (!enabled) return
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start()
  }, [enabled, scale])

  return {
    scaleStyle: { transform: [{ scale }] } as Animated.WithAnimatedObject<{ transform: { scale: Animated.Value }[] }>,
    handlePressIn,
    handlePressOut,
  }
}
