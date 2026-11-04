---
"radix-native": minor
---

Match Radix Themes variant colors across components. Every variant color now comes from one Variant recipe per component family, taken from the Radix CSS.

Visible changes:

- **Switch**
  - The thumb is always white; disabled thumbs are gray-2.
  - Surface tracks get a gray-a5 ring.
  - Classic unchecked tracks are gray-a4 with the shadow-1 ring.
  - High-contrast tracks are accent-9 darkened in light mode, not accent-12.
  - Soft tracks follow Radix's layered tints.
- **Progress**
  - Soft is accent-8 under accent-a5 on a lighter track.
  - The classic ring is shadow-1.
- **Checkbox / Radio**
  - Classic unchecked rings follow Radix: Checkbox gray-a3 + shadow-1, Radio gray-7.
  - Disabled rings are per variant: surface gray-a6, classic shadow-1, soft none.
  - The classic drop shadow / gradient appears only when checked. Radio gains the gradient.
- **TextField / TextArea**
  - The classic ring is shadow-1.
  - Disabled fields are tinted gray-a2 and keep their variant's placeholder at half opacity.
  - TextArea soft placeholder opacity is 0.65.
- **Card**
  - Card fills with the panel color (white / dark gray-2). The surface ring is gray-a5; the classic ring is gray-a6 in dark mode.
  - Pressed surface and classic Cards change the ring instead of fading.
- **CheckboxCards / RadioCards**
  - Items fill with the surface color.
  - Disabled items use gray-a9 text and a gray-a2 tint instead of 50% opacity.
  - The Checkbox inside CheckboxCards is always the surface variant.
- **Badge / Code**: outline with `highContrast` uses a gray-a11 border, like Button.
- **Code ghost**: without `color` it inherits the surrounding text color (gray-12 standalone).
- **Button classic**: stays accent-9 while pressed.

New color steps:

- `indicator`, `track` and `panel`, available through `useColor`.
- `colorOverrides` accepts `indicator` and `track`. Both follow overrides of step 9 when not set.

**Migration.** No props changed. Check screens that relied on the old colors, especially:

- Switch thumbs in the soft variant.
- Disabled CheckboxCards / RadioCards, which no longer fade.
- Ghost `Code` without `color`.
