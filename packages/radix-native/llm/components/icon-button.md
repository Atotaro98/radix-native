# IconButton

> Square button designed for a single icon.

## Import

```tsx
import { IconButton } from 'radix-native'
```

## Props

Same as Button but square (width = height) and no text wrapping.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3 \| 4` | `2` | Button size (square) |
| variant | `'classic' \| 'solid' \| 'soft' \| 'surface' \| 'outline' \| 'ghost'` | `'solid'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| radius | `RadiusToken` | theme radius | Override border radius |
| loading | `boolean` | `false` | Shows spinner |
| disabled | `boolean` | `false` | Disables button |
| children | `ReactNode` | — | Icon element (receives `color` prop automatically) |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |
| onPress | `(e) => void` | — | Press handler |

## Size reference

| Size | Box (px) | Ghost padding | Spinner |
|------|----------|---------------|---------|
| 1 | 24 | 4px | 16px |
| 2 | 32 | 6px | 20px |
| 3 | 40 | 8px | 20px |
| 4 | 48 | 12px | 24px |

## Icon color

Children receive `color` prop via `cloneElement`, so icon components that accept a `color` prop will automatically match the button's variant color:

```tsx
// MyIcon receives { color: '#fff' } automatically for solid variant
<IconButton variant="solid">
  <MyIcon size={16} />
</IconButton>
```

## Examples

```tsx
<IconButton><TrashIcon /></IconButton>
<IconButton variant="soft" color="red"><TrashIcon /></IconButton>
<IconButton variant="ghost" size={1}><CloseIcon /></IconButton>
<IconButton loading><SaveIcon /></IconButton>
```
