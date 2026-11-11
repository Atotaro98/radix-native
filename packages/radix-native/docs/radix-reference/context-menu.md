# ContextMenu — Radix reference

Sources: `THEMES/components/context-menu.{tsx,props.tsx,css}`, `THEMES/components/_internal/base-menu.{css,props.ts}`,
`PRIM/context-menu/src/context-menu.tsx`, `PRIM/menu/src/menu.tsx`. Docs: radix-ui.com/themes/docs/components/context-menu.

**ContextMenu is DropdownMenu with a different trigger and placement.** `context-menu.tsx` is a line-for-line copy of
`dropdown-menu.tsx` (props re-export the same `base-menu.props`, CSS imports the same `base-menu.css`). Read
`dropdown-menu.md` for parts, all item/sub props, every size/variant/state value and menu behaviour. Only the
differences are listed here.

## 1. Differences from DropdownMenu

| | DropdownMenu | ContextMenu |
|---|---|---|
| Root props | `open`, `defaultOpen`, `onOpenChange`, `modal` (true), `dir` | `open`, `onOpenChange`, `modal` (true), `dir` — **no `defaultOpen`** |
| Trigger | child (forced `asChild`), opens on pointer-down / Enter / Space / ArrowDown | child (forced `asChild`), `disabled` prop (default `false`); opens on **`contextmenu`** (right click) or **touch/pen long-press 700 ms**; no keyboard open on the trigger |
| Anchor | trigger element | **virtual point** at the pointer `clientX/clientY` (a zero-size rect) |
| `TriggerIcon` export | yes | no |
| Content side / align | `bottom` / `start` (Themes) | `right` / `start` (primitive) |
| Content sideOffset | 4 (Themes) | **2** (primitive) |
| Content alignOffset | 0 | **`-4 × size`** (Themes: −4 / −8, so the first item sits at the pointer, not the content padding) |
| Content collisionPadding | 10 | 10 |
| `max-height` var | `--radix-dropdown-menu-content-available-height` | `--radix-context-menu-content-available-height` |
| Item children | `Slot.Slottable` for Item; plain for Radio/Checkbox | `Slot.Slottable` for all three (no visible difference) |

SubContent placement is the same as DropdownMenu (`right`, sideOffset 1, alignOffset −4·size).

## 2. Trigger behaviour (primitive)

- `onContextMenu`: clear long-press timer, record the point, open, `preventDefault()` (suppresses the browser menu).
- `onPointerDown` with `pointerType !== 'mouse'`: start a **700 ms** timer that opens the menu at the pointer-down
  point. Any `pointermove`, `pointercancel` or `pointerup` (touch/pen) before 700 ms cancels it. Nested triggers: the
  innermost claims the event (`claimedLongPressEvents`) so only one long-press timer runs.
- `disabled`: no handlers at all; the native context menu shows.
- The trigger element has `data-state` and `data-disabled`; it is not focusable by itself and has no ARIA role.
- Content `onCloseAutoFocus`: in non-modal mode, if the user interacted outside, focus is not returned to the trigger.
- Dev warning when `open` is controlled before any interaction (the menu needs a point to anchor to).

## RN notes

- Long-press at the touch point is exactly Radix's touch path (700 ms, move cancels). Use `onLongPress` with
  `delayLongPress={700}`… note RN's Pressable cancels on move beyond its press-retention region, while Radix cancels on
  any pointermove; a small slop is acceptable.
- Anchor is a zero-size rect at `pageX/pageY` of the press; place with `side='right'`, `align='start'`, `sideOffset=2`,
  `alignOffset=-4·size`, `collisionPadding=10`, flip/shift.
- Shares the **same Variant family** (one menu recipe) as DropdownMenu — no styling of its own.
- No keyboard trigger in Radix; for a11y in RN add an `accessibilityActions` entry (e.g. "Open menu") on the trigger
  so screen-reader users can reach it (RN addition, list in `llm/differences.md`).
