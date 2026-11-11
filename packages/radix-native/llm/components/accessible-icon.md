# AccessibleIcon

> Makes an icon accessible by giving it a label.

## Import

```tsx
import { AccessibleIcon } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | `string` | required | Announced in place of the icon |
| children | `ReactElement` | required | Exactly one icon |

## Examples

```tsx
<IconButton variant="ghost">
  <AccessibleIcon label="Close">
    <CloseIcon />
  </AccessibleIcon>
</IconButton>
```

## Behaviour

- The icon is hidden from screen readers; the label is read instead.
- Standalone: one accessible element with role `image`, named by the label.
- Inside a button (Button, IconButton) or a pressable Card: not a separate element; the label becomes part of the control's name, and the icon is still tinted with the button's text color.

Radix adds a visually hidden sibling with the label; RN cannot add a sibling to the icon, so AccessibleIcon wraps it in one View.
