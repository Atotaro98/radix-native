---
"radix-native": patch
---

Tab triggers, SegmentedControl items and the Select trigger show their focus ring again: press feedback and focus are now separate. Strong, Em and Quote outside other text render as body text (gray-12), like Radix, instead of the platform's default color. Internally, Variant recipes take exactly the state they decide and return their parts already chosen for it, one module draws every recipe's surface (fill, border, ring, shadow, bevel), every pressable control shares one shell, and the four Selection group families share one Root.
