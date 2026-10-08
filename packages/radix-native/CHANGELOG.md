# radix-native

## 0.7.0

### Minor Changes

- 70d6952: Quality, accessibility and tooling overhaul.

  **Fixes**
  - Spinner / Skeleton no longer crash when toggling `loading` (hooks were called after an early return).
  - Consumer `onPressIn` / `onPressOut` / `onFocus` / `onBlur` / `accessibilityState` are now composed with the internal ones instead of silently replacing them (press animation, pressed colors and a11y state kept working).
  - `<Button>Hello {name}</Button>` renders a single label (adjacent text is merged; no gap between fragments).
  - Button / IconButton only inject `color` into icon children that don't set one.
  - Button / IconButton loading uses the library `Spinner` (numeric `ActivityIndicator` sizes are ignored on iOS).
  - CheckboxCards / RadioCards: `variant="classic"` and `columns` now work; plain string children are wrapped in `Text` (they crashed on device); no layout shift when a RadioCards item gets checked.
  - Grid lays out rows without `onLayout` measurement (no first-frame jump).
  - Switch thumb no longer jumps 1px between states.
  - Progress never produces `NaN` widths (`max <= 0`).
  - TextField / TextArea: disabled state is exposed on the input; soft placeholder alpha works for any hex format.
  - Code uses the system monospace font when `fonts.code` is not set.
  - `__DEV__` is no longer referenced unguarded in the published build.
  - Skeleton dimension props are typed as `DimensionValue`.

  **Behavior changes**
  - Nested `Text`, `Link`, `Code` and `Kbd` inherit size (and `Text` color / weight) from the surrounding text when those props are omitted, like Radix on the web.
  - `Link` with `underline="auto"` is underlined when nested in running text.
  - Pressing a checked standalone `Radio` no longer unchecks it (native radio semantics).

  **Accessibility**
  - Default `hitSlop` up to a 44×44pt touch target for Checkbox, Radio, Switch, IconButton and small Buttons.
  - Visible 2px focus ring for keyboard / TV / web focus on all pressables.
  - `RadioGroup` / `RadioCards` expose `accessibilityRole="radiogroup"`; group roots accept `accessibilityLabel` and `testID`.
  - IconButton warns in development when it has no `accessibilityLabel`; Spinner has a default `"Loading"` label; indeterminate Progress reports `busy`.

  **New**
  - Margin props accept `'auto'` (new `MarginValue` type).
  - `Spinner` accepts an RN-only `color` prop.
  - `onFocus` / `onBlur` on pressable components.
