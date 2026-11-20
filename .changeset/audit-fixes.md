---
'radix-native': patch
---

Fixes from a code audit. `Popover.Anchor` keeps positioning the content after the Trigger is pressed. A ref on the child of an overlay Trigger / Anchor is kept on React 18. A disabled TextField / TextArea stays not editable when `readOnly={false}` is passed. Avatar shows its fallback for an empty or missing `uri`. Progress reports its clamped value to screen readers. A Link without `href` or `onPress` no longer takes the touch from a pressable parent.
