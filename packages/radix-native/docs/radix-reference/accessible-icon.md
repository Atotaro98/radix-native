# AccessibleIcon — Radix reference

Sources: Radix Themes `packages/radix-ui-themes/src/components/accessible-icon.tsx` (re-export: `AccessibleIcon = AccessibleIconPrimitive.Root`); Radix Primitives `packages/react/accessible-icon/src/accessible-icon.tsx` (uses `@radix-ui/react-visually-hidden`). Docs: https://www.radix-ui.com/themes/docs/components/accessible-icon (no props table, no examples; "inherits all props and functionality from the Accessible Icon primitive").

## 1. Parts

Single `AccessibleIcon` (= `Root`). A function component (`React.FC`), **no ref forwarding, no DOM element of its own**. Renders a fragment:

```
<>
  {cloneElement(onlyChild, { 'aria-hidden': 'true', focusable: 'false' })}
  <VisuallyHidden.Root>{label}</VisuallyHidden.Root>
</>
```

## 2. Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `label` | `string` | — (**required**) | announced text, visually hidden |
| `children` | `ReactNode` | — | must be exactly one element (`React.Children.only` throws otherwise) |

No other props (no style, margin, asChild). Nothing responsive.

## 3. Visual values

None. The icon renders unchanged; the label is a VisuallyHidden span (see `visually-hidden.md`) placed **as a sibling after** the icon, so it lands in the icon's parent.

## 4. Behaviour

- The icon is hidden from assistive tech (`aria-hidden`) and made non-focusable (`focusable="false"`, for old IE/Edge SVG focus).
- The label is read in its place. Typical use: icon-only button content (`<IconButton><AccessibleIcon label="Close"><Cross2Icon/></AccessibleIcon></IconButton>`) where the button's accessible name comes from the hidden span.

## 5. RN notes

- RN computes a Pressable's accessible name from its descendants' text when `accessible` (default for Pressable on iOS) and `accessibilityLabel` isn't set; a hidden Text sibling works similarly to the web but is fragile.
- Proposed adaptation: render `cloneElement(child, { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' })` plus our `VisuallyHidden` with `label`, to keep parity. Alternative (more robust on native): wrap in a `View accessible accessibilityRole="image" accessibilityLabel={label}` — but inside an IconButton that would create a nested accessible element; IconButton should then read the label. Decide which; the sibling approach is closest to Radix and lets the parent button merge the text.
- Keep `React.Children.only` semantics (throw on multiple children) for parity.
- `focusable="false"` has no RN meaning (icons aren't focusable); drop.
- No Variant recipe, no Metrics.
