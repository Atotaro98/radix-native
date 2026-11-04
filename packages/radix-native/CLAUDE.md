# radix-native

React Native UI library that replicates the Radix Themes (web) API.
Same prop names, same variants, same tokens. Web devs use it instantly.

Domain vocabulary (Text style, Text role, Variant recipe, Variant family, Radix parity…) lives in `GLOSSARY.md`.

## Architecture

```
packages/radix-native/src/
  theme/          ThemeRoot (stateful) + ThemeImpl (inheritable) + Theme (public)
  hooks/          useThemeContext, useColor, useResolveColor (internal), useResolveSpace, useMargins,
                  useControllableState (internal), useInteraction (internal), useTextStyle (internal),
                  useVariantColors (internal), usePressScale
  tokens/         colors/ (31 scales), spacing, typography, radius, scaling
  types/          nativeProps, marginProps
  utils/          resolveColor, variantPalette, colorMath, resolveSpace, applyScaling, classicEffect, textStyle,
                  hitSlop, alpha, env, fonts
  components/
    internal/     BaseButton, ControlLabel, ClassicOverlay, FocusRing, ColumnRows, LabeledControl (not exported)
    layout/       Box, Flex, Grid, Separator, Card
    typography/   Text, Heading, Link, Blockquote, Code, Em, Strong, Quote, Kbd, TextContext
    display/      Avatar, Badge
    actions/      Button, IconButton, Checkbox, CheckboxGroup, CheckboxCards,
                  Switch, Radio, RadioGroup, RadioCards
    feedback/     Spinner, Progress, Skeleton
    forms/        TextField, TextArea
    playground/   ThemeControls
  __tests__/      Jest + @testing-library/react-native
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

Steps: solid `1-12` (numbers), alpha `'a1'-'a12'` (strings), special `'contrast' | 'surface' | 'indicator' | 'track' | 'panel'`
(`indicator` / `track` resolve through step 9 so overrides of 9 carry over; `panel` = white / dark step 2).

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

### Variant colors — `useVariantColors`

Every color that depends on a variant or state comes from a **Variant recipe** in
`utils/variantPalette.ts`, read through `useVariantColors` (`hooks/useVariantColors.ts`).
Never write `switch (variant)` color code in a component.

```tsx
const colors = useVariantColors('checkbox', { variant, color, highContrast, checked, disabled })
// → { bg, border?, indicator? } — strings ready for styles
```

- Recipes return **paints** — `c(step)` (the `color` prop, accent by default), `g(step)` (gray),
  `layers(top, …, bottom)` (flattened into one color), `fade(paint, opacity)`, `byMode(light, dark)`,
  `blackA(n)` / `whiteA(n)` — so they test against Radix CSS without a theme.
- Recipes are grouped by **Variant family** (buttons, chips, selection controls, tracks, cards,
  text inputs, text). Radix is not uniform across families; keep its values even where they
  look inconsistent (e.g. solid high-contrast text `gray-1` in Button, `accent-1` in Badge), and cite
  the Radix selector in a comment.
- `SHADOW_1_RING` is Radix `--shadow-1` as a border color (classic variants, sunken parts).
- Add a row to `__tests__/variantPalette.test.ts` for every rule; `contrast.test.ts` walks the
  real recipes.
- Shadows (`getClassicEffect`, `ClassicOverlay`) and focus rings (`rc(prefix, 8)`) stay in components.

### Shared building blocks — use these instead of re-implementing

| Need | Use |
|------|-----|
| Controlled / uncontrolled value | `useControllableState({ prop, defaultProp, onChange })` — setter accepts updater functions (no stale closures) |
| Pressed / focused state, press scale, composing consumer handlers | `useInteraction({ enabled, onPressIn, onPressOut, onFocus, onBlur })` → `{ pressed, focused, scaleStyle, handlers }` |
| Focus indicator | `<FocusRing visible={focused} color={rc(prefix, 8)} borderRadius={r} offset={…} />` (offset only on hosts without `overflow: 'hidden'`) |
| Classic gradient | `<ClassicOverlay borderRadius={r} />` |
| A button (interaction, recipe colors, classic, loading, focus ring, touch target, prop order) | `<BaseButton {...props} iconOnly? />` — Button and IconButton are thin wrappers over it, like Radix `BaseButton` |
| A row of text runs + icons inside a control (Control label) | `<ControlLabel size weight color maxFontSizeMultiplier>{children}</ControlLabel>` — merges adjacent text, one line, tints icons without `color` |
| Equal-width columns | `<ColumnRows columns gap…>` (no `onLayout`, no `%` flexBasis) |
| Control + label row in groups | `<LabeledControl role control …>` |
| Any rendered text (size, face, letter spacing, Font scaling cap, `truncate` / `wrap`, nesting) | `useTextStyle({ inline?, role?, size?, weight?, lineHeight?, color?, compact?, maxFontSizeMultiplier?, truncate?, wrap?, margins? })` → `{ style, textProps, contextFontSize }` — see Text style below |
| Minimum touch target | `hitSlop ?? getMinHitSlop(width, height)` (44pt) |
| Colors of a component's parts for its variant and state | `useVariantColors(recipe, { variant?, color, highContrast?, checked?, disabled?, pressed?, focused? })` — see Variant colors above |
| Translucent hex | `withAlpha(color, alpha)` — never concatenate `hex + '99'` |
| Dev-only logging | `isDev` from `utils/env` — never reference `__DEV__` directly (crashes outside Metro) |

### Pressable prop order

Consumer props must never silently disable internal behavior:

```tsx
<AnimatedPressable
  accessibilityRole="button"                     // defaults the consumer may override
  hitSlop={hitSlop ?? getMinHitSlop(w, h)}
  {...rest}                                      // consumer props
  {...handlers}                                  // composed onPressIn/Out/Focus/Blur (call the consumer's too)
  onPress={handlePress}
  disabled={isDisabled}
  accessibilityState={{ ...accessibilityState, disabled: isDisabled }}  // merged, internal state wins
  style={[scaleStyle, containerStyle, style]}
