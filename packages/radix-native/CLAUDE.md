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
                  hitSlop, alpha, env, fonts
  components/
    internal/     control (useControl), surface (paintSurface), BaseButton, ToggleSurface, BaseToggle, BaseTextInput, ControlLabel, selectionGroup, controlGroup, SelectionCard, CardRing, BaseTabList, BaseDialog, Portal, portalContext, overlayRoot, AnchoredContent, PopperContent, ListRows, BaseMenu, inlineText, ClassicOverlay, FocusRing, ColumnRows, accessibleControl (not exported)
    layout/       Box, Flex, Grid, Container, Section, AspectRatio, ScrollArea, Separator, Card, Inset, InsetContext (Radix --inset-* values; Card provides them)
    typography/   Text, Heading, Link, Blockquote, Code, Em, Strong, Quote, Kbd, TextContext, InlineText (factory, not exported)
    display/      Avatar, Badge, Callout, DataList, Table (column sizing in utils/tableLayout)
    actions/      Button, IconButton, Checkbox, CheckboxGroup, CheckboxCards,
                  Switch, Radio, RadioGroup, RadioCards, SegmentedControl
    feedback/     Spinner, Progress, Skeleton
    navigation/   Tabs, TabNav (both on internal/BaseTabList)
    overlays/     Dialog, AlertDialog (internal/BaseDialog), Popover, HoverCard, Tooltip, DropdownMenu, ContextMenu (roots on internal/overlayRoot; menus on internal/BaseMenu; panels via internal/PopperContent on internal/AnchoredContent + utils/popper; menu and Select rows via internal/ListRows)
    utilities/    VisuallyHidden, AccessibleIcon
    forms/        TextField, TextArea, Slider (math in utils/slider), Select (item-aligned in utils/selectLayout)
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
- Add a row to `__tests__/variantPalette.test.ts` for every rule; `contrast.test.ts` walks the
  real recipes.
- Focus rings come from the `focusRing` recipe (`useVariantColors('focusRing', { color }).ring`);
  text inputs draw theirs as `border` from their own recipe.
- Drop shadows and the classic bevel are recipe parts too: `shadow` / `thumbShadow` (a `ShadowPaint`: color
  paint, opacity, offsetY, radius, Android elevation) and `bevel: true`. The recipe decides when they apply
  (Button classic loses its lift while pressed and both when disabled or loading; Card keeps its shadow while
  pressed; card items keep it when disabled; Checkbox / Radio bevel only when checked). `paintSurface` draws
  them (through `shadowStyle`, the only `Platform.select` for shadows, and `ClassicOverlay`); parts that are
  not a surface (a Switch thumb, Slider thumb, SegmentedControl indicator, Kbd) still call `shadowStyle` themselves.
  `getClassicEffect` is a deprecated public export; don't use it.

### Shared building blocks — use these instead of re-implementing

