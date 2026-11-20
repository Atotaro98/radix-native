---
'radix-native': patch
---

Fixes from a code audit. `Popover.Anchor` keeps positioning the content after the Trigger is pressed. A ref on the child of an overlay Trigger / Anchor is kept on React 18. A disabled TextField / TextArea stays not editable when `readOnly={false}` is passed. Avatar shows its fallback for an empty or missing `uri`. Progress reports its clamped value to screen readers. A Link without `href` or `onPress` no longer takes the touch from a pressable parent.

More fixes: a Slider keeps its drag inside a ScrollView on Android. DataList label columns and Table auto columns widen when a longer cell arrives. Spinner starts mid-cycle instead of fully opaque. Anchored overlays (Popover, menus, Select, Tooltip, HoverCard) are placed correctly when the root Theme does not start at the window's top-left, stay above the keyboard, keep their stacking order when `onOpenChange` is an inline function, and close with the screen reader's escape gesture (Dialog and AlertDialog too). A Select list taller than the screen opens scrolled to the selected item, and an item whose label changes keeps its place. A Theme with inline `fonts` / `colorOverrides` no longer re-renders everything under it on each render. ScrollArea `scrollbars="both"` content is at least as wide as the viewport.
