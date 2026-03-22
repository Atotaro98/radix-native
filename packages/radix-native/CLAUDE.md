# radix-native

React Native UI library that replicates the Radix Themes (web) API.
Same prop names, same variants, same tokens. Web devs use it instantly.

## Architecture

```
packages/radix-native/src/
  theme/          ThemeRoot (stateful) + ThemeImpl (inheritable) + Theme (public)
  hooks/          useThemeContext, useResolveColor, useResolveSpace, useMargins
  tokens/         colors/ (31 scales), spacing, typography, radius, scaling
  types/          nativeProps, marginProps
  utils/          resolveColor, resolveSpace, applyScaling, classicEffect
  components/
    layout/       Box, Flex, Grid, Separator, Card
    typography/   Text, Heading, Link, Blockquote, Code, Em, Strong, Quote, Kbd
    display/      Avatar, Badge
    actions/      Button, IconButton, Checkbox, CheckboxGroup, CheckboxCards, Switch, Radio, RadioGroup
    feedback/     Spinner, Progress
    forms/        TextField, TextArea
    playground/   ThemeControls
```

## Zero dependencies

The library has NO production dependencies. Only `react` and `react-native` as peer deps.
All animations use `Animated` from RN. All icons/indicators drawn with `View` borders.
Never add external deps — this is a hard rule.

## Key patterns

### Color resolution — `rc(color, step)`

```tsx
const rc = useResolveColor()

// Two-param form (preferred — type-safe, no casts):
rc('accent', 9)        // theme accent at step 9
rc(prefix, 'a3')       // alpha step
rc('gray', 'surface')  // special step
rc(prefix, 'contrast') // contrast text

// Single-param form (for static tokens):
rc('gray-1')
```

Steps: solid `1-12` (numbers), alpha `'a1'-'a12'` (strings), special `'contrast' | 'surface'`.

### Margins — `useMargins`

All components accept `m, mx, my, mt, mr, mb, ml` props (margin tokens).
Internally resolved via `useMargins({ m, mx, my, mt, mr, mb, ml })` which returns a memoized `ViewStyle`.

```tsx
// In component interface:
export interface MyProps extends NativeViewProps, MarginProps { ... }

// In component body:
const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
// Then spread into style: { ...otherStyles, ...margins }
```

### Radius

```tsx
import { getRadius, getFullRadius } from 'radix-native'

// Most components:
const borderRadius = Math.max(
  getRadius(effectiveRadius, SIZE_RADIUS_LEVEL[size]),
  getFullRadius(effectiveRadius),
)

// Card, TextArea (no pill shape):
const borderRadius = getRadius(radius, level)

// Switch (uses thumb radius):
import { getRadiusThumb } from '../../tokens/radius'
const trackRadius = Math.max(getRadius(r, level), getRadiusThumb(r))
```

### Variant colors

Components compute colors in a `useMemo` with a switch on `variant`:
```tsx
const colors = useMemo(() => {
  const hc = highContrast
  switch (variant) {
    case 'solid': {
      const bg = hc ? rc(prefix, 12) : rc(prefix, 9)
      const text = hc ? rc('gray', 1) : rc(prefix, 'contrast')
      return { bg, text, border: undefined }
    }
    case 'soft': { ... }
    case 'surface': { ... }
    case 'outline': { ... }
    case 'ghost': { ... }
  }
}, [variant, prefix, highContrast, rc])
```

### Component structure (consistent across all components)

```tsx
export function MyComponent({ size, variant, color, ..., m, mx, my, ..., style, ...rest }) {
  const { scaling, fonts, radius: themeRadius } = useThemeContext()
  const rc = useResolveColor()
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })

  const prefix = color ?? 'accent'
  const effectiveRadius = radiusProp ?? themeRadius
  const scalingFactor = scalingMap[scaling]

  // Dimensions (scaled)
  // Radius
  // Colors (useMemo)
  // Callbacks (useCallback)
  // Styles (useMemo, spread ...margins)
  // Render
}
```

## Theme system

```tsx
<Theme
  appearance="dark"       // 'inherit' | 'light' | 'dark'
  accentColor="blue"      // 26 accent colors
  grayColor="auto"        // 'auto' | 6 gray variants
  radius="medium"         // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling="100%"          // '90%' | '95%' | '100%' | '105%' | '110%'
>
  <App />
</Theme>
```

Access via `useThemeContext()` which returns:
- `appearance` (resolved: always `'light' | 'dark'`)
- `accentColor`, `grayColor`, `resolvedGrayColor`, `radius`, `scaling`
- `fonts` (ThemeFonts)
- Change handlers: `onAppearanceChange`, `onAccentColorChange`, etc.

## Tokens

| Token | Values | Usage |
|-------|--------|-------|
| Space | 0-9 → 0, 4, 8, 12, 16, 24, 32, 40, 48, 64 px | `resolveSpace(token, scaling)` |
| Font size | 1-9 → 12, 14, 16, 18, 20, 24, 28, 35, 60 px | `fontSize[token] * scalingFactor` |
| Radius | none/small/medium/large/full | `getRadius(token, level)` |
| Scaling | 90%-110% | `scalingMap[mode]` → 0.9-1.1 |
| Colors | 31 scales × 12 solid + 12 alpha + contrast + surface | `rc(name, step)` |

## Press scale animation

All interactive components (Button, IconButton, Checkbox, Switch, Card) have a subtle scale-down animation on press via `usePressScale`:

```tsx
import { usePressScale } from '../../hooks/usePressScale'

const { scaleStyle, handlePressIn, handlePressOut } = usePressScale(!disabled)

<Animated.View style={scaleStyle}>
  <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
    ...
  </Pressable>
</Animated.View>
```

- Scales to 0.97 on press (80ms ease-out), back to 1 on release (150ms)
- Uses `useNativeDriver: true` for 60fps
- Additive: works alongside Radix's pressed background color changes (not a replacement)
- Disabled when component is disabled

## Differences from Radix web

See `llm/differences.md` for the complete list of API changes, visual differences, and RN platform limitations vs `@radix-ui/themes`. Key highlights:

- No CSS filters (`brightness`, `saturate`) — use color step changes for pressed states
- No double borders — outline hc uses single border
- No `background-image` gradients — classic variant uses overlay Views
- No `outline` — focus uses border color change
- Separator uses `StyleSheet.hairlineWidth` (1 physical pixel)
- Em/Quote don't have serif font or 118% size adjustment (RN limitation)

## TypeScript rules

- **Never use `any`** — use specific types or `unknown`
- **Never use `as ThemeColor`** — use the 2-param `rc(color, step)` form
- All styles should be memoized with `useMemo`
- All handlers should be wrapped in `useCallback`
- Interfaces extend `MarginProps` for margin props (not individual declarations)
