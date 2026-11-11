---
'radix-native': patch
---

`Blockquote` now rounds its border width and left padding to whole pixels, like every other component's spacing. At some sizes and scalings this differs from before by less than 1px. For example, at size 4 the border goes from 4.5px to 5px.
