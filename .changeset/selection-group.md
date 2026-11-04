---
"radix-native": patch
---

CheckboxGroup, RadioGroup, CheckboxCards and RadioCards now share one Selection group module (like Radix's CheckboxGroup / RadioGroup primitives), and the two Cards share one card shell.

- A disabled group disables every item: `disabled={false}` on an item no longer re-enables it inside a disabled group (Radix `context.disabled || disabled`).
- CheckboxGroup items are `space-1` apart, like RadioGroup and Radix (were `space-2`).
- Group labels sit `0.5em` from their control, as in Radix (6 / 7 / 8 px instead of 4 / 6 / 8).
