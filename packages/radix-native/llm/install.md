# Installation

## Requirements

- React Native 0.72+
- React 18.0+

## Install

```bash
# npm
npm install radix-native

# yarn
yarn add radix-native

# pnpm
pnpm add radix-native
```

No additional setup, no CSS imports, no babel plugins.

## Wrap your app with Theme

```tsx
import { Theme } from 'radix-native'

export default function App() {
  return (
    <Theme appearance="dark" accentColor="blue">
      {/* Your app */}
    </Theme>
  )
}
```

## Start building

```tsx
import { Flex, Text, Button, Avatar, Badge } from 'radix-native'

function Profile() {
  return (
    <Flex gap={3} align="center">
      <Avatar src="https://..." fallback="JD" size={5} />
      <Flex direction="column" gap={1}>
        <Text size={4} weight="bold">John Doe</Text>
        <Badge variant="soft" color="green">Active</Badge>
      </Flex>
      <Button variant="soft" ml="auto">Edit</Button>
    </Flex>
  )
}
```

## Custom fonts (optional)

```tsx
<Theme
  fonts={{
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
    heading: 'Inter-Bold',
    code: 'JetBrainsMono-Regular',
    // optional — Radix role faces:
    strong: 'Inter-Bold',        // falls back to bold → regular
    em: 'Lora-Italic',           // falls back to the system serif
    quote: 'Lora-Italic',        // falls back to the system serif
  }}
>
```

Each entry is one font file (one face). Its weight / italic is baked in, so radix-native never adds
`fontWeight` / `fontStyle` on top. A weight with no face renders with `regular` and warns in development.

```tsx
```
