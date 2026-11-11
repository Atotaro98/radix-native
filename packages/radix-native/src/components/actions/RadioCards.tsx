import {
  createSelectionCards,
  type SelectionCardsItemProps,
  type SelectionCardsProps,
  type SelectionCardVariant,
} from '../internal/SelectionCard'

export type RadioCardsVariant = SelectionCardVariant
/** Props of RadioCards: one value (`string`), Radix card sizes and variants. */
export type RadioCardsProps = SelectionCardsProps<'single'>
export type RadioCardsItemProps = SelectionCardsItemProps

/**
 * A Selection group of radio cards: the user picks one value. A checked card
 * shows a 2px ring in the accent color (Radix).
 */
export const RadioCards = createSelectionCards({
  name: 'RadioCards',
  type: 'single',
  rootRole: 'radiogroup',
  itemRole: 'radio',
  recipe: 'radioCard',
})
