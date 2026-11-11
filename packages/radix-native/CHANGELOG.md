# radix-native

## 0.11.0

### Minor Changes

- 4e3080f: Add `VisuallyHidden` and `AccessibleIcon`. Inside a Button, IconButton, pressable Card or card item, an AccessibleIcon contributes only its label to the control's name and keeps the button's icon tint.
- 2c4658c: Add `Callout` (Root, Icon, Text) with Radix's sizes and the soft / surface / outline variants, as a new "callouts" Variant family.
- 920710c: Add `Inset`, which bleeds content to the edge of the surrounding Card like Radix Themes. Card now draws its border as a 1px ring over the content (content starts exactly at the card padding instead of 1px further in), provides the inset values, and a ghost Card pulls itself out by its padding with negative margins as in Radix.
- 02126c9: Add `DataList` (Root, Item, Label, Value) with Radix's sizes, orientations, `trim`, label colors and the shared label column of horizontal lists.
- 70a488e: Add `Dialog` and `AlertDialog` (Root, Trigger, Content, Title, Description, Close / Action / Cancel) with Radix's sizes, panel, overlay, shadow ring, layout, scroll and animations, in a native `Modal`. Adds the overlay infrastructure: an internal portal host on the root Theme and inside every Modal overlay, and a `safeAreaInsets` Theme prop. A Table inside an `Inset` now aligns its outer cells with the container's padding.
- 8169cc8: Add `HoverCard` and `Tooltip`. On touch both open with a long-press (Radix: hover); Tooltip stays while the finger is down, with Radix's gray-12 label, size 1 text and 10 × 5 arrow.
- 0001a5b: Add `Container`, `Section` and `AspectRatio`, matching Radix Themes: Container caps its inner content at 448 / 688 / 880 / 1136px with size props on the inner View, Section adds the size's vertical padding (overridable with padding props), and AspectRatio takes only `ratio`.
- f9bddb0: Add `DropdownMenu` and `ContextMenu` on a shared menu (a new "menus" Variant family): sizes 1 / 2, solid / soft highlight, color, high contrast, items with shortcuts, checkbox and radio items, labels, groups, separators and sub-menus; ContextMenu opens with a 700ms long-press at the touch point. Anchored overlays that fit on neither side now stay on screen.
- 89be7b2: Add `Popover` (Root, Trigger, Anchor, Content, Close) on a new Anchored overlay engine: Radix Popper placement (flip, shift, available height, transform origin), a layer per overlay in the portal host (outside touch and Android back dismiss the top one), and the popper open / close animations.
- 7876ca6: Add `ScrollArea` on native ScrollViews: `scrollbars` picks the axes that scroll (`both` by default, as in Radix), `type="always"` keeps indicators visible on Android; `size` and `radius` are accepted for API parity.
- f579b12: Add `SegmentedControl` (Root, Item) with Radix's sizes, surface / classic variants, radius, disabled state, equal-width items and the sliding indicator, as a new "segmented" Variant family. DataList and SegmentedControl share an internal `useWidest` measurement hook.
- 0cc5957: Add `Select` (Root, Trigger, Content, Item, Group, Label, Separator) with Radix's trigger variants and sizes, solid / soft list with high contrast, and both positions: `item-aligned` (default, the selected item over the trigger) and `popper`.
- 0c2f690: Add `Slider` with Radix's sizes, surface / classic / soft variants (in the tracks Variant family), color, high contrast, radius, ranges, `step`, `minStepsBetweenThumbs`, vertical orientation, `inverted`, `onValueCommit` and adjustable thumbs for screen readers. The slider math is ported from Radix Primitives.
- 034bfb2: Add `Table` (Root, Header, Body, Row, Cell, ColumnHeaderCell, RowHeaderCell) with Radix's sizes, surface / ghost variants, row align, cell justify / width / padding, and `layout="auto"` (columns sized by content, measured) or `"fixed"` (first-row widths). Adds a `mix()` paint for `color-mix(in oklab)`.
- b4b62e1: Add `Tabs` (Root, List, Trigger, Content) and `TabNav` (Root, Link) on one shared tab list matching Radix's `base-tab-list.css`: sizes 1 / 2, wrap, justify, color, high contrast, the instant 2px active bar and width-stable labels.

### Patch Changes

