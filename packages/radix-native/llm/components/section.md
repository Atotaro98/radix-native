# Section

> Denotes a section of page content with consistent vertical spacing.

## Import

```tsx
import { Section } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1-4` | `3` | Vertical padding: space-5 (24) / space-7 (40) / space-9 (64) / 80px, scaled |
| display | `'none' \| 'initial'` | — | `'none'` hides it |
| Layout props | | — | `p`, `py`, `pt`, `pb` override the size's padding |

## Examples

```tsx
<Section size={2}>
  <Heading>Features</Heading>
</Section>
```
