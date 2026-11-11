# Popover

> Floating element that shows rich content next to a trigger.

## Import

```tsx
import { Popover } from 'radix-native'
```

## Parts and props

- **Popover.Root**: `open`, `defaultOpen`, `onOpenChange`, `modal` (default false).
- **Popover.Trigger**: one element; its `onPress` toggles the popover and it is the anchor.
- **Popover.Anchor**: anchors the content to another element.
- **Popover.Content**: `size` (`1-4`, default 2: padding 12/16/24/32), `width`, `minWidth`, `maxWidth` (480), `height`, `minHeight`, `maxHeight`, and placement: `side` ('bottom'), `sideOffset` (8), `align` ('start'), `alignOffset` (0), `avoidCollisions` (true), `collisionPadding` (10), `sticky` ('partial').
- **Popover.Close**: one element; its `onPress` closes.

## Examples

```tsx
<Popover.Root>
  <Popover.Trigger><Button variant="soft">Comment</Button></Popover.Trigger>
  <Popover.Content width={360}>
    <TextArea placeholder="Write a comment…" style={{ height: 80 }} />
    <Flex direction="row" justify="end" mt={3}>
      <Popover.Close><Button size={1}>Comment</Button></Popover.Close>
    </Flex>
  </Popover.Content>
</Popover.Root>
```

## Behaviour

- Placed with Radix's Popper rules: flips to the other side when it doesn't fit, shifts to stay 10px inside the screen (and the Theme's `safeAreaInsets`), at least as wide as the trigger, as tall as the space left (then scrolls).
- Not modal: a touch outside closes it and still reaches what's underneath; `modal` swallows that touch instead. The Android back button closes it.
- Opens in 160ms (fade, slide 4px toward the trigger, scale 0.97), closes in 100ms; no animation under Reduce Motion.
- Inside a Dialog it draws above the dialog. An `Inset` inside bleeds to its edges.
- The content renders in a portal: React contexts of your own above the Popover don't reach it (radix-native's own do).
