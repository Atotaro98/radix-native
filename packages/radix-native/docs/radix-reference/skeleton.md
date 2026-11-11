# Skeleton — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/skeleton.tsx`, `components/skeleton.props.tsx`, `components/skeleton.css`, `components/index.css` (import order), `helpers/inert.ts`; components overriding skeleton vars: `components/switch.css`, `components/_internal/base-checkbox.css`, `components/_internal/base-radio.css`. Docs: https://www.radix-ui.com/themes/docs/components/skeleton
Our implementation: `src/components/feedback/Skeleton.tsx`.

## 1. Parts

Single component, no primitive. Three render paths:

- `loading === false` → returns `children` unchanged (no wrapper).
- `children` is a valid React element → `Slot.Root`: the skeleton class/attrs are **merged onto the child itself** (the child becomes the skeleton, keeping its own size, layout and — where its CSS wins — radius).
- otherwise (text, empty, fragments of strings) → `<span class="rt-Skeleton" data-inline-skeleton>`.

Always sets `aria-hidden`, `tabIndex={-1}`, `inert`.

## 2. Props

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `loading` | `boolean` | `true` | no |
| `width`, `minWidth`, `maxWidth` | `string` | — | yes |
| `height`, `minHeight`, `maxHeight` | `string` | — | yes |
| Margin props | — | — | yes |

## 3. Visual values (`skeleton.css`)

- `.rt-Skeleton`: `border-radius: var(--radius-1)`; `animation: rt-skeleton-pulse 1000ms infinite alternate-reverse` (default timing function `ease`); `!important` resets: `background-image: none`, `border: none`, `box-shadow: none`, `outline: none`, `color: transparent`, `pointer-events: none`, `user-select: none`, `cursor: default`, `box-decoration-break: clone`.
- Keyframes `rt-skeleton-pulse`: `from { background-color: var(--gray-a3) } to { background-color: var(--gray-a4) }`. With `alternate-reverse`, the first cycle runs to → from (starts at **gray-a4**), 1000 ms each way, 2000 ms full period.
- Children and `::before/::after`: `visibility: hidden !important` (keep layout, invisible).
- Inline text skeleton (`[data-inline-skeleton]`): `line-height: 0; font-family: Arial, sans-serif !important` — the background covers each line's glyph box (cloned per line fragment), so multi-line text gives one bar per line with gaps between lines.
- Empty skeleton (`:where(.rt-Skeleton:empty)`): `display: block; height: var(--space-3)` (12px × scaling).
- Radius cascade: `skeleton.css` is imported before every other component, so a wrapped component's own `border-radius` (Button, Card, Avatar, TextField…) wins over `--radius-1`. Switch / Checkbox / Radio set `--skeleton-radius-override` (switch radius, checkbox radius, `100%`) and `--skeleton-height-override` (their control size instead of the text line height) which `.rt-Skeleton` copies into `--skeleton-radius` / `--skeleton-height`.

## 4. Behaviour

- Hidden from assistive tech (`aria-hidden`), unfocusable (`tabIndex -1`), `inert` (whole subtree non-interactive), `pointer-events: none`.
- No controlled state; `loading` simply switches rendering.

## 5. RN notes and mismatches with `src/components/feedback/Skeleton.tsx`

Matches: `loading` default `true`, returns children when not loading (after hooks), gray-a3 ↔ gray-a4 pulse at 1000 ms per direction, `radius(1)`, width/height/min/max props, margins, hidden from a11y (`accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`), children kept in layout with `opacity: 0`.

Mismatches:

1. **Empty height**: ours defaults to `16` unscaled; Radix is `--space-3` = `metrics.space(3)` (12 × scaling).
2. **Easing / phase**: ours `Easing.inOut(Easing.ease)` starting at gray-a3; Radix CSS `ease` (`cubic-bezier(0.25, 0.1, 0.25, 1)`) on each half, starting at gray-a4 (`alternate-reverse`). Minor.
3. **Element children radius**: Radix keeps the child's own radius (Button pill, Card radius-4, Avatar…) and Switch/Checkbox/Radio radius via `--skeleton-radius-override`; ours always forces `radius(1)` on a wrapper View. Proposal: accept a radius from the child (e.g. a `SkeletonContext` that controls read to report their radius/size, or a `radius` prop), and for Switch/Checkbox/Radio use their Indicator geometry (`--skeleton-height-override`: control size, not line height).
4. **Text children**: ours renders strings in a plain `RNText` (no Text style, default RN font/size), so the placeholder size doesn't match surrounding `Text`. Should render through the Text style / inherit `TextContext` so `<Text><Skeleton>…</Skeleton></Text>` sizes like the text. Radix also draws one bar per line (box-decoration clone, line-height 0) — RN can't; one block covering all lines is the accepted approximation (record in differences).
5. **Touch blocking**: Radix `pointer-events: none` + `inert` on the whole skeleton; ours only sets `pointerEvents="none"` on the inner children View, the outer View can still capture touches/`...rest` handlers (should be `pointerEvents="none"` on the root, or `box-only` to swallow). Also interactive children (Switch inside) must be non-focusable for screen readers — already covered by `no-hide-descendants`.
6. **Wrapper vs Slot**: ours always adds a wrapper View with its own `overflow: hidden`; Radix (element child) styles the child itself, so the child's margins/flex props act on the parent layout. With our wrapper, a child's `flex: 1` or margins act inside the wrapper. Acceptable, but note in differences.
7. Hidden content uses `opacity: 0` vs Radix `visibility: hidden` and `color: transparent`; also Radix removes the child's own border/box-shadow/background-image — with `opacity: 0` on children, borders are hidden too, so equivalent.

No Variant recipe needed (fixed gray steps; CLAUDE.md lists Skeleton as a direct `rc` user).
