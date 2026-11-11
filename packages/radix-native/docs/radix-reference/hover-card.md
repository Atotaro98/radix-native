# HoverCard — Radix reference

Sources: `THEMES/components/hover-card.{tsx,props.tsx,css}`, `PRIM/hover-card/src/hover-card.tsx`.
Docs: radix-ui.com/themes/docs/components/hover-card ("For sighted users to preview content available behind a link").
Shared overlay machinery in `overlay-infrastructure.md`.

## 1. Parts

| Part | Element | Primitive |
|---|---|---|
| `HoverCard.Root` | — | `HoverCard.Root` with Themes defaults `openDelay={200}` `closeDelay={150}` |
| `HoverCard.Trigger` | the child (forced `asChild`), class `rt-HoverCardTrigger` (no CSS attached) | `HoverCard.Trigger` (a `Primitive.a`) |
| `HoverCard.Content` | `div.rt-PopperContent.rt-HoverCardContent` in `Portal` › `Theme asChild` | `HoverCard.Content` |

No Arrow exported.

## 2. Props

Root: `open`, `defaultOpen`, `onOpenChange`, `openDelay` (Themes **200**, primitive 700), `closeDelay` (Themes **150**, primitive 300).

Trigger: anchor props; `data-state="open|closed"`.

Content:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `width` / `minWidth` | `string` | — | yes |
| `maxWidth` | `string` | `'480px'` | yes |
| `height` / `minHeight` / `maxHeight` | `string` | — | yes |
| `asChild` | `boolean` | — | no |
| `side` | Side | `'bottom'` | no |
| `sideOffset` | `number` | **`8`** | no |
| `align` | Align | **`'start'`** | no |
| `collisionPadding` | `number` | **`10`** | no |
| other popper props, `onEscapeKeyDown`, `onPointerDownOutside`, `onFocusOutside`, `onInteractOutside`, `forceMount`, `container` | | | no |

## 3. Visual values

`.rt-HoverCardContent`: `background-color: --color-panel-solid`, `box-shadow: --shadow-4` (**one step lighter than
Popover's `--shadow-5`**), `overflow: auto`, `position: relative`, `box-sizing: border-box`,
`padding: --hover-card-content-padding` (also `--inset-padding-*`), `transform-origin: --radix-hover-card-content-transform-origin`.
No `min-width: trigger width` (unlike Popover).

| size | padding | border-radius |
|---|---|---|
| 1 | `--space-3` (12) | `--radius-4` |
| 2 | `--space-4` (16) | `--radius-4` |
| 3 | `--space-5` (24) | `--radius-5` |

## 4. Behaviour (web)

- Opens on pointer enter after `openDelay`, closes on pointer leave after `closeDelay`; entering the content cancels the
  close timer. Opens on keyboard focus of the trigger and closes on blur.
- Touch is **explicitly excluded**: `excludeTouch` ignores touch pointer enter/leave, and `onTouchStart` calls
  `preventDefault()` so touch doesn't even focus the trigger. A tap on the trigger link just follows the link.
- Dismissed by Escape and outside pointer-down. Focus never moves into the content; tabbable nodes in the content get
  `tabindex="-1"`. Content is not announced (no role / aria wiring) — it is a visual preview only.
- While the user selects text that started in the content, body `user-select` is set to `none` to contain the selection.

## RN notes

- Anchored overlay, `side='bottom'`, `align='start'`, `sideOffset=8`, `collisionPadding=10`; panel shared with Popover
  except `shadow-4` and sizes 1–3.
- Radix has no touch behaviour at all; our long-press-to-open / outside-touch-to-close is an RN invention. Because a long
  press on a link is the open gesture, the child's `onPress` (navigate) still fires on tap.
- `openDelay` / `closeDelay` have no meaning for long-press; keep the props for parity (maybe for web / pointer).
- Content is not exposed to screen readers in Radix; in RN prefer leaving it out of the accessibility tree too, or make
  sure the trigger already conveys the information.
- Not a Variant recipe.
