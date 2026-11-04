---
"radix-native": minor
---

Theme nesting now follows Radix, and the Theme hands out its color resolver.

- A nested Theme can no longer change the root Theme: its change handlers are no-ops, as in Radix. `ThemeControls` inside a nested Theme logs a dev warning; place it directly under the root.
- `fonts` and `colorOverrides` on a nested Theme merge with the parent's (fonts by key; overrides per scale, mode and step) instead of replacing them.
- A nested Theme paints a background only when it sets `appearance` (`light` / `dark`), as in Radix. Before, every nested Theme painted one; pass `hasBackground` to keep it.
- `useThemeContext()` adds `isRoot` and `resolveColor(token)`.
