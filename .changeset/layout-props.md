---
'radix-native': minor
---

Box, Flex and Grid now resolve their shared layout props in one place, and their computed style is memoized. Their props don't change. The `LayoutProps`, `PaddingProps` and `GapProps` types are now exported, so you can build your own layout primitives with the same props.
