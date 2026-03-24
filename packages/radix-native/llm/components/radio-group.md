# RadioGroup

> Group of labeled radio buttons with shared selection state.

## Import
```tsx
import { RadioGroup } from 'radix-native'
```

## Usage
```tsx
<RadioGroup.Root defaultValue="a" onValueChange={setValue}>
  <RadioGroup.Item value="a">Option A</RadioGroup.Item>
  <RadioGroup.Item value="b">Option B</RadioGroup.Item>
  <RadioGroup.Item value="c" disabled>Option C</RadioGroup.Item>
</RadioGroup.Root>
```

## Root Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Radio size |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases contrast |
| value | `string` | — | Controlled selected value |
| defaultValue | `string` | `''` | Uncontrolled default |
| onValueChange | `(value: string) => void` | — | Change handler |
| disabled | `boolean` | `false` | Disables all radios |

## Item Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `string` | **required** | Unique value |
| disabled | `boolean` | — | Disables this item |
| children | `ReactNode` | — | Label text |
| maxFontSizeMultiplier | `number` | — | Caps font scaling for label text |

## Examples
```tsx
// Controlled
const [plan, setPlan] = useState('free')
<RadioGroup.Root value={plan} onValueChange={setPlan}>
  <RadioGroup.Item value="free">Free</RadioGroup.Item>
  <RadioGroup.Item value="pro">Pro</RadioGroup.Item>
  <RadioGroup.Item value="enterprise">Enterprise</RadioGroup.Item>
</RadioGroup.Root>
```
