# Section — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/section.tsx`, `components/section.props.tsx`, `components/section.css`, `props/layout.props.ts`. Docs: https://www.radix-ui.com/themes/docs/components/section

## 1. Parts

Single component, no primitive. Renders `<section class="rt-Section rt-r-size-N …">` (or Slot with `asChild`).

## 2. Props

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3' \| '4'` | `'3'` | yes |
| `display` | `'none' \| 'initial'` | — | yes (`'initial'` parsed to `display: block`) |
| `asChild` | `boolean` | — | no |
| LayoutProps (`p*`, `width…maxHeight`, `position`, `inset`, offsets, `overflow*`, flex/grid child props) | per layout.props | — | yes |
| Margin props | space tokens / string | — | yes |

Note: layout padding props (`py`, `pt`, `pb`…) are utility classes and override the size padding when set (same specificity order as Radix utilities: `.rt-Section:where(.rt-r-size-N)` has class specificity 0-1-0, the `rt-r-py-*` utilities come later).

## 3. Visual values (`section.css`)

- `.rt-Section`: `box-sizing: border-box; flex-shrink: 0`.
- Vertical padding only (`padding-top` and `padding-bottom`):

| size | token | px @ scaling 1 |
|---|---|---|
| 1 | `--space-5` | 24 |
| 2 | `--space-7` | 40 |
| 3 (default) | `--space-9` | 64 |
| 4 | `calc(80px * var(--scaling))` | 80 |

No horizontal padding, colors or radius.

## 4. Behaviour

Semantic `<section>` element only; no role/state.

## 5. RN notes

- Maps directly to a `View` with `paddingVertical = metrics.space(5|7|9)` or `metrics.px(80)` for size 4 (80 is not a space token but is scaled), `flexShrink: 0`.
- Explicit `py/pt/pb/p` from LayoutProps should win over the size padding.
- `<section>` semantics: RN has no landmark role equivalent on iOS/Android; nothing to map (react-native-web could use `role="region"` only if labelled — not needed).
- `display: 'initial'` → RN `'flex'` (no `block` in RN).
- No Variant recipe needed.
