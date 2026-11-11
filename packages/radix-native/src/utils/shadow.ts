import { Platform, type ViewStyle } from 'react-native'
import type { Shadow } from './variantPalette'

/**
 * The platform style for a recipe's resolved drop shadow: iOS `shadow*` props,
 * Android `elevation`. No shadow → an empty style. The one place that writes
 * shadow styles; components never call `Platform.select` for shadows.
 */
export function shadowStyle(shadow: Shadow | undefined): ViewStyle {
  if (!shadow) return NO_SHADOW
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: shadow.color,
      shadowOffset: { width: 0, height: shadow.offsetY },
      shadowOpacity: shadow.opacity,
      shadowRadius: shadow.radius,
    },
    default: { elevation: shadow.elevation },
  })
}

const NO_SHADOW: ViewStyle = {}