| Need | Use |
|------|-----|
| Controlled / uncontrolled value | `useControllableState({ prop, defaultProp, onChange })` — setter accepts updater functions (no stale closures) |
| Any pressable control (pressed / focus state, press scale, a11y name from content, touch target, disabled gate, focus ring, prop order) | `const control = useControl({ props: rest, children, role, onPress, disabled, state?, touchTarget?, focusRing: { color?, borderRadius, offset? }, forceName? })` (`internal/control`) → `<Pressable {...control.pressableProps} style={[control.scaleStyle?, …]}>{control.wrap(content)}{control.focusRing}</Pressable>`; read `control.pressed` for the recipe. Focus is reported whether or not the control uses the press scale. BaseButton, Card, Toggle surface, tab triggers, SegmentedControl items, Select trigger and menu / Select rows are built on it. Text inputs use `useInteraction` for focus only |
| A recipe's fill, border, ring, shadow, bevel, opacity | `const surface = paintSurface(colors, borderRadius)` (`internal/surface`) → `style={[…, surface.style]}`, `{surface.under}` before the content (bevel), `{surface.over}` after it (ring) |
| A button (interaction, recipe colors, classic, loading, focus ring, touch target, prop order) | `<BaseButton {...props} iconOnly? />` — Button and IconButton are thin wrappers over it, like Radix `BaseButton` |
| Anything that acts as a Toggle (role, a11y state incl. `'mixed'`, disabled gate, press scale, touch target, focus ring, consumer handlers) | `<ToggleSurface role checked disabled onPress indicator={{ kind, props }} labelLineHeight? />` (focus ring around the Indicator, in the Indicator's `color`) or `<ToggleSurface … borderRadius color>{card}</ToggleSurface>` (focus ring on the card's edge) — holds no checked state; built on `useControl` |
| A standalone Toggle (checked state, what a press does per role) | `<BaseToggle role="checkbox" \| "radio" \| "switch" {...rest} kind={CheckboxToggle} indicator={{ size, variant, … }} margins>` — Checkbox, Radio and Switch are thin wrappers over it, built on the Toggle surface |
| A Toggle's Indicator and its size | `CheckboxToggle`, `RadioToggle`, `SwitchToggle` (`ToggleKind`: `Indicator` + pure `geometry(props, theme)`, exported from each control's file, not from `index.ts`) — the one source of an Indicator's width, height, radius and focus offset. Built with `defineToggle(geometry, Indicator)`; whoever draws the Indicator (Toggle surface, Selection card) computes it once with `useToggleGeometry(indicator)` and passes it as the Indicator's `geometry` prop. A bare Toggle's surface reports the Indicator radius to a Skeleton |
| A Toggle's look without its behaviour | `CheckboxIndicator`, `RadioIndicator`, `SwitchIndicator` (exported from each control's file, not from `index.ts`) — rows and cards show these, never a nested Toggle |
| A row of text runs + icons inside a control (Control label: buttons, Badge, tab triggers, SegmentedControl items, menu / Select rows) | `<ControlLabel size weight color letterSpacingEm? maxFontSizeMultiplier>{children}</ControlLabel>` — merges adjacent text, one line, tints icons without `color`; a tab trigger's label goes in `<WeightReserve label={(weight) => …}>{visible}</WeightReserve>`, which reserves the wider of both weights (SegmentedControl keeps its medium copy in flow instead: a zero-height reserving copy there made Android drop the last letter); pass `truncate={false}` where the control always takes the label's width (tabs, segmented) |
| A Text input (sizes, recipe colors, focus, read-only look, prop order) | `<BaseTextInput {...props} multiline? />` — TextField and TextArea are thin wrappers over it |
| A control announced as one element, named by its content | `useControl` does it (`useAccessibleControl` underneath, `internal/accessibleControl`); accessible content inside reads `useIsInsideAccessibleControl()` and contributes only its label (AccessibleIcon). Never call `accessibleNameOf` or render `AccessibleControlContext.Provider` by hand |
| A base card's border (Card, card items) | `<CardRing color borderRadius width? />` (`internal/CardRing`) drawn after the content — never a layout `borderWidth`; publish the Inset values with `InsetContext.Provider` (padding − border width) |
| Inside a Skeleton, keep the component's shape | `useSkeletonRadius(borderRadius)` (`feedback/SkeletonContext`) in any component with its own radius; layout primitives report through `useLayoutStyle` |
| Cells as wide as the widest (CSS grid `auto` / `1fr` / subgrid) | `useWidest()` + `useWidestCell(cells)` (`hooks/useWidest`, internal): cells report their natural width, all take the widest; hide the parent until `ready` — DataList labels, SegmentedControl items |
| Text inside a container that sets the font (DataList, Table) | `renderInlineText(children, { textStyle, textProps, provide }, color)` (`internal/inlineText`): merges strings and text components into one Text |
| Draw above everything (overlays) | `<Portal>` (`internal/Portal`) renders into the nearest `PortalHost` — the root Theme's, or a Modal overlay's own — keeping the bridged contexts where the Portal sits: the Theme and every context made with `createPortalContext` (`internal/portalContext`). Component-state contexts that portalled parts read are made with it; contexts that stand for CSS inheritance (TextContext, InsetContext, Skeleton, AccessibleControl) are not, as on the web |
| An overlay root (open state, anchor, Trigger / Anchor / Close parts) | `useOverlayState({ open, defaultOpen, onOpenChange })` → `{ open, setOpen, anchor }`; `createOverlayContext<T>(name)` → `{ Provider, Context, use(part) }` (bridged); parts via `slot(child, { onPress }, anchor?)`, internal pressables via `ref={anchorRef(anchor)}` (`internal/overlayRoot`). Provide a Content's own context around its `PopperContent`: the portal carries it — never re-provide inside |
| An Anchored overlay drawn as a panel (Popover, HoverCard, menus, Select) | `<PopperContent open onDismiss anchor modal? padding borderRadius accessibilityRole inset? width… side…>{children}</PopperContent>` (`internal/PopperContent`; `usePanelSize(size)` for Popover / HoverCard) — panel, ring, shadow, max-height from the space left. Tooltip draws its own content on `<AnchoredContent>{(placement, anchorRect) => …}</AnchoredContent>` |
| Rows of a menu or a Select list | `useListMetrics(size)`, `<ListRow list look paddingLeft paddingRight accessibilityRole checked? trailing? onPress>`, `<ListLabel>`, `<ListSeparator>` (`internal/ListRows`); `rowHeight(list, kind)` is the height each kind renders with (Select's item-aligned offset) |
| Equal-width columns | `<ColumnRows columns gap…>` (no `onLayout`, no `%` flexBasis) |
| CheckboxGroup / RadioGroup (Root + Item, labelled or bare items, column layout) | `createControlGroup({ name, type, rootRole, itemRole, Control, kind })` in `internal/controlGroup.tsx`, on `createSelectionFamily` — both groups are one call each; a labelled item is a Toggle surface row (label style, 0.5em gap) |
| A Selection group family (Root with value, disabled propagation, shared size / variant / color / highContrast, margins, role) | `createSelectionFamily({ name, type, rootRole, size, Layout, Item })` (`internal/selectionGroup`) — the family brings only its layout (`SelectionLayoutProps<Extra>`, Extra = its own Root props like `columns`) and its item view (gets `item: { checked, disabled, select, shared }`); plain-text item content via `renderItemLabel(children, textStyle)`. Built on `createSelectionGroup({ name, type })`, like Radix's CheckboxGroup / RadioGroup primitives |
| CheckboxCards / RadioCards (Root + Item, grid, Selection cards) | `createSelectionCards({ name, type, rootRole, itemRole, recipe, kind? })` in `internal/SelectionCard.tsx` — both families are one call each. A Selection card (`<SelectionCard recipe role size … indicator? />`) owns the Radix size table (padding, font size, radius), the trailing Indicator (`kind`, placed from its geometry) and plain text via `useTextStyle`, on a Toggle surface |
| Any rendered text (size, face, letter spacing, Font scaling cap, `truncate` / `wrap`, nesting) | `useTextStyle({ inline?, role?, size?, weight?, lineHeight?, color?, compact?, maxFontSizeMultiplier?, truncate?, wrap?, margins? })` → `{ style, textProps, contextFontSize, em, radius }` — see Text style below |
| Minimum touch target | `hitSlop ?? getMinHitSlop(width, height)` (44pt) |
| Colors of a component's parts for its variant and state | `useVariantColors(recipe, { variant?, color, highContrast?, checked?, disabled?, pressed?, focused? })` — see Variant colors above |
| Translucent color | `fadeColor(color, opacity)` from `utils/colorMath` (or `fade(paint, opacity)` inside a recipe) — never concatenate `hex + '99'` |
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

ThemeControls (dev tool) hardcodes `maxFontSizeMultiplier={1}` on all internal text.

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

`yarn test` (Jest + `@testing-library/react-native`, Reanimated 4 via `setUpTests()` and the worklets Babel plugin). Tests live in `src/__tests__/`; render inside a theme with `renderWithTheme` from `__tests__/helpers/render`. `contrast.test.ts` checks WCAG ratios of every text-on-fill pair the Variant recipes produce.

## TypeScript rules

- **Never use `any`** — use specific types or `unknown`
- **Never use `as ThemeColor`** — use the 2-param `useColor(color, step)` form (or `rc(color, step)` internally)
- Memoize styles derived from props / tokens with `useMemo`; tiny per-interaction styles (pressed bg, opacity) may stay inline
- All handlers should be wrapped in `useCallback`
- Interfaces extend `MarginProps` for margin props (not individual declarations)
