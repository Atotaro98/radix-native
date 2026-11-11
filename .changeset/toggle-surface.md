---
'radix-native': patch
---

Labelled `CheckboxGroup` and `RadioGroup` items now behave like every other Toggle. A row press-scales, reaches the 44pt touch target vertically, and draws its focus ring around the checkbox or radio instead of the whole row, as Radix focuses the control rather than its label. `CheckboxCards` and `RadioCards` items keep their look and behaviour.
