# CheckboxGroup
> Group of labeled checkboxes with shared state.

```tsx
import { CheckboxGroup } from 'radix-native'

<CheckboxGroup.Root defaultValue={['a']} onValueChange={setValues}>
  <CheckboxGroup.Item value="a">Option A</CheckboxGroup.Item>
  <CheckboxGroup.Item value="b">Option B</CheckboxGroup.Item>
  <CheckboxGroup.Item value="c" disabled>Option C</CheckboxGroup.Item>
</CheckboxGroup.Root>
```

Root props: `size` (1-3), `variant`, `color`, `highContrast`, `value`/`defaultValue` (string[]), `onValueChange`, `disabled`.
Item props: `value` (string, required), `disabled`, `children` (label text/node).
