---
'radix-native': patch
---

- DropdownMenu / ContextMenu: a `CheckboxItem` or `RadioItem` inside a component of your own now reserves the indicator gutter for the whole menu, as it does when it is a direct child of `Content`.
- Table: a cell whose `width`, `minWidth` or `maxWidth` changes after the first layout keeps its measured width, so the table no longer stays hidden waiting for a layout event that never comes.
- Kbd: the classic variant's top highlight follows the rounded corners instead of sticking out past them at large sizes.
- Internal: one module decides where an Anchored overlay goes (window, safe area, keyboard, RTL, portal origin, Select's item-aligned position); Table, DataList and SegmentedControl share one registry of measured cells; the Slider's drag is a pure module; Dialog and Anchored overlays share their enter / exit presence.
