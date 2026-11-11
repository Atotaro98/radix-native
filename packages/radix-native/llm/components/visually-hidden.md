# VisuallyHidden

> Hides content on screen while keeping it readable by screen readers.

## Import

```tsx
import { VisuallyHidden } from 'radix-native'
```

## Props

View props. `style` is merged after the hidden style, so it can override it. Strings are wrapped in a `Text`.

## Examples

```tsx
<Flex direction="row" gap={2}>
  <Text>⚙</Text>
  <VisuallyHidden>Settings</VisuallyHidden>
</Flex>
```

## How it hides

Radix's `VISUALLY_HIDDEN_STYLES`: absolute, 1×1, margin −1, overflow hidden. RN has no `clip`, so `opacity: 0` hides the 1px left. Never `display: 'none'` or `accessibilityElementsHidden`, which remove it from the accessibility tree.

Often an `accessibilityLabel` on the parent is the simpler RN answer; use VisuallyHidden when the text must exist as content (e.g. a hidden Dialog title).
