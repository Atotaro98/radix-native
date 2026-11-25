---
'radix-native': patch
---

- CheckboxGroup, RadioGroup, CheckboxCards and RadioCards items, VisuallyHidden, Skeleton, Tooltip and the Avatar `fallback`: text written in several pieces (`Option {name}`) or inside a fragment now renders as one text. React Native threw on the loose strings.
- Button, Badge, tab triggers, SegmentedControl items, menu and Select items, Callout.Icon: one of the library's own components placed in the label (a Badge, a Spinner) is no longer handed the label's color string as its `color`. TextField.Slot applies the same rule to every component the library exports, not a partial list.
- ThemeControls: swatches and cards have a focus ring and the minimum touch target, the closed panel is no longer mounted (screen readers cannot reach it), and it opens and closes at once under Reduce Motion.
- Internal: one module reads content written as text and one decides what is tinted; Slider, Switch, SegmentedControl, Kbd, text inputs and Table draw their boxes through the shared surface painter; containers publish their Inset values through one module; the contrast tests cover every Variant recipe.
