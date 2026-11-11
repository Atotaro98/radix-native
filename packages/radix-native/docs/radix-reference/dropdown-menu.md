# DropdownMenu — Radix reference

Sources: `THEMES/components/dropdown-menu.{tsx,props.tsx,css}`, `THEMES/components/_internal/base-menu.{css,props.ts}`,
`THEMES/components/scroll-area.tsx`, `THEMES/components/icons.tsx`, `PRIM/dropdown-menu/src/dropdown-menu.tsx`,
`PRIM/menu/src/menu.tsx`. Docs: radix-ui.com/themes/docs/components/dropdown-menu.
ContextMenu (`context-menu.md`) is the **same component** apart from trigger and placement; everything in §3–§5 applies to both.

## 1. Parts

| Part | Element / classes | Primitive |
|---|---|---|
| `Root` | — | `DropdownMenu.Root` |
| `Trigger` | child (forced `asChild`) | `DropdownMenu.Trigger` |
| `TriggerIcon` | `ChevronDownIcon` (9 × 9 SVG) — just an icon export to put inside the trigger Button | — |
| `Content` | `div.rt-PopperContent.rt-BaseMenuContent.rt-DropdownMenuContent` › `ScrollArea type="auto"` › `div.rt-BaseMenuViewport` | `Portal` › `Theme asChild` › `Content` |
| `Label` | `div.rt-BaseMenuLabel` | `Label` |
| `Item` | `div.rt-reset.rt-BaseMenuItem` › children + optional `div.rt-BaseMenuShortcut` | `Item` |
| `Group` | `div.rt-BaseMenuGroup` (`role="group"`, no CSS) | `Group` |
| `RadioGroup` | `div.rt-BaseMenuRadioGroup` (no CSS) | `RadioGroup` |
| `RadioItem` | `div.rt-BaseMenuItem.rt-BaseMenuRadioItem` › children + `ItemIndicator.rt-BaseMenuItemIndicator` › `ThickCheckIcon` | `RadioItem` |
| `CheckboxItem` | `div.rt-BaseMenuItem.rt-BaseMenuCheckboxItem` › children + indicator (`ThickCheckIcon`) + optional shortcut | `CheckboxItem` |
| `Sub` | — | `Sub` |
| `SubTrigger` | `div.rt-BaseMenuItem.rt-BaseMenuSubTrigger` › children + `div.rt-BaseMenuShortcut` › `ThickChevronRightIcon.rt-BaseMenuSubTriggerIcon` | `SubTrigger` |
| `SubContent` | `div.rt-PopperContent.rt-BaseMenuContent.rt-BaseMenuSubContent…` › ScrollArea › viewport | `Portal` › `Theme asChild` › `SubContent` |
| `Separator` | `div.rt-BaseMenuSeparator` (`role="separator"`) | `Separator` |

Not exported by Themes: `Arrow` (`.rt-BaseMenuArrow { fill: --base-menu-bg }` exists in CSS but is unused), `ItemIndicator`, `Portal`.
The radio indicator is a **check mark**, not a dot. An indeterminate CheckboxItem also shows the **check** icon (Themes
always renders `ThickCheckIcon`; primitive shows the indicator for `'indeterminate'`).

## 2. Props

Root: `open`, `defaultOpen`, `onOpenChange`, `modal` (default **`true`**), `dir`.

Trigger: primitive button props (`disabled`). `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`, `data-state`.

Content (`baseMenuContentPropDefs`), passed down through a context to every `SubContent`:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2'` | `'2'` | yes |
| `variant` | `'solid' \| 'soft'` | `'solid'` | no |
| `color` | accent colour | Theme accent (resolved and set as `data-accent-color` on Content) | no |
| `highContrast` | `boolean` | — (false) | no |
| `side` | Side | `'bottom'` | no |
| `sideOffset` | `number` | **`4`** | no |
| `align` | Align | **`'start'`** | no |
| `alignOffset` | `number` | `0` | no |
| `collisionPadding` | `number` | **`10`** | no |
| `loop` | `boolean` | `false` (keyboard focus wraps) | no |
| `avoidCollisions`, `sticky`, `hideWhenDetached`, `arrowPadding`, `collisionBoundary` | popper | | no |
| `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside` | handlers | | no |
| `forceMount`, `container` | portal | | no |

Item: `color` (accent, no default), `shortcut` (`string`), `asChild`, `disabled` (`false`), `textValue` (typeahead
override, default = `textContent`), `onSelect(event)`.

CheckboxItem: `color`, `shortcut`, `checked: boolean | 'indeterminate'` (default `false`), `onCheckedChange(checked: boolean)`,
`disabled`, `textValue`, `onSelect`. (No `asChild` — forced false.)

