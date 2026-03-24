# Badge

> Annotation label with variants and colors.

## Import

```tsx
import { Badge } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `1` | Badge size |
| variant | `'solid' \| 'soft' \| 'surface' \| 'outline'` | `'soft'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| radius | `RadiusToken` | theme radius | Override border radius |
| children | `ReactNode` | — | Badge content (string auto-wrapped in Text) |
| maxFontSizeMultiplier | `number` | `2` (fallback) | Caps font scaling for accessibility. Local prop > Theme global > 2 |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Size reference

| Size | Height | Padding-x | Gap | Font-size |
|------|--------|-----------|-----|-----------|
| 1 | 20px | 6px | 6px | 12px (fs-1) |
| 2 | 24px | 8px | 6px | 12px (fs-1) |
| 3 | 28px | 10px | 8px | 14px (fs-2) |

## Examples

```tsx
<Badge>Default</Badge>
<Badge variant="solid" color="green">Active</Badge>
<Badge variant="outline" color="red" size={2}>Error</Badge>
<Badge highContrast>High contrast</Badge>
```
