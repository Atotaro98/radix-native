# ScrollArea — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/scroll-area.{tsx,props.tsx,css}`, `PRIM/scroll-area/src/scroll-area.tsx`.
Docs: radix-ui.com/themes/docs/components/scroll-area.

## 1. Parts

Single component `ScrollArea`; ref goes to the **Viewport**. Internally:

| Element | Primitive | Class |
|---|---|---|
| root | `ScrollArea.Root` | `rt-ScrollAreaRoot` (margins applied here) |
| viewport | `ScrollArea.Viewport` (inner `div` style `min-width:100%; display:table`) | `rt-ScrollAreaViewport` |
| focus ring | plain `div` | `rt-ScrollAreaViewportFocusRing` |
| horizontal scrollbar (unless `scrollbars="vertical"`) | `ScrollArea.Scrollbar orientation=horizontal` › `ScrollArea.Thumb` | `rt-ScrollAreaScrollbar` / `rt-ScrollAreaThumb` |
| vertical scrollbar (unless `"horizontal"`) | same, vertical | |
| corner (only `"both"`) | `ScrollArea.Corner` | `rt-ScrollAreaCorner` |

## 2. Props

Themes (`scrollAreaPropDefs`) + margin props:

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2' \| '3'` | `'1'` | yes (class on each Scrollbar) |
| `radius` | `'none'…'full'` | theme | no (`data-radius` on Scrollbars) |
| `scrollbars` | `'vertical' \| 'horizontal' \| 'both'` | `'both'` | no |
| `asChild` | boolean | — | |

Primitive Root: `type: 'auto' | 'always' | 'scroll' | 'hover'` (default `'hover'`), `scrollHideDelay` (primitive default 600ms; **Themes overrides it to 0 unless `type="scroll"`**), `dir`. Viewport: any div props.

## 3. Visual values

Root: `display:flex; flex-direction:column; overflow:hidden; width:100%; height:100%`. Viewport: flex column, 100%×100%; direct child `display:block !important; width:fit-content; flex-grow:1`. Focus-visible viewport → ring div `outline: 2px solid --focus-8; outline-offset:-2px`.

Scrollbar: `background: --gray-a3`, `border-radius: --scrollarea-scrollbar-border-radius`, thickness `--scrollarea-scrollbar-size`, margins on all 4 sides `--space-1` (vars `--scrollarea-scrollbar-{horizontal,vertical}-margin-{top,bottom,left,right}`; Table ghost zeroes horizontal left/right).

| size | thickness | radius |
|---|---|---|
| 1 | `--space-1` (4) | `max(--radius-1, --radius-full)` |
| 2 | `--space-2` (8) | same |
| 3 | `--space-3` (12) | same |

Thumb: `background: --gray-a8` (hover `--gray-a9`, `transition: background-color 100ms`), `border-radius: inherit`; `::before` hit area min `--space-4` (16) each way. Primitive thumb length = viewport/content ratio × track, min **18px**.
Show/hide: `animation-duration 120ms ease-out`, `rt-fade-in` on `data-state=visible`, `rt-fade-out` on hidden.

## 4. Behaviour (primitive)

- Native scrolling on the viewport (`overflow-x/y: scroll|hidden` depending on which scrollbars are mounted); custom scrollbars are overlays; native ones hidden. `scrollbars` therefore also **disables scrolling** on the omitted axis (overflow hidden).
- `type`: `always` – always visible; `auto` – visible when content overflows (ResizeObserver); `scroll` – state machine hidden→scrolling→idle, hides `scrollHideDelay` after scroll ends (scroll end debounced 100ms), stays while pointer is over the bar; `hover` – visible while pointer is inside root, hides `scrollHideDelay` after leave (Themes: immediately), and only if overflowing.
- Thumb drag & track click scroll the viewport; wheel over scrollbar scrolls.

## 5. RN notes

- Map to `ScrollView`: `vertical` → default ScrollView, `horizontal` → `horizontal`. `both` (the Radix **default**) has no single cross-platform RN equivalent (iOS UIScrollView can pan both axes, Android ScrollView cannot) → nest a horizontal ScrollView inside a vertical one. Omitted axis must not scroll (Radix parity).
- `type` → `showsVertical/HorizontalScrollIndicator`: `always` → indicators on + Android `persistentScrollbar`; iOS cannot keep indicators permanently visible (only `flashScrollIndicators`); `auto`/`scroll`/`hover` → native flash-on-scroll behaviour (≈ `scroll`). `hover` has no touch meaning → behaves like `scroll`.
- Size/radius/colors of the drawn thumb cannot be applied to native indicators (only `indicatorStyle` black/white on iOS, `scrollbarThumbVertical` drawable not exposed) → `size`, `radius` become no-ops; document in differences.md.
- Ref should expose the ScrollView (Radix ref = viewport).
- No Variant family.
