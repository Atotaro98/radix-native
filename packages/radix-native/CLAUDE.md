# radix-native

React Native UI library that replicates the Radix Themes (web) API.
Same prop names, same variants, same tokens. Web devs use it instantly.

## Architecture

```
packages/radix-native/src/
  theme/          ThemeRoot (stateful) + ThemeImpl (inheritable) + Theme (public)
  hooks/          useThemeContext, useColor, useResolveColor (internal), useResolveSpace, useMargins
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

## Dependencies

Peer deps: `react`, `react-native`, `react-native-reanimated` (>=3.0.0).
All animations use `react-native-reanimated` (shared values, UI-thread animations).
All icons/indicators drawn with `View` borders (no SVG deps).

## Key patterns

### Color resolution — `useColor(color, step)`

**Public API** (`useColor`): resolves a single color token per call. Used by consumers.

```tsx
import { useColor } from 'radix-native'

// Two-param form (preferred):
const bg = useColor('accent', 9)           // theme accent at step 9
const alpha = useColor('accent', 'a3')     // alpha step
const surface = useColor('gray', 'surface') // special step
const text = useColor('accent', 'contrast') // contrast text

// Single-param form:
const gray1 = useColor('gray-1')
```

**Internal** (`useResolveColor`): returns a resolver function for components that resolve many colors in one `useMemo`. Not exported publicly.

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
  const rc = useResolveColor() // internal hook — not exported
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
  maxFontSizeMultiplier={2} // RN-only: global cap for accessibility font scaling
>
  <App />
</Theme>
```

Access via `useThemeContext()` which returns:
- `appearance` (resolved: always `'light' | 'dark'`)
- `accentColor`, `grayColor`, `resolvedGrayColor`, `radius`, `scaling`
- `fonts` (ThemeFonts)
- `maxFontSizeMultiplier` (optional global cap)
- Change handlers: `onAppearanceChange`, `onAccentColorChange`, etc.

## Font scaling (accessibility)

All text components support `maxFontSizeMultiplier` and `allowFontScaling` props (from `NativeTextProps`).
Components with internal text (Button, Badge, Kbd, Avatar, etc.) expose `maxFontSizeMultiplier` in their own interface.

Priority: **local prop > global Theme prop > undefined (no limit)**

Compact components (Button, Badge, Kbd) use `minHeight` instead of `height` so they grow with font scaling.
Their `maxFontSizeMultiplier` defaults to `2` when neither local nor global is set (WCAG AA 200%).

```tsx
// Global cap — applies to all text components
<Theme maxFontSizeMultiplier={1.5}>
  <Button>Capped at 1.5x</Button>
  <Button maxFontSizeMultiplier={2}>This one overrides to 2x</Button>
  <Text>Also capped at 1.5x</Text>
</Theme>

// No global — components use their own defaults
<Theme>
  <Button>Default 2x cap (compact component)</Button>
  <Text>No cap (body text)</Text>
</Theme>
```

ThemeControls (dev tool) hardcodes `maxFontSizeMultiplier={1}` on all internal text.

## Tokens

| Token | Values | Usage |
|-------|--------|-------|
| Space | 0-9 → 0, 4, 8, 12, 16, 24, 32, 40, 48, 64 px | `resolveSpace(token, scaling)` |
| Font size | 1-9 → 12, 14, 16, 18, 20, 24, 28, 35, 60 px | `fontSize[token] * scalingFactor` |
| Radius | none/small/medium/large/full | `getRadius(token, level)` |
| Scaling | 90%-110% | `scalingMap[mode]` → 0.9-1.1 |
| Colors | 31 scales × 12 solid + 12 alpha + contrast + surface | `useColor(name, step)` |

## Press scale animation

All interactive components (Button, IconButton, Checkbox, Switch, Card) have a subtle scale-down animation on press via `usePressScale` + `AnimatedPressable`:

```tsx
import { usePressScale, AnimatedPressable } from '../../hooks/usePressScale'

const { scaleStyle, handlePressIn, handlePressOut } = usePressScale(!disabled)

<AnimatedPressable
  style={[scaleStyle, containerStyle, style]}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  ...
</AnimatedPressable>
```

- `AnimatedPressable` = `Animated.createAnimatedComponent(Pressable)` from Reanimated
- Single node (no wrapper) — user styles like `flex: 1` work correctly
- Scales to 0.97 on press (80ms ease-out), back to 1 on release (150ms)
- Runs on UI thread via Reanimated shared values
- Additive: works alongside Radix's pressed background color changes (not a replacement)
- Disabled when component is disabled

Components with pressed bg color changes (Button, IconButton, Card) track `pressed` via `useState` + `onPressIn`/`onPressOut`, then compute bg/opacity outside JSX. The style is a static array, not a callback.

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
- **Never use `as ThemeColor`** — use the 2-param `useColor(color, step)` form (or `rc(color, step)` internally)
- All styles should be memoized with `useMemo`
- All handlers should be wrapped in `useCallback`
- Interfaces extend `MarginProps` for margin props (not individual declarations)
