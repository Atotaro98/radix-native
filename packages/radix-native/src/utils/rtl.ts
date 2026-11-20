import { I18nManager } from 'react-native'

/** The app's layout direction is right-to-left (rows start on the right). */
export const isRTL = (): boolean => I18nManager.isRTL

/** +1, or −1 in RTL: the sign of a `translateX` that moves toward the end of a row (transforms are never mirrored). */
export const inlineSign = (): 1 | -1 => (I18nManager.isRTL ? -1 : 1)

const SWAP: Record<string, string> = { left: 'right', right: 'left', Left: 'Right', Right: 'Left' }

/**
 * A style whose `left` / `right` keys (positions, borders, margins, paddings)
 * mean the physical sides. React Native swaps them in RTL
 * (`doLeftAndRightSwapInRTL`), which is right for layout that follows the
 * reading direction and wrong for anything placed from window coordinates
 * (an Anchored overlay, a Tooltip arrow).
 */
export function physical<T extends object>(style: T): T {
  if (!(I18nManager.isRTL && I18nManager.doLeftAndRightSwapInRTL)) return style
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(style)) {
    out[key.replace(/^(left|right)$|Left|Right/, (m) => SWAP[m])] = value
  }
  return out as T
}
