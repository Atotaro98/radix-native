# Select — Radix reference

Sources: `THEMES/components/select.{tsx,props.tsx,css}`, `THEMES/components/_internal/base-button.css`
(classic disabled shadow), `THEMES/components/icons.tsx`, `PRIM/select/src/select.tsx`.
Docs: radix-ui.com/themes/docs/components/select. Shared overlay machinery in `overlay-infrastructure.md`.

## 1. Parts

| Part | Element / classes | Primitive |
|---|---|---|
| `Select.Root` | — (provides `size` context) | `Select.Root` |
| `Select.Trigger` | `button.rt-reset.rt-SelectTrigger` › `span.rt-SelectTriggerInner` › `Select.Value` (+ `Select.Icon asChild` › `ChevronDownIcon.rt-SelectIcon`) | `Select.Trigger asChild` |
| `Select.Content` | `div.rt-SelectContent` (+ `.rt-PopperContent` only when `position="popper"`) › `ScrollArea.Root` › `Select.Viewport.rt-SelectViewport` (as ScrollArea viewport) + vertical Scrollbar size 1 | `Portal` › `Theme asChild` › `Select.Content` |
| `Select.Item` | `div.rt-SelectItem` › `ItemIndicator.rt-SelectItemIndicator` › `ThickCheckIcon` + `ItemText` › children | `Select.Item` |
| `Select.Group` | `div.rt-SelectGroup` (`role="group"`, labelled by its Label) | `Select.Group` |
| `Select.Label` | `div.rt-SelectLabel` | `Select.Label` |
| `Select.Separator` | `div.rt-SelectSeparator` | `Select.Separator` |

Not exported: `ScrollUpButton` / `ScrollDownButton`, `Value`, `Icon`, `Arrow`. Trigger children (if any) are passed as
`Select.Value` children, i.e. they replace the rendered selected text.

## 2. Props

Root (primitive + `size`):

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes (drives Trigger **and** Content) |
| `value` / `defaultValue` | `string` | — | |
| `onValueChange` | `(value: string) => void` | — | |
| `open` / `defaultOpen` / `onOpenChange` | | — | |
| `name`, `autoComplete`, `form`, `required`, `disabled`, `dir` | form / a11y | — | |

Trigger (+ margin props):

| Prop | Type | Default |
|---|---|---|
| `variant` | `'classic' \| 'surface' \| 'soft' \| 'ghost'` (source also accepts undocumented `'ghost-offset'`, styled like ghost) | `'surface'` |
| `color` | accent | — (Theme accent) → `data-accent-color` |
| `radius` | `'none' \| 'small' \| 'medium' \| 'large' \| 'full'` | — (Theme) → `data-radius` |
| `placeholder` | `ReactNode` (docs: `string`) | — (primitive `''`) |

Content:

