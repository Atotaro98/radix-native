---
'radix-native': patch
---

Overlay and control fixes. A `DropdownMenu.RadioItem` / `ContextMenu.RadioItem` inside a sub-menu now keeps its `RadioGroup` (checked state and `onValueChange`): overlay content keeps the state of the radix-native components around it, not only the Theme. Select's item-aligned list honours a per-side `collisionPadding`. Tab triggers, SegmentedControl items, menu items, Select items and labelled CheckboxGroup / RadioGroup rows pass the name their content gives them (AccessibleIcon labels, VisuallyHidden text) as `accessibilityLabel`, so TalkBack reads them as one element. Their labels read adjacent text as one label (`Hello {name}`), and menu and Select item labels stay on one line. A menu, Select or modal Popover that is closing no longer swallows the next tap, and the Tooltip arrow stays on the content's straight edge.
