# ContextMenu

> DropdownMenu opened with a long-press where the finger is.

## Import

```tsx
import { ContextMenu } from 'radix-native'
```

Same parts as [DropdownMenu](dropdown-menu.md), with:

- **Root**: `open`, `onOpenChange` (no `defaultOpen`, as in Radix).
- **Trigger**: the area that opens the menu; `disabled`, `style`. A 700ms long-press opens the menu at the touch point (Radix's touch path); screen readers get an "Open menu" action.
- **Content**: to the right of the touch point, the first item at the finger (`sideOffset` 2, `alignOffset` −4 × size).

```tsx
<ContextMenu.Root>
  <ContextMenu.Trigger style={{ height: 120 }}><Text>Long-press here</Text></ContextMenu.Trigger>
  <ContextMenu.Content>
    <ContextMenu.Item shortcut="⌘ E">Edit</ContextMenu.Item>
    <ContextMenu.Separator />
    <ContextMenu.Item shortcut="⌘ ⌫" color="red">Delete</ContextMenu.Item>
  </ContextMenu.Content>
</ContextMenu.Root>
```
