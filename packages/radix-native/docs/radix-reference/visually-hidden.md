# VisuallyHidden — Radix reference

Sources: Radix Themes `packages/radix-ui-themes/src/components/visually-hidden.tsx` (re-export of the primitive: `VisuallyHidden = Root = VisuallyHiddenPrimitive.Root`; `visually-hidden.props.tsx` is empty); Radix Primitives `packages/react/visually-hidden/src/visually-hidden.tsx`. Docs: https://www.radix-ui.com/themes/docs/components/visually-hidden

## 1. Parts

Single `VisuallyHidden` (= `Root`), a `Primitive.span`. Also exported by the primitive: `VISUALLY_HIDDEN_STYLES`.

## 2. Props

All `span` props plus `asChild` (from `Primitive`). No Themes props, no margin props, nothing responsive. `style` is merged **after** the hidden styles (`{ ...VISUALLY_HIDDEN_STYLES, ...props.style }`), so a consumer can override them.

## 3. Visual values

`VISUALLY_HIDDEN_STYLES` (Bootstrap's visually-hidden mixin):
`position: absolute; border: 0; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; word-wrap: normal`.

Content is invisible and takes no layout space, but stays in the accessibility tree (read by screen readers, unlike `display: none` / `aria-hidden`).

## 4. Behaviour

No state. Purely an a11y utility; content remains focusable if it contains focusable elements (a focusable child stays invisible — Radix doesn't reveal on focus).

## 5. RN notes

- Map to a `View` (or `Text` for string children) with `position: 'absolute', width: 1, height: 1, margin: -1, overflow: 'hidden', opacity: 0` — RN has no `clip`; `opacity: 0` + 1×1 overflow-hidden box is the closest. Do **not** use `display: 'none'` or `accessibilityElementsHidden`: both remove it from the a11y tree.
- Keep the 1×1 size: screen readers may skip zero-size elements. Whether VoiceOver/TalkBack still focus an `opacity: 0` element is unverified here — check on device before relying on it (fallback: tiny size + transparent color instead of opacity).
- Strings must be wrapped in RN `Text`.
- In RN the common need is "label without visible text": often better solved with `accessibilityLabel` on the parent. Keep VisuallyHidden for parity (e.g. a Dialog title that must exist but be hidden).
- No Variant recipe, no Metrics.