RadioGroup: `value?: string`, `onValueChange(value)` — controlled only (no `defaultValue`).
RadioItem: `value: string` (required), `color`, `disabled`, `textValue`, `onSelect`. No `shortcut`.

Sub: `open`, `defaultOpen`, `onOpenChange`.
SubTrigger: `disabled`, `textValue`. No `shortcut` (the slot holds the chevron).
SubContent: inherits `size`, `variant`, `color`, `highContrast` from the parent Content (overridable by passing them);
defaults `sideOffset={1}` ("accounts for the outer solid box-shadow"), `alignOffset={-size * 4}` (−4 / −8 px),
`collisionPadding={10}`, `align` `'start' | 'end'` (default `'start'`; `center` is not allowed); side is forced
`'right'` (`'left'` in RTL). `loop`, handlers, `forceMount`, `container`.

Label, Group, Separator: primitive div props only.

## 3. Visual values (shared `base-menu.css`)

Content `.rt-BaseMenuContent`: `display:flex; flex-direction:column; overflow:hidden; box-sizing:border-box`,
`background-color: --color-panel-solid` (`--base-menu-bg`), `box-shadow: --shadow-5`.
`.rt-DropdownMenuContent`: `max-height: --radix-dropdown-menu-content-available-height` (space left to the collision
boundary), `transform-origin` per side. **No min-width** (does not match trigger width), no max-width.
Viewport `.rt-BaseMenuViewport`: `flex:1; overflow:auto; padding: --base-menu-content-padding`; when a vertical
scrollbar is shown, `padding-right: --space-3`.

Per size:

| | size 1 | size 2 |
|---|---|---|
| content padding | `--space-1` (4) | `--space-2` (8) |
| content radius | `--radius-3` | `--radius-4` |
| item height | `--space-5` (24) | `--space-6` (32) |
| item padding-left (no checkbox/radio item in this content) | `--space-2` (8) | `--space-3` (12) |
| item padding-left (content `:has` a CheckboxItem or RadioItem) | `calc(--space-5 / 1.2)` (20) | `--space-5` (24) |
| item padding-right | `--space-2` (8) | `--space-3` (12) |
| item font | `--font-size-1` / `--line-height-1` / `--letter-spacing-1` | `--font-size-2` / `--line-height-2` / `--letter-spacing-2` |
| item radius | `--radius-1` | `--radius-2` |
| indicator & chevron icon | `8px × scaling` square | `10px × scaling` square |
| label font | same as items | same as items |

The left padding switch is per content element — the root and each SubContent decide independently, and all items
(including plain Items, Labels, Separators) in that content shift together so text lines up.

Item `.rt-BaseMenuItem`: `display:flex; align-items:center; gap: --space-2; height: --base-menu-item-height;
padding-left/right` as above; `position:relative`; regular weight; text colour inherits (Theme `--gray-12`).
`cursor: var(--cursor-menu-item)` (`default`).

Indicator `.rt-BaseMenuItemIndicator`: `position:absolute; left:0; width: --base-menu-item-padding-left`, centred
(i.e. centred inside the left padding gutter). `ThickCheckIcon` 9 × 9 viewBox scaled to 8/10 px.

Shortcut `.rt-BaseMenuShortcut`: `display:flex; align-items:center; margin-left:auto; padding-left: --space-4` (16),
`color: --gray-a11`; becomes `inherit` when the item is highlighted or disabled, or the SubTrigger is open.

SubTrigger chevron `.rt-BaseMenuSubTriggerIcon`: `ThickChevronRightIcon`, `color: --gray-12`,
`margin-right: calc(-2px * scaling)`, inside a Shortcut slot (so also pushed right with 16 px left padding).

Separator: `height: 1px; background: --gray-a6; margin: --space-2 (8) vertical; margin-left = item padding-left;
margin-right = item padding-right`.

Label `.rt-BaseMenuLabel`: `display:flex; align-items:center; height = item height; padding = item padding;
color: --gray-a10; user-select:none`; `margin-top: --space-2` when it directly follows an item.

States and colours:

