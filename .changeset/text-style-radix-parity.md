---
"radix-native": minor
---

Unify how all text renders and match Radix Themes typography more closely.

- **Em and Quote now match Radix**: system serif (`Times New Roman` on iOS, `serif` on Android), italic, 1.18× the surrounding size, −0.025em letter spacing. Standalone they render at 1.18 × size 3.
- **Code** gains Radix's −0.007em letter-spacing offset, and keeps `weight` when it falls back to the system monospace.
- **New `ThemeFonts` keys**: `strong`, `em` and `quote` (all optional). `strong` falls back to `bold`, then `regular`; `em` and `quote` fall back to the system serif.
- **Custom fonts**: a weight with no configured face (e.g. `weight="bold"` with only `fonts.regular`) still renders with `fonts.regular`, but now logs a development warning instead of failing silently. A custom face never gets `fontWeight` / `fontStyle` set alongside it.
- **Nested text**: `Strong`, `Em`, `Quote` and `Code` inside another text component no longer apply `flexShrink` or margins, matching `Text` and `Link`. Standalone `Strong` / `Em` / `Quote` default to size 3, like `Text`.
- **Kbd** forwards native view props (`testID`, accessibility props, …).
- `resolveFont` and `FONT_WEIGHT` are deprecated and will be removed in the next minor release.
