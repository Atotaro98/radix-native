# Grid

> Responsive grid layout with columns and gap.

## Import
```tsx
import { Grid } from 'radix-native'
```

## Props
| Prop | Type | Default |
|------|------|---------|
| columns | `number` | `1` |
| gap, gapX, gapY | `SpaceToken` | — |
| align | `'start' \| 'center' \| 'end' \| 'stretch'` | — |
| justify | `'start' \| 'center' \| 'end'` | — |
| width, height, p, px, py | `SpaceToken` | — |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — |

## Examples
```tsx
<Grid columns={2} gap={3}>
  <Card><Text>Item 1</Text></Card>
  <Card><Text>Item 2</Text></Card>
  <Card><Text>Item 3</Text></Card>
  <Card><Text>Item 4</Text></Card>
</Grid>

<Grid columns={3} gap={4} gapY={2}>
  {items.map(item => <Card key={item.id}>...</Card>)}
</Grid>
```

Uses `onLayout` to measure container width and compute cell dimensions.
