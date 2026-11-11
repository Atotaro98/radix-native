# Overlay infrastructure (Radix Themes + Primitives reference)

What Radix does underneath every Overlay (see `GLOSSARY.md` → Overlays), read from the sources:
`radix-ui-themes/src/components/{dialog,alert-dialog,popover,tooltip,dropdown-menu,…}.tsx`,
`theme.tsx`, `animations.css`, `_internal/base-dialog.css`, and the primitives `portal`, `presence`,
`dismissable-layer`, `focus-scope`, `focus-guards`, `popper`, `use-controllable-state`, `dialog`.
Each section ends with **RN notes**: how it maps onto our design (ADR 0001).

---

## 1. Portal and Theme propagation

### Radix

- `Portal` (`@radix-ui/react-portal`) is `ReactDOM.createPortal(<div/>, container)`. `container`
  defaults to `document.body` and is only resolved after a layout effect (`mounted` state), so nothing
  renders on the first (server) pass.
- Every Themes overlay renders its content as
  `Primitive.Portal → <Theme asChild> → Content`. Examples:
  - Dialog / AlertDialog: `Portal → Theme asChild → Overlay → div.rt-BaseDialogScroll → div.rt-BaseDialogScrollPadding → Content`.
  - Popover / HoverCard / DropdownMenu / ContextMenu / Select (`position="popper"`) / Tooltip:
    `Portal → Theme asChild → Content`.
- Why the re-wrap: the portalled DOM lands in `body`, outside the `.radix-themes` element, so the CSS
  variables (appearance class `light`/`dark`, `data-accent-color`, `data-gray-color`, `data-radius`,
  `data-scaling`, `data-panel-background`) would be lost. `<Theme asChild>` is **not** the root (React
  context already exists), so it renders `ThemeImpl`, which reads every value from `ThemeContext`
  (React context flows through portals) and re-emits the class + data attributes on the content's own
  element (`Slot`).
- Which Theme is used: the `ThemeContext` nearest to where `*.Content` is **rendered in the React
  tree**, not where the Trigger is. In normal usage Trigger and Content are siblings under the same
  Root, so they share a Theme. If a consumer wraps only the Content in `<Theme accentColor="red">`, the
  overlay uses red even though the trigger is in another Theme.
- `hasBackground` on that re-wrap is `false` (not root, appearance not explicit), so the wrapper adds
  no page background — the overlay keeps its own panel / overlay colors.
- Every value is propagated: `appearance`, `accentColor`, `grayColor` (resolved `auto` → matching gray),
  `panelBackground`, `radius`, `scaling`. The Theme change handlers are noops on the inner Theme.
- `container` is exposed on every Themes Content (`Dialog.Content container={el}`) and `forceMount` too.

### RN notes

- Modal overlays (Dialog, AlertDialog) render inside `<Modal transparent>`; Anchored overlays render
  through the portal host mounted by `ThemeRoot`. Both re-wrap their children in an inheriting
  `ThemeImpl` built from `useThemeContext()` read **at the Content element's position in the tree**,
  which is what Radix does (and equals "the Theme nearest the trigger" whenever Trigger and Content sit
  under the same Root — the documented usage).
- RN `Modal` is a separate native window: a portal host mounted by `ThemeRoot` sits *below* it. An
  Anchored overlay opened from inside a Dialog (Popover, Select, DropdownMenu, Tooltip in a Dialog)
  must render into a portal host that lives **inside** that Modal. Each Modal overlay therefore needs
  to provide its own (nearest) portal host; Anchored overlays target the nearest host, not always the
  root one.
- `container` / `forceMount` have no DOM meaning; drop `container`, keep `forceMount` only if we expose
  animation control.

---

## 2. Presence (mount / unmount with exit animations)

### Radix

- `Presence` wraps each part (Portal child, Overlay, Content) with `present = forceMount || open`.
- State machine: `mounted --UNMOUNT--> unmounted`, `mounted --ANIMATION_OUT--> unmountSuspended`,
  `unmountSuspended --ANIMATION_END--> unmounted`, `unmountSuspended --MOUNT--> mounted`
  (re-opening during an exit animation keeps the node).
