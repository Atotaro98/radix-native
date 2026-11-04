import { useCallback, useEffect } from 'react'
import { Pressable } from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated'

export const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

/**
 * Provides a subtle scale-down animation on press for interactive components.
 * Returns an animated style and press handlers to use with AnimatedPressable.
 *
 * @example
 * const { scaleStyle, handlePressIn, handlePressOut } = usePressScale()
 *
 * <AnimatedPressable style={[scaleStyle, otherStyles]} onPressIn={handlePressIn} onPressOut={handlePressOut}>
 *   ...
 * </AnimatedPressable>
 */
export function usePressScale(enabled = true) {
  const scale = useSharedValue(1)

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const handlePressIn = useCallback(() => {
    if (!enabled) return
    scale.value = withTiming(0.97, {
      duration: 80,
      easing: Easing.out(Easing.ease),
    })
  }, [enabled, scale])

  // Always release: the component may have been disabled mid-press
  // (e.g. `loading` set from onPressIn), and must not stay scaled down.
  const handlePressOut = useCallback(() => {
    scale.value = withTiming(1, {
      duration: 150,
      easing: Easing.out(Easing.ease),
    })
  }, [scale])

  // Disabled while scaled down: spring back even if no release arrives.
  useEffect(() => {
    if (!enabled) handlePressOut()
  }, [enabled, handlePressOut])

  return {
    scaleStyle,
    handlePressIn,
    handlePressOut,
  }
}
