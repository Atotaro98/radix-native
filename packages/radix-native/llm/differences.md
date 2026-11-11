# Differences from Radix Themes (web)

This document lists every known difference between `radix-native` and `@radix-ui/themes` (web). Organized by category: API changes, visual differences, and RN platform limitations.

---

## API differences

These are intentional changes to adapt the Radix API to React Native.

| Radix web | radix-native | Reason |
|-----------|-------------|--------|
| CSS variables (`var(--accent-9)`) | `rc('accent', 9)` hook | RN has no CSS cascade |
| `className` prop | `style` prop | RN styling model |
| `asChild` + Slot composition | Not yet supported | RN has no DOM Slot semantics |
| Responsive props (`{ initial: '1', md: '3' }`) | Fixed values only | RN has no media queries |
| `<Avatar.Root>` + `<Avatar.Image>` + `<Avatar.Fallback>` | `<Avatar src={} fallback={} />` | Single-component API for RN |
| `<TextField.Root>` + `<TextField.Slot>` | `<TextField />` | No slot system |
| `extractProps(props, marginPropDefs)` | `useMargins({ m, mx, my, ... })` hook | JS-based prop extraction |
| `extractProps(props, layoutPropDefs, marginPropDefs)` (Box / Flex / Grid) | internal `useLayoutStyle(props)` → `{ style, rest }` | Space tokens only for padding; no `inset` / grid-child props |
| `data-accent-color`, `data-radius` attributes | Props resolved via hooks | No HTML data attributes in RN |
| CSS `:hover` states | No hover (touch-only) | Mobile interaction model |
| CSS `:active` states | `Pressable` `pressed` state | RN touch feedback |
| `box-shadow` for borders | `borderWidth` + `borderColor` | RN shadow model differs |
| No press animation on web | `scale(0.97)` on press via `usePressScale` + `AnimatedPressable` (Reanimated, UI thread) | Native mobile UX enhancement — additive to color changes |
| `<Flex>` defaults to `row` | `<Flex>` defaults to `column` | Mobile-first: vertical stacking is the natural default for mobile UIs |
| No `maxFontSizeMultiplier` | All text components accept `maxFontSizeMultiplier` prop | RN accessibility font scaling can break fixed layouts |
| No global font scaling config | `<Theme maxFontSizeMultiplier={N}>` | Global cap for all text, overridable per-component |
| Button/Badge use `height` | Button/Badge/Kbd use `minHeight` | Allows container to grow with accessibility font scaling |

---

## Visual differences (platform limitations)

These are places where RN cannot replicate the exact Radix web visual, and we use the closest approximation.

### Global

| Feature | Radix web | radix-native | Impact |
|---------|-----------|-------------|--------|
| **CSS filters** | `brightness()`, `saturate()`, `contrast()` on press/hover | Not available — use color step changes | Pressed state slightly differs |
| **Double borders** | `box-shadow: inset 0 0 0 1px A, inset 0 0 0 1px B` | Single `borderWidth: 1` | Outline hc variant has simpler border |
| **Backdrop filter** | `backdrop-filter: blur()` | Not supported | Card/panel backgrounds differ |
| **Mix blend mode** | `mix-blend-mode: multiply/screen` for disabled | Not supported — use alpha colors | Disabled state slightly differs |
| **Linear gradients** | `background-image: linear-gradient(...)` | Not available on Views | Classic variant bevel is approximated with overlay Views |
| **Multi-layer shadows** | Complex `box-shadow` stacks | Platform-specific: iOS `shadow*`, Android `elevation` | Less depth in shadows |
| **Color-mix** | `color-mix(in oklab, ...)` | Not available | Border colors are simpler approximations |
| **Outline** | `outline: 2px solid color; outline-offset: -1px` | Absolutely positioned `FocusRing` view (`focus-8`) | Shown on keyboard / TV / web focus for every pressable; inputs use border color + 1px inner ring. The checked RadioCards item ring is an absolute 2px overlay too, so it never moves the content |
| **Separator thickness** | `height: 1px` (CSS pixel) | `StyleSheet.hairlineWidth` (1 physical pixel) | Separator may appear thinner on retina |

### Per component

