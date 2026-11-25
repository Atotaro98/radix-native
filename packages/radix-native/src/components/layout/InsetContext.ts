import { createContext, createElement, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

/**
 * What a container publishes for an `Inset` inside it — Radix's `--inset-*`
 * variables, resolved to px. Card, Selection cards, popper panels (Popover,
 * HoverCard) and Dialog content publish it, through `InsetContainer`. Without
 * a provider every value is 0, like the `0px` fallbacks in Radix's `inset.css`.
 */
export interface InsetValues {
  /** `--inset-padding-*`: the container's padding minus its border width. */
  padding: { top: number; right: number; bottom: number; left: number }
  /** `--inset-border-width`. */
  borderWidth: number
  /** `--inset-border-radius`. */
  borderRadius: number
  /** Set by Inset for its content: a Table inside aligns its outer cells with the container (`.rt-Inset .rt-TableCell`). */
  insideInset?: boolean
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

type Sides = InsetValues['padding']

export interface InsetContainerProps {
  /** The container's own padding, in px: one value, or one per side. */
  padding: number | Sides
  /** The width of the container's border (Radix `--card-border-width`); a panel has none. Default 0. */
  borderWidth?: number
  /** The container's radius, when an Inset should follow it (cards). Default 0. */
  borderRadius?: number
  children?: ReactNode
}

/**
 * Internal: wraps the content of a padded container so an `Inset` inside can
 * reach its edges. Owns Radix's rule (base-card.css):
 * `--inset-padding-* = the container's padding − its border width`.
 */
export function InsetContainer({ padding, borderWidth = 0, borderRadius = 0, children }: InsetContainerProps) {
  const { top, right, bottom, left } = typeof padding === 'number'
    ? { top: padding, right: padding, bottom: padding, left: padding }
    : padding
  const value = useMemo<InsetValues>(() => ({
    padding: { top: top - borderWidth, right: right - borderWidth, bottom: bottom - borderWidth, left: left - borderWidth },
    borderWidth,
    borderRadius,
  }), [top, right, bottom, left, borderWidth, borderRadius])
  return createElement(InsetContext.Provider, { value }, children)
}
