# Radix Native

React Native components that match the [Radix Themes](https://www.radix-ui.com/themes) API exactly. Same props, same variants, same design tokens — built for React Native with zero production dependencies.

> If you know Radix Themes on web, you already know Radix Native.

## Features

- **Identical API** to `@radix-ui/themes` — same component names, same props, same variants
- **30 components** — layout, typography, actions, forms, display, feedback
- **Full theme system** — 26 accent colors, 6 gray scales, radius, scaling, dark mode, nested themes
- **31 color scales** from `@radix-ui/colors` with light/dark modes and alpha variants
- **Zero dependencies** — only `react` and `react-native` as peer deps
- **TypeScript strict** — fully typed props, tokens, and theme values
- **Accessible** — semantic roles, accessibility states, screen reader support
- **Press animation** — subtle scale-down on press for interactive components

## Installation

```bash
npm install radix-native
```

### Peer dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.72.0"
}
```

## Quick Start

```tsx
import { Theme, Text, Button, Flex, Avatar, Badge } from 'radix-native'

export default function App() {
  return (
    <Theme accentColor="indigo" appearance="dark">
      <Flex direction="row" gap={3} align="center" p={4}>
        <Avatar src="https://example.com/photo.jpg" fallback="JD" size={5} />
        <Flex gap={1}>
          <Text size={4} weight="bold">
            John Doe
          </Text>
          <Badge variant="soft" color="green">
            Active
          </Badge>
        </Flex>
        <Button variant="soft" ml="auto">
          Edit
        </Button>
      </Flex>
    </Theme>
  )
}
```

## Components

### Layout

| Component   | Description                                                    |
| ----------- | -------------------------------------------------------------- |
| `Box`       | Base container with padding, margin, and dimension props       |
| `Flex`      | Flexbox container with `direction`, `align`, `justify`, `gap`  |
| `Grid`      | Equal-width column grid with wrapping                          |
| `Separator` | Visual divider (horizontal/vertical)                           |
| `Card`      | Container with background, border, and optional press behavior |

### Typography

| Component    | Description                                                   |
| ------------ | ------------------------------------------------------------- |
| `Text`       | Body text with size (1–9), weight, color, alignment           |
| `Heading`    | Section headings with tighter line-heights                    |
| `Link`       | Pressable text with underline control                         |
| `Blockquote` | Block quote with left accent border                           |
| `Code`       | Inline code with `solid`, `soft`, `outline`, `ghost` variants |
| `Kbd`        | Keyboard key indicator                                        |
| `Em`         | Italic emphasis                                               |
| `Strong`     | Bold emphasis                                                 |
| `Quote`      | Inline quotation with curly quotes                            |

### Display

| Component | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `Avatar`  | Profile picture with image loading state, fallback text/icon |
| `Badge`   | Annotation label with 4 variants                             |

### Actions

| Component       | Description                                                    |
| --------------- | -------------------------------------------------------------- |
| `Button`        | 6 variants, 4 sizes, loading state with dimension preservation |
| `IconButton`    | Square button for icons, auto-passes color to children         |
| `Checkbox`      | Toggle with View-based check/dash indicator                    |
| `CheckboxGroup` | Compound `Root` + `Item` for labeled checkbox groups           |
| `CheckboxCards` | Card-style checkbox grid                                       |
| `Switch`        | Toggle with animated thumb (bezier easing)                     |
| `Radio`         | Radio button with dot indicator                                |
| `RadioGroup`    | Compound `Root` + `Item` for labeled radio groups              |
| `RadioCards`    | Card-style radio selection (border indicator)                  |

### Feedback

| Component  | Description                                         |
| ---------- | --------------------------------------------------- |
| `Spinner`  | 8-leaf staggered fade animation                     |
| `Progress` | Determinate + indeterminate bar with variant colors |

### Forms

| Component   | Description                                               |
| ----------- | --------------------------------------------------------- |
| `TextField` | Single-line text input with 3 variants and disabled state |
| `TextArea`  | Multi-line text input                                     |

## Theme Configuration

```tsx
<Theme
  accentColor="blue"    // 26 accent colors
  grayColor="auto"      // 6 gray scales or 'auto' (matches accent)
  appearance="dark"     // 'light' | 'dark' | 'inherit'
  radius="medium"       // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling="100%"        // '90%' | '95%' | '100%' | '105%' | '110%'
  hasBackground         // applies background color
  fonts={{
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
    heading: 'Inter-Bold',
    code: 'JetBrainsMono',
  }}
