import { createInlineText, type InlineTextProps } from './InlineText'

export type StrongProps = InlineTextProps

/**
 * Inline bold text. Can be nested inside `<Text>` for inline use.
 * Face: `fonts.strong`, else `fonts.bold`, else `fontWeight: '700'` on the system font
 * (Radix `--strong-font-*`).
 */
export const Strong = createInlineText('strong', 'Strong')
