import { createInlineText, type InlineTextProps } from './InlineText'

export type EmProps = InlineTextProps

/**
 * Inline emphasis. Can be nested inside `<Text>` for inline use.
 * Radix `--em-*`: serif italic at 1.18× the surrounding size, −0.025em tracking.
 * Face: `fonts.em`, else the system serif.
 */
export const Em = createInlineText('em', 'Em')
