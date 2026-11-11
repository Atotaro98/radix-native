# Skeleton

> Replaces content with a pulsing placeholder that keeps its size and shape while loading.

## Import

```tsx
import { Skeleton } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| loading | `boolean` | `true` | `false` renders the children as they are |
| width, minWidth, maxWidth, height, minHeight, maxHeight | `DimensionValue` | — | Size of the placeholder |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Examples

```tsx
// Sized placeholder (empty: space-3 tall)
<Skeleton width={48} height={48} />

// Text: takes the surrounding text's size
<Text><Skeleton>Lorem ipsum dolor sit amet.</Skeleton></Text>

// A component keeps its own shape (pill button, round radio, switch track)
<Skeleton loading={loading}>
  <Button>Submit</Button>
</Skeleton>
```

## Behaviour (skeleton.css)

- Pulses `gray-a4` → `gray-a3` and back, 1000ms each way, CSS `ease`.
- Radius: `radius-1`, unless the wrapped component has its own (Button, IconButton, Badge, Avatar, Card, TextField, TextArea, Checkbox, Radio, Switch, or Box / Flex / Grid with `radius`) — the outermost one wins, as in Radix.
- Hidden from screen readers and never takes touches.
- The children stay laid out (invisible), so the placeholder has their exact size.

## Known RN limitations

- Radix draws one bar per text line; RN draws one block over all lines, sized like a Text in the same spot.
- Radix styles the child itself; RN wraps it in a View, so the child's margins sit inside the placeholder.
