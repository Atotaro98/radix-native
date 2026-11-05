---
'radix-native': patch
---

A checked RadioCards item no longer moves its content by 1px. The 2px checked ring is now an overlay over the 1px border, like Radix's `::after` outline, instead of a thicker border. The padding passed through an item's `style` now stays as given.