- On `present → false` it reads `getComputedStyle(node).animationName`: if it is `none` (or
  `display: none`) the node unmounts immediately; if the animation name changed (a closing keyframe
  started) it waits for `animationend` / `animationcancel` of **that** animation on **that** node.
  After the end it sets `animation-fill-mode: forwards` for one tick to avoid a flash.
- The exit state is driven purely by CSS: the closed state is expressed with `data-state="closed"` and
  keyframes. Under `prefers-reduced-motion: reduce` no keyframes apply, so the node unmounts at once.
- Parts animate independently. In Themes' Dialog the Overlay **contains** the Content, so the Overlay
  gets a 160 ms "no-op" keyframe (`rt-dialog-overlay-no-op`, opacity 1→1) while closing purely to keep
  itself (and the Content inside) mounted while the 100 ms content exit and the 160 ms backdrop fade
  (`::before`) run.
- During the exit animation the content is still mounted but `open` is false: DismissableLayer has
  already released `disableOutsidePointerEvents`, focus trap is off (`trapped={open}`).

### RN notes

- Implement a `usePresence(open)` with reanimated: keep the tree mounted, run the exit animation on the
  UI thread, unmount from the animation's completion callback (`runOnJS`). Re-opening mid-exit must
  cancel the exit and keep the same instance (the `unmountSuspended → mounted` edge).
- For a Modal overlay, keep `<Modal visible>` true until the exit finishes (set `visible={false}` only
  after the callback); use `animationType="none"` so the native fade does not double ours.
- Under Reduce Motion (`AccessibilityInfo.isReduceMotionEnabled` / reanimated `useReducedMotion`) our
  design keeps a fade (see §7); Radix uses no animation at all.

---

## 3. DismissableLayer

### Radix rules (`dismissable-layer.tsx`)

- A module-level context holds a **stack of layers** in mount order, the subset with
  `disableOutsidePointerEvents`, **branches** (`DismissableLayerBranch`) and **dismissable surfaces**
  (e.g. the Dialog overlay, registered with `useDismissableLayerSurface`).
- **Escape**: a `keydown` listener (capture, on `document`) is attached **only by the highest layer**.
  Escape calls `onEscapeKeyDown(event)`; if not `preventDefault`ed, the layer calls `onDismiss`. So
  Escape closes exactly one layer — the top one. Escape during IME composition (`isComposing` or
  `keyCode 229`) is ignored.
- **Pointer down outside**: each layer listens to `pointerdown` on the document (registered after a
  `setTimeout(0)` so the opening press does not close it). "Inside" is judged on the **React tree**
  (`onPointerDownCapture` on the layer), so a press inside a nested, portalled child layer counts as
  inside its parents. A layer handles an outside press only if it is at or above the highest layer
  with `disableOutsidePointerEvents` (`isPointerEventsEnabled`), and the target is not inside a branch.
  Then `onPointerDownOutside` → `onInteractOutside` → `onDismiss` unless prevented.
  Consequence: one outside press can dismiss **several** layers at once (e.g. a non-modal Popover
  inside a Dialog and the Dialog itself when pressing the dialog's overlay); a press inside the Dialog
  content but outside the Popover closes only the Popover.
- **Deferred pointer-down** (`deferPointerDownOutside`, used by Dialog content): for the primary
  button the dismissal waits for the `click`; if third-party code stops `pointerup`/`mousedown`/
  `click` (other than on a dismissable surface) the dismissal is cancelled. Scroll-drag or long-press
  (no click) also cancels it. Non-primary buttons dismiss immediately.
- **Focus outside**: `focusin` outside the React subtree → `onFocusOutside` → `onInteractOutside` →
  `onDismiss`. Modal Dialog `preventDefault`s focus-outside (the trap handles it).
- **`disableOutsidePointerEvents`**: while any such layer is mounted, `body.style.pointerEvents =
  'none'` and only layers at or above the highest such layer get `pointer-events: auto`. The first
  outside click only closes the layer; a second is needed to hit the element underneath.
  Who sets it: modal Dialog / AlertDialog (`= open`), DropdownMenu and ContextMenu (modal by default),
  Select. **Popover is `modal={false}` by default**: an outside press dismisses it **and** reaches the
  element underneath (no blocking). HoverCard and Tooltip are non-modal too.
- Modal Dialog ignores right-click (and ctrl+left-click) outside: it `preventDefault`s them.
- Non-modal Dialog: pressing the trigger is not treated as outside (so the trigger toggles), and focus
  returns to the trigger only if the user did not interact outside.

### RN notes

- Keep a JS layer stack (context in `ThemeRoot`) ordered by mount. Only the top layer handles the
  Android back button (`BackHandler`, our Escape) and hardware-keyboard Escape where available.
  RN `Modal`'s `onRequestClose` is the back button for Modal overlays; it must defer to an Anchored
  overlay open above it (close the top layer only).
- Our design gives every Anchored overlay (except Tooltip) a full-screen transparent backdrop whose
  press closes it and is **not** propagated. That matches DropdownMenu / ContextMenu / Select (modal by
  default) but **not** Popover (non-modal: Radix lets the press through) or HoverCard. Document the
  Popover difference, or offer `modal` on Popover with our default `true`.
- "Inside" must follow the React tree: a Popover in a Dialog renders into the Dialog's portal host,
  above the Dialog's backdrop; pressing its own backdrop closes only the Popover (the backdrop
  swallows the touch), which differs from Radix where one press on the dialog overlay closes both.
