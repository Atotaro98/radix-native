# Popover — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/popover.{tsx,props.tsx,css}`, `PRIM/popover/src/popover.tsx`, `PRIM/popper/src/popper.tsx`.
Docs: radix-ui.com/themes/docs/components/popover. Portal, popper placement, dismissable layer and open/close
animations (`.rt-PopperContent`) are in `overlay-infrastructure.md`.

## 1. Parts

| Part | Element | Primitive |
|---|---|---|
| `Popover.Root` | — (context only) | `Popover.Root` |
| `Popover.Trigger` | the child (forced `asChild`, child must be one React element) | `Popover.Trigger` |
| `Popover.Content` | `div.rt-PopperContent.rt-PopoverContent` inside `Portal` › `Theme asChild` | `Popover.Content` |
| `Popover.Close` | the child (forced `asChild`) | `Popover.Close` |
| `Popover.Anchor` | `div` (not forced `asChild`) | `Popover.Anchor` |

No `Popover.Arrow` is exported. Content is re-wrapped in `<Theme asChild>` so it takes the Theme of the trigger's tree.

## 2. Props

Root (primitive): `open`, `defaultOpen`, `onOpenChange(open)`, `modal` (default **`false`**).

Trigger: primitive button props. Renders `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (when open),
`data-state="open|closed"`; `onClick` toggles.

Content (`popoverContentPropDefs` + primitive Content + `container`):

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3' \| '4'` | `'2'` | yes |
| `width` / `minWidth` | `string` | — | yes |
| `maxWidth` | `string` | `'480px'` | yes |
| `height` / `minHeight` / `maxHeight` | `string` | — | yes |
| `asChild` | `boolean` | — | no |
| `side` | `'top' \| 'right' \| 'bottom' \| 'left'` | `'bottom'` (popper default) | no |
| `sideOffset` | `number` | **`8`** (Themes) | no |
| `align` | `'start' \| 'center' \| 'end'` | **`'start'`** (Themes; primitive is `center`) | no |
| `alignOffset` | `number` | `0` | no |
| `collisionPadding` | `number \| Partial<Record<Side, number>>` | **`10`** (Themes) | no |
| `avoidCollisions` | `boolean` | `true` | no |
| `arrowPadding`, `sticky` (`'partial'`), `hideWhenDetached` (`false`), `collisionBoundary` | popper | — | no |
| `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside` | handlers | — | no |
| `forceMount`, `container` | portal | — | no |

Close: primitive button props; `onClick` closes. Anchor: positions the content relative to something other than the Trigger.

## 3. Visual values

`.rt-PopoverContent`:

- `background-color: --color-panel-solid`, `box-shadow: --shadow-5`, `overflow: auto`, `position: relative`, `outline: 0`,
  `box-sizing: border-box`.
- `min-width: var(--radix-popover-trigger-width)` → **never narrower than the trigger**.
- `padding: --popover-content-padding`, also exported as `--inset-padding-{top,right,bottom,left}` so `Inset` children can bleed to the edge.
- `transform-origin: --radix-popover-content-transform-origin` (side-dependent, used by the open animation).

| size | padding | border-radius |
|---|---|---|
| 1 | `--space-3` (12) | `--radius-4` |
| 2 | `--space-4` (16) | `--radius-4` |
| 3 | `--space-5` (24) | `--radius-5` |
| 4 | `--space-6` (32) | `--radius-5` |

No color, variant or highContrast props: a Popover is always a neutral panel. Text colour inherits from the Theme (`--gray-12`).

## 4. Behaviour

- Trigger click toggles. Non-modal by default: outside pointer-down, focus moving outside, and Escape all dismiss;
  outside content stays interactive and scrollable.
- `modal`: focus trapped, outside pointer events disabled, body scroll locked (`react-remove-scroll`), siblings `aria-hidden`.
- On open, focus moves into content (first focusable, else content); on close, back to the trigger.
- Content has `role="dialog"`, `id` referenced by the trigger's `aria-controls`.

## RN notes

- Anchored overlay in the `ThemeRoot` portal host; re-wrap in the trigger's Theme. Defaults to port: `side='bottom'`,
  `align='start'`, `sideOffset=8`, `collisionPadding=10`, flip + shift.
- `min-width = trigger width` must be applied from the measured anchor width; `maxWidth` default 480.
- Content padding per size feeds an Inset context (same role as `--inset-padding-*`).
- `--shadow-5` is a multi-layer shadow; platform shadow approximation (see `llm/differences.md`).
- Tap outside dismisses; Android back button should dismiss (Escape equivalent). Modal mode is rarely meaningful on
  touch; keep the prop for parity.
- Not a Variant recipe: one panel style shared with HoverCard (HoverCard uses `--shadow-4` and has no size 4).
