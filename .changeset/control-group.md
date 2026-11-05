---
'radix-native': patch
---

`CheckboxGroup` and `CheckboxCards` now announce themselves to screen readers as a group (`role="group"`), as in Radix. `RadioGroup` and `RadioCards` keep `radiogroup`, now set through the same `role` prop. Internally, CheckboxGroup and RadioGroup are built from one shared module; their props don't change.
