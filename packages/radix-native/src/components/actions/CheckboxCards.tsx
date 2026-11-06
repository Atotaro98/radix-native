import {
  createSelectionCards,
  type SelectionCardsItemProps,
  type SelectionCardsProps,
  type SelectionCardVariant,
} from '../internal/SelectionCard'
import { CheckboxToggle } from './Checkbox'

export type CheckboxCardsVariant = SelectionCardVariant
/** Props of CheckboxCards: several values (`string[]`), Radix card sizes and variants. */
export type CheckboxCardsProps = SelectionCardsProps<'multiple'>
export type CheckboxCardsItemProps = SelectionCardsItemProps

/**
 * A Selection group of checkbox cards: the user picks several values. Each
 * card shows a surface Checkbox at its trailing edge (Radix).
 */
export const CheckboxCards = createSelectionCards({
  name: 'CheckboxCards',
  type: 'multiple',
  rootRole: 'group',
  itemRole: 'checkbox',
  recipe: 'checkboxCard',
  kind: CheckboxToggle,
})
