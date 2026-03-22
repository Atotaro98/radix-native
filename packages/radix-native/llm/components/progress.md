# Progress

> Progress bar for determinate and indeterminate loading states.

## Import
```tsx
import { Progress } from 'radix-native'
```

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Bar height |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Indicator color |
| highContrast | `boolean` | — | Uses accent-12 for indicator |
| radius | `RadiusToken` | theme radius | Override border radius |
| value | `number` | — | Current value (0–max). Omit for indeterminate |
| max | `number` | `100` | Maximum value |

## Size reference
| Size | Height |
|------|--------|
| 1 | 4px |
| 2 | 6px |
| 3 | 8px |

## Examples
```tsx
// Determinate
<Progress value={60} />
<Progress value={30} max={50} color="green" />

// Indeterminate (no value prop)
<Progress />
<Progress size={3} color="blue" />
```

## Known RN limitations
- Radix indeterminate has a complex 3-phase animation (grow, fade, pulse + shine). We use a simplified grow loop.
- No shine gradient overlay (requires LinearGradient which is an external dep).
