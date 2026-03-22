# Heading

> Section headings with semantic sizing.

## Import
```tsx
import { Heading } from 'radix-native'
```

## Props
| Prop | Type | Default |
|------|------|---------|
| size | `1-9` | `6` |
| weight | `'light' \| 'regular' \| 'medium' \| 'bold'` | `'bold'` |
| align | `'left' \| 'center' \| 'right'` | — |
| trim, truncate | same as Text | — |
| color, highContrast | `AccentColor`, `boolean` | — |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — |

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

Uses heading-specific line-heights and bold font by default.

## Examples
```tsx
<Heading>Page Title</Heading>
<Heading size={4} color="blue">Section</Heading>
<Heading size={8} align="center">Hero</Heading>
```
