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

## Metrics (scaling and radius)

Sizes, spacing and radius come from `useMetrics`, which applies the Theme scaling and
radius factor the way Radix does (fonts are scaled by the Text style):

```tsx
import { useMetrics } from 'radix-native'

const metrics = useMetrics({ radius: radiusProp })   // radius prop overrides the Theme's

const height = metrics.px(32)                // calc(32px * var(--scaling)), rounded
const gap = metrics.space(2)                 // var(--space-2), rounded

metrics.radius(level)                        // var(--radius-N) = Npx × scaling × radius-factor
metrics.radius(level, 'pill')                // max(var(--radius-N), var(--radius-full))
metrics.radius(level, 'thumb')               // max(var(--radius-N), var(--radius-thumb))

// Raw Radix variables for one-off calc() formulas:
const kbdRadius = metrics.radiusFactor * 0.35 * fontSize   // calc(var(--radius-factor) * 0.35em)
```

Radius is not rounded: Radix keeps fractional values.

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
