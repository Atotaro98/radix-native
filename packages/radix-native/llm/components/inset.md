# Inset

> Bleeds content (an image, a table) to the edge of the surrounding Card or CheckboxCards / RadioCards item.

## Import

```tsx
import { Inset } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| side | `'all' \| 'x' \| 'y' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'all'` | Which sides reach the Card's edge |
| clip | `'border-box' \| 'padding-box'` | `'border-box'` | `border-box` stops inside the Card's border (radius − border width); `padding-box` runs under the border to the outer edge (full radius) |
| p, px, py, pt, pr, pb, pl | `'current' \| '0'` | — | `'current'` restores the Card's own padding on that side (e.g. `pb="current"` below a bled image) |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Added to the negative margin on pulled sides |

Not Layout props: only these padding values, no size props (Radix `inset.props.tsx`).

## Examples

```tsx
<Card size={2}>
  <Inset clip="padding-box" side="top" pb="current">
    <Image source={cover} style={{ height: 140 }} />
  </Inset>
  <Text>Body text keeps the card padding.</Text>
</Card>
```

## How it resolves

Card and card items (CheckboxCards, RadioCards) publish Radix's `--inset-*` values through context: padding = card padding − border width, border width (1, ghost 0), radius. A pulled side gets `margin − pull`, where pull = padding (border-box) or padding + border width (padding-box). Outside a Card every value is 0: Inset only clips (`overflow: 'hidden'`).

Dialog, Popover and HoverCard content will provide the same context when they land.
