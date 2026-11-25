# radix-native

React Native UI library that replicates the Radix Themes (web) API.
Same prop names, same variants, same tokens. Web devs use it instantly.

Domain vocabulary (Text style, Text role, Variant recipe, Variant family, Radix parity…) lives in `GLOSSARY.md`.

## Architecture

```
packages/radix-native/src/
  theme/          ThemeRoot (stateful) + ThemeImpl (inheritable) + Theme (public)
  hooks/          useThemeContext, useColor, useResolveColor (internal), useMetrics, useMargins, useLayoutStyle (internal), useResolveSpace (deprecated),
                  useControllableState (internal), useInteraction (internal, under internal/control), useTextStyle (internal),
                  useVariantColors (internal), usePressScale
  tokens/         colors/ (31 scales), spacing, typography, radius, scaling
  types/          nativeProps, marginProps, layoutProps (LayoutProps, PaddingProps, GapProps)
  utils/          resolveColor, variantPalette, colorMath, metrics, shadow, classicEffect (deprecated), textStyle,
                  hitSlop, alpha, env, fonts, popper, anchoredPlacement, slider, tableLayout, rtl
  components/
    internal/     control (useControl), surface (paintSurface), contentText (renderContentText, plainText), tint, useAnchoredPlacement, presence (usePresence, useEnterExit), collection (useCollection), BaseButton, ToggleSurface, BaseToggle, BaseTextInput, ControlLabel, selectionGroup, controlGroup, SelectionCard, CardRing, BaseTabList, BaseDialog, Portal, portalContext, overlayRoot, AnchoredContent, PopperContent, ListRows, BaseMenu, inlineText, ClassicOverlay, FocusRing, ColumnRows, accessibleControl (not exported)
    layout/       Box, Flex, Grid, Container, Section, AspectRatio, ScrollArea, Separator, Card, Inset, InsetContext (Radix --inset-* values; containers publish them through InsetContainer)
    typography/   Text, Heading, Link, Blockquote, Code, Em, Strong, Quote, Kbd, TextContext, InlineText (factory, not exported)
    display/      Avatar, Badge, Callout, DataList, Table (column sizing in utils/tableLayout)
    actions/      Button, IconButton, Checkbox, CheckboxGroup, CheckboxCards,
                  Switch, Radio, RadioGroup, RadioCards, SegmentedControl
    feedback/     Spinner, Progress, Skeleton
    navigation/   Tabs, TabNav (both on internal/BaseTabList)
    overlays/     Dialog, AlertDialog (internal/BaseDialog), Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu (roots on internal/overlayRoot; menus on internal/BaseMenu; panels via internal/PopperContent on internal/AnchoredContent; placement in utils/anchoredPlacement over utils/popper; menu and Select rows via internal/ListRows)
    utilities/    VisuallyHidden, AccessibleIcon
    forms/        TextField, TextArea, Slider (drag and geometry in utils/slider), Select (item-aligned is a strategy of utils/anchoredPlacement)
    playground/   ThemeControls
  __tests__/      Jest + @testing-library/react-native
```

## Dependencies

Peer deps: `react`, `react-native`, `react-native-reanimated` (>=3.0.0).
All animations use `react-native-reanimated` (shared values, UI-thread animations).
All icons/indicators drawn with `View` borders (no SVG deps).

## Key patterns

### Color resolution — `useColor(color, step)`

**Public API** (`useColor`): resolves a single color token per call. Used by consumers.

```tsx
import { useColor } from 'radix-native'

// Two-param form (preferred):
const bg = useColor('accent', 9)           // theme accent at step 9
const alpha = useColor('accent', 'a3')     // alpha step
const surface = useColor('gray', 'surface') // special step
const text = useColor('accent', 'contrast') // contrast text

// Single-param form:
const gray1 = useColor('gray-1')
```

**Internal** (`useResolveColor`): returns a resolver function for components that resolve many colors in one `useMemo`. Not exported publicly.

Steps: solid `1-12` (numbers), alpha `'a1'-'a12'` (strings), special `'contrast' | 'surface' | 'indicator' | 'track' | 'panel'`
(`indicator` / `track` resolve through their base steps in `tokens/derivedSteps` — step 9, light yellow step 10,
dark amber/lime/mint/sky/yellow track = OKLab mix of 8 and 9 — so overrides of the base steps carry over; `panel` = white / dark step 2).

### Margins — `useMargins`

