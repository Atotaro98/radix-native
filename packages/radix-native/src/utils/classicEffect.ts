import { Platform } from 'react-native'
import type { ViewStyle } from 'react-native'

/**
 * Returns ViewStyle that approximates the Radix "classic" 3D effect
 * using only native RN shadow capabilities.
 *
 * Radix CSS uses linear-gradient overlays + inset box-shadows which
 * are not available in RN. We approximate with an outer drop shadow
 * and pressed state removal (simulates "pushed in").
 */
export function getClassicEffect(
  appearance: 'light' | 'dark',
  options?: { pressed?: boolean; disabled?: boolean },
): ViewStyle {
  const isLight = appearance === 'light'
  const pressed = options?.pressed ?? false
  const isDisabled = options?.disabled ?? false

  // Disabled: no shadow at all — keep it flat like the other disabled variants
  if (isDisabled) return {}

  // Pressed: remove shadow for "pushed in" feel
  if (pressed) {
    return Platform.select({
      ios: {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      default: { elevation: 0 },
    })!
  }

  // Normal resting state — subtle drop shadow
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isLight ? 0.15 : 0.3,
      shadowRadius: 2,
    },
    default: { elevation: 2 },
  })!
}
