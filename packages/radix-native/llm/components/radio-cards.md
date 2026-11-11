# RadioCards

> Card-style radio grid with shared selection state.

## Import
```tsx
import { RadioCards } from 'radix-native'
```

## Usage
```tsx
<RadioCards.Root columns={2} defaultValue="a">
  <RadioCards.Item value="a">Plan A</RadioCards.Item>
  <RadioCards.Item value="b">Plan B</RadioCards.Item>
  <RadioCards.Item value="c">Plan C</RadioCards.Item>
</RadioCards.Root>
```

## Root Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Card/radio size |
| variant | `'surface' \| 'classic'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases contrast |
| columns | `number` | auto-fit (≥ 160px per card) | Equal-width columns |
| gap | `SpaceToken` | `4` | Gap between cards |
| value | `string` | — | Controlled selected value |
| defaultValue | `string` | `''` | Uncontrolled default |
| onValueChange | `(value: string) => void` | — | Change handler |
| disabled | `boolean` | `false` | Disables all cards |

## Item Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | **required** | Unique value |
| disabled | `boolean` | — | Disables this card (a disabled group always wins) |
| children | `ReactNode` | — | Card content |

## Examples
```tsx
// Controlled
const [plan, setPlan] = useState('free')
<RadioCards.Root columns={3} value={plan} onValueChange={setPlan}>
  <RadioCards.Item value="free">Free</RadioCards.Item>
  <RadioCards.Item value="pro">Pro</RadioCards.Item>
  <RadioCards.Item value="enterprise">Enterprise</RadioCards.Item>
</RadioCards.Root>
```

## Layout and Inset

Like Radix (`display: flex; align-items: center; gap: var(--space-2)`), an item lays its content out in a centered row with a `space-2` gap. Its border is a ring drawn over the content (`base-card.css`), and it provides the values an `Inset` inside it needs, so an image can bleed to the item's edge:

```tsx
<RadioCards.Item value="1">
  <Inset clip="padding-box" side="left" style={{ width: 64 }}>
    <AspectRatio ratio={1}><Image source={photo} style={{ width: '100%', height: '100%' }} /></AspectRatio>
  </Inset>
  <Text>Item</Text>
</RadioCards.Item>
```