- No focus-outside dismissal on touch; on TV / keyboard focus it can be skipped (the Modal traps).

---

## 4. Focus scope, focus guards, return focus

### Radix

- `FocusScope` (`trapped={open}` for modal, `loop`) — `trapped` reclaims focus on `focusin`/`focusout`
  outside the container (except registered `branches`, i.e. nested non-modal layers); `loop` wraps Tab
  / Shift+Tab between the first and last tabbable.
- **On mount**: if focus is not already inside, dispatches `onMountAutoFocus` (`onOpenAutoFocus`); if
  not prevented, focuses the **first tabbable that is not a link** (`removeLinks`), falling back to the
  container itself (Content has `tabIndex=-1` style focus).
  AlertDialog prevents this and focuses `AlertDialog.Cancel` instead.
- **On unmount** (after `setTimeout(0)`): `onUnmountAutoFocus` (`onCloseAutoFocus`); Dialog's modal
  content prevents the default and focuses `triggerRef` explicitly. Otherwise the previously focused
  element (or `body`).
- Scopes form a stack: mounting a new one pauses the previous; unmounting resumes it.
- `useFocusGuards` inserts two invisible focusable `<span data-radix-focus-guard>` at the start and
  end of `body` so `focusin`/`focusout` always fire at the document edges.
- Modal Dialog also calls `hideOthers(content)` → `aria-hidden` on every sibling of the content's
  ancestors, so screen readers only see the dialog.
- Semantics: Content `role="dialog"` (AlertDialog: `role="alertdialog"`), `aria-labelledby` = Title id
  (if a Title is mounted), `aria-describedby` = all mounted Description ids (merged with the consumer's).
  Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (when open), `data-state`.
  Dev warning when several Titles are mounted.

### RN notes

- `Modal` already isolates screen-reader focus (it is its own window), which is our `hideOthers`.
  Anchored overlays in the portal host cannot hide the app's other views (no `aria-hidden` across the
  tree); set `accessibilityViewIsModal` on their content (iOS) for modal ones (menus, Select).
- Initial focus: move screen-reader focus to the Title (or the Cancel for AlertDialog) with
  `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))` after the open animation starts.
  Keyboard/TV focus: focus the first focusable (or Cancel) — `autoFocus`-like behaviour via a ref.
- Return focus: on close, `setAccessibilityFocus` back to the trigger ref (Radix focuses `triggerRef`).
- Roles: content `accessibilityRole` has no `dialog`/`alertdialog` on RN; use `accessibilityViewIsModal`
  plus `accessibilityLabel` from the Title text, and on Android announce with
  `AccessibilityInfo.announceForAccessibility` for AlertDialog (role `alert` exists: use
  `accessibilityRole="alert"` on AlertDialog content).

---

## 5. Scroll lock

### Radix

- Modal Dialog's Overlay wraps itself in `react-remove-scroll` (`allowPinchZoom`, `shards` = the
  content + branch nodes): page scroll (wheel / touch / keys) is blocked except inside the shards, and
  the scrollbar gap is compensated. DropdownMenu / ContextMenu / Select (modal) also lock scroll;
  Popover only when `modal`.
