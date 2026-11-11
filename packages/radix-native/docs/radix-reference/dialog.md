# Dialog (Radix Themes reference)

Sources: `radix-ui-themes/src/components/dialog.tsx`, `dialog.props.tsx`, `dialog.css` →
`_internal/base-dialog.css`; primitive `@radix-ui/react-dialog` (`dialog.tsx`); docs
<https://www.radix-ui.com/themes/docs/components/dialog>,
<https://www.radix-ui.com/primitives/docs/components/dialog>. Shared machinery (portal, Theme re-wrap,
Presence, DismissableLayer, focus, scroll lock, animations) is in `overlay-infrastructure.md`.

A **Modal overlay** (GLOSSARY). Themes' Dialog is always modal: `Dialog.Root` forces `modal` and removes
the prop from its type.

## Parts

| Part | Renders | Notes |
|---|---|---|
| `Dialog.Root` | context only | `open`, `defaultOpen`, `onOpenChange`; `modal` removed (always `true`) |
| `Dialog.Trigger` | primitive Trigger, **always `asChild`** | child must be a single React element (`requireReactElement`); toggles `open` on click; `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (when open), `data-state` |
| `Dialog.Content` | `Portal → Theme asChild → Overlay → Scroll → ScrollPadding → Content` | Overlay, Portal and scroll wrappers are not separate public parts in Themes |
| `Dialog.Title` | primitive Title `asChild` → `<Heading size="5" mb="3" trim="start">` (`h2`) | consumer props spread after the defaults, so `size`, `mb`, `trim`, `weight`… can be overridden; `asChild` forced to `false` |
| `Dialog.Description` | primitive Description `asChild` → `<Text as="p" size="3">` | props overridable; omit + `aria-describedby={undefined}` on Content to drop it |
| `Dialog.Close` | primitive Close, **always `asChild`** | child must be a single element; sets `open=false` on click |

## Props

### Root (primitive)

| Prop | Type | Default |
|---|---|---|
| `open` | `boolean` | — (uncontrolled) |
| `defaultOpen` | `boolean` | `false` |
| `onOpenChange` | `(open: boolean) => void` | — |

### Content (Themes)

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `asChild` | `boolean` | — | no |
| `align` | `'start' \| 'center'` | `'center'` | **no** in the prop def (no `responsive: true`), even though the CSS for it sits in `@breakpoints` |
| `size` | `'1' \| '2' \| '3' \| '4'` | `'3'` | yes |
| `width` | `string` (CSS) | — | yes |
| `minWidth` | `string` | — | yes |
| `maxWidth` | `string` | `'600px'` | yes |
| `height` | `string` | — | yes |
| `minHeight` | `string` | — | yes |
| `maxHeight` | `string` | — | yes |
| `container` | `Element` | `document.body` | — |
| `forceMount` | `true` | — | — |

Plus all primitive Content props: `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`,
`onPointerDownOutside`, `onInteractOutside` (and `onFocusOutside`), all preventable. Content does **not**
take margin props.

## Structure and CSS

```
.rt-BaseDialogOverlay        position: fixed; inset: 0
  ::before                   position: fixed; inset: 0; background: var(--color-overlay)   ← backdrop
  .rt-BaseDialogScroll       display: flex; overflow: auto; position: absolute; inset: 0      ← scrolls
    .rt-BaseDialogScrollPadding   flex-grow: 1; margin: auto;
                                  padding: space-6 (top) space-4 (sides) max(space-6, 6vh) (bottom)
                                  align start → margin-top: 0 ; align center → margin-top: auto
      .rt-BaseDialogContent  margin: auto; width: 100%; max-width: var(--max-width, 600px);
                             position: relative; z-index: 1; box-sizing: border-box; overflow: auto;
                             padding: var(--dialog-content-padding);
                             background: var(--color-panel-solid); box-shadow: var(--shadow-6); outline: none
