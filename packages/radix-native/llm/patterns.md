# Component Patterns

Patterns shared by all radix-native components. Use these when building custom components that integrate with the radix-native theme system.

## Color resolution

```tsx
import { useColor } from 'radix-native'

// Two-param form (preferred):
const bg = useColor('accent', 9)          // solid background
const softBg = useColor('accent', 'a3')   // soft background
const text = useColor('accent', 'contrast') // text on solid bg
const surface = useColor('accent', 'surface') // translucent surface
const border = useColor('gray', 'a7')     // border color

// Single-param form:
const gray1 = useColor('gray-1')
```

## Margin props

All components accept spacing-token-based margin props:

```tsx
<Button mt={3} mx={2}>Save</Button>  // marginTop: 12px, marginHorizontal: 8px
<Avatar m={4} />                       // margin: 16px all sides
```

When building custom components:

```tsx
import { useMargins } from 'radix-native'
import type { MarginProps } from 'radix-native'

interface MyProps extends MarginProps {
  // your props
}

function MyComponent({ m, mx, my, mt, mr, mb, ml, ...props }: MyProps) {
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  return <View style={[{ /* your styles */ }, margins]} />
}
```

## Variant color pattern

Most interactive components follow the same color logic per variant:

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| solid | `accent-9` | `accent-contrast` | none |
| soft | `accent-a3` | `accent-a11` | none |
| surface | `accent-surface` | `accent-a11` | `accent-a7` |
| outline | transparent | `accent-a11` | `accent-a8` |
| ghost | transparent | `accent-a11` | none |
| classic | `accent-9` + gradient overlay | `accent-contrast` | none |

With `highContrast`:
- solid: bg=`accent-12`, text=`gray-1`
- others: text=`accent-12`

Disabled state always uses `gray-a3` bg, `gray-a8` text.

## Scaling

All dimensions (height, padding, gap, font-size, radius) multiply by the theme scaling factor:

```tsx
const { scaling } = useThemeContext()
const scalingFactor = scalingMap[scaling]  // 0.9 | 0.95 | 1 | 1.05 | 1.1

const resolvedHeight = Math.round(BASE_HEIGHT * scalingFactor)
```

## Radius computation

```tsx
import { getRadius, getFullRadius } from 'radix-native'

const effectiveRadius = radiusProp ?? themeRadius

// Standard (most components):
const borderRadius = Math.max(
  getRadius(effectiveRadius, level),    // level 1-6 based on component size
  getFullRadius(effectiveRadius),       // 9999 only when token='full'
)

// Card/TextArea (never pill-shaped):
const borderRadius = getRadius(effectiveRadius, level)
```

## Press scale animation

All interactive components have a subtle press-down animation via `usePressScale`:

```tsx
import { usePressScale } from 'radix-native'

const { scaleStyle, handlePressIn, handlePressOut } = usePressScale(!disabled)

<Animated.View style={scaleStyle}>
  <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
    {children}
  </Pressable>
</Animated.View>
```

Applied to: Button, IconButton, Checkbox, Switch, Card (pressable). Scales to 0.97 on press, back to 1 on release. Uses `useNativeDriver: true`.

## Style memoization

Always memoize style objects and callbacks:

```tsx
const containerStyle = useMemo<ViewStyle>(() => ({
  height: resolvedHeight,
  borderRadius,
  backgroundColor: colors.bg,
  ...margins,
}), [resolvedHeight, borderRadius, colors, margins])

const handlePress = useCallback(() => {
  onPress?.()
}, [onPress])
```