All components accept `m, mx, my, mt, mr, mb, ml` props (margin tokens).
Internally resolved via `useMargins({ m, mx, my, mt, mr, mb, ml })` which returns a memoized `ViewStyle`.

```tsx
// In component interface:
export interface MyProps extends NativeViewProps, MarginProps { ... }

// In component body:
const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
// Then spread into style: { ...otherStyles, ...margins }
```

### Layout props — `useLayoutStyle`

Box, Flex and Grid share **Layout props** (`LayoutProps` = margins + padding + size + position + flex child +
`bg` + `radius`). `useLayoutStyle(props)` splits them from the rest and returns `{ style, rest }`, memoized;
the pure `resolveLayoutStyle(props, metrics, rc)` in `utils/layoutStyle` does the mapping (side > axis > all,
`radius` = `radius(4, 'pill')`). `gap` / `gapX` / `gapY` (`GapProps`) stay in Flex and Grid. A new layout
primitive extends `LayoutProps` and calls the hook — never re-declares or re-maps these props.

### Metrics — `useMetrics`

Every pixel value derived from the Theme (sizes, padding, gaps, radius) comes from **Metrics**
(`useMetrics`, `hooks/useMetrics.ts`), a thin adapter over the pure `resolveMetrics` (`utils/metrics.ts`).
Never write `Math.round(x * scalingMap[scaling])` or combine radius tokens by hand.

```tsx
const metrics = useMetrics({ radius: radiusProp })    // radius prop overrides the Theme's
const height = metrics.px(SIZE_HEIGHT[size])          // calc(32px * var(--scaling)), rounded
const gap = metrics.space(2)                          // var(--space-2), rounded; negatives allowed
metrics.radius(level)                                 // var(--radius-N) — Card, TextArea, Checkbox…
metrics.radius(level, 'pill')                         // max(var(--radius-N), var(--radius-full)) — Button, Badge, Avatar, TextField
metrics.radius(level, 'thumb')                        // max(var(--radius-N), var(--radius-thumb)) — Switch
```

- `radius` = `Npx × scaling × radius-factor`, **not rounded** (Radix keeps the fractional value).
- One-off Radix `calc()` formulas stay in the component, written with the raw variables
  `metrics.scaling`, `metrics.radiusFactor`, `metrics.radiusThumb`, citing the selector
  (Progress `max(factor × h/3, factor × thumb)`). Lengths and radius in `em` come from the Text style, not Metrics.
- Size tables (`SIZE_HEIGHT`, …) stay in each component, in unscaled px; pass them through `px`.
- Fonts are scaled by the Text style, not Metrics.
- `getRadius`, `getFullRadius`, `getRadiusThumb`, `scalingMap`, `applyScaling`, `resolveSpace`,
  `useResolveSpace` are deprecated public exports; don't use them inside the library.
- Test new rules in `__tests__/metrics.test.ts` (pure tables against Radix CSS); component radius in `__tests__/radius.test.tsx`.

### Variant colors — `useVariantColors`

Every color that depends on a variant or state comes from a **Variant recipe** in
`utils/variantPalette.ts`, read through `useVariantColors` (`hooks/useVariantColors.ts`).
Never write `switch (variant)` or `appearance === 'dark'` color code in a component. Calling `rc` directly
is only for a fixed step with no variant, state or mode to decide (Spinner `gray-a11`, Skeleton, Separator).

```tsx
const colors = useVariantColors('checkbox', { variant, color, highContrast, checked, disabled })
// → { bg, border?, indicator?, bevel? } — strings ready for styles
```

- **Each recipe takes exactly the state it decides** (`Disabled`, `Checked`, `Pressed`, `Focused`, or its own
  flags like `open`, `highlighted`, `active`) — passing a flag a recipe ignores is a type error — and returns its
  parts **for that state, already chosen**: `button` with `pressed` returns the pressed `bg` and `opacity`, `card`
  with `pressed` its `:active` ring or ghost fill, `radioCard` with `checked` its 2px `ring` (`ringWidth: 2`).
  Components never branch on state to pick a paint and never read a recipe's shape (`'x' in colors`).
- **Surface parts** share names across recipes and are drawn by `paintSurface` (`internal/surface`), never by
  hand: `bg` (fill), `border` (1px layout border), `ring` + `ringWidth?` (a `CardRing` over the content — Radix
  inset box-shadow rings: cards, card items, Callout, Select trigger, Switch track, panels), `shadow`,
  `bevel`, `opacity`.

