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
  hasBackground           // applies background color to the root view
  fonts={{ regular: 'Inter-Regular', bold: 'Inter-Bold' }}
>
```

## Nested themes

Themes can nest. Inner themes inherit from outer and override specific props:

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
    // Change handlers:
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

31 color scales, each with 12 solid steps + 12 alpha steps + contrast + surface:

```tsx
const rc = useResolveColor()

rc('accent', 9)        // accent color step 9 (main bg for solid variant)
rc('accent', 'a3')     // accent alpha step 3 (bg for soft variant)
rc('accent', 'contrast') // text on accent-9 background
rc('gray', 'surface')  // translucent surface background
rc('blue', 5)          // specific named color
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
