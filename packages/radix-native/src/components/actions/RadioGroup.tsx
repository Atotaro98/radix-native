import { createControlGroup, type ControlGroupProps, type ControlGroupItemProps } from '../internal/controlGroup'
import { Radio, RadioToggle, type RadioSize, type RadioVariant } from './Radio'

/** Props of RadioGroup: one value (`string`), Radio sizes and variants. */
export type RadioGroupProps = ControlGroupProps<'single', RadioSize, RadioVariant>
export type RadioGroupItemProps = ControlGroupItemProps

/**
 * A Selection group of radios: the user picks one value.
 * `RadioGroup.Item` with a label is one accessible row; without one, the Radio itself.
 */
export const RadioGroup = createControlGroup<'single', RadioSize, RadioVariant>({
  name: 'RadioGroup',
  type: 'single',
  rootRole: 'radiogroup',
  itemRole: 'radio',
  Control: Radio,
  kind: RadioToggle,
})
