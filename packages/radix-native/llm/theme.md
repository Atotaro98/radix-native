# Theme System

## Theme component

```tsx
<Theme
  appearance="dark"       // 'inherit' | 'light' | 'dark'
  accentColor="blue"      // 26 accent colors
  grayColor="auto"        // 'auto' | 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand'
  radius="medium"         // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling="100%"          // '90%' | '95%' | '100%' | '105%' | '110%'
  maxFontSizeMultiplier={2} // RN-only: global cap for accessibility font scaling
  safeAreaInsets={insets}   // RN-only: { top, right, bottom, left } overlays keep clear of (default 0)
  hasBackground           // applies background color to the root view
  fonts={{ regular: 'Inter-Regular', bold: 'Inter-Bold' }} // one face per weight; also light, medium, heading, code, strong, em, quote
>
```

## Nested themes

Themes can nest. Inner themes inherit everything from the outer one and override only what they set (as Radix):

- A nested Theme keeps the parent's *resolved* gray; `grayColor="auto"` must be set again to re-match a new accent.
- `fonts` and `colorOverrides` merge with the parent's (fonts by key; overrides per scale, mode and step), the way CSS custom properties cascade.
- A nested Theme draws a background only with an explicit `appearance` (or `hasBackground`).
- Only the root Theme can be changed through the handlers; a nested Theme's handlers are no-ops (Radix). Place `ThemeControls` directly under the root.

```tsx
<Theme appearance="dark" accentColor="blue">
  <Button>Blue button</Button>

  <Theme accentColor="red">
    <Button>Red button (still dark)</Button>
  </Theme>
</Theme>
```

## useThemeContext

Access the resolved theme values from any component:

```tsx
import { useThemeContext } from 'radix-native'

function MyComponent() {
  const {
    appearance,           // 'light' | 'dark' (always resolved)
    accentColor,          // AccentColor
    grayColor,            // GrayColor | 'auto'
    resolvedGrayColor,    // GrayColor (resolved — never 'auto')
    radius,               // RadiusToken
    scaling,              // ScalingMode
    fonts,                // ThemeFonts
    maxFontSizeMultiplier,// number | undefined — global cap
    safeAreaInsets,       // { top, right, bottom, left } — RN-only, inherited
    isRoot,               // boolean — whether this is the outermost Theme
    resolveColor,         // (token: ThemeColor) => string, with this Theme's values
    // Change handlers (no-ops in a nested Theme):
    onAppearanceChange,
    onAccentColorChange,
    onGrayColorChange,
    onRadiusChange,
    onScalingChange,
  } = useThemeContext()
}
```

## Auto gray

When `grayColor="auto"`, the gray scale is automatically matched to the accent color:
- Blue/Indigo/Violet → Slate
- Pink/Crimson/Ruby → Mauve
- Green/Grass/Teal → Sage
- Brown/Gold/Bronze → Sand
- etc.

## Color tokens

31 color scales, each with 12 solid steps + 12 alpha steps + contrast, surface, indicator, track and panel:

```tsx
import { useColor } from 'radix-native'

const accent9 = useColor('accent', 9)          // accent color step 9
const softBg = useColor('accent', 'a3')        // accent alpha step 3
const text = useColor('accent', 'contrast')     // text on accent-9 background
const surface = useColor('gray', 'surface')     // translucent surface background
const fill = useColor('accent', 'indicator')    // checked controls / progress fill (= step 9 unless overridden)
const panel = useColor('gray', 'panel')         // Card background: white (light) / gray-2 (dark)
const blue5 = useColor('blue', 5)              // specific named color

// Single-param form:
const gray1 = useColor('gray-1')
```

## Spacing tokens

| Token | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|-------|---|---|---|---|---|---|---|---|---|---|
| Pixels | 0 | 4 | 8 | 12 | 16 | 24 | 32 | 40 | 48 | 64 |

Used in margin props (`m`, `mt`, `mx`, etc.) and spacing props (`gap`, `p`, `px`, etc.).

## Radius tokens

| Token | Factor | Effect |
|-------|--------|--------|
| none | 0 | Square corners |
| small | 0.75 | Subtle rounding |
| medium | 1 | Default rounding |
| large | 1.5 | Pronounced rounding |
| full | 1.5 + pill (9999) | Fully rounded / pill shape |

Each component picks a radius level (1-6 → 3, 4, 6, 8, 12, 16 px). Like Radix `--radius-N`,
the result is `level px × radius factor × scaling`; read it with `useMetrics().radius(level, shape?)`.

## Safe area (RN-only)

Overlays (Dialog, AlertDialog, and later Popover, menus, Select) keep clear of the notch and home indicator using the root Theme's `safeAreaInsets`. radix-native adds no dependency for it: pass the insets from your safe-area library.

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function App() {
  const insets = useSafeAreaInsets()
  return <Theme safeAreaInsets={insets}>…</Theme>
}
```
