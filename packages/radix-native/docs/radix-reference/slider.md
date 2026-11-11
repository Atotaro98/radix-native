# Slider — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/slider.{tsx,props.tsx,css}`, `THEMES/styles/tokens/radius.css`, `PRIM/slider/src/slider.tsx`.
Docs: radix-ui.com/themes/docs/components/slider.

## 1. Parts

Single component `Slider` (no compound API). Internally:

| Element | Primitive | Class |
|---|---|---|
| root `span` | `Slider.Root` (→ `SliderHorizontal`/`SliderVertical` → `SliderImpl`) | `rt-SliderRoot` |
| track | `Slider.Track` | `rt-SliderTrack` |
| range (inside track) | `Slider.Range` | `rt-SliderRange` (+ `rt-high-contrast`, `data-inverted`) |
| one thumb per value | `Slider.Thumb` (wrapper span absolutely positioned + `span[role=slider]` + hidden `<input>` for forms) | `rt-SliderThumb` |

Thumbs are rendered by Themes as `(value ?? defaultValue ?? []).map(...)` — **with neither `value` nor `defaultValue`, Themes renders zero thumbs** (the primitive would default to `[min]`). Thumb count is fixed by the props, not by internal state.

## 2. Props

Themes (`sliderPropDefs`) + margin props:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'2'` | yes |
| `variant` | `'classic' \| 'surface' \| 'soft'` | `'surface'` | no |
| `color` | accent color | theme accent | no (`data-accent-color`) |
| `highContrast` | `boolean` | — | no (class on Root **and** Range) |
| `radius` | `'none'…'full'` | theme | no |
| `tabIndex` | number | — | forwarded to every Thumb |

Primitive (`PRIM/slider/src/slider.tsx`):

| Prop | Type | Default |
|---|---|---|
| `value` / `defaultValue` | `number[]` | — / `[min]` |
| `onValueChange` | `(v: number[]) => void` | noop |
| `onValueCommit` | `(v: number[]) => void` | noop |
| `min` / `max` / `step` | number | `0` / `100` / `1` |
| `minStepsBetweenThumbs` | number | `0` |
| `preserveThumbOrder` | boolean | `false` (newer primitive versions only) |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `dir` | `'ltr' \| 'rtl'` | inherited |
| `inverted` | boolean | `false` |
| `disabled` | boolean | `false` |
| `name`, `form` | string | form integration (n/a in RN) |

## 3. Visual values

CSS vars: `--slider-track-size`: size1 `calc(--space-2 * 0.75)` (6px), size2 `--space-2` (8px), size3 `calc(--space-2 * 1.25)` (10px) — all × scaling via space. `--slider-thumb-size: track + --space-1` (10/12/14).

Root: flex, `align-items:center`, `flex-grow:1`; horizontal `width: stretch; height: track`; vertical `height: stretch; width: track; flex-direction: column`. `border-radius: max(radius-factor × track/3, radius-factor × --radius-thumb)` (`--radius-thumb` = 0.5px for none/small, 9999px for medium/large/full → effectively pill unless radius none/small; radius none → 0).
Track: `overflow:hidden; flex-grow:1; border-radius: inherit`; thickness = track size.
Range: absolute, `border-radius: inherit`, full thickness; `start: offsetStart%`, `end: offsetEnd%` where for 1 value start=0, for ≥2 start=min(percentages); end=100−max(percentages). Edges flip with `inverted`/rtl/vertical (`startEdge` = left/right/bottom/top).
Thumb: box `--slider-thumb-size` square (this is the layout/hit box); `::before` = invisible 3× thumb size hit area; `::after` = visible disc, `inset: -0.25 × track` (visible size = thumb + track/2 = 13/16/19px), `background: white`, `border-radius: max(--radius-1, --radius-thumb)`, `box-shadow: --slider-thumb-box-shadow`. Focus-visible: shadow + `0 0 0 3px --accent-3, 0 0 0 5px --focus-8`.

Variants:

| | Track | Range | Thumb shadow |
|---|---|---|---|
| surface | bg `--gray-a3`, `inset 0 0 0 1px --gray-a5` (disabled: `--gray-a4`) | bg `--accent-track`, `inset 0 0 0 1px --gray-a5` | `0 0 0 1px --black-a4` |
| classic | bg `--gray-a3`; `::before` overlay `--shadow-1` (disabled opacity .5) | bg `--accent-track`; `inset 0 0 0 1px --gray-a3, inset 0 0 0 1px --accent-a4, inset 0 0 0 1px --black-a1, inset 0 1.5px 2px 0 --black-a2` (hc: `--gray-a3`, `--black-a2`, `0 1.5px 2px --black-a2`) | `0 0 0 1px --black-a3, 0 1px 3px --black-a1, 0 2px 4px -1px --black-a1` |
| soft | bg `--gray-a4` + `--white-a1` overlay (disabled: no overlay) | bg `--accent-6` + `--accent-a5` overlay | `0 0 0 1px --black-a3, 0 0 0 1px --gray-a2, 0 0 0 1px --accent-a2, 0 1px 2px --gray-a4, 0 1px 3px -0.5px --gray-a3` |

High contrast: range gets extra layer `linear-gradient(--black-a8)` in **light only** (`--slider-range-high-contrast-background-image`, none in dark) — i.e. darkens accent-track with black-a8; no change in dark.

Disabled (`[data-disabled]`): Root `mix-blend-mode: multiply` (light) / `screen` (dark); Range transparent, no image, no shadow (invisible); Thumb `::after` bg `--gray-1`, shadow `0 0 0 1px --gray-6` (soft: `--gray-5`).

No animations/transitions anywhere (thumb follows pointer instantly). No pressed style (only cursor change).

## 4. Behaviour (primitive)

- State: `useControllableState` over `number[]`. `onValueChange` fires each change (drag move, key, track press). Value is always **sorted** (`getNextSortedValues`).
- Snapping: `snap = round(round((v - min)/step) * step + min, decimals(step))`, then `clamp(min,max)`. Decimal count of `step` avoids float drift.
- `minStepsBetweenThumbs`: distance = `minSteps × step`; if any adjacent gap < distance the update is **rejected** (value unchanged; thumb stops), not clamped.
- Collision: default thumbs may cross — the moved value is re-sorted and `valueIndexToChange` becomes the new index of that value (thumbs swap identity). With `preserveThumbOrder`, value is clamped to neighbours ± min distance.
- Pointer down on track (not on a thumb): picks **closest** thumb (`getClosestValueIndex`, ties → first) and jumps it there (`onSlideStart`). Pointer down on a thumb only focuses it; movement uses pointer capture. Value from pointer = linear scale over the root rect (`[0,width] → [min,max]`, reversed when sliding from right; vertical: `[0,height] → [max,min]` unless inverted). Rect cached for the drag.
- `onValueCommit`: pointer — on pointer up, only if `String(values) !== String(valuesAtPointerDown)`; keyboard — immediately on each key (Home/End/arrows/Page) if changed.
- Keyboard: arrows ±step, Shift+arrow or PageUp/Down ±10 steps, Home → min (thumb 0), End → max (last thumb). Non-aligned value steps to the next aligned step (`getNextStepValue`). Back keys depend on slide direction (`BACK_KEYS`).
- `inverted`: horizontal ltr+inverted slides from right; vertical default slides from **bottom**, inverted from top. rtl flips horizontal.
- Thumb in-bounds offset: thumb box centre is shifted so it stays inside the track: `offset = (half − percent/50·half·dir)·dir` → thumb centre goes from `thumbSize/2` to `width − thumbSize/2` while the Range edge goes 0…100% — so range end and thumb centre coincide only at 50%.
- a11y: each thumb `role="slider"`, `aria-valuemin/max/now`, `aria-orientation`, `tabIndex 0` (none when disabled); `aria-label` default: 2 thumbs → "Minimum"/"Maximum", >2 → "Value i of n", 1 → none. Root `aria-disabled`, `data-disabled`. Changing value focuses the changed thumb.

## 5. RN notes

- Single component, props 1:1 (drop `name`, `form`, `dir` → use I18nManager). Track sizes from Metrics (space-2 × .75/1/1.25), thumb = track + space-1, visible disc = thumb + track/2.
- Each thumb: `accessible`, `accessibilityRole="adjustable"`, `accessibilityValue {min,max,now}`, `accessibilityActions increment/decrement` → ±step with immediate commit (matches keyboard path). Labels "Minimum"/"Maximum" as Radix.
- Drag: Responder system on the root (`onStartShouldSetResponder`, `onResponderGrant` = slide start w/ closest thumb, `onResponderMove`, `onResponderRelease/Terminate` = commit if changed); `onResponderTerminationRequest → false` to keep the drag inside ScrollViews. Positions via reanimated shared values; snapping logic in a pure util ported verbatim (snap, sort, minSteps reject, closest index, getNextStepValue, in-bounds offset). Track width from `onLayout` is unavoidable here (pointer → value needs a rect; Radix uses getBoundingClientRect).
- Shadows: thumb/classic insets → `utils/shadow`; inset shadows not possible → 1px borders (as elsewhere, record in differences.md). Disabled `mix-blend-mode` impossible → document; approximate with flattened colors.
- High-contrast light range: flatten `black-a8` over `accent-track` with colorMath.
- Variant family: **tracks** (Switch, Progress) — Slider's surface/classic/soft is the same trio and Progress uses `--accent-track` too. Add Slider to that family's recipe (track, range, thumb shadow, disabled).
