# radix-native — Overview

## What it is

A React Native UI component library that mirrors the [Radix Themes](https://www.radix-ui.com/themes) API for web. Same prop names, same variants, same design tokens. If you know Radix Themes, you already know radix-native.

## Philosophy

- **API parity with Radix web** — same `size`, `variant`, `color`, `highContrast`, `radius` props
- **Minimal peer dependencies** — `react`, `react-native`, and `react-native-reanimated`
- **Pure RN StyleSheet** — no NativeWind, no Tamagui, no CSS-in-JS runtime
- **Token-driven** — spacing, typography, radius, scaling, and 31 color scales from Radix Colors

## Key differences from Radix web

| Radix web | radix-native | Why |
|-----------|-------------|-----|
| CSS variables (`var(--accent-9)`) | `useColor('accent', 9)` hook | RN has no CSS cascade |
| `className` composition | `style` prop arrays | RN styling model |
| `asChild` + Slot | Not yet supported | RN doesn't have DOM Slot semantics |
| Responsive props (`{ initial, md }`) | Fixed values | RN has no media queries (use `useWindowDimensions`) |
| `<Avatar.Image>` + `<Avatar.Fallback>` | `<Avatar src={} fallback={} />` | Simplified single-component API |
| CSS `:hover`, `:active` | `Pressable` + `pressed` state | Touch-based interactions |
| `box-shadow` for borders | `borderWidth` + `borderColor` | RN shadow model differs |

## What's included

**25 components** across 5 categories:
- **Layout**: Box, Flex, Grid, Separator, Card
- **Typography**: Text, Heading, Link, Blockquote, Code, Em, Strong, Quote, Kbd
- **Display**: Avatar, Badge
- **Actions**: Button, IconButton, Checkbox, CheckboxGroup, CheckboxCards, Switch, Radio, RadioGroup
- **Feedback**: Spinner, Progress
- **Forms**: TextField, TextArea

**Theme system**: Nested themes, 26 accent colors, 6 gray scales, auto gray matching, dark/light mode, radius and scaling tokens.

**5 hooks**: `useThemeContext`, `useColor`, `useResolveSpace`, `useMargins`, `usePressScale`
