---
"radix-native": patch
---

Match Radix Themes sizes for Spinner, Card, RadioCards, Avatar and the CheckboxCards / RadioCards grid.

- **Spinner** is 12 / 16 / 20px for sizes 1 / 2 / 3 (`var(--space-3)`, `var(--space-4)`, `calc(1.25 * var(--space-4))`); it was 16 / 20 / 25px.
- **Card** size 5 padding is `var(--space-8)` (48px); it was 40px.
- **RadioCards** items have a smaller vertical padding than horizontal, as in Radix: 10 / 14 / 20px top and bottom, 12 / 16 / 24px left and right (it was the same on all sides).
- **Avatar** sizes 6–9 stay 80 / 96 / 128 / 160px at every `scaling`, as in Radix; only sizes 1–5 scale.
- **CheckboxCards / RadioCards** auto-fit grid cells keep a plain 160px minimum width at every `scaling`.
