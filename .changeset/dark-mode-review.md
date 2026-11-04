---
"radix-native": patch
---

Dark mode fixes from a component-by-component review against Radix Themes:

- TextArea / TextField: text typed before an appearance switch is repainted with the new theme color (iOS kept typed text in the old color, e.g. dark gray on a dark background), and uncontrolled inputs no longer snap back to `defaultValue` when the theme changes.
- TextArea / TextField: the iOS keyboard follows the Theme appearance (`keyboardAppearance`), like Radix's `color-scheme`; pass `keyboardAppearance` to override it.
- Button / IconButton: the disabled classic variant keeps its ring (`gray-a4`; dark `gray-a5` over `gray-a2`), so it no longer disappears on dark backgrounds.
- Kbd: the classic bevel uses Radix's dark-mode colors (bright top highlight, black bottom edge and drop shadow) instead of a light glow.
