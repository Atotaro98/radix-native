# Avatar

> Profile picture, user initials or fallback icon.

## Import

```tsx
import { Avatar } from 'radix-native'
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | `string \| number \| { uri: string }` | — | Image source (URL, require(), or uri object) |
| fallback | `ReactNode` | **required** | Content shown when image unavailable |
| size | `1-9` | `3` | Avatar size (24px to 160px) |
| variant | `'solid' \| 'soft'` | `'soft'` | Visual variant for fallback background |
| color | `AccentColor` | theme accent | Accent color |
| highContrast | `boolean` | — | Increases color contrast |
| radius | `RadiusToken` | theme radius | Override border radius |
| m, mx, my, mt, mr, mb, ml | `MarginToken` | — | Margin spacing tokens |

## Size reference

| Size | Pixels | 1-letter font | 2-letter font |
|------|--------|---------------|---------------|
| 1 | 24 | 14px | 12px |
| 2 | 32 | 16px | 14px |
| 3 | 40 | 18px | 16px |
| 4 | 48 | 20px | 18px |
| 5 | 64 | 24px | 24px |
| 6 | 80 | 28px | 28px |
| 7 | 96 | 28px | 28px |
| 8 | 128 | 35px | 35px |
| 9 | 160 | 60px | 60px |

## Examples

```tsx
// With image
<Avatar src="https://example.com/photo.jpg" fallback="JD" size={5} />

// With text fallback
<Avatar fallback="A" variant="solid" color="blue" />
<Avatar fallback="BG" variant="soft" color="red" />

// With icon fallback (icon receives color prop automatically)
<Avatar fallback={<MyPersonIcon />} size={7} variant="solid" />

// Different radii
<Avatar fallback="AB" radius="none" />   // square
<Avatar fallback="AB" radius="full" />   // circle
```

## Loading behavior

Matches Radix web: during image loading, the colored background (placeholder) is shown. Fallback text/icon only appears on error or when no `src` is provided. The image component is kept mounted but hidden (`opacity: 0`) until loaded.

## Differences from Radix web

- Single `<Avatar>` component instead of `<Avatar.Root>` + `<Avatar.Image>` + `<Avatar.Fallback>`
- `src` prop instead of child `<Avatar.Image src={}>`
- Fallback text is auto-uppercased (matching Radix CSS `text-transform: uppercase`)
- Non-string fallbacks receive `color` prop via `cloneElement` (RN equivalent of CSS `color` inheritance)
- Solid highContrast text uses `accent-1` (not `gray-1`) — matches Radix CSS `var(--accent-1)`
