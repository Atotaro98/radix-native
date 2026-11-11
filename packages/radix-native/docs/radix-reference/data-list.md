# DataList — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/data-list.tsx`, `components/data-list.props.tsx`, `components/data-list.css`, `components/text.css`, `props/leading-trim.prop.ts`, `props/width.props.ts`, `props/color.prop.ts`, `styles/utilities/align-items.css`, `styles/tokens/typography.css`. Docs: https://www.radix-ui.com/themes/docs/components/data-list

## 1. Parts

No Radix primitive. Compound `DataList.Root / Item / Label / Value`.

| Part | Element | Notes |
|---|---|---|
| `Root` | `<Text asChild><dl class="rt-DataListRoot rt-r-size-N …"></Text>` | Because the `dl` also gets `.rt-Text`, the root's `rt-r-size-N` class triggers Text's size rules: **font-size/line-height/letter-spacing of Text size N** for the whole list |
| `Item` | `div.rt-DataListItem` | one key/value row |
| `Label` | `dt.rt-DataListLabel` | `data-accent-color={color}` |
| `Value` | `dd.rt-DataListValue` | — |

No `asChild` on any part.

## 2. Props

**Root**: margin props, plus

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | yes |
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `trim` | `'normal' \| 'start' \| 'end' \| 'both'` | — | yes (custom `rt-r-trim-*` classes) |

**Item**: `align`: `'start' \| 'center' \| 'end' \| 'baseline' \| 'stretch'`, no default (CSS default `baseline` in horizontal), responsive.

**Label**: `width`, `minWidth`, `maxWidth` (string, responsive); `color` (accent color, default undefined); `highContrast` (boolean).

**Value**: only `dd` props.

## 3. Visual values (`data-list.css`)

**Root**: `overflow-wrap: anywhere; font-family: --default-font-family; font-weight: normal; font-style: normal; text-align: start`. Font size via Text: size 1 → 12/16 (letter-spacing 0.0025em), 2 → 14/20, 3 → 16/24 (× scaling).

Gap (`.rt-DataListRoot:where(.rt-r-size-N)`): 1 → `--space-3` (12), 2 → `--space-4` (16), 3 → `calc(var(--space-4) * 1.25)` (20). Used as row and column gap.

**Label**: `display: flex; color: --gray-a11`; high contrast `--gray-12`; with `color` → `--accent-a11`, high contrast `--accent-12`.
**Value**: `display: flex; margin: 0; min-width: 0` (allows truncation). Value text color is inherited (page text, i.e. Theme default `--gray-12`).

**Orientation horizontal** (default): Root `display: grid; grid-template-columns: auto 1fr`. Item: `display: grid; grid-template-columns: subgrid; gap: inherit; grid-column: span 2; align-items: baseline` — labels of all rows share one auto column width (= widest label). Label `min-width: 120px` (not scaled).

**Orientation vertical**: Root `display: flex; flex-direction: column` (gap from size). Item `display: flex; flex-direction: column; gap: var(--space-1)` (4). Label `min-width: 0`.

**Value vertical trim (horizontal only)**: Value gets `margin-top/bottom` of `-0.25em` so tall content (Badge, IconButton…) can poke 0.25em outside the row without growing it; first item's top / last item's bottom are `0` so it doesn't leave the Root. Per `Item align`:

| align | trim start | trim end | first-item start | last-item end |
|---|---|---|---|---|
| baseline / default | −0.25em | −0.25em | 0 | 0 |
| start | 0 | −0.25em | 0 | 0 |
| center | −0.25em | −0.25em | −0.25em | −0.25em |
| end | −0.25em | 0 | 0 | 0 |
| stretch | 0 | 0 | 0 | 0 |

Vertical orientation resets all to 0.

**Baseline**: Label and Value get `::before { content: '\200D' }` (zero-width joiner) so flex children align on a text baseline even when empty or containing only boxes.

**Trim** (`.rt-DataListRoot:where(.rt-r-trim-*)`): `--data-list-leading-trim-start = calc(--default-leading-trim-start (0.42em) − --line-height / 2)`, `-end = calc(0.36em − --line-height / 2)`; first Item gets `margin-top: var(--leading-trim-start)`, last Item `margin-bottom: var(--leading-trim-end)` for `start` / `end` / `both`; `normal` = none.

No states, no variants.

## 4. Behaviour

Semantic `dl/dt/dd` only (screen readers announce a description list with term/definition pairs). No interaction.

## 5. RN notes

- Compound `Object.assign(Root, { Root, Item, Label, Value })`. Root provides context `{ orientation, size, labelWidth? }` and a `TextContext`-compatible text size (via `useTextStyle(...).provide`) so plain strings inside Label/Value render at size N.
- Strings in Label/Value must be wrapped in our Text (RN can't render raw strings in a View); Label passes `color` (gray-a11 / gray-12 / accent-a11 / accent-12), Value inherits standalone color.
- **Subgrid has no RN equivalent**: aligning all label columns needs either (a) a fixed label width (`minWidth` 120 default, consumer `width`), or (b) measure each Label with `onLayout`, take the max in Root context and apply it to all — CLAUDE.md discourages `onLayout` for columns; propose (a) default `minWidth: 120` (Radix's own implicit min) plus measure-max as an enhancement. Record the difference.
- Horizontal Item: `flexDirection: 'row'`, `columnGap = gap`, `alignItems` from `align` (default `'baseline'` — RN supports `alignItems: 'baseline'` on iOS and Android, but only aligns Text children well). Value `flex: 1, minWidth: 0`.
- Vertical: Item `flexDirection: 'column', gap: metrics.space(1)`.
- Root gap between items: `metrics.space(3|4)` and `metrics.px(20)` for size 3.
- −0.25em value margins: `text.em(-0.25)` from the Text style; apply per the table (first/last item exceptions need index awareness — Root can clone with `isFirst/isLast` via context or `React.Children.map`).
- Zero-width-joiner baseline trick: unnecessary in RN; drop.
- `trim`: leading trim — RN has no `text-box-trim`; approximate with negative margins `text.em(0.42) − lineHeight/2` (start) and `text.em(0.36) − lineHeight/2` (end) on the first/last Item. Our Text has no `trim` yet, so this would be the first leading-trim implementation; consider adding it to the Text style instead.
- `overflow-wrap: anywhere` has no RN equivalent (RN wraps at word boundaries; long words break anyway on Android, not on iOS) — note as difference.
- Accessibility: no `dl` role in RN; consider making each Item an `accessible` group whose label is "Label, Value" — optional.
- Needs no Variant recipe; Label colors are fixed steps chosen by `color`/`highContrast` (could go in the "text" Variant family recipe since it's the Text color rule with gray-a11 default).
