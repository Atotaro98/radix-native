# Text

> Body text with size, weight, color, alignment, and wrapping controls.

## Import

```tsx
import { Text } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1-9` | `3` | Font size token |
| weight | `'light' \| 'regular' \| 'medium' \| 'bold'` | `'regular'` | Font weight |
| align | `'left' \| 'center' \| 'right'` | — | Text alignment |
| wrap | `'wrap' \| 'nowrap' \| 'pretty' \| 'balance'` | — | Wrap behavior (pretty/balance map to wrap in RN) |
| trim | `'normal' \| 'start' \| 'end' \| 'both'` | — | Leading/trailing trim |
| truncate | `boolean` | — | Truncate with ellipsis (single line) |
| color | `AccentColor` | — | Override text color |
| highContrast | `boolean` | — | Use step 12 instead of 11 for colored text |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Size reference

| Size | Font-size | Line-height |
|------|-----------|-------------|
| 1 | 12px | 16px |
| 2 | 14px | 20px |
| 3 | 16px | 24px |
| 4 | 18px | 26px |
| 5 | 20px | 28px |
| 6 | 24px | 30px |
| 7 | 28px | 36px |
| 8 | 35px | 40px |
| 9 | 60px | 60px |

All dimensions multiply by the theme scaling factor.

## Examples

```tsx
<Text>Default body text</Text>
<Text size={5} weight="bold">Large bold text</Text>
<Text color="red" highContrast>Error message</Text>
<Text size={2} align="center" truncate>Long text that gets cut off...</Text>
```

## Related

- `Heading` — for section headings (uses heading font family, bolder sizes)
- `Link` — pressable text with underline
- `Code` — inline code
