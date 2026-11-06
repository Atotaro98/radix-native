import { createControlGroup, type ControlGroupProps, type ControlGroupItemProps } from '../internal/controlGroup'
import { Checkbox, CheckboxToggle, type CheckboxSize, type CheckboxVariant } from './Checkbox'

/** Props of CheckboxGroup: several values (`string[]`), Checkbox sizes and variants. */
export type CheckboxGroupProps = ControlGroupProps<'multiple', CheckboxSize, CheckboxVariant>
export type CheckboxGroupItemProps = ControlGroupItemProps

/**
 * A Selection group of checkboxes: the user picks several values.
 * `CheckboxGroup.Item` with a label is one accessible row; without one, the Checkbox itself.
 */
export const CheckboxGroup = createControlGroup<'multiple', CheckboxSize, CheckboxVariant>({
  name: 'CheckboxGroup',
  type: 'multiple',
  rootRole: 'group',
  itemRole: 'checkbox',
  Control: Checkbox,
  kind: CheckboxToggle,
})
