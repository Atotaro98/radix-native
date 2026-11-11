# Callout

> Short message to attract the user's attention.

## Import

```tsx
import { Callout } from 'radix-native'
```

## Parts and props

**Callout.Root**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Padding 12/16/24, gaps, radius-3/4/5; text size 2/2/3 |
| variant | `'soft' \| 'surface' \| 'outline'` | `'soft'` | soft accent-a3; surface accent-a2 + accent-a6 ring; outline accent-a7 ring |
| color | `AccentColor` | theme accent | |
| highContrast | `boolean` | — | Text and icons accent-12 instead of accent-a11 |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | |

**Callout.Icon**: View props. Icons without their own `color` take the callout's color (RN has no `currentColor`); the row is one text line tall.

**Callout.Text**: Text props. Size from the callout; color from the callout unless it sets `color` / `highContrast`.

## Examples

```tsx
<Callout.Root>
  <Callout.Icon>
    <InfoIcon />
  </Callout.Icon>
  <Callout.Text>You will need admin privileges to install and access this application.</Callout.Text>
</Callout.Root>

// Urgent message (Radix role="alert")
<Callout.Root color="red" accessibilityRole="alert">…</Callout.Root>
```

## Layout

Like Radix's grid: icons in a left column (wherever they appear among the children), everything else stacked in the right column with the size's row gap. The ring of surface / outline is drawn over the content and takes no layout space.
