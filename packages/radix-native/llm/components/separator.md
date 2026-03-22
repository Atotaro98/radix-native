# Separator

> Visual divider between content sections.

## Import

```tsx
import { Separator } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3 \| 4` | `1` | Length (not thickness). 4 = full width/height |
| color | `AccentColor` | `'gray'` | Line color (uses step a6) |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Line orientation |
| decorative | `boolean` | `true` | When true, hidden from screen readers |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Size reference

| Size | Length |
|------|--------|
| 1 | 16px (space-4) |
| 2 | 32px (space-6) |
| 3 | 64px (space-9) |
| 4 | 100% |

Thickness is always `StyleSheet.hairlineWidth` (1 physical pixel — typically 0.5pt on retina screens).

## Examples

```tsx
// Default (short gray line, 16px)
<Separator />

// Full width
<Separator size={4} />

// Vertical in a row
<Flex direction="row" align="center" gap={3}>
  <Text>Left</Text>
  <Separator orientation="vertical" size={2} />
  <Text>Right</Text>
</Flex>

// Colored
<Separator color="red" />
```
