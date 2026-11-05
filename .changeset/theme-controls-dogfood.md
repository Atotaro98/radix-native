---
'radix-native': patch
---

`ThemeControls` is now built from the library's own components:

- The appearance, radius and scaling sections use `RadioCards`.
- The toggle and "Copy Theme" controls are now `Button`s.
- The accent and gray swatches are announced to screen readers as radio groups.

The panel looks slightly different. Its props don't change.
