# radix-native

## 0.8.0

### Minor Changes

- 6cb2743: Unify how all text renders and match Radix Themes typography more closely.

  - **Em and Quote now match Radix**: system serif (`Times New Roman` on iOS, `serif` on Android), italic, 1.18× the surrounding size, −0.025em letter spacing. Standalone they render at 1.18 × size 3.
  - **Code** gains Radix's −0.007em letter-spacing offset, and keeps `weight` when it falls back to the system monospace.
  - **New `ThemeFonts` keys**: `strong`, `em` and `quote` (all optional). `strong` falls back to `bold`, then `regular`; `em` and `quote` fall back to the system serif.
  - **Custom fonts**: a weight with no configured face (e.g. `weight="bold"` with only `fonts.regular`) still renders with `fonts.regular`, but now logs a development warning instead of failing silently. A custom face never gets `fontWeight` / `fontStyle` set alongside it.
  - **Nested text**: `Strong`, `Em`, `Quote` and `Code` inside another text component no longer apply `flexShrink` or margins, matching `Text` and `Link`. Standalone `Strong` / `Em` / `Quote` default to size 3, like `Text`.
  - **Kbd** forwards native view props (`testID`, accessibility props, …).
  - `resolveFont` and `FONT_WEIGHT` are deprecated and will be removed in the next minor release.

  **Migration.** No props were removed or renamed, so existing code keeps compiling. Act only if one of these applies:

  | If you…                                                                  | Do this                                                                                                   |
  | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
  | prefer the previous sans-serif `Em` / `Quote`                            | set your own italic face in `fonts.em` / `fonts.quote`, or override `fontFamily` / `fontSize` via `style` |
  | use `Strong` / `Em` / `Quote` standalone and relied on RN's 14px default | wrap them in `<Text size={2}>`                                                                            |
  | pass a partial `fonts` map (e.g. only `regular`) and see dev warnings    | add the missing weight faces (`medium`, `bold`, …) — rendering is unchanged                               |
  | import `resolveFont` / `FONT_WEIGHT`                                     | render text with `<Text weight=…>` instead; both exports go away in the next minor                        |

- b9ba193: Theme nesting now follows Radix, and the Theme hands out its color resolver.

  - A nested Theme can no longer change the root Theme: its change handlers are no-ops, as in Radix. `ThemeControls` inside a nested Theme logs a dev warning; place it directly under the root.
  - `fonts` and `colorOverrides` on a nested Theme merge with the parent's (fonts by key; overrides per scale, mode and step) instead of replacing them.
  - A nested Theme paints a background only when it sets `appearance` (`light` / `dark`), as in Radix. Before, every nested Theme painted one; pass `hasBackground` to keep it.
  - `useThemeContext()` adds `isRoot` and `resolveColor(token)`.

- 5aad3bf: Match Radix Themes variant colors across components. Every variant color now comes from one Variant recipe per component family, taken from the Radix CSS.

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

### Patch Changes

- 1797d09: Button and IconButton now share one `BaseButton` body, as in Radix, and Button, IconButton and Badge render their children through one Control label.

  - Badge: text next to an icon no longer throws ("Text strings must be rendered within a <Text> component"); icons without `color` take the badge text color; the label stays on one line (Radix `white-space: nowrap`).
  - IconButton: accepts text children (e.g. a count) and keeps the button's size while loading.
  - Loading buttons keep their label readable by screen readers ("Save, button, busy") instead of announcing only "busy".
  - The press scale always springs back, including when the button becomes disabled or loading mid-press.

- 8bd21a7: TextField and TextArea now share one `BaseTextInput` body; they differ only in line count, height and radius.

  - Disabling a focused field drops its focus ring (it used to stay visible).
  - `readOnly` and `editable={false}` look like Radix's `:read-only`: the disabled colors and a gray-8 focus ring, without reporting the field as disabled to screen readers.
  - TextField no longer accepts `multiline` (a Radix TextField is one line); use TextArea.

- 6c5e88b: Dark mode fixes from a component-by-component review against Radix Themes:

  - TextArea / TextField: text typed before an appearance switch is repainted with the new theme color (iOS kept typed text in the old color, e.g. dark gray on a dark background), and uncontrolled inputs no longer snap back to `defaultValue` when the theme changes.
  - TextArea / TextField: the iOS keyboard follows the Theme appearance (`keyboardAppearance`), like Radix's `color-scheme`; pass `keyboardAppearance` to override it.
  - Button / IconButton: the disabled classic variant keeps its ring (`gray-a4`; dark `gray-a5` over `gray-a2`), so it no longer disappears on dark backgrounds.
  - Kbd: the classic bevel uses Radix's dark-mode colors (bright top highlight, black bottom edge and drop shadow) instead of a light glow.

- 04cf2b3: Focus rings match Radix `--focus-8`: a component with `color="gray"` now keeps the theme accent for its focus ring instead of showing gray-8 (Button, IconButton, Checkbox, Radio, Switch, Card, CheckboxCards, RadioCards, CheckboxGroup, RadioGroup, surface / classic TextField and TextArea). Soft TextField and TextArea keep a gray-8 ring when gray, as in Radix.
- 0f66cec: CheckboxGroup, RadioGroup, CheckboxCards and RadioCards now share one Selection group module (like Radix's CheckboxGroup / RadioGroup primitives), and the two Cards share one card shell.

  - A disabled group disables every item: `disabled={false}` on an item no longer re-enables it inside a disabled group (Radix `context.disabled || disabled`).
  - CheckboxGroup items are `space-1` apart, like RadioGroup and Radix (were `space-2`).
  - Group labels sit `0.5em` from their control, as in Radix (6 / 7 / 8 px instead of 4 / 6 / 8).

- d68f8a6: `accent-track` and `accent-indicator` now follow Radix Themes for amber, lime, mint, sky and yellow: in dark mode the checked Switch track and the surface / classic Progress indicator mix steps 8 and 9 in OKLab (65%, amber 75%) instead of using the paler step 9, and in light mode yellow uses step 10 for both. Overrides of steps 8, 9 and 10 carry over.

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
