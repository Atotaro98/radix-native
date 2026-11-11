import { createContext, useContext } from 'react'

/**
 * What a container publishes for an `Inset` inside it — Radix's `--inset-*`
 * variables, resolved to px. Card publishes it today; Dialog, Popover and
 * HoverCard content will too. Without a provider every value is 0, like the
 * `0px` fallbacks in Radix's `inset.css`.
 */
export interface InsetValues {
  /** `--inset-padding-*`: the container's padding minus its border width. */
  padding: { top: number; right: number; bottom: number; left: number }
  /** `--inset-border-width`. */
  borderWidth: number
  /** `--inset-border-radius`. */
  borderRadius: number
}

export const NO_INSET: InsetValues = {
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  borderWidth: 0,
  borderRadius: 0,
}

export const InsetContext = createContext<InsetValues>(NO_INSET)

export function useInsetContext(): InsetValues {
  return useContext(InsetContext)
}