```

### Sizes

| size | padding (`--dialog-content-padding`) | border-radius | px at 100% scaling, radius medium |
|---|---|---|---|
| 1 | `space-3` | `radius-4` | 12 / 8 |
| 2 | `space-4` | `radius-4` | 16 / 8 |
| 3 (default) | `space-5` | `radius-5` | 24 / 12 |
| 4 | `space-6` | `radius-5` | 32 / 12 |

The padding is also published as `--inset-padding-{top,right,bottom,left}` so an `<Inset>` inside the
content can bleed to the edges.

### Width and height

- Width = `100%` of the padding box (viewport − `space-4` per side), capped by `max-width` (600px default).
  `width` / `minWidth` / `maxWidth` / `height` / `minHeight` / `maxHeight` are plain CSS lengths.
- No default height or max-height.

### Vertical position (`align`)

- `center`: the padding box is centred by `margin: auto` in the flex scroller, and the content is centred
  inside it. Because bottom padding is `max(space-6, 6vh)` vs top `space-6`, the dialog sits slightly
  **above** the true centre on tall viewports.
- `start`: the padding box gets `margin-top: 0`, so the content is pinned to `space-6` from the top.

### Tall content (scroll behaviour)

- The **whole overlay** scrolls (`.rt-BaseDialogScroll { overflow: auto }`): a dialog taller than the
  viewport grows past it, keeps its top/bottom padding, and the user scrolls the page-like layer — the
  dialog itself does **not** get an internal scroll by default.
- `Content` has `overflow: auto`, so it scrolls internally only if the consumer sets `height` /
  `maxHeight`.
- Page scroll behind is locked (`react-remove-scroll`, see infrastructure §5).

### Colors per appearance

| Token | Light | Dark |
|---|---|---|
| Backdrop `--color-overlay` | `black-a6` (rgba(0,0,0,0.4)) | `black-a8` (rgba(0,0,0,0.6)) |
| Panel `--color-panel-solid` | `white` | `gray-2` |

The panel is always **solid**: Dialog ignores `panelBackground="translucent"`.

### Shadow `--shadow-6`

| | Light | Dark |
|---|---|---|
| ring | `0 0 0 1px gray-a3` (with color-mix: mix(gray-a3, gray-3 25%)) | `0 0 0 1px gray-a6` (mix(gray-a6, gray-6 25%)) |
| layer 2 | `0 12px 60px black-a3` | `0 12px 60px black-a4` |
| layer 3 | `0 16px 64px gray-a2` | `0 16px 64px black-a6` |
| layer 4 | `0 16px 36px -20px gray-a7` | `0 16px 36px -20px black-a11` |

### Typography

- **Title**: Heading size 5 → `font-size-5` 20px × scaling, line-height `heading-line-height-5` 26px,
  letter-spacing `-0.005em`, weight bold (700), heading font family; `margin-bottom: space-3` (12px);
  `trim="start"` removes leading above the first line: `::before { margin-bottom: 0.42em − 26px/2 }` =
  −4.6px at 100%.
- **Description**: Text size 3 → 16px / 24px, letter-spacing 0, regular weight, default color (inherits
  `gray-12` page text). Renders a `<p>`; no margin.

### Animation (reduced motion: none)

Backdrop fade-in 200 ms / fade-out 160 ms; content `opacity 0, translateY(5px) scale(0.97)` → identity in
200 ms, closing to `opacity 0, translateY(5px) scale(0.99)` in 100 ms; easing
`cubic-bezier(0.16, 1, 0.3, 1)`. Details in infrastructure §7.

## Behaviour

- Open: Trigger click (toggle), or `open`. Close: `Dialog.Close`, Escape (top layer only), pointer-down on
  the backdrop/anything outside the content (deferred to the click; right-click ignored), controlled
  `open=false`. Focus moving outside does not close (prevented; trap reclaims it).
- Focus: on open, first tabbable non-link inside Content (else Content); trapped and looping while open;
  on close, focus returns to the Trigger. Scroll locked; everything else `aria-hidden`; body
  `pointer-events: none`.
- A11y: `role="dialog"`, `aria-labelledby` → Title, `aria-describedby` → Description(s). Dev warning on
  more than one Title.
- Nested Dialogs stack as layers; Escape closes only the top one. A press on the top dialog's backdrop
  closes the top one; when that Dialog is rendered inside the parent's Content (React tree), the press
  counts as inside the parent, so the parent stays open.

## RN notes (agreed design)

- Render in `<Modal transparent animationType="none" visible={present} onRequestClose={…}
  statusBarTranslucent>`; `onRequestClose` (Android back) = Escape, top layer only. Re-wrap children with
  the Theme read where `Dialog.Content` is rendered. Provide a portal host inside the Modal for Anchored
  overlays opened from the dialog.
- Layout: full-screen backdrop `Pressable` (`--color-overlay`: `blackA(6)` / `blackA(8)` via a recipe,
  `byMode`) that dismisses; centred content; width = window − `space(4)` per side (plus
  `safeAreaInsets` left/right), capped at `maxWidth` (600 default). Vertical padding `space(6)` top and
  `max(space(6), 6% of height)` bottom, plus safe-area insets. `align="start"` pins to the top.
- Tall content: **deviation** — our design scrolls inside the content (a `ScrollView` capped at the
  available height) instead of scrolling the whole layer; Radix scrolls the layer and keeps the dialog
  full height. Record in `differences.md`. Wrap in `KeyboardAvoidingView` (RN-only addition).
- `width`/`maxWidth`/`height`… accept numbers (and maybe `%` strings); no responsive objects
  (`differences.md`: responsive props not planned) — `size` takes a fixed value.
- Panel `gray-panel` solid (white / dark gray-2), radius via `metrics.radius(4|5)`, padding via
  `metrics.space(3..6)`. `--shadow-6` → one platform shadow from a recipe (`shadow` ShadowPaint) plus
  the 1px ring as `borderColor` (`gray-a3` / dark `gray-a6`).
- Title = `Heading size="5"` with `mb="3"` and start trim (our Heading's trim support if present, else
  `marginTop: −(lineHeight/2 − 0.42em)`); Description = `Text size="3"`. Both overridable.
- Trigger / Close: clone the single child and compose `onPress` (no `asChild` support in RN yet — use a
  cloneElement-based slot or accept a render child).
- A11y: `accessibilityViewIsModal`; move screen-reader focus to the Title on open; return it to the
  trigger on close. No `dialog` role in RN.
- Animations with reanimated; Reduce Motion → fade only (Radix: none).
