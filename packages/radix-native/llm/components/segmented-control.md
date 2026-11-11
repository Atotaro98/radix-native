# SegmentedControl

> Toggle buttons for switching between different values or views.

## Import

```tsx
import { SegmentedControl } from 'radix-native'
```

## Parts and props

**SegmentedControl.Root**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Height 24 / 32 / 40, text size 1 / 2 / 3 |
| variant | `'surface' \| 'classic'` | `'surface'` | Indicator ring (surface gray-a4) or raised (classic) |
| radius | `RadiusToken` | theme | `max(radius-N, radius-full)` |
| disabled | `boolean` | `false` | Disables every item (no per-item disabled, like Radix) |
| value / defaultValue | `string` | — | Single value; pressing the checked item doesn't clear it |
| onValueChange | `(value: string) => void` | — | |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | |

**SegmentedControl.Item**: `value` (required).

## Examples

```tsx
<SegmentedControl.Root defaultValue="inbox">
  <SegmentedControl.Item value="inbox">Inbox</SegmentedControl.Item>
  <SegmentedControl.Item value="drafts">Drafts</SegmentedControl.Item>
  <SegmentedControl.Item value="sent">Sent</SegmentedControl.Item>
</SegmentedControl.Root>
```

## Behaviour

- Every item is as wide as the widest (Radix's grid `1fr`); the control is hidden for the first frame while items are measured.
- The indicator slides to the checked item in 100ms (`cubic-bezier(.445,.05,.55,.95)`); separators and the label weight fade in 80ms. No animation under Reduce Motion.
- Labels render twice (medium over regular) so switching never changes the width.
- Gray only: no `color` prop, as in Radix.
