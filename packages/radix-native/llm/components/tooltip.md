# Tooltip

> Floating label that explains the element it points at.

## Import

```tsx
import { Tooltip } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| content | `ReactNode` | required | What it says (a string is also the trigger's accessibility hint) |
| children | element | required | The trigger |
| open / defaultOpen / onOpenChange | | — | |
| side / sideOffset / align | | `'top'` / `4` / `'center'` | Placement (plus `alignOffset`, `avoidCollisions`, `collisionPadding` 10, `sticky`) |
| width / minWidth / maxWidth | `DimensionValue` | `maxWidth` 360 | |
| delayDuration | `number` | — | Accepted for API parity |

## Examples

```tsx
<Tooltip content="Add to library">
  <IconButton accessibilityLabel="Add"><PlusIcon /></IconButton>
</Tooltip>
```

## Behaviour

Radix shows a tooltip on hover or keyboard focus, which touch screens lack. Here a **long-press** shows it until the finger lifts; a tap still presses the trigger. gray-12 background, gray-1 text size 1, radius-2, a 10 × 5 arrow pointing at the trigger; opens in 140ms, closes instantly, as in Radix.
