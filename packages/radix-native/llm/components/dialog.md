# Dialog

> Window overlaid on the primary window, rendering the content underneath inert.

## Import

```tsx
import { Dialog } from 'radix-native'
```

## Parts and props

- **Dialog.Root**: `open`, `defaultOpen` (false), `onOpenChange`.
- **Dialog.Trigger**: one element; its `onPress` toggles the dialog (Radix: always `asChild`).
- **Dialog.Content**: `size` (`1-4`, default 3: padding 12/16/24/32, radius-4/4/5/5), `align` (`'start' | 'center'`), `width`, `minWidth`, `maxWidth` (600), `height`, `minHeight`, `maxHeight`, `onEscapeKeyDown` (Android back; `preventDefault()` keeps it open).
- **Dialog.Title**: Heading size 5, `mb={3}`, leading trimmed above the first line.
- **Dialog.Description**: Text size 3.
- **Dialog.Close**: one element; its `onPress` closes.

## Examples

```tsx
<Dialog.Root>
  <Dialog.Trigger><Button>Edit profile</Button></Dialog.Trigger>
  <Dialog.Content maxWidth={450}>
    <Dialog.Title>Edit profile</Dialog.Title>
    <Dialog.Description size={2} mb={4}>Make changes to your profile.</Dialog.Description>
    <Flex direction="row" gap={3} mt={4} justify="end">
      <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
      <Dialog.Close><Button>Save</Button></Dialog.Close>
    </Flex>
  </Dialog.Content>
</Dialog.Root>
```

## Behaviour

- Renders in a native `Modal` (its own window): nothing behind it takes touches; screen readers stay inside.
- A press on the backdrop or the Android back button closes it.
- Content taller than the screen scrolls the whole layer, as in Radix; with `height` / `maxHeight` it scrolls inside.
- Padding: space-6 above, space-4 at the sides, `max(space-6, 6% of the height)` below, plus the Theme's `safeAreaInsets`.
- Opens in 200ms (fade + `translateY(5px) scale(0.97)`), closes in 100 / 160ms, `cubic-bezier(0.16, 1, 0.3, 1)`; no animation under Reduce Motion.
- An `Inset` inside bleeds to the content's edges; a Table in it aligns its outer cells with the padding.
- Popovers, menus and Selects opened inside draw above it (each dialog has its own portal host).
