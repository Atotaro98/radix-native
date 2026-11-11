# AspectRatio — Radix reference

Sources: Radix Themes `packages/radix-ui-themes/src/components/aspect-ratio.tsx` (a direct re-export: `export const AspectRatio = AspectRatioPrimitive.Root`); Radix Primitives `packages/react/aspect-ratio/src/aspect-ratio.tsx`. Docs: https://www.radix-ui.com/themes/docs/components/aspect-ratio

## 1. Parts

Single `AspectRatio` (= primitive `Root`). Themes adds no class, CSS, margin props or layout props. Renders two elements:

```
<div data-radix-aspect-ratio-wrapper style="position:relative; width:100%; padding-bottom:{100/ratio}%">
  <div {...props} style="{...style}; position:absolute; top:0; right:0; bottom:0; left:0">children</div>
</div>
```

The forwarded ref, user props and `style` land on the **inner** div; the outer wrapper is not customisable.

## 2. Props

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `ratio` | `number` | `1 / 1` | no |
| `asChild` | `boolean` (Primitive.div) | — | no |
| all `div` props | — | — | — |

No margin/layout props (Themes doesn't wrap it with extractProps).

## 3. Visual values

None besides the geometry above. Width is always 100% of the parent; height = width / ratio. Docs example: `ratio={16 / 8}` wrapping an `<img>` with `objectFit: cover`, `width/height: 100%`, `borderRadius: var(--radius-2)`.

## 4. Behaviour

No state or a11y semantics.

## 5. RN notes

- Maps directly to RN's `aspectRatio` style: `<View style={{ width: '100%', aspectRatio: ratio }}>`. No padding-bottom trick or absolute child needed; a single View suffices, children fill it with `flex: 1` or `StyleSheet.absoluteFill`.
- Keep `width: '100%'` default to match Radix (outer wrapper is always full-width). If a consumer passes `style.width` it would apply to the inner div in Radix (which is absolutely filled, so it has no effect); in RN we can let `style` apply to the single View — document as a harmless difference.
- Children that are `Image` need explicit `width/height: '100%'` (as in the docs example).
- No Variant recipe needed. Not a Selection group or compound component.
