# Card

> Container with background, border, and optional press behavior.

## Import

```tsx
import { Card } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1-5` | `1` | Card size (controls padding) |
| variant | `'surface' \| 'classic' \| 'ghost'` | `'surface'` | Visual variant |
| onPress | `() => void` | — | Makes card pressable |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Examples

```tsx
<Card>
  <Text>Simple card content</Text>
</Card>

<Card size={3} variant="classic">
  <Heading size={4}>Card Title</Heading>
  <Text>Card body text</Text>
</Card>

// Pressable card
<Card onPress={() => navigate('/detail')}>
  <Text>Tap me</Text>
</Card>
```

## Size reference

| Size | Padding | Radius level |
|------|---------|-------------|
| 1 | 12px | 4 |
| 2 | 16px | 4 |
| 3 | 24px | 5 |
| 4 | 32px | 5 |
| 5 | 48px | 6 |

## Radius behavior

Card uses `metrics.radius(level)` (no pill shape) — it never becomes pill-shaped even with `radius="full"` on the theme. Radius levels vary by size: 1-2→level 4, 3-4→level 5, 5→level 6.

## Border and Inset

The 1px border is a ring drawn over the content, as Radix draws it on `::after`, so content starts exactly at the card padding. Card provides the values an `Inset` inside it needs (padding − border width, border width, radius).

## Ghost

Like Radix, a ghost Card has no border and pulls itself out by its padding (negative margins, added to any margin you pass), so its content lines up with the content around it.

## Known RN limitations

- **Surface/classic border**: Radix uses elaborate multi-layer `box-shadow` with `color-mix()` for the card border. RN draws one 1px ring overlay with the un-mixed token. Visual is close but lacks the depth.
- **Backdrop filter**: Radix applies `backdrop-filter` on the card panel. Not supported in RN.
- **Ghost hover**: Radix shows `gray-a3` background on hover. No hover in touch UIs — ghost card has no visible background until pressed.
