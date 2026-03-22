# Kbd
> Keyboard key indicator with raised appearance.

```tsx
import { Kbd } from 'radix-native'
<Text>Press <Kbd>Ctrl</Kbd> + <Kbd>S</Kbd> to save</Text>
<Kbd size={3} variant="outline">Enter</Kbd>
```

Props: `size` (1-9), `variant` (`'classic' | 'soft'`), plus margin props.
Uses the default body font (NOT monospace — unlike Code). Font-size is 0.75x of the size token.
