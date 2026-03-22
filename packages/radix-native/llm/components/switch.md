# Switch

> Toggle control for on/off states.

## Import

```tsx
import { Switch } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `1 \| 2 \| 3` | `2` | Switch size |
| variant | `'classic' \| 'surface' \| 'soft'` | `'surface'` | Visual variant |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| radius | `RadiusToken` | theme radius | Override border radius |
| checked | `boolean` | — | Controlled checked state |
| defaultChecked | `boolean` | `false` | Uncontrolled default |
| onCheckedChange | `(checked: boolean) => void` | — | Change handler |
| disabled | `boolean` | `false` | Disables switch |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Examples

```tsx
// Uncontrolled
<Switch defaultChecked />

// Controlled
<Switch checked={darkMode} onCheckedChange={setDarkMode} />

// Sizes
<Switch size={1} />
<Switch size={2} />
<Switch size={3} />
```

## Size reference

| Size | Track W | Track H | Thumb | Inset |
|------|---------|---------|-------|-------|
| 1 | 28px | 16px | 14px | 1px |
| 2 | 35px | 20px | 18px | 1px |
| 3 | 42px | 24px | 22px | 1px |

## Animation

Thumb slides with material ease-out curve (`Easing.bezier(0.4, 0, 0.2, 1)`) using `useNativeDriver: true` for 60fps.

## Radius behavior

Uses `--radius-thumb` system: pill-shaped for `medium`/`large`/`full`, nearly square for `none`/`small`. This matches Radix web's `max(var(--radius-N), var(--radius-thumb))` pattern.

## Known RN limitations

- **Track gradient**: Radix uses `background-image: linear-gradient(to right, accent-track 40%, transparent 60%)` for the smooth checked/unchecked transition. RN has no background-image on Views — we use solid background-color swap.
- **Thumb shadow**: Radix applies elaborate multi-layer box-shadow on the thumb. RN shadow is limited — we use a clean flat thumb.
- **Checked active filter**: Radix applies `brightness(0.92)` on press while checked. Not available in RN.
- **Disabled blend mode**: Radix uses `mix-blend-mode: multiply/screen`. Not supported in RN — we use alpha colors instead.