- Recipes return **paints** — `c(step)` (the `color` prop, accent by default), `g(step)` (gray),
  `f(step)` (Radix `--focus-*`: like `c`, but a gray component keeps the theme accent),
  `layers(top, …, bottom)` (flattened into one color), `fade(paint, opacity)`, `byMode(light, dark)`, `mix(a, b, weightB?)` (`color-mix(in oklab)`),
  `blackA(n)` / `whiteA(n)` — so they test against Radix CSS without a theme.
- Recipes are grouped by **Variant family** (buttons, chips, selection controls, tracks, cards,
  text inputs, callouts, segmented, menus, text). Radix is not uniform across families; keep its values even where they
  look inconsistent (e.g. solid high-contrast text `gray-1` in Button, `accent-1` in Badge), and cite
  the Radix selector in a comment.
- `SHADOW_1_RING` is Radix `--shadow-1` as a border color (classic variants, sunken parts).
- A component that draws more than one box gets a recipe that names each as a surface of its own, with the same
  parts: a Slider's `track`, `range` and `thumb`, a Switch's `thumb`, a SegmentedControl's `indicator`. Each goes
  through `paintSurface(colors.thumb, radius)`; never flatten them into prefixed keys (`thumbRing`, `thumbShadow`).
- Add a row to `__tests__/variantPalette.test.ts` for every rule. `contrast.test.ts` walks the real recipes: its
  `TEXT_ON_FILL` map is total over the registry, so a new recipe does not compile until it declares which part is
  text on which fill (or `null`).
- Focus rings come from the `focusRing` recipe (`useVariantColors('focusRing', { color }).ring`);
  text inputs draw theirs as `border` from their own recipe.
- Drop shadows and the classic bevel are recipe parts too: `shadow` (a `ShadowPaint`: color
  paint, opacity, offsetY, radius, Android elevation) and `bevel: true`. The recipe decides when they apply
  (Button classic loses its lift while pressed and both when disabled or loading; Card keeps its shadow while
  pressed; card items keep it when disabled; Checkbox / Radio bevel only when checked). `paintSurface` draws
  them (through `shadowStyle`, the only `Platform.select` for shadows, and `ClassicOverlay`), also for a Switch
  thumb, a Slider thumb, a SegmentedControl indicator and Kbd; components never call `shadowStyle` themselves.
  `getClassicEffect` is a deprecated public export; don't use it.

### Shared building blocks — use these instead of re-implementing