- The dialog itself can scroll: `rt-BaseDialogScroll` is `overflow: auto` covering the viewport (see
  `dialog.md`).

### RN notes

- RN `Modal` blocks touches to the screen behind, so nothing behind scrolls. For Anchored overlays
  the full-screen backdrop absorbs touches, so the underlying ScrollView cannot scroll while open —
  this is also why measuring the anchor only on open / layout / rotation is enough.

---

## 6. Popper engine (Anchored overlays)

### Radix (`popper.tsx`, Floating UI)

PopperContent props and defaults (primitive): `side='bottom'`, `sideOffset=0`, `align='center'`,
`alignOffset=0`, `arrowPadding=0`, `avoidCollisions=true`, `collisionBoundary=[]` (viewport),
`collisionPadding=0` (number or per-side object, missing sides 0), `sticky='partial'`,
`hideWhenDetached=false`, `updatePositionStrategy='optimized'`, `onPlaced`.

Themes overrides:

| Component | side | align | sideOffset | collisionPadding | other |
|---|---|---|---|---|---|
| Popover | bottom | `start` | 8 | 10 | `min-width: var(--radix-popover-trigger-width)` |
| HoverCard | bottom | `start` | 8 | 10 | |
| Tooltip | top (primitive default for Tooltip) | center | 4 | 10 | Arrow |
| DropdownMenu | bottom | `start` | 4 | 10 | `max-height: available-height` |
| DropdownMenu.SubContent / ContextMenu.SubContent | right | start | 1 | 10 | |
| ContextMenu | at pointer | — | 0 | 10 | |
| Select (`position="popper"`) | bottom | start | 4 | 10 (primitive) | `min-width: trigger width`, `max-height: available-height` |

Pixel offsets are **not** multiplied by `--scaling`.

Middleware, in order:

