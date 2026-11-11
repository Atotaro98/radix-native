# Callout — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/callout.tsx`, `components/callout.props.tsx`, `components/callout.css`, `helpers/map-prop-values.ts` (`mapCalloutSizeToTextSize`), `props/color.prop.ts` (`accentColorPropDef`), `props/high-contrast.prop.ts`, `components/text.css`. Docs: https://www.radix-ui.com/themes/docs/components/callout

## 1. Parts

No Radix primitive. Compound: `Callout.Root`, `Callout.Icon`, `Callout.Text`.

| Part | Element | Notes |
|---|---|---|
| `Root` | `div.rt-CalloutRoot` (Slot with `asChild`) | sets `data-accent-color={color}`; provides `CalloutContext { size }` |
| `Icon` | `div.rt-CalloutIcon` | plain wrapper, no props |
| `Text` | Themes `Text` as `p`, `.rt-CalloutText` | size from context via `mapCalloutSizeToTextSize`; consumer props spread after (so `size` can be overridden); `asChild` forced `false` |

## 2. Props

**Root**

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `variant` | `'soft' \| 'surface' \| 'outline'` | `'soft'` | no |
| `color` | accent color (26) | `''` → theme accent | no |
| `highContrast` | `boolean` | — | no |
| `asChild` | `boolean` | — | no |
| Margin props | — | — | yes |

**Icon**: only `div` props. **Text**: all Themes `Text` props (`size`, `weight`, `align`, `trim`, `truncate`, `wrap`, `color`, `highContrast`, margins…) as `p`.

Callout size → Text size: `1 → '2'`, `2 → '2'`, `3 → '3'` (size 1 still uses text size 2).

## 3. Visual values (`callout.css`)

**Root base**: `display: grid; align-items: flex-start; justify-content: flex-start; text-align: left; color: var(--accent-a11)`; `.rt-high-contrast` → `color: var(--accent-12)`. No `grid-template-columns`: `.rt-CalloutIcon { grid-column-start: -2 }` creates an implicit auto-width column before the explicit one, and every non-icon child gets `grid-column-start: -1`. So: icon in a left auto column, all other children stacked in the right column (one row each, `row-gap` between them). Without an icon, a single column.

**Icon**: `display: flex; align-items: center; height: var(--callout-icon-height)` — no width set; the icon is vertically centred within the first text line.

**Sizes** (`.rt-CalloutRoot:where(.rt-r-size-N)`):

| size | padding | column-gap | row-gap | border-radius | `--callout-icon-height` | Text size (font / line-height) |
|---|---|---|---|---|---|---|
| 1 | `--space-3` (12) | `--space-2` (8) | `--space-2` (8) | `--radius-3` | `--line-height-2` (20) | 2 (14 / 20) |
| 2 | `--space-4` (16) | `--space-3` (12) | `--space-2` (8) | `--radius-4` | `--line-height-2` (20) | 2 (14 / 20) |
| 3 | `--space-5` (24) | `--space-4` (16) | `--space-3` (12) | `--radius-5` | `--line-height-3` (24) | 3 (16 / 24) |

All px × scaling.

**Variants** (`.rt-CalloutRoot:where(.rt-variant-*)`):

| variant | background | border |
|---|---|---|
| `soft` | `--accent-a3` | none |
| `surface` | `--accent-a2` | `inset 0 0 0 1px var(--accent-a6)` |
| `outline` | transparent | `inset 0 0 0 1px var(--accent-a7)` |

Text/icon color for all variants: `--accent-a11`, high contrast `--accent-12` (variant doesn't change it; highContrast doesn't change bg/border). Callout.Text inherits that color (it has no `data-accent-color` of its own unless `color` passed). Icons inherit `currentColor`.

No states (no hover/press/disabled).

## 4. Behaviour

No primitive, no default role. Docs recommend `role="alert"` on Root for urgent messages (screen reader announces immediately).

## 5. RN notes

- Compound API `Object.assign(Root, { Root, Icon, Text })`; Root provides a context with `size`, resolved `color` (text color) and `highContrast`.
- Grid → `flexDirection: 'row'`: `[Icon column] [View flex:1, gap=row-gap containing all non-icon children]`. Needs to partition children by type (`child.type === CalloutIcon`) since RN has no grid placement; column-gap between columns, row-gap within the right column. Icon children placed anywhere in Radix still render in the left column — partitioning reproduces that.
- Icon: `height = metrics.px(20|24)`, `justifyContent: 'center'`; must tint icons — provide the resolved color through context (or a `color` on the icon child, like ControlLabel tints icons) since RN has no `currentColor`.
- Text: render through our `Text` with `size` from the map, color from context (inherits accent-a11/accent-12), standalone `gray-12` default must NOT apply.
- Border: `inset` box-shadow → `borderWidth: 1` (layout shifts by 1px vs Radix; already documented pattern in `llm/differences.md`).
- `role="alert"` → `accessibilityRole="alert"` (iOS/Android) and/or `accessibilityLiveRegion="assertive"` (Android). Pass-through of `accessibilityRole` is enough; maybe document it.
- Needs a **new Variant family** ("callouts"): its surface uses `accent-a2` (chips surface uses `surface` step + `a6`/`a7`), outline has no bg, text accent-a11/accent-12 independent of variant. Recipe: `soft {bg c('a3')}`, `surface {bg c('a2'), border c('a6')}`, `outline {border c('a7')}`, `text: highContrast ? c(12) : c('a11')`.
- `asChild`: not ported.