>
```

### Text style — `useTextStyle`

Every text-rendering module (typography and control labels) gets its Text style from `useTextStyle`
(`hooks/useTextStyle.ts`), a thin adapter over the pure `resolveTextStyle` (`utils/textStyle.ts`).
Never assemble `fontSize` / `fontFamily` / `fontWeight` / `maxFontSizeMultiplier` by hand.

- **Text role** (`default | heading | code | strong | em | quote`): the `TEXT_ROLES` table mirrors Radix
  `typography.css` (family slot, size adjust, style, weight, letter-spacing offset). Change values there only.
- **Weight intent** → face: exact `ThemeFonts` face, else `fonts.regular` with a dev warning, else system
  font + `fontWeight`. Custom faces never get `fontWeight` / `fontStyle` (baked into the file).
- **Font scaling cap**: local prop > Theme prop > `2` for `compact: true` > none.
- **Nesting**: `inline: true` reads `TextContext`. Nested text without a size inherits it (or derives it
  from the parent for roles with a size adjust, e.g. Code 0.95, Em/Quote 1.18, Kbd 0.75 via `sizeAdjust`)
  and never gets `flexShrink` / margins. Provide `contextFontSize` through `TextContext` from text that can
  contain other text.
- Color is resolved by the caller and passed in (`undefined` = inherit).
- Test new rules in `__tests__/textStyle.test.ts` (pure tables), not through renders.

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
Components with internal text (Button, Badge, Kbd, TextField, TextArea, group items) expose `maxFontSizeMultiplier` in their own interface.

Priority: **local prop > global Theme prop > undefined (no limit)**

Compact text (Button, Badge, Kbd, TextField, TextArea) sits in controls that use `minHeight` instead of `height` so they grow with font scaling.
Its `maxFontSizeMultiplier` defaults to `2` when neither local nor global is set (WCAG AA 200%) — pass `compact: true` to `useTextStyle`.
Avatar initials live in a fixed-size box and are always capped at `1`.

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

All interactive components (Button, IconButton, Checkbox, Switch, Radio, Card, CheckboxCards, RadioCards) have a subtle scale-down animation on press. Inside the library use `useInteraction` (which wraps `usePressScale`); `usePressScale` + `AnimatedPressable` remain public for consumers:

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
- Doesn't start when the component is disabled; always springs back to 1 — on release and as soon as it becomes disabled (e.g. `loading` set mid-press)

Components with pressed color changes (Button, IconButton, Card) read `pressed` from `useInteraction`, then pick the pressed bg / ring / opacity from their Variant recipe outside JSX. The style is a static array, not a callback.

## Differences from Radix web

See `llm/differences.md` for the complete list of API changes, visual differences, and RN platform limitations vs `@radix-ui/themes`. Key highlights:

- No CSS filters (`brightness`, `saturate`) — use color step changes for pressed states
- No double borders — outline hc uses single border
- No `background-image` gradients — classic variant uses overlay Views
- No `outline` — focus uses an absolutely positioned `FocusRing` view
- Separator uses `StyleSheet.hairlineWidth` (1 physical pixel)
- Em/Quote use the system serif (`Times New Roman` on iOS, `serif` on Android) unless `fonts.em` / `fonts.quote` is set

## Hooks rules

- **Never return early before a hook call** (e.g. `if (!loading) return children` must come after every hook). Enforced by `react-hooks/rules-of-hooks`.
- Effect / memo dependency arrays must be complete (`react-hooks/exhaustive-deps` is an error). Cancel Reanimated loops in effect cleanups (`cancelAnimation`).

## Testing

`yarn test` (Jest + `@testing-library/react-native`, Reanimated 4 via `setUpTests()` and the worklets Babel plugin). Tests live in `src/__tests__/`; render inside a theme with `renderWithTheme` from `__tests__/helpers/render`. `contrast.test.ts` checks WCAG ratios of every text-on-fill pair the Variant recipes produce.

## TypeScript rules

- **Never use `any`** — use specific types or `unknown`
- **Never use `as ThemeColor`** — use the 2-param `useColor(color, step)` form (or `rc(color, step)` internally)
- Memoize styles derived from props / tokens with `useMemo`; tiny per-interaction styles (pressed bg, opacity) may stay inline
- All handlers should be wrapped in `useCallback`
- Interfaces extend `MarginProps` for margin props (not individual declarations)