| Prop | Type | Default |
|---|---|---|
| `variant` | `'solid' \| 'soft'` | `'solid'` |
| `color` | accent | Theme accent (resolved, `data-accent-color`) |
| `highContrast` | `boolean` | — |
| `position` | `'item-aligned' \| 'popper'` | **`'item-aligned'`** (primitive; Themes doesn't change it) |
| `side`, `align`, `sideOffset`, `alignOffset`, `collisionPadding`, `avoidCollisions`, `sticky`, `hideWhenDetached`, `arrowPadding`, `collisionBoundary` | popper only | `side='bottom'`, `align='start'`, `sideOffset=4` (Themes), `collisionPadding=10` (primitive `CONTENT_MARGIN`) |
| `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `container` | | |

Content has no `size` prop — it reads Root's. No `forceMount` passed to the Portal.

Item: `value: string` (required; `''` is reserved — an empty value means "show placeholder", so an item cannot use it),
`disabled` (`false`), `textValue` (typeahead + the text shown in the trigger; default = ItemText's text content). No
`color` per item.

## 3. Trigger visual values

Base: `inline-flex; align-items:center; justify-content:space-between; flex-shrink:0; user-select:none`;
`font-family: --default-font-family`, regular weight, `text-align:start`, `color: --gray-12`.
Inner text: single line, ellipsis. Icon: `ChevronDownIcon` 9 × 9 (11 × 11 at size 3), `flex-shrink:0`,
`opacity: 0.9` except ghost. Focus-visible: `outline: 2px solid --focus-8; outline-offset:-1px` (soft: `--accent-8`).

| size | height (non-ghost) | padding-x (non-ghost) | ghost padding (y / x) | gap | font | radius |
|---|---|---|---|---|---|---|
| 1 | `--space-5` (24) | `--space-2` (8) | `--space-1` / `--space-2` (4 / 8) | `--space-1` (4) | `--font-size-1`, lh 1, ls 1 | `max(--radius-1, --radius-full)` |
| 2 | `--space-6` (32) | `--space-3` (12) | `--space-1` / `--space-2` (4 / 8) | `--space-1 × 1.5` (6) | size 2 | `max(--radius-2, --radius-full)` |
| 3 | `--space-7` (40) | `--space-4` (16) | `--space-1 × 1.5` / `--space-3` (6 / 12) | `--space-2` (8) | size 3 | `max(--radius-3, --radius-full)` |

Ghost: `height: fit-content`, `box-sizing: content-box`, padding as above and an equal **negative margin** (plus any
margin prop) so its text aligns with surrounding content. `line-height: var(--height)` on the base is effectively unused.

Variants:

| state | surface | classic | soft | ghost |
|---|---|---|---|---|
| rest | text `gray-12`, bg `--color-surface`, `inset 0 0 0 1px --gray-a7` | text `gray-12`, bg gradient `gray-2 → gray-1`, `--select-trigger-classic-box-shadow`, plus `::before` inner gradient (see below) | text `--accent-12`, bg `--accent-a3` | text `--accent-12`, transparent |
| hover / open (`[data-state=open]`) | ring `--gray-a8` | adds `inset 0 0 0 1px --gray-a3` before the classic shadow; `::before` gradient shifts | bg `--accent-a4` | bg `--accent-a3` |
| placeholder (`[data-placeholder]`) | inner text `--gray-a10` | `--gray-a10` | `--accent-12` at `opacity 0.6` | `--accent-12` at 0.6 |
| disabled | text `--gray-a11`, bg `--gray-a2`, ring `--gray-a6` | text `gray-a11`, bg `--gray-2` (no gradient), `--base-button-classic-disabled-box-shadow`, `::before` bg `gray-a2` | text `gray-a11`, bg `--gray-a3` | text `gray-a11`, bg transparent |
| disabled icon | `--gray-a9` | `--gray-a9` | `--gray-a9` | `--gray-a9` |

Classic shadow `--select-trigger-classic-box-shadow`:
light `inset 0 0 0 1px --gray-a5, inset 0 2px 1px --white-a11, inset 0 -2px 1px --gray-a4`;
dark `inset 0 0 0 1px --white-a4, inset 0 1px 1px --white-a4, inset 0 -1px 1px --black-a9`.
Classic `::before` (inset 2px, behind content): `linear-gradient(--black-a1 -20%, transparent, --white-a1 130%), linear-gradient(--color-surface, transparent)`; hover/open: `linear-gradient(--black-a1 -15%, transparent, --white-a1 120%), linear-gradient(--gray-2, --gray-1)`.
Classic disabled shadow: light = button's top+bottom (`inset 0 0 0 1px --gray-a4, inset 0 -2px 1px --gray-a3, inset 0 4px 2px -2px --white-a9, inset 0 2px 1px -1px --white-a9`);
dark = `inset 0 0 0 1px --gray-a5, inset 0 4px 2px -2px --gray-a2, inset 0 1px 1px --gray-a5, inset 0 -1px 1px --black-a3, inset 0 0 0 1px --gray-a2`.
The trigger `color` prop only affects soft/ghost (accent-based) and focus outline; surface/classic are gray.

## 4. Content visual values

`.rt-SelectContent`: `overflow:hidden; background: --color-panel-solid; box-shadow: --shadow-5`.
Popper only (`[data-side]`): `min-width: --radix-select-trigger-width`, `max-height: --radix-select-content-available-height`, transform-origin.
Viewport: `padding: --select-content-padding`; `padding-right: --space-3` when the scrollbar shows.

| | size 1 | size 2 | size 3 |
|---|---|---|---|
| content padding | `--space-1` (4) | `--space-2` (8) | `--space-2` (8) |
| content radius | `--radius-3` | `--radius-4` | `--radius-4` |
| item / label height | `--space-5` (24) | `--space-6` (32) | `--space-6` (32) |
| indicator width = item padding-left **and right** | `calc(--space-5 / 1.2)` (20) | `--space-5` (24) | `--space-5` (24) |
| item font | size 1 / lh 1 / ls 1 | size 2 / lh 2 / ls 2 | **size 3** / lh 2 / ls 3 |
| item radius | `--radius-1` | `--radius-2` | `--radius-2` |
| label font | size 1 | size 2 | size 2 |
| check icon | `8px × scaling` | `10px × scaling` | `10px × scaling` |
| separator margin-right | `--space-2` | `--space-3` | `--space-3` |

Unlike menus, the left gutter is **always** reserved (every Select item can be checked) and the right padding equals it.
Item: flex row, `align-items:center`, `position:relative`, `user-select:none`. Indicator: absolute `left:0`, width =
indicator width, centred; shown only on the selected item.
Separator: `1px`, `--gray-a6`, `margin: --space-2` vertical, `margin-left` = indicator width.
Label: `color: --gray-a10`, padding = indicator width both sides, `margin-top: --space-2` after an item.

| state | solid | soft |
|---|---|---|
| highlighted | bg `--accent-9`, text `--accent-contrast` | bg `--accent-a4` |
| highlighted + highContrast | bg `--accent-12`, text `--accent-1` | unchanged |
| disabled | text `--gray-a8` | text `--gray-a8` |

Selected-but-not-highlighted items have no background — only the check indicator.

## 5. Positioning

- **`item-aligned`** (default): no popper. The content is placed so the **selected item's text sits exactly over the
  trigger's value text**, clamped `CONTENT_MARGIN = 10px` from the viewport, min-width = trigger width (+ paddings),
  height grows towards the side with room (Themes renders no Scroll Up/Down buttons; overflow scrolls in its ScrollArea). No side/align props apply, no
  `.rt-PopperContent` (so no side slide animation).
- **`popper`**: regular popper below the trigger, `align='start'`, `sideOffset=4`, `collisionPadding=10`,
  `min-width` trigger width, `max-height` available height. The docs only demonstrate this mode ("set
  `position="popper"` to place the menu below the trigger").

## 6. Behaviour and a11y

- Value model: single `string`; `undefined` or `''` → placeholder shown (`data-placeholder` on trigger). Controlled
  `value=""` clears back to the placeholder. The trigger shows the selected Item's `ItemText` content (mirrored via portal),
  or Trigger `children` if given.
- Opening: mouse on `pointerdown` (left, no ctrl); touch/pen on **click** (so scrolling over the trigger doesn't open);
  keyboard Space / Enter / ArrowUp / ArrowDown. When opened, the selected item (else first enabled) is focused.
- Selecting: mouse on pointer-up over an item (press-drag-release works), touch on click, keyboard Enter / Space;
  sets value, fires `onValueChange`, closes, focuses the trigger. Disabled items skip.
- Typeahead: on the **closed** trigger, typing selects the next matching item directly (value changes without
  opening); in the open content it moves the highlight. 1000 ms reset, prefix match, repeated letter cycles.
- Content is modal: outside pointer events disabled, scroll locked, everything else `aria-hidden`, focus trapped;
  Escape / outside press closes.
- Roles: trigger `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-required`, `aria-autocomplete="none"`,
  `data-disabled`; content `role="listbox"`; item `role="option"`, `aria-selected` (only on selected + focused),
  `aria-labelledby` its text, `data-state="checked|unchecked"`, `data-highlighted`, `data-disabled`; group `role="group"`
  labelled by its Label. Icon `aria-hidden`.
- Forms: renders a hidden native `<select>` (bubble input) when inside a form or `name` is set, for submission and autofill.

## RN notes

- Our decision: Anchored overlay with `position="popper"` as default; `item-aligned` dropped. This **differs from
  Radix's default** (`item-aligned`); list in `llm/differences.md`. With popper, Radix gives `min-width = trigger width`,
  `sideOffset=4`, `align='start'`, `collisionPadding=10`.
- Trigger is a Variant recipe of its own (surface / classic / soft / ghost) closely matching TextField/Button metrics;
  classic gradients need `ClassicOverlay`-style approximation; ghost's negative margins should be ported like Button ghost.
- Content highlight colours = menu solid/soft family (same tokens), but metrics differ: always-reserved left gutter,
  right padding = gutter, size 3 item font.
- Selected text in trigger: render the selected item's `textValue`/children; RN can't mirror DOM, so items must register
  `value → label` with the Root even when content is closed (mount-free registry, or require `textValue`).
- a11y: trigger `accessibilityRole="combobox"` (or `button`) with `accessibilityState.expanded`, value as
  `accessibilityValue.text`; items `accessibilityRole` "menuitem"/radio-like with `selected`.
- Highlight on press-in instead of hover; no typeahead without a hardware keyboard.
