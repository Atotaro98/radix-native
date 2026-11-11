# AspectRatio

> Displays content within a desired ratio.

## Import

```tsx
import { AspectRatio } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ratio | `number` | `1` | Width ÷ height |

Like Radix, no margin or Layout props. It always takes its parent's full width.

## Examples

```tsx
<AspectRatio ratio={16 / 8}>
  <Image source={photo} style={{ width: '100%', height: '100%', borderRadius: 4 }} resizeMode="cover" />
</AspectRatio>
```

One View with RN's `aspectRatio` style replaces Radix's two divs (padding-bottom trick); `style` lands on that View.
