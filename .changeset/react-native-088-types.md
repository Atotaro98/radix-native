---
'radix-native': patch
---

Type-checks against React Native 0.88 (Expo SDK 58): `flexBasis` on Box, Flex and Grid no longer passes a `null` `DimensionValue` through, and the internal text and selection-card types no longer depend on RN's `AccessibilityRole` (now open to any `string`) or on mutable style props. No runtime change.
