# HoverCard

> Previews content behind a link.

## Import

```tsx
import { HoverCard } from 'radix-native'
```

## Parts and props

- **HoverCard.Root**: `open`, `defaultOpen`, `onOpenChange` (`openDelay` / `closeDelay` accepted for API parity).
- **HoverCard.Trigger**: one element; a **long-press** opens the card (Radix: hover); a tap still does what the element does.
- **HoverCard.Content**: `size` (`1-3`, default 2), `width`, `minWidth`, `maxWidth` (480), `height`…, placement (`side` bottom, `sideOffset` 8, `align` start, `collisionPadding` 10).

## Examples

```tsx
<HoverCard.Root>
  <HoverCard.Trigger><Link onPress={openProfile}>@radix_ui</Link></HoverCard.Trigger>
  <HoverCard.Content maxWidth={300}>
    <Text size={2}>React components, icons, and colors for building high-quality, accessible UI.</Text>
  </HoverCard.Content>
</HoverCard.Root>
```

Closes on an outside touch (which still reaches what's underneath) or the Android back button.