- 4e3080f: CheckboxCards and RadioCards items now match Radix's base card: content is laid out in a centered row with a `space-2` gap, the 1px border is drawn over the content (content starts at the item padding, not 1px further in), and an `Inset` inside an item bleeds to its edge.
- e84bd67: The classic look now follows Radix in three states:

  - A loading classic `Button` is flat, like a disabled one. It no longer keeps its drop shadow.
  - A pressed classic `Card` keeps its drop shadow.
  - A disabled classic `CheckboxCards` or `RadioCards` item keeps its drop shadow.

  `getClassicEffect` is deprecated. Components take their shadows from their Variant recipe. It keeps working and will be removed in the next major version.

- a7f3227: `IconButton` no longer warns about a missing `accessibilityLabel` when its content names it: text, an `AccessibleIcon` or `VisuallyHidden` content, as in Radix.
- 0187299: Skeleton matches Radix more closely: an empty skeleton is `space-3` tall (scaled), the pulse starts at gray-a4 with CSS `ease`, it never takes touches, and a wrapped Button, Badge, Avatar, Card, text input, Checkbox, Radio, Switch or layout primitive with `radius` keeps its own shape instead of radius-1.
- c438d95: `Skeleton` with plain-text children now sizes its placeholder with the library's Text style. It uses the Theme's fonts and Font scaling cap and, inside a `Text`, the surrounding text size, instead of React Native's default text. A placeholder now matches the size of the text it stands in for.
- a89ec0e: `Blockquote` now rounds its border width and left padding to whole pixels, like every other component's spacing. At some sizes and scalings this differs from before by less than 1px. For example, at size 4 the border goes from 4.5px to 5px.
- b2d0322: ThemeControls draws its appearance, radius and scaling options like Radix's ThemePanel (radius-1 cards with a gray-7 ring and a gray-12 outline when selected; radius names below their swatch; scaling in three columns, each value at its own scaling), fixing labels clipped since card items became rows.
- 92aedb6: Labelled `CheckboxGroup` and `RadioGroup` items now behave like every other Toggle. A row press-scales, reaches the 44pt touch target vertically, and draws its focus ring around the checkbox or radio instead of the whole row, as Radix focuses the control rather than its label. `CheckboxCards` and `RadioCards` items keep their look and behaviour.

## 0.10.0

### Minor Changes

