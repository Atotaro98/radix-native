import { Platform, type ViewStyle } from 'react-native'
import { shadowStyle } from './shadow'

/**
 * The drop shadow of a raised classic part, for a light or dark appearance:
 * cleared while pressed, none when disabled.
 *
 * @deprecated Components take their shadow from their Variant recipe now
 * (`shadow` / `bevel`). Kept for consumers; removed in the next major version.
 */
export function getClassicEffect(
  appearance: 'light' | 'dark',
  options?: { pressed?: boolean; disabled?: boolean },
): ViewStyle {
  if (options?.disabled) return {}
  if (options?.pressed) {
    return Platform.select<ViewStyle>({
      ios: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0 },
      default: { elevation: 0 },
    })
  }
  return shadowStyle({
    color: '#000000',
    opacity: appearance === 'light' ? 0.15 : 0.3,
    offsetY: 1,
    radius: 2,
    elevation: 2,
  })
}
