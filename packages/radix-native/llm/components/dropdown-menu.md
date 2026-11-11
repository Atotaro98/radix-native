# DropdownMenu

> Menu of actions or options opened from a button.

## Import

```tsx
import { DropdownMenu } from 'radix-native'
```

## Parts and props

- **Root**: `open`, `defaultOpen`, `onOpenChange`.
- **Trigger**: one element; its `onPress` toggles the menu.
- **Content**: `size` (`1 | 2`, default 2), `variant` (`'solid' | 'soft'`), `color`, `highContrast`, placement (`side` bottom, `sideOffset` 4, `align` start, `collisionPadding` 10…).
- **Item**: `color`, `shortcut`, `disabled`, `onSelect(event)` — the whole menu closes unless `event.preventDefault()`.
- **CheckboxItem**: `checked` (`boolean | 'indeterminate'`), `onCheckedChange`; closes like an item.
- **RadioGroup** (`value`, `onValueChange`) / **RadioItem** (`value`).
- **Label**, **Group**, **Separator**.
- **Sub** / **SubTrigger** / **SubContent**: a press on the SubTrigger opens the sub-menu to its right (it inherits size, variant, color, high contrast); the parent stays open.

## Examples

```tsx
<DropdownMenu.Root>
  <DropdownMenu.Trigger><Button variant="soft">Options</Button></DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
    <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>Move to project…</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Separator />
    <DropdownMenu.Item shortcut="⌘ ⌫" color="red">Delete</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>
```

## Behaviour

- Modal: a backdrop swallows outside touches; the Android back button closes the top-most (sub-)menu.
- When any checkbox or radio item is in a content, every row of that content reserves the indicator gutter (Radix `:has`).
- A pressed item is highlighted like Radix's `[data-highlighted]`: solid accent-9 / accent-contrast (high contrast accent-12), soft accent-a4.
- A sub-menu that fits on neither side stays on screen over its trigger.