1. `offset({ mainAxis: sideOffset + arrowHeight, alignmentAxis: alignOffset })`.
2. `shift` (if `avoidCollisions`) on the main axis only (cross-axis off), padded by
   `collisionPadding`; `sticky='partial'` adds `limitShift()` (content stays attached to the anchor:
   stops shifting once the anchor's edge is reached), `sticky='always'` keeps it in the boundary even
   if it detaches.
3. `flip` (if `avoidCollisions`): moves to the opposite side when the preferred side overflows.
4. `size`: writes `--radix-popper-available-width/height` (space between anchor and boundary minus
   padding) and `--radix-popper-anchor-width/height`. Themes uses these as `max-height` /
   `min-width` (re-exported per component, e.g. `--radix-dropdown-menu-content-available-height`).
5. `arrow` (if an Arrow is mounted) with `arrowPadding`; arrow hidden when it cannot be centred.
6. `transformOrigin` → `--radix-popper-transform-origin`: on the anchor-facing edge, at the arrow
   centre or `0% / 50% / 100%` for align start/center/end (e.g. side bottom + align start = `0% 0px`).
   Themes uses it as `transform-origin` so the scale animation grows out of the anchor.
7. `hide` (if `hideWhenDetached`): `visibility: hidden; pointer-events: none` when the anchor is
   clipped out of view.

Positioning: `strategy: fixed`, kept in sync by `autoUpdate` (scroll of any ancestor, resize, element
resize, and every frame when `updatePositionStrategy='always'`). Before the first computed position
the wrapper is translated off-screen (`translate(0,-200%)`) and the content's `animation` is `none`, so
the entry animation starts only once placed. `data-side` / `data-align` on content reflect the
**placed** side after flipping (animations key off it). The wrapper copies the content's `z-index`
and `min-width: max-content`.

### RN notes

- Measure the anchor with `measureInWindow` on open, and re-measure on content `onLayout` and on
  `Dimensions` change (rotation). Hide content (`opacity: 0`, no animation) until the first placement,
  like Radix's off-screen pre-measure.
- Boundary = window minus `ThemeRoot`'s `safeAreaInsets` (default 0), then minus `collisionPadding`
  (default 10 as in Themes). Implement offset → shift (main axis, `limitShift` when sticky partial) →
  flip → size (available width/height as `maxHeight` / `maxWidth` props to the content) → arrow →
  transform origin, in that order; the order matters (Radix shifts before flipping).
- Expose `side`, `sideOffset`, `align`, `alignOffset`, `avoidCollisions`, `collisionPadding`,
  `sticky`, `arrowPadding`; `hideWhenDetached` and `updatePositionStrategy` are moot when the backdrop
  prevents scrolling (accept and ignore, or omit).
- Inside a Modal overlay, `measureInWindow` coordinates are relative to the window; the Modal's portal
  host is full-window too, so no conversion is needed (verify on Android with `statusBarTranslucent`).
- Transform origin: reanimated has `transformOrigin` (RN ≥ 0.73) — use the computed origin so the
  `scale(0.97)` grows from the anchor.

---

## 7. Entry / exit animations (`animations.css`, `base-dialog.css`, `tooltip.css`)

All wrapped in `@media (prefers-reduced-motion: no-preference)` — under reduced motion there is **no
animation at all**, not even a fade. Easing everywhere: `cubic-bezier(0.16, 1, 0.3, 1)` (an
"ease-out-expo"-like curve).

### Keyframes

| Name | from | to |
|---|---|---|
| `rt-fade-in` / `rt-fade-out` | opacity 0 / 1 | opacity 1 / 0 |
| `rt-slide-from-top` (side top) | `translateY(4px) scale(0.97)` | `translateY(0) scale(1)` |
| `rt-slide-to-top` | `translateY(0) scale(1)` | `translateY(4px) scale(0.97)` |
| `rt-slide-from-bottom` (side bottom) | `translateY(-4px) scale(0.97)` | identity |
| `rt-slide-to-bottom` | identity | `translateY(-4px) scale(0.97)` |
| `rt-slide-from-left` (side left) | `translateX(4px) scale(0.97)` | identity |
| `rt-slide-to-left` | identity | `translateX(4px) scale(0.97)` |
| `rt-slide-from-right` (side right) | `translateX(-4px) scale(0.97)` | identity |
| `rt-slide-to-right` | identity | `translateX(-4px) scale(0.97)` |

The offset always points **toward the anchor** (content above the anchor starts 4px lower), keyed off
the placed `data-side`.

### Who uses what

| Overlay | Open | Close |
|---|---|---|
| `.rt-PopperContent` (Popover, HoverCard, DropdownMenu, ContextMenu, Select popper) | slide-from-{side} + fade-in, **160 ms** | slide-to-{side} + fade-out, **100 ms** |
| Tooltip (`.rt-TooltipContent`) | slide-from-{side} + fade-in, **140 ms**, only on `data-state="delayed-open"` | **none** (instant unmount); `instant-open` (moving between tooltips within the skip delay) also has no animation |
| Dialog backdrop (`::before`, `--color-overlay`) | `rt-fade-in` **200 ms** | `rt-fade-out` **160 ms** |
| Dialog overlay element | — | `rt-dialog-overlay-no-op` 160 ms (keeps it mounted) |
| Dialog content | `rt-dialog-content-show` **200 ms**: opacity 0→1, `translateY(5px) scale(0.97)` → identity | `rt-dialog-content-hide` **100 ms**: opacity 1→0, identity → `translateY(5px) scale(0.99)` |

Transform origin: popper content uses `--radix-…-content-transform-origin`; dialog content uses the
default (centre).

### RN notes

- Reanimated `withTiming(…, { duration, easing: Easing.bezier(0.16, 1, 0.3, 1) })`; durations and
  keyframes as above, per placed side.
- Our agreed Reduce-Motion behaviour (fade only, same durations) differs from Radix (no animation).
  It is an intentional RN deviation — record it in `llm/differences.md`.
- Tooltip: no exit animation in Radix; keep it instant to match (or fade-out only, documented).

---

## 8. Controlled state (`useControllableState`)

- `open` controlled when `!== undefined`; uncontrolled from `defaultOpen ?? false`.
- Controlled: the setter only calls `onOpenChange(next)` when `next !== open`. Uncontrolled:
  `onOpenChange` fires from an effect after the state changed (never for the initial value).
- Dev warning when switching between controlled and uncontrolled.

### RN notes

- Our internal `hooks/useControllableState.ts` has the same contract; reuse it for `open`.
