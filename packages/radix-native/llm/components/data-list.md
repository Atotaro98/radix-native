# DataList

> Displays metadata as a list of key-value pairs.

## Import

```tsx
import { DataList } from 'radix-native'
```

## Parts and props

**DataList.Root**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Label beside or above the value |
| size | `1 \| 2 \| 3` | `2` | Text size 1/2/3; gap 12/16/20 |
| trim | `'normal' \| 'start' \| 'end' \| 'both'` | — | Removes the leading above the first / below the last item |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | |

**DataList.Item**: `align` (`'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch'`, default baseline).

**DataList.Label**: `width`, `minWidth`, `maxWidth`, `color`, `highContrast`. gray-a11 by default (gray-12 high contrast); with `color` accent-a11 / accent-12.

**DataList.Value**: View props.

## Examples

```tsx
<DataList.Root>
  <DataList.Item align="center">
    <DataList.Label minWidth={88}>Status</DataList.Label>
    <DataList.Value>
      <Badge color="jade" variant="soft" radius="full">Authorized</Badge>
    </DataList.Value>
  </DataList.Item>
  <DataList.Item>
    <DataList.Label minWidth={88}>ID</DataList.Label>
    <DataList.Value>
      <Code variant="ghost">u_2J89JSA4GJ</Code>
    </DataList.Value>
  </DataList.Item>
</DataList.Root>
```

## Layout

- Horizontal: like Radix's subgrid, every label takes the widest label's width (at least 120px, unscaled). The list is hidden for the first frame while the labels are measured.
- Text, Link, Code, Em, Strong, Quote and Kbd inside a label or value take the list's text size; other elements (Badge, Button, Flex) keep their own.
- A value may poke 0.25em above and below its row (tall content like a Badge), except at the list's top and bottom edges.
