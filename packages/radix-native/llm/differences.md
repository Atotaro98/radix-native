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
| `data-accent-color`, `data-radius` attributes | Props resolved via hooks | No HTML data attributes in RN |
| CSS `:hover` states | No hover (touch-only) | Mobile interaction model |
| CSS `:active` states | `Pressable` `pressed` state | RN touch feedback |
| `box-shadow` for borders | `borderWidth` + `borderColor` | RN shadow model differs |
| No press animation on web | `scale(0.97)` on press via `usePressScale` | Native mobile UX enhancement — additive to color changes |
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
| **Outline** | `outline: 2px solid color; outline-offset: -1px` | `borderColor` change | Focus ring is a border change, not an outline |
| **Separator thickness** | `height: 1px` (CSS pixel) | `StyleSheet.hairlineWidth` (1 physical pixel) | Separator may appear thinner on retina |

### Per component

| Component | Difference | Detail |
|-----------|-----------|--------|
| **Button** solid pressed | Web: `accent-10` + `brightness(0.92)` filter | RN: just `accent-10` bg change |
| **Button** outline hc border | Web: double shadow `accent-a7 + gray-a11` | RN: single `gray-a11` border |
| **Button** surface pressed border | Web: border changes from `a7` to `a8` | RN: border stays `a7` |
| **Switch** track | Web: gradient transition between checked/unchecked | RN: solid color swap |
| **Switch** thumb | Web: elaborate multi-layer shadow | RN: flat clean thumb |
| **Switch** checked pressed | Web: `brightness()` filter | RN: no filter |
| **Checkbox** indicator | Web: SVG paths (ThickCheckIcon) | RN: View borders rotated -45deg |
| **Checkbox** classic border | Web: `gray-a3 + shadow-1` | RN: `gray-a3` border only |
| **Card** surface/classic border | Web: `color-mix()` enhanced shadows | RN: simple `borderColor` |
| **Card** ghost hover | Web: `gray-a3` background on hover | RN: no hover background |
| **TextField/TextArea** focus | Web: 2px outline with offset | RN: border color change |
| **Code** inline sizing | Web: `0.95em` relative to parent | RN: inherits parent font-size directly |
| **Em/Quote** font | Web: serif font (`Times New Roman`) at 118% | RN: italic style only, no serif font or size adjustment |
| **Kbd** classic shadow | Web: elaborate multi-layer box-shadow | RN: simple border + platform shadow |

---

## Color token differences

These are the EXACT token mappings that intentionally differ between Radix web and our implementation due to RN constraints.

| Context | Radix web token | Our token | Reason |
|---------|----------------|-----------|--------|
| Badge/Avatar solid hc text | `accent-1` | `accent-1` | Matches (was `gray-1` bug, now fixed) |
| Button/IconButton solid hc text | `gray-1` | `gray-1` | Matches (Button differs from Badge/Avatar in Radix) |
| Badge surface border | `accent-a6` | `accent-a6` | Matches (was `a7` bug, now fixed) |
| Checkbox unchecked bg | `color-surface` (semantic) | `gray-surface` | Close approximation — RN has no `color-surface` semantic token |
| Checkbox checked bg | `accent-indicator` (semantic) | `accent-9` | `accent-indicator` typically equals `accent-9` |
| TextField/TextArea classic bg | `color-surface` (semantic) | `gray-1` | Close approximation |

---

## Features not yet implemented

| Feature | Radix web | Status |
|---------|-----------|--------|
| `ghost-offset` variant | Button/IconButton toolbar variant with negative margin | Not implemented |
| Progress shine overlay | Indeterminate gradient sweep effect | Not implemented (requires LinearGradient) |
| Spinner `currentColor` | Inherits CSS text color | Uses `gray-a11` (no CSS cascade in RN) |
| `asChild` / Slot composition | Supported | Planned |
| Haptic feedback | N/A (web) | Planned |
| Responsive props | `{ initial, sm, md, lg, xl }` | Not planned (use `useWindowDimensions`) |
| `Container` component | Centering container | Not implemented |
| `Section` component | Semantic sections | Not implemented |
| Dialog, Popover, Tooltip, etc. | Overlay components | Not implemented |
| Select, Tabs, SegmentedControl | Selection components | Not implemented |
| Skeleton | Loading placeholder | Not implemented |
| Slider | Range input | Not implemented |
| Table, DataList | Data display | Not implemented |
| ScrollArea | Custom scroll container | Not implemented |
