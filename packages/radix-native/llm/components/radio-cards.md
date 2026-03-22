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
| columns | `number` | `1` | Grid columns |
| gap | `SpaceToken` | `4` | Gap between cards |
| value | `string` | — | Controlled selected value |
| defaultValue | `string` | `''` | Uncontrolled default |
| onValueChange | `(value: string) => void` | — | Change handler |
| disabled | `boolean` | `false` | Disables all cards |

## Item Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | **required** | Unique value |
| disabled | `boolean` | — | Disables this card |
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
