# AlertDialog (Radix Themes reference)

Sources: `radix-ui-themes/src/components/alert-dialog.tsx`, `alert-dialog.props.tsx`
(re-exports Dialog's prop defs), `alert-dialog.css` (imports `_internal/base-dialog.css`); primitive
`@radix-ui/react-alert-dialog` (a thin layer over `@radix-ui/react-dialog`); docs
<https://www.radix-ui.com/themes/docs/components/alert-dialog>.

**Visually identical to Dialog** — same DOM structure (`Portal → Theme asChild → Overlay → Scroll →
ScrollPadding → Content`), same classes (`rt-BaseDialog*` plus `rt-AlertDialog*`, which have no styles of
their own), same Content props, sizes, colors, shadow, typography and animations. Read `dialog.md` for
all of those; this file lists only what differs.

## Parts

| Part | Renders | Notes |
|---|---|---|
| `AlertDialog.Root` | `Dialog.Root` with `modal={true}` | `open`, `defaultOpen` (`false`), `onOpenChange`; `modal` not accepted |
| `AlertDialog.Trigger` | Dialog Trigger, always `asChild` | single element child |
| `AlertDialog.Content` | Dialog Content with `role="alertdialog"` | same Themes props as `Dialog.Content`: `align` (`'center'`), `size` (`'3'`, responsive), `width`, `minWidth`, `maxWidth` (`'600px'`), `height`, `minHeight`, `maxHeight`, `asChild`, `container`, `forceMount`; primitive `onOpenAutoFocus`, `onCloseAutoFocus`, `onEscapeKeyDown`. **`onPointerDownOutside` and `onInteractOutside` are removed from the type** |
| `AlertDialog.Title` | `Heading size="5" mb="3" trim="start"` | as Dialog |
| `AlertDialog.Description` | `Text as="p" size="3"` | as Dialog |
| `AlertDialog.Action` | Dialog Close, always `asChild` | closes; the consumer runs the action in its own `onClick` |
| `AlertDialog.Cancel` | Dialog Close, always `asChild`, ref stored as `cancelRef` | closes; receives initial focus |

No `AlertDialog.Close`: closing is through Action or Cancel (or Escape).

## Behaviour differences from Dialog

| | Dialog | AlertDialog |
|---|---|---|
| Role | `dialog` | `alertdialog` |
| Pointer-down / interaction outside (backdrop press) | closes | **ignored** — `onPointerDownOutside` and `onInteractOutside` always `preventDefault()` (hard-wired, not overridable) |
| Escape | closes | **still closes** (not prevented; consumer can `onEscapeKeyDown={e => e.preventDefault()}`) |
| Initial focus | first tabbable non-link inside | `AlertDialog.Cancel` (`focus({ preventScroll: true })`); the consumer's `onOpenAutoFocus` runs first; if there is no Cancel nothing is focused by default (the default is prevented regardless) |
| Return focus | trigger | trigger (same) |
| Scroll lock, `aria-hidden` on others, focus trap | yes | yes (same modal path) |

The docs: an alert dialog "interrupts the user and expects a response"; Action and Cancel should look
visually distinct (examples: `color="red"` Action, `variant="soft" color="gray"` Cancel, in a
`Flex gap="3" mt="4" justify="end"`).

## RN notes (agreed design)

- Same component as our Dialog (share one internal `BaseDialog`, like Radix's `base-dialog.css`), with:
  backdrop press does **nothing** (the backdrop still swallows the touch);
  Android back (`onRequestClose`) / hardware Escape closes, as Escape does in Radix (expose
  `onEscapeKeyDown` with `preventDefault` to block it);
  `accessibilityRole="alert"` or announce on open; initial screen-reader focus on `Cancel` (Radix focuses
  Cancel, not the Title).
- Action / Cancel: clone the single child and compose `onPress` to close after the consumer handler.
- All visual notes (centred, width = window − `space-4` per side capped at `maxWidth`, internal scroll,
  `KeyboardAvoidingView`, `align="start"`, safe-area insets, Reduce Motion fade) as in `dialog.md`.
