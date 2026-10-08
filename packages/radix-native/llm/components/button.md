# Button

> Trigger an action or event.

## Import

```tsx
import { Button } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3 \| 4` | `2` | Button size |
| variant | `'classic' \| 'solid' \| 'soft' \| 'surface' \| 'outline' \| 'ghost'` | `'solid'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| radius | `RadiusToken` | theme radius | Override border radius |
| loading | `boolean` | `false` | Shows spinner, disables button |
| disabled | `boolean` | `false` | Disables button |
| children | `ReactNode` | — | Button content (string auto-wrapped in Text) |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |
| maxFontSizeMultiplier | `number` | `2` (fallback) | Caps font scaling for accessibility. Local prop > Theme global > 2 |
| onPress | `(e) => void` | — | Press handler |

## Examples

```tsx
// Sizes
<Button size={1}>Small</Button>
<Button size={2}>Default</Button>
<Button size={3}>Large</Button>
<Button size={4}>Extra large</Button>

// Variants
<Button variant="solid">Solid</Button>
<Button variant="soft">Soft</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>

// Colors
<Button color="red">Delete</Button>
<Button color="green">Confirm</Button>

// Loading
<Button loading>Saving...</Button>

// With icon (pass as ReactNode)
<Button><MyIcon /> Save</Button>
```

## Differences from Radix web

- `children` strings are auto-wrapped in `<Text>`; adjacent strings/numbers are merged into one label (`<Button>Hello {name}</Button>` renders a single text)
- Icon elements receive the button text color via `color` **only if they don't set `color` themselves**
- Loading uses the library `Spinner` (works on iOS and Android) with the button text color; size scales with button size (1→Spinner 1, 2/3→Spinner 2, 4→Spinner 3)
- Consumer `onPressIn` / `onPressOut` / `onFocus` / `onBlur` / `accessibilityState` are composed with the internal ones
- Default `hitSlop` extends small sizes to a 44pt touch target
- Ghost variant uses `fontWeight: '400'` (regular), others use `'500'` (medium)
- No `asChild` prop

## Known RN limitations

- **Solid pressed filter**: Radix applies `brightness(0.92) saturate(1.1)` on active press. RN has no CSS filters — we use `accent-10` bg change instead (close visual match).
- **Outline highContrast border**: Radix uses double inset shadow (`accent-a7` + `gray-a11`). RN can't do double borders — we use single `gray-a11` border.
- **Surface border on press**: Radix changes border from `accent-a7` to `accent-a8` on hover/press. We keep `accent-a7` static (no hover in touch UIs).
