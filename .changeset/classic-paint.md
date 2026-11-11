---
'radix-native': patch
---

The classic look now follows Radix in three states:

- A loading classic `Button` is flat, like a disabled one. It no longer keeps its drop shadow.
- A pressed classic `Card` keeps its drop shadow.
- A disabled classic `CheckboxCards` or `RadioCards` item keeps its drop shadow.

`getClassicEffect` is deprecated. Components take their shadows from their Variant recipe. It keeps working and will be removed in the next major version.
