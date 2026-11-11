---
'radix-native': minor
---

Add `Inset`, which bleeds content to the edge of the surrounding Card like Radix Themes. Card now draws its border as a 1px ring over the content (content starts exactly at the card padding instead of 1px further in), provides the inset values, and a ghost Card pulls itself out by its padding with negative margins as in Radix.
