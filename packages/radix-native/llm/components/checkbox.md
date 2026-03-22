# Checkbox

> Toggle control for boolean or indeterminate state.

## Import

```tsx
import { Checkbox } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Checkbox size |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| checked | `boolean \| 'indeterminate'` | — | Controlled checked state |
| defaultChecked | `boolean \| 'indeterminate'` | `false` | Uncontrolled default |
| onCheckedChange | `(checked: CheckedState) => void` | — | Change handler |
| disabled | `boolean` | `false` | Disables checkbox |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Examples

```tsx
// Uncontrolled
<Checkbox defaultChecked />

// Controlled
<Checkbox checked={agreed} onCheckedChange={setAgreed} />

// Indeterminate
<Checkbox checked="indeterminate" />

// Variants
<Checkbox variant="classic" />
<Checkbox variant="surface" />
<Checkbox variant="soft" />
```

## Indicator

The checkmark and dash indicators are drawn with `View` borders (not text/SVG) for pixel-perfect rendering without external dependencies. The checkmark is an L-shaped border rotated -45deg.

## Known RN limitations

- **Indicator is View-based**: Radix uses SVG paths (`ThickCheckIcon`, `ThickDividerHorizontalIcon`). We draw the check with View borders rotated -45deg and the dash with a simple View — close match but not pixel-identical.
- **Classic unchecked shadow**: Radix uses `box-shadow: var(--shadow-1)` for the classic unchecked state. RN shadow is platform-specific and less precise.
- **No hover states**: Checkbox in Radix has hover feedback via CSS. Touch-based interactions don't have hover.

## Related

- `CheckboxGroup` — group of labeled checkboxes with shared state
- `CheckboxCards` — card-style checkbox grid
- `Switch` — toggle for on/off states