| Component | Difference | Detail |
|-----------|-----------|--------|
| **Button** solid pressed | Web: `accent-10` + `brightness(0.92)` filter | RN: just `accent-10` bg change |
| **Button / Badge / Code** outline hc border | Web: double shadow `accent-a7 + gray-a11` | RN: single `gray-a11` border |
| **Button** surface pressed border | Web: border changes from `a7` to `a8` | RN: border stays `a7` |
| **Switch** track | Web: gradient transition between checked/unchecked halves | RN: solid color swap; each state flattens its half of Radix's gradient stack into one color |
| **Switch** thumb | Web: white with a multi-layer drop shadow in every variant; soft adds `saturate(0.45)` | RN: one platform drop shadow (lighter when disabled; gray-2 thumb), no saturate; the track has no shadow |
| **Switch** checked pressed | Web: `brightness()` filter | RN: no filter |
| **Checkbox** indicator | Web: SVG paths (ThickCheckIcon) | RN: View borders rotated -45deg |
| **shadow-1** (classic Checkbox, Radio, Switch, Progress, TextField / TextArea; disabled classic controls) | Web: inset ring + inner top shadow | RN: the ring only, as the border color (`gray-a5`; dark mode `gray-a3` over `gray-a4`), composited with any ring drawn on top |
| **Classic raised effect** | Web: bevel gradient + highlight on checked / solid parts | RN: `ClassicOverlay` where Radix has the bevel. Button stands in for its inset raised look with a drop shadow, dropped while pressed; a disabled or loading Button is flat. Card and card items have Radix's outer shadow as one platform shadow, kept while pressed (Card) and when disabled (items). Checked Checkbox / Radio get no drop shadow (Radix's bevel there is inset only) |
| **Card** surface/classic border | Web: `color-mix()` enhanced shadows | RN: simple `borderColor` with the un-mixed token (`gray-a5`, classic `gray-a3` / dark `gray-a6`) |
| **Card** pressed | Web: `:active` ring color change | RN: same ring change plus the press scale |
| **CheckboxGroup / RadioGroup** disabled label | Web: unchanged text, `cursor: not-allowed` | RN: label turns `gray-a8` — there is no cursor to signal it |
| **CheckboxCards / RadioCards** disabled custom children | Web: `color: gray-a9` inherited by all content | RN: applied to plain-string children only; custom children set their own color |
| **Card** ghost hover | Web: `gray-a3` background on hover | RN: no hover background |
| **TextField/TextArea** focus | Web: 2px outline with offset | RN: 1px border color change + 1px inner ring |
| **Code** inline sizing | Web: `0.95em` relative to parent | RN: 0.95 × parent size when nested in a text component (via `TextContext`); token size when standalone |
| **Skeleton** plain text | Web: inline, inherits every font property of the surrounding text | RN: a View, so its hidden text gets the Text style of a Text in the same spot; inside a Text it takes the surrounding size, not the parent's face or line height |
| **Em/Quote** font | Web: serif font (`Times New Roman`) at 118% | RN: same — system serif (`Times New Roman` on iOS, `serif` on Android) at 1.18 × the surrounding size, −0.025em tracking. Custom faces via `fonts.em` / `fonts.quote` |
| **Custom fonts** | Web: one CSS family per role, the browser picks the weight / italic face | RN: one font file per face — `ThemeFonts` maps each weight (and the heading / code / strong / em / quote roles) to a face. A face's weight and style are baked in, so `fontWeight` / `fontStyle` are not set with it. A weight with no configured face renders with `fonts.regular` and warns in development |
| **Kbd** classic shadow | Web: elaborate multi-layer box-shadow | RN: simple border + platform shadow, with the per-mode colors of `--kbd-box-shadow`: ring `gray-a5` / dark `gray-a7`, bottom edge `gray-a7` / dark `black-a11`, top highlight `gray-a3` / dark `gray-a11`, drop shadow `gray-12` / dark black |
| **Button / IconButton** classic disabled | Web: `--base-button-classic-disabled-box-shadow` (inset rings + inner shadows) | RN: the outer ring only, as the border color (`gray-a4`; dark mode `gray-a5` over `gray-a2`) |
| **TextField / TextArea** text state | Web: the browser repaints typed text when `color` changes | RN: the input always receives `value` (internal state when uncontrolled). iOS repaints only text it gets from React: a multiline input kept typed text in the old color after an appearance switch, and an uncontrolled one snapped back to `defaultValue` |
| **TextField / TextArea** `color-scheme` | Web: `color-scheme: dark` in dark mode themes native widgets | RN: `keyboardAppearance` follows the Theme appearance (consumers can override it) |

---

## Color token differences

These are the EXACT token mappings that intentionally differ between Radix web and our implementation due to RN constraints.

