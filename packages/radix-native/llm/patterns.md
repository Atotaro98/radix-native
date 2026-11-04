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

## Variant colors

Components never pick color tokens themselves. Each one asks its **Variant recipe**
(`src/utils/variantPalette.ts`) for the colors of its parts:

```tsx
const colors = useVariantColors('button', { variant, color, highContrast, disabled })
// → { bg, text, border, pressedBg, pressedOpacity }
```

Recipes are grouped by **Variant family** (buttons, chips, selection controls, tracks,
cards, text inputs, text) and mirror Radix Themes CSS selector by selector — Radix is
not uniform across families (e.g. solid high-contrast text is `gray-1` in Button but
`accent-1` in Badge), so there is no single variant → token table. Change colors in the
recipe, never in the component, and add a row to `__tests__/variantPalette.test.ts`.

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

All interactive components have a subtle press-down animation via `usePressScale` + `AnimatedPressable`:

```tsx
import { usePressScale, AnimatedPressable } from 'radix-native'

const { scaleStyle, handlePressIn, handlePressOut } = usePressScale(!disabled)

<AnimatedPressable
  style={[scaleStyle, containerStyle, style]}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  {children}
</AnimatedPressable>
```

Applied to: Button, IconButton, Checkbox, Switch, Radio, RadioCards, Card (pressable). Single node (no wrapper), scales to 0.97 on press, back to 1 on release. Runs on UI thread via `react-native-reanimated`.

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
