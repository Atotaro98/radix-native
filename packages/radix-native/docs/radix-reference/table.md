# Table — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`): `THEMES/components/table.{tsx,props.tsx,css}`,
`THEMES/components/scroll-area.tsx` (Table embeds it), `THEMES/props/{width,padding}.props.ts`,
`THEMES/styles/utilities/{table-layout,vertical-align,text-align}.css`. Docs: radix-ui.com/themes/docs/components/table.
No Radix primitive — native HTML table elements.

## 1. Parts

| Part | Element / classes |
|---|---|
| `Table.Root` | `div.rt-TableRoot` › Themes `ScrollArea` (all defaults: `scrollbars="both"`, `type="hover"`, hide delay 0) › `table.rt-TableRootTable.rt-r-tl-*` |
| `Table.Header` | `thead.rt-TableHeader` |
| `Table.Body` | `tbody.rt-TableBody` |
| `Table.Row` | `tr.rt-TableRow` |
| `Table.Cell` | `td.rt-TableCell` |
| `Table.ColumnHeaderCell` | `th.rt-TableCell.rt-TableColumnHeaderCell[scope=col]` |
| `Table.RowHeaderCell` | `th.rt-TableCell.rt-TableRowHeaderCell[scope=row]` |

## 2. Props

Root (`tableRootPropDefs`) + margin props:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `variant` | `'surface' \| 'ghost'` | `'ghost'` | no |
| `layout` | `'auto' \| 'fixed'` | — (browser `auto`) | yes → `table-layout` |

Header / Body: no own props.
Row (`tableRowPropDefs`): `align: 'start' | 'center' | 'end' | 'baseline'` (responsive) → `vertical-align: top | middle | bottom | baseline`. Default inherited `vertical-align: top` from the table.
Cell, ColumnHeaderCell, RowHeaderCell (`tableCellPropDefs`, same for all three):
- `justify: 'start' | 'center' | 'end'` (responsive) → `text-align: left | center | right`; default `text-align:left`.
- `width`, `minWidth`, `maxWidth`: **CSS strings** (`"200px"`, `"30%"`), responsive (`--width` etc.).
- `p, px, py, pt, pr, pb, pl`: space token `'0'…'9'` or CSS string, responsive — override `--table-cell-padding`.

## 3. Visual values

Table (`.rt-TableRootTable`): `width:100%`, `text-align:left`, `vertical-align:top`, `border-collapse:collapse`, `border-radius: calc(--table-border-radius - 1px)`, `height:0` (lets `height:100%` work in cells). Row `color: --gray-12`.

Cells (`.rt-TableCell`): `background: --table-row-background-color` (transparent), row divider = `box-shadow: inset 0 -1px --gray-a5` on **every cell** (bottom line), `padding: --table-cell-padding`, `height: --table-cell-min-height` (acts as min-height). ColumnHeaderCell `font-weight: bold` (700, not medium); RowHeaderCell `font-weight: normal`.

| size | `--table-border-radius` | `--table-cell-padding` | min-height | font |
|---|---|---|---|---|
| 1 | `--radius-3` | `--space-2` | `36px × scaling` | `--font-size-2` / `--line-height-2` |
| 2 | `--radius-4` | `--space-3` | `44px × scaling` | `--font-size-2` / `--line-height-2` |
| 3 | `--radius-4` | `--space-3 --space-4` (y x) | `--space-8` (48) | `--font-size-3` / `--line-height-3` |

Variants:
- `surface` (Root): `border: 1px solid --gray-a5` (where supported: `color-mix(in oklab, --gray-a5, --gray-6)`), `border-radius: --table-border-radius`, `background: --color-panel`, `backdrop-filter: --backdrop-filter-panel`, `background-clip: padding-box`; inner table `overflow:hidden`; Header row bg `--gray-a2`; last Body row has **no** divider.
- `ghost`: no border/bg; last row keeps its divider; horizontal scrollbar side margins set to 0 (`--scrollarea-scrollbar-horizontal-margin-left/right: 0`).
- Inside `Inset`: first/last cell padding-left/right = inset padding.

No states (no hover, selection or press styles).

## 4. Behaviour

- Pure layout. Column widths are computed by the browser table algorithm: `layout=auto` → content-based, any cell's `width/minWidth/maxWidth` in a column influences that column (not only header cells); `layout=fixed` → widths from the **first row** cells (typically ColumnHeaderCells), rest share remaining space equally.
- Overflow: table wider than root → ScrollArea scrolls horizontally (hover-type scrollbars).
- a11y: native table semantics; `scope=col/row` on header cells.

## 5. RN notes

- `Object.assign(Root, { Root, Header, Body, Row, Cell, ColumnHeaderCell, RowHeaderCell })`.
- No table layout engine in RN: columns must be aligned across rows explicitly. Agreed approach (width/minWidth from ColumnHeaderCell, `flex:1` for the rest, horizontal ScrollView) is closest to `layout="fixed"`; with `layout="auto"` Radix sizes by content, which can't be reproduced without measuring → document in differences.md. Width strings: accept numbers and `%`/`px` strings.
- Cell widths on body cells (allowed by Radix) would be ignored unless propagated via column context → document.
- Row divider: bottom border 1px `--gray-a5` per row (not per cell). Surface border color: compute oklab mix of gray-a5 and gray-6 with colorMath. `backdrop-filter` impossible.
- `Row.align` → `alignItems` of the row (`baseline` → `'baseline'`); `Cell.justify` → `alignItems`/`textAlign` of cell content.
- Header text bold (700) — check Weight intent; the font face may not have bold.
- Min-height not height: use `minHeight` (matches library's minHeight convention).
- Variant family: closest is **cards** (surface = panel bg + border like Card surface); ghost = nothing. Probably no family needed: two fixed looks.
