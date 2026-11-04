---
"radix-native": patch
---

Button and IconButton now share one `BaseButton` body, as in Radix, and Button, IconButton and Badge render their children through one Control label.

- Badge: text next to an icon no longer throws ("Text strings must be rendered within a <Text> component"); icons without `color` take the badge text color; the label stays on one line (Radix `white-space: nowrap`).
- IconButton: accepts text children (e.g. a count) and keeps the button's size while loading.
- Loading buttons keep their label readable by screen readers ("Save, button, busy") instead of announcing only "busy".
- The press scale always springs back, including when the button becomes disabled or loading mid-press.
