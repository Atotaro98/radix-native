# radix-native

Radix Themes API for React Native. A faithful port of [Radix Themes](https://www.radix-ui.com/themes) to React Native with minimal peer dependencies.

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
- Minimal peer dependencies (`react`, `react-native`, `react-native-reanimated`)

## Using with NativeWind / Uniwind

radix-native uses the standard React Native `style` prop. All components accept `style` as the last override, so they work seamlessly with className-based styling solutions — you just need to wrap them once.

**NativeWind v5:**

```tsx
import { styled } from 'nativewind'
import { Button, Text, Flex } from 'radix-native'

const StyledButton = styled(Button, { className: 'style' })
const StyledText = styled(Text, { className: 'style' })
const StyledFlex = styled(Flex, { className: 'style' })
```

**Uniwind:**

```tsx
import { withUniwind } from 'uniwind'
import { Button, Text, Flex } from 'radix-native'

const StyledButton = withUniwind(Button)
const StyledText = withUniwind(Text)
const StyledFlex = withUniwind(Flex)
```

Then use them with `className` as usual:

```tsx
<StyledFlex className="mt-4 gap-2">
  <StyledButton className="rounded-xl">Click me</StyledButton>
</StyledFlex>
```

> radix-native does not depend on NativeWind or Uniwind — the wrapping is done on the consumer side, following the same pattern used by any third-party React Native library.

## Peer Dependencies

```json
{
  "react": ">=18.0.0",
  "react-native": ">=0.72.0",
  "react-native-reanimated": ">=3.0.0"
}
```

## License

MIT
