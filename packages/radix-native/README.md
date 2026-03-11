# radix-native

Radix Themes API for React Native. A faithful port of [Radix Themes](https://www.radix-ui.com/themes) to React Native with zero production dependencies beyond `react` and `react-native`.

## Installation

```bash
npm install radix-native
# or
yarn add radix-native
```

## Quick Start

```tsx
import { Theme, Button, Text, Flex } from 'radix-native'

export default function App() {
  return (
    <Theme accentColor="indigo" grayColor="slate" radius="medium">
      <Flex direction="column" gap="3" p="4">
        <Text size="5" weight="bold">Hello, radix-native!</Text>
        <Button>Get Started</Button>
      </Flex>
    </Theme>
  )
}
```

## Features

- Full Radix Themes color system (31 color scales, light & dark mode)
- Layout primitives: `Box`, `Flex`, `Grid`
- Typography: `Text`, `Heading`, `Link`, `Code`, `Kbd`, `Blockquote`, `Em`, `Strong`, `Quote`
- Actions: `Button`, `Checkbox`, `CheckboxGroup`, `CheckboxCards`
- Theme system with `accentColor`, `grayColor`, `radius`, `scaling`, and `appearance`
- Custom themes via `createTheme()`
- Zero production dependencies (only `react` and `react-native` as peers)

## Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.72.0"
}
```

## License

MIT
