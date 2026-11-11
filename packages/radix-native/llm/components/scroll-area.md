# ScrollArea

> Scrollable area on the platform's native scroll views.

## Import

```tsx
import { ScrollArea } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| scrollbars | `'vertical' \| 'horizontal' \| 'both'` | `'both'` | Axes that scroll; an omitted axis doesn't (Radix) |
| type | `'auto' \| 'always' \| 'scroll' \| 'hover'` | `'hover'` | `always` keeps indicators visible on Android; the rest show them while scrolling |
| size | `1 \| 2 \| 3` | `1` | No effect: native indicators can't be sized (API parity) |
| radius | `RadiusToken` | theme | No effect on native indicators (API parity) |
| contentContainerStyle | `StyleProp<ViewStyle>` | — | Style of the scrolling content |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | |

The ref is the outer ScrollView (Radix: the viewport).

## Examples

```tsx
<Box height={180}>
  <ScrollArea type="always" scrollbars="vertical">
    <Box p={2} pr={8}>
      <Heading size={4} mb={2}>Three fundamental aspects of typography</Heading>
      <Text>Legibility describes how easily individual characters can be distinguished…</Text>
    </Box>
  </ScrollArea>
</Box>
```

`both` nests a horizontal ScrollView in a vertical one and stacks the children in a column, because an Android ScrollView scrolls one axis.
