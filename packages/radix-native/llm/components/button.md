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

- `children` string is auto-wrapped in `<Text>` (no need for separate text element)
- Loading spinner size scales with button size (1→16px, 2→20px, 3→20px, 4→24px)
- Ghost variant uses `fontWeight: '400'` (regular), others use `'500'` (medium)
- No `asChild` prop

## Known RN limitations

- **Solid pressed filter**: Radix applies `brightness(0.92) saturate(1.1)` on active press. RN has no CSS filters — we use `accent-10` bg change instead (close visual match).
- **Outline highContrast border**: Radix uses double inset shadow (`accent-a7` + `gray-a11`). RN can't do double borders — we use single `gray-a11` border.
- **Surface border on press**: Radix changes border from `accent-a7` to `accent-a8` on hover/press. We keep `accent-a7` static (no hover in touch UIs).
