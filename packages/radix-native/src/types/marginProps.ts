import type { MarginToken } from '../tokens/spacing'

/**
 * Margin props shared by all Radix Native components.
 * Equivalent to Radix web's `marginPropDefs` used in `extractProps`.
 */
export interface MarginProps {
  m?: MarginToken
  mx?: MarginToken
  my?: MarginToken
  mt?: MarginToken
  mr?: MarginToken
  mb?: MarginToken
  ml?: MarginToken
}
