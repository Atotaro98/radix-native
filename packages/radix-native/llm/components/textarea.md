# TextArea

> Multi-line text input. Same API as TextField but always multiline.

## Import
```tsx
import { TextArea } from 'radix-native'
```

## Props
Same as TextField (extends `TextInputProps` minus `style` and `multiline`).

| Prop | Type | Default |
|------|------|---------|
| size | `1 \| 2 \| 3` | `2` |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` |
| color | `AccentColor` | theme accent |
| radius | `RadiusToken` | theme radius |

## Size reference

| Size | Padding-x | Padding-y | Font-size |
|------|-----------|-----------|-----------|
| 1 | 6px | 4px | 12px (fs-1) |
| 2 | 8px | 6px | 14px (fs-2) |
| 3 | 12px | 8px | 16px (fs-3) |

## Variant color behavior

Same as TextField: soft variant uses accent colors (bg `accent-a3`, text `accent-12`, placeholder `accent-a10`), not gray.

## Radius behavior
Uses bare `getRadius(level)` — never becomes pill-shaped (unlike TextField which uses `max(radius, radiusFull)`).

## Known RN limitations
Same as TextField: no CSS outline for focus (uses border color change), no classic box-shadow, no text selection color control.

## Examples
```tsx
<TextArea placeholder="Write a message..." />
<TextArea variant="soft" size={3} />
```
