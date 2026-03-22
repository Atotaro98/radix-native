# Spinner

> Loading indicator with staggered fade animation.

## Import
```tsx
import { Spinner } from 'radix-native'
```

## Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Spinner size (16/20/25 px) |
| loading | `boolean` | `true` | When false, renders children instead |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Size reference
| Size | Pixels |
|------|--------|
| 1 | 16px |
| 2 | 20px |
| 3 | 25px |

## Examples
```tsx
<Spinner />
<Spinner size={1} />
<Spinner size={3} />

// Loading wrapper — shows spinner, preserves children layout
<Spinner loading={isLoading}>
  <Text>Content</Text>
</Spinner>
```

## How it works
8 leaves rotated 45deg apart, each with staggered opacity fade (800ms, linear, infinite). Overall opacity 0.65. Uses `gray-a11` color (inherits text color intent). Animation uses `useNativeDriver: true`.

## Differences from Radix web
- Radix uses CSS keyframes with `currentColor`. We use Animated API with explicit color.
- No `currentColor` in RN — uses `gray-a11` as default.
