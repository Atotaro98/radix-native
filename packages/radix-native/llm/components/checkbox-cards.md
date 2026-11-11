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
Item props: `value` (string, required), `disabled` (a disabled group always wins), `children`.

## Layout and Inset

Like Radix (`display: flex; align-items: center; gap: var(--space-2)`), an item lays its content out in a centered row with a `space-2` gap. Its border is a ring drawn over the content (`base-card.css`), and it provides the values an `Inset` inside it needs, so an image can bleed to the item's edge:

```tsx
<CheckboxCards.Item value="1">
  <Inset clip="padding-box" side="left" style={{ width: 64 }}>
    <AspectRatio ratio={1}><Image source={photo} style={{ width: '100%', height: '100%' }} /></AspectRatio>
  </Inset>
  <Text>Item</Text>
</CheckboxCards.Item>
```
