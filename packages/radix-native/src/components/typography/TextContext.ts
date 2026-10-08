import React from 'react'

export interface TextContextValue {
  /** Resolved font size (px) of the closest typography ancestor. */
  fontSize: number
}

/**
 * Set by Text-like components so nested typography can inherit like it does
 * on the web: `<Text size={1}>See <Link>more</Link></Text>` renders the link
 * at size 1 instead of resetting to the default size.
 *
 * `null` means "not nested inside a radix-native text component".
 */
export const TextContext = React.createContext<TextContextValue | null>(null)

export function useParentText(): TextContextValue | null {
  return React.useContext(TextContext)
}