| Need | Use |
|------|-----|
| Controlled / uncontrolled value | `useControllableState({ prop, defaultProp, onChange })` — setter accepts updater functions (no stale closures) |
| Any pressable control (pressed / focus state, press scale, a11y name from content, touch target, disabled gate, focus ring, prop order) | `const control = useControl({ props: rest, children, role, onPress, disabled, state?, touchTarget?, focusRing: { color?, borderRadius, offset? }, forceName? })` (`internal/control`) → `<Pressable {...control.pressableProps} style={[control.scaleStyle?, …]}>{control.wrap(content)}{control.focusRing}</Pressable>`; read `control.pressed` for the recipe. Focus is reported whether or not the control uses the press scale. BaseButton, Card, Toggle surface, tab triggers, SegmentedControl items, Select trigger and menu / Select rows are built on it. Text inputs use `useInteraction` for focus only |
| Content that may be written as text (`children`, a `label`, a `fallback`) | `renderContentText(children, (value) => <RNText …>{value}</RNText>, node?)` (`internal/contentText`): strings and numbers, in any number of pieces (`Option {name}`) and inside fragments, become one Text per run; everything else passes through (`node` to add to elements, e.g. `tint`). `plainText(children)` is the text when the content is text alone. Never test `typeof children === 'string'` — it is false for `Option {name}` and React Native throws on the loose strings. Control label, group and card item labels, the Select trigger, Tooltip, VisuallyHidden, Skeleton and the Avatar fallback are built on it; `renderInlineText` additionally merges text components into the run |
| Give content the surrounding text color (RN has no `currentColor`) | `tint(element, color)` / `tintChildren(children, color)` (`internal/tint`): only an element that sets no `color` and is not one of the library's own components (their `color` names a Theme color) gets it — Control label, Callout.Icon, TextField.Slot. A new exported component must be added to `LIBRARY_NAMES` (`__tests__/tint.test.tsx` fails otherwise). Never `cloneElement(child, { color })` by hand |
| A recipe's fill, border, ring, shadow, bevel, opacity | `const surface = paintSurface(colors, borderRadius)` (`internal/surface`) → `style={[…, surface.style]}`, `{surface.under}` before the content (bevel), `{surface.over}` after it (ring) |
| A button (interaction, recipe colors, classic, loading, focus ring, touch target, prop order) | `<BaseButton {...props} iconOnly? />` — Button and IconButton are thin wrappers over it, like Radix `BaseButton` |
| Anything that acts as a Toggle (role, a11y state incl. `'mixed'`, disabled gate, press scale, touch target, focus ring, consumer handlers) | `<ToggleSurface role checked disabled onPress indicator={{ kind, props }} labelLineHeight? />` (focus ring around the Indicator, in the Indicator's `color`) or `<ToggleSurface … borderRadius color>{card}</ToggleSurface>` (focus ring on the card's edge) — holds no checked state; built on `useControl` |
| A standalone Toggle (checked state, what a press does per role) | `<BaseToggle role="checkbox" \| "radio" \| "switch" {...rest} kind={CheckboxToggle} indicator={{ size, variant, … }} margins>` — Checkbox, Radio and Switch are thin wrappers over it, built on the Toggle surface |
| A Toggle's Indicator and its size | `CheckboxToggle`, `RadioToggle`, `SwitchToggle` (`ToggleKind`: `Indicator` + pure `geometry(props, theme)`, exported from each control's file, not from `index.ts`) — the one source of an Indicator's width, height, radius and focus offset. Built with `defineToggle(geometry, Indicator)`; whoever draws the Indicator (Toggle surface, Selection card) computes it once with `useToggleGeometry(indicator)` and passes it as the Indicator's `geometry` prop. A bare Toggle's surface reports the Indicator radius to a Skeleton |
| A Toggle's look without its behaviour | `CheckboxIndicator`, `RadioIndicator`, `SwitchIndicator` (exported from each control's file, not from `index.ts`) — rows and cards show these, never a nested Toggle |
| A row of text runs + icons inside a control (Control label: buttons, Badge, tab triggers, SegmentedControl items, menu / Select rows) | `<ControlLabel size weight color letterSpacingEm? maxFontSizeMultiplier>{children}</ControlLabel>` — merges adjacent text, one line, tints icons without `color`; a tab trigger's label goes in `<WeightReserve label={(weight) => …}>{visible}</WeightReserve>`, which reserves the wider of both weights (SegmentedControl keeps its medium copy in flow instead: a zero-height reserving copy there made Android drop the last letter); pass `truncate={false}` where the control always takes the label's width (tabs, segmented) |
| A Text input (sizes, recipe colors, focus, read-only look, prop order) | `<BaseTextInput {...props} multiline? />` — TextField and TextArea are thin wrappers over it |
| A control announced as one element, named by its content | `useControl` does it (`useAccessibleControl` underneath, `internal/accessibleControl`); accessible content inside reads `useIsInsideAccessibleControl()` and contributes only its label (AccessibleIcon). Never call `accessibleNameOf` or render `AccessibleControlContext.Provider` by hand |
| A base card's border (Card, card items) | `<CardRing color borderRadius width? />` (`internal/CardRing`) drawn after the content — never a layout `borderWidth` |
| A padded container an `Inset` can reach the edges of (Card, Selection card, popper panel, Dialog content) | `<InsetContainer padding borderWidth? borderRadius?>{children}</InsetContainer>` (`layout/InsetContext`) around the content: it owns Radix's `--inset-padding = padding − border width`. Never build `InsetValues` or render `InsetContext.Provider` in a container (Inset itself re-provides for nested content) |
| Inside a Skeleton, keep the component's shape | `useSkeletonRadius(borderRadius)` (`feedback/SkeletonContext`) in any component with its own radius; layout primitives report through `useLayoutStyle` |
| Columns sized by their cells (CSS grid `auto` / `1fr` / subgrid, table layout) | Measured columns (`hooks/useWidest`, internal). All cells take the widest: `useWidest()` + `useWidestCell(cells)` — DataList labels, SegmentedControl items. Another rule per column: `useMeasuredCells<Meta>()` + `useMeasuredCell(cells, { meta })` and resolve from `cells` (Table, with the pure `resolveTableWidths` in `utils/tableLayout`). Wrap the measured content in `naturalWidthStyle(ownsWidth)`; hide the parent until `ready`. Never keep a second registry of cells |
| Text inside a container that sets the font (DataList, Table) | `renderInlineText(children, { textStyle, textProps, provide }, color)` (`internal/inlineText`): merges strings and text components into one Text |
| Draw above everything (overlays) | `<Portal>` (`internal/Portal`) renders into the nearest `PortalHost` — the root Theme's, or a Modal overlay's own — keeping the bridged contexts where the Portal sits: the Theme and every context made with `createPortalContext` (`internal/portalContext`). Component-state contexts that portalled parts read are made with it; contexts that stand for CSS inheritance (TextContext, InsetContext, Skeleton, AccessibleControl) are not, as on the web |
| An overlay root (open state, anchor, Trigger / Anchor / Close parts) | `useOverlayState({ open, defaultOpen, onOpenChange })` → `{ open, setOpen, anchor }`; `createOverlayContext<T>(name)` → `{ Provider, Context, use(part) }` (bridged); parts via `slot(child, { onPress }, anchor?)`, internal pressables via `ref={anchorRef(anchor)}` (`internal/overlayRoot`). Provide a Content's own context around its `PopperContent`: the portal carries it — never re-provide inside |
| An Anchored overlay drawn as a panel (Popover, HoverCard, menus, Select) | `<PopperContent open onDismiss anchor modal? padding borderRadius accessibilityRole inset? width… side…>{children}</PopperContent>` (`internal/PopperContent`; `usePanelSize(size)` for Popover / HoverCard) — panel, ring, shadow, max-height from the space left. Tooltip draws its own content on `<AnchoredContent>{(placement, anchorRect) => …}</AnchoredContent>` |
| Where an Anchored overlay goes (boundary = window − safe area − keyboard, RTL `align`, portal host origin, collisions) | The pure `placeAnchored(anchor, content, options, env)` (`utils/anchoredPlacement`), wrapping the Popper port `place` (`utils/popper`, kept in Floating UI's order); `useAnchoredPlacement(anchor, options)` (`internal/useAnchoredPlacement`) reads the device and is the only caller. A placement that is not Popper's is a `strategy` (Select's `item-aligned`), never a callback. Test rules as tables in `__tests__/anchoredPlacement.test.ts`; component tests use `__tests__/helpers/overlay` (`FakeAnchor`, `measureAs`, `layout`, `touchWindow`, `setRTL`) |
| Mounted until the exit animation ends; enter / exit progress; Reduce Motion for overlays | `usePresence(open)` → `{ present, onExited }` and `useEnterExit({ open, ready?, timing, onExited? })` → a 0 → 1 shared value (`internal/presence`) — AnchoredContent, BaseDialog. Never write `runOnJS(setPresent)` or the overlay easing by hand |
| The parts of a compound component, wherever they sit (also inside a consumer's component) | `useCollection<T>()` in the root + `useCollectionItem(collection, item, enabled?)` in each part (`internal/collection`): Select's rows, a menu's indicator rows (the gutter). Mount order, so keep scanning `children` where the first frame or a changing order matters (Table columns, SegmentedControl items) |
| Rows of a menu or a Select list | `useListMetrics(size)`, `<ListRow list look paddingLeft paddingRight accessibilityRole checked? trailing? onPress>`, `<ListLabel>`, `<ListSeparator>` (`internal/ListRows`); `rowHeight(list, kind)` is the height each kind renders with and `rowCenter(list, kinds, index)` the centre of a row (Select's item-aligned position and its scroll on open) |
| Equal-width columns | `<ColumnRows columns gap…>` (no `onLayout`, no `%` flexBasis) |
| CheckboxGroup / RadioGroup (Root + Item, labelled or bare items, column layout) | `createControlGroup({ name, type, rootRole, itemRole, Control, kind })` in `internal/controlGroup.tsx`, on `createSelectionFamily` — both groups are one call each; a labelled item is a Toggle surface row (label style, 0.5em gap) |
| A Selection group family (Root with value, disabled propagation, shared size / variant / color / highContrast, margins, role) | `createSelectionFamily({ name, type, rootRole, size, Layout, Item })` (`internal/selectionGroup`) — the family brings only its layout (`SelectionLayoutProps<Extra>`, Extra = its own Root props like `columns`) and its item view (gets `item: { checked, disabled, select, shared }`); plain-text item content via `renderItemLabel(children, textStyle)`. Built on `createSelectionGroup({ name, type })`, like Radix's CheckboxGroup / RadioGroup primitives |
| CheckboxCards / RadioCards (Root + Item, grid, Selection cards) | `createSelectionCards({ name, type, rootRole, itemRole, recipe, kind? })` in `internal/SelectionCard.tsx` — both families are one call each. A Selection card (`<SelectionCard recipe role size … indicator? />`) owns the Radix size table (padding, font size, radius), the trailing Indicator (`kind`, placed from its geometry) and plain text via `useTextStyle`, on a Toggle surface |
| Any rendered text (size, face, letter spacing, Font scaling cap, `truncate` / `wrap`, nesting) | `useTextStyle({ inline?, role?, size?, weight?, lineHeight?, color?, compact?, maxFontSizeMultiplier?, truncate?, wrap?, margins? })` → `{ style, textProps, contextFontSize, em, radius }` — see Text style below |
| Minimum touch target | `hitSlop ?? getMinHitSlop(width, height)` (44pt) |
| Colors of a component's parts for its variant and state | `useVariantColors(recipe, { variant?, color, highContrast?, checked?, disabled?, pressed?, focused? })` — see Variant colors above |
| Translucent color | `fadeColor(color, opacity)` from `utils/colorMath` (or `fade(paint, opacity)` inside a recipe) — never concatenate `hex + '99'` |
| A Slider's behaviour (what a touch means, a drag, an accessibility step, where thumbs and range are drawn; vertical / inverted / RTL) | The pure `beginDrag` / `moveDrag` / `stepThumb` / `commits` / `sliderLayout` over one `SliderConfig` (`utils/slider`); the Radix helpers below them are private. `Slider.tsx` only wires the responder and draws. Test as tables in `__tests__/slider.test.tsx` |
| Right-to-left | `utils/rtl`: `physical(style)` for anything placed from window coordinates (RN swaps `left` / `right` in RTL), `inlineSign()` for a `translateX` that moves toward the row's end, `isRTL()` for Radix `dir` rules (overlay `align`, sub-menu side). Never read `I18nManager` in a component |
| Dev-only logging | `isDev` from `utils/env` — never reference `__DEV__` directly (crashes outside Metro) |

### Pressable prop order

Consumer props must never silently disable internal behavior:

```tsx
<AnimatedPressable
  accessibilityRole="button"                     // defaults the consumer may override
  hitSlop={hitSlop ?? getMinHitSlop(w, h)}
  {...rest}                                      // consumer props
  {...handlers}                                  // composed onPressIn/Out/Focus/Blur (call the consumer's too)
  onPress={handlePress}
  disabled={isDisabled}
  accessibilityState={{ ...accessibilityState, disabled: isDisabled }}  // merged, internal state wins
  style={[scaleStyle, containerStyle, style]}
>
```

### Text style — `useTextStyle`

Every text-rendering module (typography and control labels) gets its Text style from `useTextStyle`
(`hooks/useTextStyle.ts`), a thin adapter over the pure `resolveTextStyle` (`utils/textStyle.ts`).
Never assemble `fontSize` / `fontFamily` / `fontWeight` / `maxFontSizeMultiplier` by hand.

- **Text role** (`default | heading | code | strong | em | quote`): the `TEXT_ROLES` table mirrors Radix
  `typography.css` (family slot, size adjust, style, weight, letter-spacing offset). Change values there only.
- **Weight intent** → face: exact `ThemeFonts` face, else `fonts.regular` with a dev warning, else system
  font + `fontWeight`. Custom faces never get `fontWeight` / `fontStyle` (baked into the file).
- **Font scaling cap**: local prop > Theme prop > `2` for `compact: true` > none.
- **Nesting**: `inline: true` reads `TextContext`. Nested text without a size inherits it (or derives it
  from the parent for roles with a size adjust, e.g. Code 0.95, Em/Quote 1.18, Kbd 0.75 via `sizeAdjust`)
  and never gets `flexShrink` / margins. The same role nested in itself (Code in Code, Em in Em…) keeps the
  outer size, like Radix's `.rt-Code :where(.rt-Code) { font-size: inherit }`; an explicit `size` still wins.
- **Providing**: wrap the rendered text in `text.provide(<RNText …/>)` — it supplies a memoized `TextContext`
  (size + role) so nested typography inherits. Never render `TextContext.Provider` by hand; use `text.isNested`
  instead of reading the context. Inline modules that only add a role (Em, Strong, Quote) come from
  `createInlineText(role, displayName, renderChildren?)` in `typography/InlineText.tsx`.
- **Lengths in em**: `text.em(k)` is Radix `k em` on this text's own size, rounded (Kbd min-width / padding,
  Code padding, Blockquote border, a group row's gap). `text.radius(k, offsetPx?)` is
  `(offsetPx + k em) × radius-factor`, not rounded (Kbd `0.35em`, Code `0.5px + 0.2em`). Both are computed by
  the pure `resolveTextStyle`. `letterSpacingEm` replaces the size's letter spacing (tab / segmented labels).
  Never multiply `contextFontSize` by hand.
- **Color**: pass the recipe's `text` as `color`. `undefined` means the text has no color of its own: nested it
  inherits, standalone it renders as body text (`body` recipe, gray-12) — the `text` recipe returns `undefined`
  without a `color` prop, ghost Code without one too. `standaloneColor` overrides that fallback (rarely needed).
- Test new rules in `__tests__/textStyle.test.ts` (pure tables), not through renders.

### Component structure (consistent across all components)

```tsx
export function MyComponent({ size, variant, color, ..., m, mx, my, ..., style, ...rest }) {
  const rc = useResolveColor() // internal hook — not exported
  const margins = useMargins({ m, mx, my, mt, mr, mb, ml })
  const metrics = useMetrics({ radius: radiusProp })

  const prefix = color ?? 'accent'

  // Dimensions (metrics.px)
  // Radius (metrics.radius)
  // Colors (useMemo)
  // Callbacks (useCallback)
  // Styles (useMemo, spread ...margins)
  // Render
}
```

## Theme system

```tsx
<Theme
  appearance="dark"       // 'inherit' | 'light' | 'dark'
  accentColor="blue"      // 26 accent colors
  grayColor="auto"        // 'auto' | 6 gray variants
  radius="medium"         // 'none' | 'small' | 'medium' | 'large' | 'full'
  scaling="100%"          // '90%' | '95%' | '100%' | '105%' | '110%'
  maxFontSizeMultiplier={2} // RN-only: global cap for accessibility font scaling
>
  <App />
</Theme>
```

Access via `useThemeContext()` which returns:
- `appearance` (resolved: always `'light' | 'dark'`)
- `accentColor`, `grayColor`, `resolvedGrayColor`, `radius`, `scaling`
- `fonts` (ThemeFonts)
- `maxFontSizeMultiplier` (optional global cap)
- `isRoot`, and `resolveColor(token)`: the Theme's color resolver (`useColor` / internal `useResolveColor` are thin wrappers over it)
- Change handlers: `onAppearanceChange`, `onAccentColorChange`, etc. — no-ops in a nested Theme (Radix)

`ThemeRoot` only holds the state ThemeControls can change (props win when they change) and renders `ThemeImpl`, which builds the context for root and nested Themes alike: inherit from the parent, override what is set, merge `fonts` / `colorOverrides`.

## Font scaling (accessibility)

All text components support `maxFontSizeMultiplier` and `allowFontScaling` props (from `NativeTextProps`).
Components with internal text (Button, Badge, Kbd, TextField, TextArea, group items) expose `maxFontSizeMultiplier` in their own interface.

Priority: **local prop > global Theme prop > undefined (no limit)**

Compact text (Button, Badge, Kbd, TextField, TextArea) sits in controls that use `minHeight` instead of `height` so they grow with font scaling.
Its `maxFontSizeMultiplier` defaults to `2` when neither local nor global is set (WCAG AA 200%) — pass `compact: true` to `useTextStyle`.
Avatar initials live in a fixed-size box and are always capped at `1`.

```tsx
// Global cap — applies to all text components
<Theme maxFontSizeMultiplier={1.5}>
  <Button>Capped at 1.5x</Button>
  <Button maxFontSizeMultiplier={2}>This one overrides to 2x</Button>
  <Text>Also capped at 1.5x</Text>
</Theme>

// No global — components use their own defaults
<Theme>
  <Button>Default 2x cap (compact component)</Button>
  <Text>No cap (body text)</Text>
</Theme>
```

ThemeControls (dev tool) hardcodes `maxFontSizeMultiplier={1}` on all internal text. Its options are drawn by hand to look like Radix's ThemePanel, but on the library's modules: each is a Control (`useControl`), its ring comes from the `themePanelOption` recipe through `paintSurface`, and the panel opens and closes on Presence (not mounted while closed).

## Tokens

| Token | Values | Usage |
|-------|--------|-------|
| Space | 0-9 → 0, 4, 8, 12, 16, 24, 32, 40, 48, 64 px | `useMetrics().space(token)` |
| Font size | 1-9 → 12, 14, 16, 18, 20, 24, 28, 35, 60 px | `useTextStyle({ size })` |
| Radius | none/small/medium/large/full; levels 1-6 → 3, 4, 6, 8, 12, 16 px × factor × scaling | `useMetrics().radius(level, shape?)` |
| Scaling | 90%-110% | `useMetrics().px(n)`; raw factor `useMetrics().scaling` → 0.9-1.1 |
| Colors | 31 scales × 12 solid + 12 alpha + contrast + surface | `useColor(name, step)` |

## Press scale animation

All interactive components (Button, IconButton, Checkbox, Switch, Radio, CheckboxGroup / RadioGroup rows, Card, CheckboxCards, RadioCards) have a subtle scale-down animation on press. Inside the library use `useControl` (`control.scaleStyle`, on `useInteraction` / `usePressScale`); `usePressScale` + `AnimatedPressable` remain public for consumers:

```tsx
import { usePressScale, AnimatedPressable } from '../../hooks/usePressScale'

const { scaleStyle, handlePressIn, handlePressOut } = usePressScale(!disabled)

<AnimatedPressable
  style={[scaleStyle, containerStyle, style]}
  onPressIn={handlePressIn}
  onPressOut={handlePressOut}
>
  ...
</AnimatedPressable>
```

- `AnimatedPressable` = `Animated.createAnimatedComponent(Pressable)` from Reanimated
- Single node (no wrapper) — user styles like `flex: 1` work correctly
- Scales to 0.97 on press (80ms ease-out), back to 1 on release (150ms)
- Runs on UI thread via Reanimated shared values
- Additive: works alongside Radix's pressed background color changes (not a replacement)
- Doesn't start when the component is disabled; always springs back to 1 — on release and as soon as it becomes disabled (e.g. `loading` set mid-press)

Components with pressed color changes (Button, IconButton, Card) pass `control.pressed` to their Variant recipe, which returns the pressed bg / ring / opacity; `paintSurface` draws them. The style is a static array, not a callback.

## Differences from Radix web

See `llm/differences.md` for the complete list of API changes, visual differences, and RN platform limitations vs `@radix-ui/themes`. Key highlights:

- No CSS filters (`brightness`, `saturate`) — use color step changes for pressed states
- No double borders — outline hc uses single border
- No `background-image` gradients — classic variant uses overlay Views
- No `outline` — focus uses an absolutely positioned `FocusRing` view
- Separator uses `StyleSheet.hairlineWidth` (1 physical pixel)
- Em/Quote use the system serif (`Times New Roman` on iOS, `serif` on Android) unless `fonts.em` / `fonts.quote` is set

## Hooks rules

- **Never return early before a hook call** (e.g. `if (!loading) return children` must come after every hook). Enforced by `react-hooks/rules-of-hooks`.
- Effect / memo dependency arrays must be complete (`react-hooks/exhaustive-deps` is an error). Cancel Reanimated loops in effect cleanups (`cancelAnimation`).

## Example app (apps/example)

Every component change gets its playground section checked in the iOS Simulator before it is called done:

- Check it with **two accent colors**, in **light and dark** mode for each (four combinations), using ThemeControls.
- Mirror Radix: the examples are the ones on the component's Radix docs page and in the Radix playground
  (`apps/playground/app/(themeable)/sink/<component>/page.tsx` in `radix-ui/themes`), in the same order; sections
  follow the playground's alphabetical navigation.
- Look at every tab: nothing clipped, collapsed, overlapping or misaligned compared with Radix.

## Testing

`yarn test` (Jest + `@testing-library/react-native`, Reanimated 4 via `setUpTests()` and the worklets Babel plugin). Tests live in `src/__tests__/`; render inside a theme with `renderWithTheme` from `__tests__/helpers/render`. Read what a component drew through `__tests__/helpers/queries` (`flat`, `focusRings`, `cardRings`, `hasBevel`), not by guessing parts from their style (`borderWidth === 2`). `contrast.test.ts` checks WCAG ratios of every text-on-fill pair the Variant recipes produce (each recipe declares its pair in `TEXT_ON_FILL`).

## TypeScript rules

- **Never use `any`** — use specific types or `unknown`
- **Never use `as ThemeColor`** — use the 2-param `useColor(color, step)` form (or `rc(color, step)` internally)
- Memoize styles derived from props / tokens with `useMemo`; tiny per-interaction styles (pressed bg, opacity) may stay inline
- All handlers should be wrapped in `useCallback`
- Interfaces extend `MarginProps` for margin props (not individual declarations)