| state | solid | soft |
|---|---|---|
| item highlighted (`[data-highlighted]`, keyboard focus / pointer hover) | bg `--accent-9`, text `--accent-contrast`, chevron `--accent-contrast` | bg `--accent-a4`, text unchanged |
| item highlighted, `highContrast` | bg `--accent-12`, text `--accent-1`, chevron `--accent-1`; **items with their own `color` keep `accent-9` / `accent-contrast`** | no change |
| SubTrigger open (`[data-state=open]`, not highlighted) | bg `--gray-a3` | bg `--accent-a3` |
| item with `color` prop (`[data-accent-color]`) | text `--accent-a11` of that colour (highlight uses that colour's `accent-9`) | text `--accent-a11`, highlight `--accent-a4` of that colour |
| disabled (`[data-disabled]`) | text `--gray-a8`, no highlight (primitive skips disabled items) | same |

`accent` inside the content = Content `color` or the Theme accent. Hover never adds anything beyond `data-highlighted`.

## 4. Placement defaults

| | side | align | sideOffset | alignOffset | collisionPadding |
|---|---|---|---|---|---|
| Content | `bottom` | `start` | 4 | 0 | 10 |
| SubContent | `right` (forced, RTL `left`) | `start` | 1 | `-4 × size` | 10 |

The −4 / −8 alignOffset equals the content padding, so the first sub-item lines up with the SubTrigger.

## 5. Menu behaviour (primitive `Menu`)

- **Trigger** opens on `pointerdown` (left button, no ctrl) — not on click — and on Enter / Space (toggle) / ArrowDown.
  Modal by default: outside pointer events blocked, scroll locked, others `aria-hidden`, focus trapped.
- **Item select**: on click (pointer-up on another item after a press-and-drag also selects), Enter or Space. Dispatches a
  cancelable `menu.itemSelect` event to `onSelect(event)`; unless `event.preventDefault()` was called, the **whole menu
  (root and all subs) closes**. Disabled items never select.
- **CheckboxItem**: `onSelect` → `onCheckedChange(indeterminate ? true : !checked)`; then **closes the menu like any
  item** unless `onSelect` calls `preventDefault()`. `role="menuitemcheckbox"`, `aria-checked` (`'mixed'` for indeterminate).
- **RadioItem**: `onSelect` → `RadioGroup.onValueChange(value)`; also closes the menu by default. `role="menuitemradio"`,
  `aria-checked = (value === group.value)`.
- **Indicator**: rendered only when checked / indeterminate (or `forceMount`); absent otherwise, but the left gutter is
  always reserved.
- **Sub**: SubTrigger opens on mouse hover after **100 ms**, on click/tap, or Enter / Space / ArrowRight (ArrowLeft in RTL).
  ArrowLeft closes the sub and refocuses the trigger. While the pointer moves from the SubTrigger toward the SubContent a
  grace polygon (300 ms) keeps it open. A sub closes when focus moves to another item of the parent. The **parent stays
  open and visible**; Escape in a sub closes the entire menu. Sub is non-modal (no focus trap). Focus moves into the
  sub only when opened with the keyboard.
- **Keyboard**: Arrow Up/Down move highlight (wrap only with `loop`), Home/End/PageUp/PageDown, Tab is prevented.
- **Typeahead**: printable keys build a search string (reset after **1000 ms** idle) prefix-matched case-insensitively (repeating one letter cycles through matches) against
  items' `textValue` (default `textContent`); highlights the next match, skipping disabled items.
- Highlight follows pointer hover (`onPointerMove` focuses the item); leaving an item clears highlight.
- `role="menu"` on content, `role="menuitem"` on items, `role="group"` for Group/RadioGroup, Label has no role and is not
  focusable. SubTrigger: `aria-haspopup="menu"`, `aria-expanded`, `aria-controls`.
- On close, focus returns to the trigger.

## RN notes

- Anchored overlay: `side='bottom'`, `align='start'`, `sideOffset=4`, `collisionPadding=10`; `maxHeight` = available
  space below/above; content scrolls (ScrollView) with item padding preserved.
- Sub-menus = another Anchored overlay anchored to the SubTrigger, `side='right'`, `sideOffset=1`, `alignOffset=-4·size`,
  flip to left / shift as needed; parent remains visible. Open sub on tap of the SubTrigger (no hover); tapping another
  parent item closes the open sub.
- **One shared Variant family for menus**: DropdownMenu and ContextMenu share `base-menu` exactly (same prop defs, same
  CSS). Select content uses parallel but separate CSS (`select.css`) with the same solid/soft highlight tokens but
  different metrics (see `select.md`) — model it as the same Variant family (solid / soft highlight + highContrast) with
  its own size metrics, not identical.
- Left gutter must be computed per content: if any CheckboxItem/RadioItem is a descendant, use the wide padding for all
  rows (Radix uses `:has`). Needs a registration context.
- `shortcut` is plain trailing text (gray-a11 → inherit on highlight); on mobile it's mostly decorative.
- Highlight on press-in replaces hover/keyboard `data-highlighted`.
- CheckboxItem / RadioItem close the menu by default — keep it (Radix parity); the `onSelect` event needs a
  `preventDefault()` equivalent.
- Typeahead is keyboard-only; keep for hardware keyboards if cheap, otherwise list as a difference.
- Icons (check, chevron) drawn with View borders per the no-SVG rule.
