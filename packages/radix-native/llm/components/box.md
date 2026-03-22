# Box

> Generic layout container. Thin wrapper over View with spacing token props.

## Import
```tsx
import { Box } from 'radix-native'
```

## Props
| Prop | Type | Default |
|------|------|---------|
| p, px, py | `SpaceToken` | — |
| width, height, minWidth, minHeight, maxWidth | `SpaceToken` | — |
| flexGrow, flexShrink | `number` | — |
| overflow | `'hidden' \| 'visible' \| 'scroll'` | — |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — |

## Examples
```tsx
<Box p={4} width={9}><Text>Padded box</Text></Box>
<Box flexGrow={1} overflow="hidden">{children}</Box>
```
