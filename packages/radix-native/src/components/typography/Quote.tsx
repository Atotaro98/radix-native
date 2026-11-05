import React from 'react'
import { createInlineText, type InlineTextProps } from './InlineText'

export type QuoteProps = InlineTextProps

/**
 * Inline quoted text. Wraps children with typographic curly quotes (" ").
 * Can be nested inside `<Text>` for inline use.
 * Radix `--quote-*`: serif italic at 1.18× the surrounding size, −0.025em tracking.
 * Face: `fonts.quote`, else the system serif.
 */
export const Quote = createInlineText('quote', 'Quote', (children) => (
  <>
    {'“'}{children}{'”'}
  </>
))
