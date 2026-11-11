# Select

> Displays a list of options for the user to pick from.

## Import

```tsx
import { Select } from 'radix-native'
```

## Parts and props

- **Select.Root**: `size` (`1-3`, default 2; trigger and content), `value`, `defaultValue`, `onValueChange`, `open`, `defaultOpen`, `onOpenChange`, `disabled`.
- **Select.Trigger**: `variant` (`'surface' | 'classic' | 'soft' | 'ghost'`), `color`, `radius`, `placeholder`, margins. Shows the selected item's text (or its own children).
- **Select.Content**: `variant` (`'solid' | 'soft'`), `color`, `highContrast`, `position` (`'item-aligned'` default, as Radix, or `'popper'`), popper placement props.
- **Select.Item**: `value` (required; `''` means "no value"), `disabled`, `textValue`.
- **Select.Group**, **Select.Label**, **Select.Separator**.

## Examples

```tsx
<Select.Root defaultValue="apple">
  <Select.Trigger />
  <Select.Content>
    <Select.Group>
      <Select.Label>Fruits</Select.Label>
      <Select.Item value="orange">Orange</Select.Item>
      <Select.Item value="apple">Apple</Select.Item>
      <Select.Item value="grape" disabled>Grape</Select.Item>
    </Select.Group>
    <Select.Separator />
    <Select.Group>
      <Select.Label>Vegetables</Select.Label>
      <Select.Item value="carrot">Carrot</Select.Item>
      <Select.Item value="potato">Potato</Select.Item>
    </Select.Group>
  </Select.Content>
</Select.Root>
```

## Behaviour

- `item-aligned`: the list opens with the selected item's text right over the trigger's value text, kept 10px inside the screen; it fades in (no slide). `popper`: below the trigger, aligned to its start, 4px away, at least as wide.
- The content's rows are registered even while the list is closed, so the trigger shows the selected text from the first render — items may live in components of their own.
- The list is modal (outside touches close it); every item reserves the check gutter on the left and the same padding on the right.
- No typeahead (no hardware keyboard on touch); the trigger is announced as a combobox with its value.
