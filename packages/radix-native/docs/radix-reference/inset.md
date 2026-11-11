# Inset — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/inset.tsx`, `components/inset.props.tsx`, `components/inset.css`, `styles/utilities/padding.css` (`.rt-r-p-inset` etc.), `styles/utilities/margin.css`, `components/_internal/base-card.css`, `components/card.css`; other providers of the plumbing: `components/_internal/base-dialog.css`, `components/popover.css`, `components/hover-card.css`; consumer: `components/table.css`. Docs: https://www.radix-ui.com/themes/docs/components/inset

## 1. Parts

Single component, no primitive. `<div class="rt-Inset rt-r-side-* rt-r-clip-* …">` (or Slot with `asChild`). Meaningful only inside a parent that publishes the `--inset-*` variables (Card, Dialog/AlertDialog content, Popover content, HoverCard content). Elsewhere every variable falls back to `0px`, so Inset does nothing but `overflow: hidden`.

## 2. Props

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `side` | `'all' \| 'x' \| 'y' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'all'` | yes |
| `clip` | `'border-box' \| 'padding-box'` | `'border-box'` | yes |
| `p`, `px`, `py`, `pt`, `pr`, `pb`, `pl` | `'current' \| '0'` | — | yes (`'current'` is parsed to the `rt-r-p*-inset` class) |
| `asChild` | `boolean` | — | no |
| Margin props `m…ml` | space tokens / string | — | yes (combined with the negative inset margin, see below) |

Not LayoutProps: only these padding values; no width/height/etc.

## 3. Visual values and CSS-var plumbing

### Variables a parent publishes

| Parent | `--inset-padding-{top,right,bottom,left}` | `--inset-border-width` | `--inset-border-radius` |
|---|---|---|---|
| Card (`.rt-BaseCard`) | `calc(--base-card-padding-* − --base-card-border-width)` = card padding − border width | `--card-border-width` (surface/classic `1px`, ghost `0px`) | `--card-border-radius` |
| Dialog / AlertDialog content | `--dialog-content-padding` | — (0) | — (0) |
| Popover content | `--popover-content-padding` | — | — |
| HoverCard content | `--hover-card-content-padding` | — | — |

Card sizes (`card.css`): padding `--space-3/4/5/6/8` and radius `--radius-4/4/5/5/6` for sizes 1–5.

### Clip → derived variables (`.rt-Inset:where(.rt-r-clip-*)`)

| clip | `--inset-padding-*-calc` | `--inset-border-radius-calc` |
|---|---|---|
| `border-box` (default) | `--inset-padding-*` (= P − bw on a Card) | `--inset-border-radius − --inset-border-width` (R − bw) |
| `padding-box` | `--inset-padding-* + --inset-border-width` (= P on a Card) | `--inset-border-radius` (R) |

On a Card (whose border is a 1px outset `box-shadow` ring on `::after`, drawn on top of children in the outer 1px band): `border-box` stops the content 1px inside the outer edge (inside the ring); `padding-box` reaches the outer edge and lies under the translucent ring. The names read inverted relative to intuition — follow the math, not the names.

### Side → negative margins and radius (`.rt-Inset:where(.rt-r-side-*)`)

`.rt-Inset` resets `--margin-*: 0px`, sets `overflow: hidden`, and `margin-* : var(--margin-*-override)`. Margin utilities set `--margin-*` (user margin M). For a side "pulled", override = `M − pad-calc`; otherwise `M`.

| side | pulled sides | radius |
|---|---|---|
| `all` | top, right, bottom, left | all corners `radius-calc` |
| `x` | left, right | `0` |
| `y` | top, bottom | `0` |
| `top` | top, left, right | top-left/top-right `radius-calc`, bottom `0` |
| `bottom` | bottom, left, right | bottom-left/bottom-right `radius-calc`, top `0` |
| `left` | left, top, bottom | top-left/bottom-left `radius-calc`, right `0` |
| `right` | right, top, bottom | top-right/bottom-right `radius-calc`, left `0` |

Direct children get `--margin-*-override: initial` so nested components don't inherit the override.

### Padding `'current'` (`padding.css`)

`.rt-r-p-inset { padding: var(--inset-padding-top/right/bottom/left) }`; axis/side variants likewise. Note it uses the **raw** `--inset-padding-*` (P − bw on a Card), not the clip-adjusted `-calc` value. `'0'` = `0`. Docs example: `<Inset side="top" clip="padding-box" pb="current">` over an image, inside a Card — `pb="current"` restores the card's spacing below the bled image.

Table: `.rt-Inset :where(.rt-TableCell:first-child/last-child)` uses `padding-left/right: var(--inset-padding-left/right, var(--table-cell-padding))` so a Table inside an Inset aligns its outer cells with the card content.

## 4. Behaviour

None. No state, role or aria.

## 5. RN notes

- No CSS variables: needs an **Inset context** published by Card (and later Dialog/Popover/HoverCard content) with `{ padding: {top,right,bottom,left}, borderWidth, borderRadius }` as resolved px. Inset reads it; without a provider all values are 0 (matching Radix fallback).
- Our Card (`src/components/layout/Card.tsx`) uses an RN `borderWidth: 1` with `padding: P` inside it, so content starts at `bw + P` from the outer edge, while Radix content starts at `P` (border drawn over the padding). The Inset context should publish what actually separates content from the clip edge in our Card: RN `overflow: 'hidden'` clips at the inner edge of the border on Android and the outer edge on iOS (border drawn above children). Proposal: Card publishes `padding = P` and `borderWidth = bw`; Inset applies `margin = M − P` for `border-box` (content touches the border's inner edge, radius `R − bw`) and `M − P − bw` for `padding-box` (radius `R`). Verify visually on both platforms; record in `llm/differences.md`.
- Radius per corner: `borderTopLeftRadius` etc. directly; `overflow: 'hidden'` so images clip to it.
- `p*="current"` → padding from context (Radix raw `--inset-padding-*`); `'0'` → 0. Keep the narrow `'current' | '0'` type rather than LayoutProps padding.
- Ghost Card: Radix ghost card itself takes negative margin `−card-padding` and `--card-border-width: 0`; Inset inside it publishes `P` and `bw = 0`.
- No Variant recipe needed.
