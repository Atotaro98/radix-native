# Radio

> Single radio button. Usually used inside RadioGroup.

## Import
```tsx
import { Radio } from 'radix-native'
```

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Radio size |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases contrast |
| checked | `boolean` | `false` | Selected state |
| disabled | `boolean` | `false` | Disables radio |
| onPress | `() => void` | — | Press handler |

## Size reference
| Size | Pixels | Dot (40%) |
|------|--------|-----------|
| 1 | 14px | 6px |
| 2 | 16px | 6px |
| 3 | 20px | 8px |

## Examples
```tsx
<Radio checked />
<Radio variant="soft" checked color="blue" />
```

## Related
- `RadioGroup` — group of labeled radios with shared state
