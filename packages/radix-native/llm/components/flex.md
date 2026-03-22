# Flex

> Flexbox layout container with spacing tokens.

## Import

```tsx
import { Flex } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'` | `'column'` | Flex direction |
| align | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'` | — | Cross-axis alignment |
| justify | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — | Main-axis justification |
| wrap | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | — | Wrap behavior |
| gap | `SpaceToken` | — | Gap between children |
| p, px, py | `SpaceToken` | — | Padding tokens |
| width, height, minWidth, minHeight, maxWidth | `SpaceToken` | — | Dimension tokens |
| flexGrow, flexShrink | `number` | — | Flex grow/shrink |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin tokens |

## Examples

```tsx
// Horizontal row with gap
<Flex direction="row" gap={3} align="center">
  <Avatar fallback="A" />
  <Text>John Doe</Text>
</Flex>

// Vertical stack
<Flex gap={4} p={5}>
  <Heading>Title</Heading>
  <Text>Body text</Text>
  <Button>Action</Button>
</Flex>

// Centered content
<Flex align="center" justify="center" height={9}>
  <Text>Centered</Text>
</Flex>
```

## Related

- `Box` — simpler container without flex defaults
- `Grid` — responsive grid layout