>
```

### Nested themes

```tsx
<Theme accentColor="indigo" appearance="light">
  <Text>Uses indigo + light</Text>
  <Theme accentColor="red" appearance="dark">
    <Text>Uses red + dark</Text>
  </Theme>
</Theme>
```

### Color resolution

```tsx
import { useResolveColor } from 'radix-native'

const rc = useResolveColor()
rc('accent', 9) // theme accent at step 9
rc('gray', 'a6') // gray alpha step 6
rc('blue', 'contrast') // blue contrast color
rc(prefix, 'surface') // dynamic color + step
```

### Theme context

```tsx
import { useThemeContext } from 'radix-native'

const { appearance, accentColor, onAppearanceChange } = useThemeContext()
```

## Hooks

| Hook                | Description                                                       |
| ------------------- | ----------------------------------------------------------------- |
| `useThemeContext()` | Access resolved theme values and change handlers                  |
| `useResolveColor()` | Resolve color tokens to hex — `rc('accent', 9)` or `rc('gray-1')` |
| `useResolveSpace()` | Resolve spacing tokens to pixels                                  |
| `useMargins()`      | Resolve margin props to memoized ViewStyle                        |
| `usePressScale()`   | Subtle scale animation on press for custom components             |

## Design Tokens

### Spacing

| Token | 0   | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| px    | 0   | 4   | 8   | 12  | 16  | 24  | 32  | 40  | 48  | 64  |

### Typography

| Size       | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| ---------- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| fontSize   | 12  | 14  | 16  | 18  | 20  | 24  | 28  | 35  | 60  |
| lineHeight | 16  | 20  | 24  | 26  | 28  | 30  | 36  | 40  | 60  |

### Color System

31 scales from `@radix-ui/colors` — 26 accent + 6 gray. Each scale has 12 solid steps, 12 alpha steps, plus `contrast` and `surface` tokens in both light and dark modes.

## Differences from Radix Web

| Feature             | Radix Web                      | Radix Native                    |
| ------------------- | ------------------------------ | ------------------------------- |
| Styling             | CSS variables + classes        | Pure RN StyleSheet              |
| Color resolution    | `var(--accent-9)`              | `rc('accent', 9)` hook          |
| Margin props        | CSS classes via `extractProps` | `useMargins` hook               |
| Responsive props    | `{ initial, sm, md }`          | Single values                   |
| `asChild` / Slot    | Supported                      | Not yet                         |
| Press feedback      | CSS `:active`                  | `usePressScale` animation       |
| `Flex` default      | `row` (CSS)                    | `column` (mobile-first)         |
| Separator thickness | `1px` CSS                      | `StyleSheet.hairlineWidth`      |
| `fonts` prop        | N/A                            | Custom font families per weight |

See `packages/radix-native/llm/differences.md` for the complete comparison.

## Documentation

- **LLM Skills**: `packages/radix-native/llm/` — 33 markdown files for AI assistants
- **MDX Docs**: `docs/content/` — 35 MDX pages ready for Astro/Next.js
- **CLAUDE.md**: `packages/radix-native/CLAUDE.md` — AI coding guide

## Development

Monorepo powered by Turborepo + Yarn 4 Berry.

```bash
yarn install           # Install dependencies
yarn build             # Build the library
cd apps/example        # Start the playground
yarn ios               # or yarn android
yarn generate:colors   # Regenerate color tokens
yarn typecheck         # Type checking
```

### Project structure

```
radix-native/
├── apps/
│   └── example/              # Expo SDK 55 playground
├── docs/
│   └── content/              # MDX documentation (35 pages)
├── packages/
│   └── radix-native/
│       ├── llm/              # LLM skills (33 files)
│       ├── CLAUDE.md          # AI coding guide
│       └── src/
│           ├── tokens/        # colors (31 scales), spacing, typography, radius
│           ├── theme/         # Theme, ThemeRoot, ThemeImpl, createTheme
│           ├── hooks/         # useThemeContext, useResolveColor, useMargins, usePressScale
│           ├── utils/         # resolveColor, resolveSpace, classicEffect
│           └── components/    # layout, typography, display, actions, feedback, forms
```

## License

MIT
