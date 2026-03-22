# Code

> Inline code with variants and accent colors.

## Import
```tsx
import { Code } from 'radix-native'
```

## Props
| Prop | Type | Default |
|------|------|---------|
| size | `1-9` | inherits from parent |
| variant | `'solid' \| 'soft' \| 'outline' \| 'ghost'` | `'soft'` |
| weight | `'light' \| 'regular' \| 'medium' \| 'bold'` | `'regular'` |
| color, highContrast | `AccentColor`, `boolean` | — |

## Examples
```tsx
<Text>Run <Code>npm install</Code> to start</Text>
<Code variant="outline" color="red">error</Code>
```

Uses the `code` font from ThemeFonts (monospace).

## Variant details

- **solid**: bg `accent-9`, text `accent-contrast`. HighContrast: bg `accent-12`, text `accent-1`.
- **soft**: bg `accent-a3`, text `accent-a11`. HighContrast: text `accent-12`.
- **outline**: border `accent-a8`, text `accent-a11`. No background.
- **ghost**: no bg, no border, no padding. Text `accent-a11`.

Font-size is 0.95x of the size token. Ghost variant has zero padding; others have 0.1em vertical, 0.25em horizontal.

## Known RN limitations

- **Inline sizing**: Radix Code uses `0.95em` font-size (relative to parent). RN has no `em` units — we multiply the font-size token by 0.95.
- **Outline border**: Radix uses `box-shadow: inset 0 0 0 max(1px, 0.033em)`. We use `borderWidth: 1`.
- **Hover states**: Radix changes background on hover for soft/outline. No hover in touch UIs.
