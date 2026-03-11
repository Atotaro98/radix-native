# Radix Native

React Native components that match the [Radix Themes](https://www.radix-ui.com/themes) API exactly. Same props, same variants, same design tokens — built for React Native with zero production dependencies.

> If you know Radix Themes on web, you already know Radix Native.

## Features

- **Identical API** to `@radix-ui/themes` — same component names, same props, same variants
- **Full theme system** — accent colors, gray scales, radius, scaling, dark mode
- **31 color scales** from `@radix-ui/colors` with light/dark modes and alpha variants
- **Zero dependencies** — only `react` and `react-native` as peer deps
- **TypeScript strict** — fully typed props, tokens, and theme values
- **Accessible by default** — semantic roles, font scaling support

## Installation

```bash
# npm
npm install radix-native

# yarn
yarn add radix-native
```

### Peer dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.72.0"
}
```

## Quick Start

Wrap your app with `<Theme>` and start using components:

```tsx
import { Theme, Text, Button, Flex } from 'radix-native'

export default function App() {
  return (
    <Theme accentColor="indigo" appearance="light">
      <Flex direction="column" gap={4} p={4}>
        <Text size={5} weight="bold">
          Hello, Radix Native
        </Text>
        <Button variant="solid" size={3}>
          <Text>Get Started</Text>
        </Button>
      </Flex>
    </Theme>
  )
}
```

## Theme Configuration

```tsx
<Theme
  accentColor="blue"    // 25 accent colors
  grayColor="auto"      // 6 gray scales or 'auto'
  appearance="light"    // 'light' | 'dark' | 'inherit'
  radius="medium"       // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling="100%"        // '90%' | '95%' | '100%' | '105%' | '110%'
  fonts={{              // RN-only: custom font families per weight
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
    heading: 'Inter-Bold',
    code: 'JetBrainsMono',
  }}
>
  {children}
</Theme>
```

### Color overrides

Override individual color steps per scale — the RN equivalent of overriding CSS custom properties like `--red-9: #custom` in Radix web:

```tsx
<Theme
  accentColor="red"
  colorOverrides={{
    red: {
      light: { 9: '#e54666', 10: '#dc3b5d' },
      dark:  { 9: '#e5484d', 10: '#ec5d5e' },
    },
  }}
>
  {children}
</Theme>
```

You can override any step (1–12), alpha step (a1–a12), `contrast`, or `surface` for any of the 31 color scales, with separate values for light and dark modes. Only the steps you specify are overridden; the rest fall back to the built-in scale.

### Nested themes

Override any theme prop for a subtree, just like Radix web:

```tsx
<Theme accentColor="indigo" appearance="light">
  <Text>Uses indigo + light</Text>

  <Theme accentColor="red" appearance="dark">
    <Text>Uses red + dark</Text>
  </Theme>
</Theme>
```

### Accessing theme values

```tsx
import { useThemeContext } from 'radix-native'

function MyComponent() {
  const { appearance, accentColor, onAppearanceChange } = useThemeContext()

  return (
    <Button onPress={() => onAppearanceChange(appearance === 'dark' ? 'light' : 'dark')}>
      <Text>Toggle theme</Text>
    </Button>
  )
}
```

## Components

### Layout

| Component | Description |
|-----------|-------------|
| `Box` | Base layout container with padding, margin, and positioning props |
| `Flex` | Flexbox container with `direction`, `align`, `justify`, `gap` |
| `Grid` | Equal-width column grid with wrapping |

### Typography

| Component | Description |
|-----------|-------------|
| `Text` | Body text with size, weight, color, and alignment |
| `Heading` | Heading text with semantic `header` role |
| `Link` | Pressable text link with underline control |
| `Blockquote` | Block quote with left accent border |
| `Code` | Inline code with `solid`, `soft`, `outline`, `ghost` variants |
| `Kbd` | Keyboard shortcut indicator |
| `Em` | Italic emphasis (inline) |
| `Strong` | Bold emphasis (inline) |
| `Quote` | Inline quotation |

### Actions

| Component | Description |
|-----------|-------------|
| `Button` | 6 variants (`solid`, `soft`, `surface`, `outline`, `ghost`, `classic`), sizes 1–4 |
| `Checkbox` | 3 variants (`surface`, `classic`, `soft`), sizes 1–3 |
| `CheckboxGroup` | Compound `Root` + `Item` for grouped checkboxes |
| `CheckboxCards` | Card-style checkbox selection |

## Color System

31 color scales from `@radix-ui/colors`, each with 12 steps + alpha variants in light and dark modes:

```
Accent (25): tomato red ruby crimson pink plum purple violet iris indigo
             blue cyan teal jade green grass bronze gold brown orange
             amber yellow lime mint sky

Gray (6):    gray mauve slate sage olive sand
```

## Design Tokens

### Spacing

```tsx
// SpaceToken: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
<Box p={4} mx={2} />  // p=16px, mx=8px
```

| Token | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|-------|---|---|---|---|---|---|---|---|---|---|
| px    | 0 | 4 | 8 | 12 | 16 | 24 | 32 | 40 | 48 | 64 |

### Typography sizes

```tsx
<Text size={3} />  // 16px, lineHeight 24px
```

| Size | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|------|---|---|---|---|---|---|---|---|---|
| fontSize | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 35 | 60 |
| lineHeight | 16 | 20 | 24 | 26 | 28 | 30 | 36 | 40 | 60 |

### Radius

```tsx
<Button radius="full" />  // 'none' | 'small' | 'medium' | 'large' | 'full'
```

## Differences from Radix Web

| Feature | Radix Web | Radix Native |
|---------|-----------|--------------|
| Styling | CSS variables + classes | `StyleSheet` (pure RN) |
| Responsive props | `Responsive<T>` with breakpoints | Single values only |
| `asChild` / `as` | Supported | Not applicable (no DOM) |
| `panelBackground` | `'solid'` / `'translucent'` | Not supported (CSS-only) |
| `fonts` prop | N/A | Custom font families per weight |
| `colorOverrides` prop | N/A | Override individual color steps |
| `display` prop | Responsive enum | Not needed (RN defaults to flex) |

## Development

This is a monorepo powered by Turborepo + Yarn 4 Berry.

```bash
# Install dependencies
yarn install

# Build the library
yarn build

# Start the example app
cd apps/example && yarn ios

# Regenerate color tokens (after updating @radix-ui/colors)
yarn generate:colors

# Lint & typecheck
yarn lint
yarn typecheck
```

### Project structure

```
radix-native/
├── apps/
│   └── example/          # Expo SDK 55 playground app
├── packages/
│   └── radix-native/     # The library
│       └── src/
│           ├── tokens/       # colors, spacing, typography, radius, scaling
│           ├── theme/        # Theme, ThemeRoot, ThemeImpl, createTheme
│           ├── hooks/        # useThemeContext, useResolveColor
│           ├── utils/        # resolveColor, resolveSpace, applyScaling
│           └── components/   # layout, typography, actions
└── scripts/
```

## License

MIT
