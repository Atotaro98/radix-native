# TextField

> Single-line text input with variants and focus state.

## Import

```tsx
import { TextField } from 'radix-native'
```

## Props

Extends `TextInputProps` (from React Native) minus `style`.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Input size |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Focus ring color |
| radius | `RadiusToken` | theme radius | Override border radius |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |
| placeholder | `string` | — | Placeholder text |
| value, onChangeText | standard RN | — | Controlled text input |

## Size reference

| Size | Height | Padding-x | Font-size |
|------|--------|-----------|-----------|
| 1 | 24px | 6px | 12px (fs-1) |
| 2 | 32px | 8px | 14px (fs-2) |
| 3 | 40px | 12px | 16px (fs-3) |

## Examples

```tsx
<TextField placeholder="Enter your name" />
<TextField variant="soft" size={3} placeholder="Large soft input" />
<TextField variant="classic" color="blue" placeholder="Classic blue" />
```

## Focus behavior

Border color changes to `accent-8` on focus. The `soft` variant uses a transparent border when unfocused (always reserves 1px space to prevent layout shift).

## Variant color behavior

- **classic/surface**: gray background, gray-12 text, gray-a10 placeholder
- **soft**: uses the **accent** color — bg `accent-a3`, text `accent-12`, placeholder `accent-a10`. This matches Radix web where soft TextField uses the component's accent color for everything.

## Known RN limitations

- **Focus indicator**: Radix uses `outline: 2px solid accent-8` with `outline-offset: -1px`. RN has no outline — we change `borderColor` to `accent-8` on focus. Border is always 1px (reserved space prevents layout jump).
- **Classic shadow**: Radix uses `box-shadow: var(--shadow-1)` for the classic variant. RN shadow is less precise.
- **Selection color**: Radix uses `accent-a5` for text selection. RN text selection color is controlled at the OS level.

## Related

- `TextArea` — multi-line variant (same props minus `multiline`)
