import type { MarginToken } from '../tokens/spacing'

/**
 * A margin value: a space token (negative tokens allowed) or `'auto'`
 * (e.g. `ml="auto"` to push an item to the end of a row).
 */
export type MarginValue = MarginToken | 'auto'

/**
 * Margin props shared by all Radix Native components.
 * Equivalent to Radix web's `marginPropDefs` used in `extractProps`.
 */
export interface MarginProps {
  m?: MarginValue
  mx?: MarginValue
  my?: MarginValue
  mt?: MarginValue
  mr?: MarginValue
  mb?: MarginValue
  ml?: MarginValue
}