| Context | Radix web token | Our token | Reason |
|---------|----------------|-----------|--------|
| Badge/Avatar solid hc text | `accent-1` | `accent-1` | Matches (was `gray-1` bug, now fixed) |
| Button/IconButton solid hc text | `gray-1` | `gray-1` | Matches (Button differs from Badge/Avatar in Radix) |
| Badge surface border | `accent-a6` | `accent-a6` | Matches (was `a7` bug, now fixed) |
| `color-surface` (Checkbox, Radio, Switch… unchecked; TextField / TextArea; card items) | `rgba(255,255,255,0.85)` / `rgba(0,0,0,0.25)` | `gray-surface` | Close approximation — RN has no page-level surface token. In dark mode Radix darkens below the page (`rgba(0,0,0,0.25)`) while `gray-surface` (`#21212180`) lightens slightly above it |
| `color-panel` (Card) | `--color-panel-solid` / translucent panel | `gray-panel` (white / dark `gray-2`) | The translucent panel over the page background resolves to the same color |
| `accent-indicator` / `accent-track` | `--{color}-indicator` / `--{color}-track`: step 9; light yellow step 10; dark amber / lime / mint / sky / yellow track `color-mix(in oklab, 8, 9 65%)` (amber 75%) | `accent-indicator` / `accent-track` | Matches — same derivations (`tokens/derivedSteps`, mixed in OKLab), so overrides of steps 8 / 9 / 10 carry over |
| Stacked backgrounds (Switch, Progress soft, disabled inputs and card items) | several layered colors / gradients | one composited color | RN has one background per view |

---

## Features not yet implemented

| Feature | Radix web | Status |
|---------|-----------|--------|
| `ghost-offset` variant | Button/IconButton toolbar variant with negative margin | Not implemented |
| Progress shine overlay | Indeterminate gradient sweep effect | Not implemented (requires LinearGradient) |
| Spinner `currentColor` | Inherits CSS text color | Uses `gray-a11`, or the RN-only `color` prop (no CSS cascade in RN) |
| `asChild` / Slot composition | Supported | Planned |
| `TextField.Slot` | Icons / buttons inside the field | Not implemented |
| Haptic feedback | N/A (web) | Planned |
| Responsive props | `{ initial, sm, md, lg, xl }` | Not planned (use `useWindowDimensions`) |
| `Container` component | Centering container | Not implemented |
| `Section` component | Semantic sections | Not implemented |
| Dialog, Popover, Tooltip, etc. | Overlay components | Not implemented |
| Select, Tabs, SegmentedControl | Selection components | Not implemented |
| Slider | Range input | Not implemented |
| Table, DataList | Data display | Not implemented |
| ScrollArea | Custom scroll container | Not implemented |

## Accessibility additions (RN-only)

| Area | Behavior |
|------|----------|
| Touch targets | Checkbox, Radio, Switch, IconButton and small Buttons get a default `hitSlop` that grows the touch area to 44×44pt (override with `hitSlop`). Labelled `CheckboxGroup` / `RadioGroup` rows grow to 44pt vertically, from the taller of the Indicator and one line of the label; with Radix's `space-1` gap the touch areas of neighbouring rows may overlap, as they already do for bare Toggles in a group. |
| Group rows | A labelled `CheckboxGroup` / `RadioGroup` row press-scales as a whole, and its focus ring surrounds the Indicator, not the row (Radix focuses the checkbox / radio button, not its label). |
| Focus | Every pressable shows a 2px `focus-8` focus ring (the component's color; a gray component keeps the theme accent, as in Radix) on keyboard / switch-control / TV / web focus. |
| Groups | `RadioGroup` / `RadioCards` roots expose `accessibilityRole="radiogroup"`; all group roots accept `accessibilityLabel`. Group items with a label are announced as one control named by the label. |
| Consumer props | `onPressIn` / `onPressOut` / `onFocus` / `onBlur` / `accessibilityState` are composed with the internal ones (never override them). |
| IconButton | Logs a dev warning when rendered without `accessibilityLabel`. |
| Link `underline="auto"` | Underlined when nested inside running text (WCAG 1.4.1 — color alone must not be the only cue); standalone links behave as before. |
| Radio | Like a native radio input, pressing a checked `Radio` does not uncheck it. |
| Contrast | Radix scales are tuned with APCA. Text on solid step 9 (`contrast` color, used by `solid` variants) is ~3:1 for some hues (orange, cyan, teal, grass…): fine for large text and UI parts, below WCAG AA for body text. Use `highContrast` where AA is required. Covered by `src/__tests__/contrast.test.ts`. |

## Text nesting

Typography components publish their resolved font size through `TextContext`. When `Text`, `Link`, `Code`, `Kbd`, `Strong`, `Em` or `Quote` are nested inside another text component **without** an explicit `size` (and `Text` without `color` / `weight`), they inherit from the parent instead of resetting to their standalone defaults — matching how Radix behaves on the web. Every text component (including `Em`, `Strong`, `Quote` and `Kbd`) passes its own size on, so `<Em><Code/></Em>` is 0.95 × the Em size; the same role nested in itself (`Code` in `Code`, `Em` in `Em`) keeps the outer size. Nested text never takes layout props (`flexShrink`, margins).
