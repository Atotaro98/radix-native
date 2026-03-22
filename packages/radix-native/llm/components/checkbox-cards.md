# CheckboxCards
> Card-style checkbox grid with shared selection state.

```tsx
import { CheckboxCards } from 'radix-native'

<CheckboxCards.Root columns={2} defaultValue={['a']}>
  <CheckboxCards.Item value="a">Plan A</CheckboxCards.Item>
  <CheckboxCards.Item value="b">Plan B</CheckboxCards.Item>
</CheckboxCards.Root>
```

Root props: `size` (1-3), `variant` (`'surface' | 'classic'`), `color`, `highContrast`, `columns`, `gap`, `value`/`defaultValue`, `onValueChange`, `disabled`.
Item props: `value` (string, required), `disabled`, `children`.
