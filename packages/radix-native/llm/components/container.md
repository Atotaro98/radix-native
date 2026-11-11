# Container

> Constrains the maximum width of page content.

## Import

```tsx
import { Container } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1-4` | `4` | Max width of the content: 448 / 688 / 880 / 1136px (not scaled) |
| align | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment of the content |
| display | `'none' \| 'initial'` | — | `'none'` hides it |
| width, minWidth, maxWidth, height, minHeight, maxHeight | `DimensionValue` | — | Applied to the inner content View (override the size's max width) |
| Other Layout props (`p*`, `m*`, position, flex child, `bg`, `radius`) | | — | Applied to the outer View |

## Structure

Two Views, like Radix: an outer column (`flexGrow: 1`, `flexShrink: 0`, `alignItems` from `align`) and an inner one (`width: '100%'`, `maxWidth` from `size`). Horizontal gutters are yours to add (`px`).

On a phone every size is wider than the screen, so Container is full width; it matters on tablets and the web.

## Examples

```tsx
<Box bg="gray-a2">
  <Container size={1} px={4}>
    <Text>Content limited to 448px</Text>
  </Container>
</Box>
```
