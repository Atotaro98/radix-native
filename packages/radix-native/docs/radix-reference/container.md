# Container — Radix reference

Sources (Radix Themes `packages/radix-ui-themes/src/`): `components/container.tsx`, `components/container.props.tsx`, `components/container.css`, `props/layout.props.ts`, `props/width.props.ts`, `props/height.props.ts`. Docs: https://www.radix-ui.com/themes/docs/components/container

## 1. Parts

Single component, no primitive. Renders **two** elements:

```
<div class="rt-Container rt-r-size-N …layout/margin classes">   ← outer (or Slot when asChild)
  <div class="rt-ContainerInner …width/height classes">children</div>
</div>
```

With `asChild`, `getSubtree` puts the inner div inside the child element.

## 2. Props

| Prop | Type | Default | Responsive | Applied to |
|---|---|---|---|---|
| `size` | `'1' \| '2' \| '3' \| '4'` | `'4'` | yes | outer (`rt-r-size-N`) → inner `max-width` |
| `display` | `'none' \| 'initial'` | — | yes | outer; `'initial'` is parsed to `display: flex` |
| `align` | `'left' \| 'center' \| 'right'` | — (CSS default `center`) | yes | outer `align-items`; `left`→`start`, `right`→`end` |
| `asChild` | `boolean` | — | no | outer |
| `width`, `minWidth`, `maxWidth`, `height`, `minHeight`, `maxHeight` | `string` | — | yes | **inner** `.rt-ContainerInner` (pulled out before the outer extractProps) |
| Rest of LayoutProps (`p*`, `position`, `inset`, `top/right/bottom/left`, `overflow*`, `flexBasis/Shrink/Grow`, `grid*`, `alignSelf`, `justifySelf`) | per layout.props | — | yes | outer |
| Margin props `m, mx, my, mt, mr, mb, ml` | space tokens / string | — | yes | outer |

## 3. Visual values (`container.css`)

- `.radix-themes` vars: `--container-1: 448px`, `--container-2: 688px`, `--container-3: 880px`, `--container-4: 1136px` — **not** multiplied by `--scaling`.
- `.rt-Container`: `display: flex; flex-direction: column; align-items: center; flex-shrink: 0; flex-grow: 1; box-sizing: border-box`.
- `.rt-ContainerInner`: `width: 100%`.
- `:where(.rt-Container.rt-r-size-N) > .rt-ContainerInner { max-width: var(--container-N) }`.
- No padding, no colors, no radius. Horizontal gutters are the consumer's job (e.g. `px`).

## 4. Behaviour

None (no state, no a11y role; plain `div`).

## 5. RN notes

- Maps directly to two nested `View`s: outer `flexDirection: 'column'`, `alignItems: 'center'` (or `flex-start`/`flex-end` from `align`), `flexGrow: 1`, `flexShrink: 0`; inner `width: '100%'`, `maxWidth: 448/688/880/1136`.
- Width/height props must go to the **inner** View to match Radix; all other LayoutProps go to the outer one.
- Max widths are fixed px (not scaled) — do not pass through `metrics.px` scaling.
- On a phone (≤ ~430pt wide) every size is wider than the screen, so Container is effectively `width: 100%` unless on tablets; keep it for API parity.
- `display: 'none'|'initial'` → `display: 'none'|'flex'` (RN supports both).
- Responsive objects: not supported (fixed values only, per `llm/differences.md`).
- No Variant recipe needed.
