# Link

> Pressable text that opens URLs or triggers navigation.

## Import
```tsx
import { Link } from 'radix-native'
```

## Props
| Prop | Type | Default |
|------|------|---------|
| href | `string` | — |
| onPress | `(e) => void` | — |
| size | `1-9` | `3` |
| weight | `'light' \| 'regular' \| 'medium' \| 'bold'` | `'regular'` |
| underline | `'auto' \| 'always' \| 'hover' \| 'none'` | `'auto'` |
| color, highContrast | `AccentColor`, `boolean` | — |
| truncate | `boolean` | — |
| maxFontSizeMultiplier | `number` | — |
| allowFontScaling | `boolean` | `true` |

## Examples
```tsx
<Link href="https://example.com">Visit website</Link>
<Link onPress={() => navigate('/about')} color="blue">About</Link>
<Link underline="always" size={2}>Always underlined</Link>
```

When `href` is provided and no `onPress`, opens the URL via `Linking.openURL`.
