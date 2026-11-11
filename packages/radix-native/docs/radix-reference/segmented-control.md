# SegmentedControl — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/segmented-control.{tsx,props.tsx,css}`, `THEMES/styles/tokens/typography.css` (tab letter spacing),
`PRIM/toggle-group/src/toggle-group.tsx`, `PRIM/toggle/src/toggle.tsx`. Docs: radix-ui.com/themes/docs/components/segmented-control.

## 1. Parts

| Part | Element | Primitive |
|---|---|---|
| `SegmentedControl.Root` | `div.rt-SegmentedControlRoot` | `ToggleGroup.Root` forced `type="single"` |
| `SegmentedControl.Item` | `button.rt-reset.rt-SegmentedControlItem` | `ToggleGroup.Item` |
| (internal) indicator | `div.rt-SegmentedControlIndicator`, appended **after** all items inside Root | — |

Item DOM: `span.rt-SegmentedControlItemSeparator` + `span.rt-SegmentedControlItemLabel` › (`span.rt-SegmentedControlItemLabelActive` {children}, `span.rt-SegmentedControlItemLabelInactive[aria-hidden]` {children}). Children are rendered **twice** (medium + regular weight stacked) so the width never changes when weight changes.

## 2. Props

Root (`segmentedControlRootPropDefs`) + margin props:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `variant` | `'surface' \| 'classic'` | `'surface'` | no |
| `radius` | `'none'…'full'` | inherit theme | no (→ `data-radius`) |
| `disabled` | `boolean` | `false` | no (→ `data-disabled`, passed to ToggleGroup) |
| `value` / `defaultValue` | `string` | — / undefined | — |
| `onValueChange` | `(value: string) => void` | — | — |

No `color` / `highContrast` prop — the control is gray-only.

Item: `value: string` (required). `disabled` is **removed** from Item props and forced `disabled={false}`; per-item disabling is impossible. ToggleGroup computes `disabled = context.disabled || props.disabled`, so only Root `disabled` disables items.

## 3. Visual values

Root (`.rt-SegmentedControlRoot`): `display:inline-grid; grid-auto-flow:column; grid-auto-columns:1fr` → **all items equal width** (= widest item), `min-width:max-content`, `color: --gray-12`, `background-color: --color-surface` **plus** `background-image: linear-gradient(--gray-a3, --gray-a3)` (i.e. gray-a3 composited over color-surface), `font-family: --default-font-family`, `text-align:center`, `isolation:isolate`, `border-radius: --segmented-control-border-radius`.

Sizes (`@breakpoints .rt-r-size-N`):

| size | height | radius var | label font | label padding-x | label gap |
|---|---|---|---|---|---|
| 1 | `--space-5` (24) | `max(--radius-2, --radius-full)` | `--font-size-1`, `--letter-spacing-1` | `--space-3` | `--space-1` |
| 2 | `--space-6` (32) | `max(--radius-2, --radius-full)` | `--font-size-2`, `--letter-spacing-2` | `--space-4` | `--space-2` |
| 3 | `--space-7` (40) | `max(--radius-3, --radius-full)` | `--font-size-3`, `--letter-spacing-3` | `--space-4` | `--space-3` |

No line-height set (inherits). Item: `display:flex; align-items:stretch`; first item takes left radii (`inherit`), `:nth-last-child(2)` (last item, indicator is last child) takes right radii. Label: flex, centered, `border-radius: inherit`, svg `flex-shrink:0`.

Label text weights: Active span `--font-weight-medium`, `letter-spacing: --tab-active-letter-spacing` (−0.01em), word-spacing 0; Inactive span (absolute) `--font-weight-regular`, `--tab-inactive-letter-spacing` (0em). Note these override the size letter-spacing.

Separator (`.rt-SegmentedControlItemSeparator`): width 1px, `margin: 3px -0.5px`, `background: --gray-a4`, `z-index:-1` (under indicator). Hidden (`opacity:0`) on: first item; the checked (or focus-visible) item; the item **after** the checked/focused one. Transition `opacity 80ms` (0.8 × 100ms) — `ease-in` when hiding, `ease-out` when showing; duration 0 while root `:has(:focus-visible)`.

Indicator (`.rt-SegmentedControlIndicator`): `display:none` unless an item is `data-state=on`; absolute, `top:0; left:0; height:100%; z-index:-1`, width `100% / itemCount` (CSS lists nth-child 2…11 → supports up to **10 items**), `transform: translateX(index * 100%)`. Animation: `transition: transform 100ms cubic-bezier(0.445, 0.05, 0.55, 0.95)` (`--segmented-control-transition-duration: 100ms`). Visible pill is `::before` with `inset:1px`, `border-radius: max(0.5px, radius − 1px)`, `background: --segmented-control-indicator-background-color` = `--color-background` (light) / `--gray-a3` (dark).
- surface: `::before box-shadow: 0 0 0 1px --gray-a4`
- classic: `::before box-shadow: --shadow-2`
- disabled (`[disabled]` item ~ indicator): background `--gray-a3`, `inset:0`, no shadow.

Label crossfade: Active/Inactive spans swap `opacity` over 80ms (`ease-out` to appear, `ease-in` to disappear).

States: disabled Root → `color: --gray-a8`, `background-color: --gray-3` (gradient stays). Focus-visible item: `outline: 2px solid --focus-8; outline-offset:-1px; border-radius:inherit`. Hover (irrelevant): unchecked label `--gray-a2`. No pressed style.

## 4. Behaviour

- ToggleGroup single: Root `role="radiogroup"`, Items `role="radio"`, `aria-checked`, `data-state on|off`, roving focus (`loop` true, arrow keys move focus, not selection; Space/Enter toggles).
- Themes wraps `onValueChange`: ignores empty string, so pressing the checked item **cannot deselect** it.
- Themes owns state with `useControllableState` (controlled `value` or `defaultValue`); `defaultValue` undefined → nothing selected, indicator hidden.

## 5. RN notes

- API: `Object.assign(Root, { Root, Item })`; Root owns value like a Selection group (single-select, disabled-group-only). Item has no `disabled`.
- Layout: equal widths need measurement on web via grid `1fr`; in RN use `flex:1` per item inside a row with `alignSelf:'flex-start'` → equal only if the root width is set. To mirror "widest item" width without onLayout, render the hidden medium-weight copy (as Radix does) and accept flex-equal widths inside a parent-determined width; or measure once. Decide explicitly — Radix's equal-width rule relies on CSS grid.
- Indicator: absolute View, `width: 100/n %`, translateX by `index × itemWidth` (needs root width: reanimated `left: index*100/n %` works without measurement). Timing 100ms, `Easing.bezier(0.445,0.05,0.55,0.95)`; separators & label crossfade 80ms. Respect Reduce Motion (Radix has no reduced-motion rule; it always animates).
- Double-rendered label: replicate with an absolutely positioned regular-weight Text over an invisible-but-sizing medium-weight Text, or simply one Text whose weight swaps and accept width jitter (record in differences.md).
- Background = gray-a3 over color-surface: compose with colorMath (flatten alpha) or two layers.
- Variant family: none fits; closest is **cards/buttons surface/classic shadows**. Proposal: new small family "segmented" (surface/classic) — gray-only, recipe = root bg, indicator bg + border/shadow, disabled.
- Focus ring → existing FocusRing; a11y `accessibilityRole="radiogroup"` / items `radio` with `accessibilityState.checked`.
