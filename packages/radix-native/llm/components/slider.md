# Slider

> Provides user selection from a range of values.

## Import

```tsx
import { Slider } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Track 6 / 8 / 10px; thumb track + space-1 |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | |
| color | `AccentColor` | theme accent | |
| highContrast | `boolean` | — | Darkens the range (light mode only, as in Radix) |
| radius | `RadiusToken` | theme | |
| value / defaultValue | `number[]` | — | One value, or several for a range. Without either, no thumbs (Radix Themes) |
| onValueChange | `(value: number[]) => void` | — | Every change while dragging |
| onValueCommit | `(value: number[]) => void` | — | On release if changed; on every accessibility increment / decrement |
| min / max / step | `number` | `0` / `100` / `1` | |
| minStepsBetweenThumbs | `number` | `0` | A move that brings thumbs closer is rejected (the thumb stops) |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Vertical slides from the bottom |
| inverted | `boolean` | `false` | Slide from the right (vertical: from the top) |
| disabled | `boolean` | `false` | |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | |

## Examples

```tsx
<Slider defaultValue={[50]} />
<Slider defaultValue={[25, 75]} />
<Slider defaultValue={[50]} orientation="vertical" style={{ height: 160 }} />
```

## Behaviour

- Pressing the track moves the closest thumb there; thumbs may cross and the value stays sorted.
- Each thumb is an adjustable element (Minimum / Maximum for two thumbs) that screen readers step by `step`.
- The thumb stays inside the track: its centre runs from half a thumb to the far end minus half a thumb.
