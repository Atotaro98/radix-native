# Tooltip — Radix reference

Sources: `THEMES/components/tooltip.{tsx,props.tsx,css}`, `THEMES/components/theme.tsx` (provider delay),
`PRIM/tooltip/src/tooltip.tsx`, `PRIM/arrow/src/arrow.tsx`. Docs: radix-ui.com/themes/docs/components/tooltip.
Shared overlay machinery in `overlay-infrastructure.md`.

## 1. Parts

Tooltip is a **single component**, not a compound one:

```
<TooltipPrimitive.Root>                       open/defaultOpen/onOpenChange/delayDuration/disableHoverableContent
  <TooltipPrimitive.Trigger asChild>{children}</…>
  <TooltipPrimitive.Portal container forceMount>
    <Theme asChild>
      <TooltipPrimitive.Content class="rt-TooltipContent" sideOffset=4 collisionPadding=10 …rest asChild=false>
        <Text as="p" class="rt-TooltipText" size="1">{content}</Text>
        <TooltipPrimitive.Arrow class="rt-TooltipArrow" />
```

`Theme` (every `<Theme>` root) wraps its tree in `Tooltip.Provider delayDuration={200}` (skipDelayDuration left at the primitive's 300).

## 2. Props

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `content` | `ReactNode` (required) | — | no |
| `children` | single element (the trigger) | — | — |
| `width` / `minWidth` | `string` | — | yes |
| `maxWidth` | `string` | `'360px'` | yes |
| `open` / `defaultOpen` / `onOpenChange` | Root | — | no |
| `delayDuration` | `number` (ms) | **200** via Theme's Provider (primitive default 700) | no |
| `disableHoverableContent` | `boolean` | `false` | no |
| `side` | Side | **`'top'`** (Tooltip.Content default) | no |
| `sideOffset` | `number` | **`4`** | no |
| `align` | Align | `'center'` | no |
| `collisionPadding` | `number` | **`10`** | no |
| `alignOffset`, `avoidCollisions`, `sticky`, `hideWhenDetached`, `arrowPadding`, `collisionBoundary` | popper | — | no |
| `aria-label` | `string` | — (when set, the visible content is not the description; a visually hidden copy with `role="tooltip"` is) | no |
| `onEscapeKeyDown`, `onPointerDownOutside` | handlers | — | no |
| `container`, `forceMount` | portal | — | no |

`skipDelayDuration` is only on `Tooltip.Provider` (300 ms; Themes does not expose or change it): after a tooltip closes,
another opens instantly if the pointer enters its trigger within 300 ms.

Margin props: the docs say Tooltip "supports common margin props" but the source does not extract them (they fall through to Content).

## 3. Visual values

`.rt-TooltipContent`: `padding: --space-1 --space-2` (4 / 8), `background-color: --gray-12`, `border-radius: --radius-2`,
`box-sizing: border-box`, `transform-origin: --radix-tooltip-content-transform-origin`.
Animation: 140 ms `cubic-bezier(0.16, 1, 0.3, 1)`, slide-from-side + fade, only on `data-state="delayed-open"`
(an instant open — focus, or within skip delay — is not animated). Tooltip does **not** use `.rt-PopperContent`.

`.rt-TooltipText`: `color: --gray-1`, Text size 1 → `--font-size-1` (12) / `--line-height-1` (16) / `--letter-spacing-1`,
regular weight, `<p>` with no margin, `user-select: none`.

`.rt-TooltipArrow`: SVG triangle **10 × 5** (primitive Arrow defaults), `fill: --gray-12`, flush with the content edge
(`arrowPadding` 0, centred on the anchor while it fits).

Colours per appearance — the same tokens, inverted by the scale itself:

| appearance | background (`gray-12`) | text (`gray-1`) |
|---|---|---|
| light | near-black | near-white |
| dark | near-white | near-black |

No `color`, `variant`, `size` or `highContrast` props; accent colour never applies. The gray scale is the Theme's `grayColor`.

## 4. Behaviour (web)

- Opens on pointer **hover** after `delayDuration` (or instantly within `skipDelayDuration`), and on keyboard **focus**
  instantly. `onPointerMove` returns early for `pointerType === 'touch'` → **touch never opens a tooltip**.
- Closes on: pointer leave (with hoverable content, moving into the content along a grace polygon keeps it open),
  `pointerdown` on the trigger, `click` on the trigger, blur, Escape, outside pointer-down, scroll of any ancestor of the
  trigger, or another tooltip opening (global `tooltip.open` event).
- a11y: when open, trigger gets `aria-describedby` → content `id`; content has `role="tooltip"`. Focus is never moved into it.

## RN notes

- Anchored overlay; defaults `side='top'`, `align='center'`, `sideOffset=4`, `collisionPadding=10`, flip + shift, arrow
  10 × 5 drawn with View borders (no SVG dep), coloured `gray-12`, its position following the resolved side.
- Text: size 1 Text style, `gray-1`; content padding 4/8; `radius-2`; `maxWidth` 360.
- Trigger interaction is our own (Radix has no touch path at all) — long-press open, release close, compose child `onLongPress`.
- a11y: no `aria-describedby` in RN; expose `content` (string) as `accessibilityHint` on the trigger.
- Animate only the delayed open (140 ms, same easing); a close in Radix is not animated by Themes' CSS for tooltips.
- Delay: Radix's 200 ms hover delay has no touch equivalent; long-press duration replaces it.
- Not a Variant recipe; single fixed style.