- 379576a: Box, Flex and Grid now resolve their shared layout props in one place, and their computed style is memoized. Their props don't change. The `LayoutProps`, `PaddingProps` and `GapProps` types are now exported, so you can build your own layout primitives with the same props.
- 4e3bc74: Checkbox, Radio and Switch now share one internal Toggle module, and their classic look follows Radix:

  - Checked classic Checkbox and Radio keep the bevel but lose the drop shadow (Radix's bevel there is inset only).
  - The Switch thumb gets Radix's soft drop shadow in every variant; the checked classic track no longer casts one.
  - A labelled CheckboxGroup / RadioGroup item and a CheckboxCards item now contain only the visual indicator, not a second hidden interactive control.

  No props change. A `style` passed to Checkbox, Radio or Switch now applies to the pressable wrapper around the indicator, so a `backgroundColor` or `borderColor` override no longer recolors the box or track.

### Patch Changes

- 56133e4: `CheckboxGroup` and `CheckboxCards` now announce themselves to screen readers as a group (`role="group"`), as in Radix. `RadioGroup` and `RadioCards` keep `radiogroup`, now set through the same `role` prop. Internally, CheckboxGroup and RadioGroup are built from one shared module; their props don't change.
- ac5c2c0: Kbd and the CheckboxGroup / RadioGroup item labels now take their colors from Variant recipes, so they are covered by the contrast checks. Nothing looks different.
- 5a7d49e: Text nested in other text now matches Radix in three cases where it was too small:

  - Text inside `Em`, `Strong` or `Quote` is now sized relative to them. For example, `<Em><Code/></Em>` at size 3 is about 18px instead of 15px.
  - A `Code` inside a `Code` keeps the outer size instead of shrinking twice. The same applies to `Em`, `Quote` and `Strong` nested in themselves.
  - `Kbd` with an explicit `size` uses Radix's `font-size × 0.8` instead of `0.75`. For example, size 9 is now 48px instead of 45px.

- fd8a056: A checked RadioCards item no longer moves its content by 1px. The 2px checked ring is now an overlay over the 1px border, like Radix's `::after` outline, instead of a thicker border. The padding passed through an item's `style` now stays as given.
- aae9160: `ThemeControls` is now built from the library's own components:

  - The appearance, radius and scaling sections use `RadioCards`.
  - The toggle and "Copy Theme" controls are now `Button`s.
  - The accent and gray swatches are announced to screen readers as radio groups.

  The panel looks slightly different. Its props don't change.

## 0.9.0

### Minor Changes

- be4eae9: Add `useMetrics` and match Radix radius at every scaling.

  - **New `useMetrics({ radius? })`**: the pixel values a component derives from the Theme, the way Radix derives them. `px(n)` is `calc(Npx * var(--scaling))`, `space(token)` is `var(--space-N)` (negative tokens allowed), and `radius(level, 'box' | 'pill' | 'thumb')` is `var(--radius-N)`, `max(var(--radius-N), var(--radius-full))` or `max(var(--radius-N), var(--radius-thumb))`. `scaling`, `radiusFactor` and `radiusThumb` expose the raw Radix variables for your own `calc()` formulas. Every component now reads its sizes and radius from it.
  - **Radius scales with `scaling`**, as Radix `--radius-N` does, and keeps fractional values (e.g. 2.25px for `radius-1` at `small`). At `90%`–`110%`, every rounded corner changes slightly; at `100%` only `small` radii change, by under half a pixel.
  - **Kbd** radius is `radius-factor × 0.35em`, as in Radix (it was about 3.5× too small) and square for `radius="none"`.
  - **Code** radius is `(0.5px + 0.2em) × radius-factor`, so it grows with the text size.
  - **Skeleton** and **Spinner** leaves follow `radius-1` and the Theme radius instead of fixed values.
  - **Progress** indicator has no radius of its own; the track clips it, as in Radix.
  - **RadioCards** use radius levels 3 / 3 / 4 like Radix (were 2 / 3 / 3).
  - `getRadius`, `getFullRadius`, `getRadiusThumb`, `scalingMap`, `applyScaling`, `resolveSpace` and `useResolveSpace` are deprecated and will be removed in the next major release.

  **Migration.** No props were removed or renamed. Act only if one of these applies:

  | If you…                                                             | Do this                                                                                                                       |
  | ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
  | call `getRadius(token, level)` / `getFullRadius` / `getRadiusThumb` | `useMetrics({ radius: token }).radius(level, 'box' \| 'pill' \| 'thumb')`. `getRadius` ignores scaling; the new value doesn't |
  | call `applyScaling(n, scaling)` or read `scalingMap`                | `useMetrics().px(n)`, or `useMetrics().scaling` for the raw factor                                                            |
  | call `resolveSpace(token, scaling)` or `useResolveSpace()`          | `useMetrics().space(token)`                                                                                                   |
  | snapshot-test component styles                                      | update snapshots: radius values changed as listed above                                                                       |

### Patch Changes

- 6503426: Type-checks against React Native 0.88 (Expo SDK 58): `flexBasis` on Box, Flex and Grid no longer passes a `null` `DimensionValue` through, and the internal text and selection-card types no longer depend on RN's `AccessibilityRole` (now open to any `string`) or on mutable style props. No runtime change.
- 1cae506: Match Radix Themes sizes for Spinner, Card, RadioCards, Avatar and the CheckboxCards / RadioCards grid.

  - **Spinner** is 12 / 16 / 20px for sizes 1 / 2 / 3 (`var(--space-3)`, `var(--space-4)`, `calc(1.25 * var(--space-4))`); it was 16 / 20 / 25px.
  - **Card** size 5 padding is `var(--space-8)` (48px); it was 40px.
  - **RadioCards** items have a smaller vertical padding than horizontal, as in Radix: 10 / 14 / 20px top and bottom, 12 / 16 / 24px left and right (it was the same on all sides).
  - **Avatar** sizes 6–9 stay 80 / 96 / 128 / 160px at every `scaling`, as in Radix; only sizes 1–5 scale.
  - **CheckboxCards / RadioCards** auto-fit grid cells keep a plain 160px minimum width at every `scaling`.

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
