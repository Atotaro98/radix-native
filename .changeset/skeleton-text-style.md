---
'radix-native': patch
---

`Skeleton` with plain-text children now sizes its placeholder with the library's Text style. It uses the Theme's fonts and Font scaling cap and, inside a `Text`, the surrounding text size, instead of React Native's default text. A placeholder now matches the size of the text it stands in for.
