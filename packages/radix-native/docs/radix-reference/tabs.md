# Tabs — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/tabs.{tsx,props.tsx,css}`, `THEMES/components/_internal/base-tab-list.{css,props.ts}` (shared with TabNav),
`THEMES/styles/tokens/typography.css`, `PRIM/tabs/src/tabs.tsx`, `PRIM/roving-focus`. Docs: radix-ui.com/themes/docs/components/tabs.

## 1. Parts

| Part | Element / classes | Primitive |
|---|---|---|
| `Tabs.Root` | `div.rt-TabsRoot` (no styles) | `Tabs.Root` |
| `Tabs.List` | `div.rt-BaseTabList.rt-TabsList` | `Tabs.List` (RovingFocusGroup) |
| `Tabs.Trigger` | `button.rt-reset.rt-BaseTabListTrigger.rt-TabsTrigger` › `span.rt-BaseTabListTriggerInner` {children} + `span.rt-BaseTabListTriggerInnerHidden` {children} | `Tabs.Trigger` |
| `Tabs.Content` | `div.rt-TabsContent` | `Tabs.Content` |

Children are rendered twice: the hidden span (always medium weight, `visibility:hidden`) sizes the trigger; the visible Inner is `position:absolute` on top, so switching weight never changes width.

## 2. Props

Root: `asChild` + margin props; primitive `value`/`defaultValue` (string, default `''`), `onValueChange`, `orientation` (`'horizontal'`), `dir`, `activationMode` (`'automatic' | 'manual'`, default `'automatic'`).

List (`baseTabListPropDefs`) + margin props + primitive `loop` (default `true`):

| Prop | Type | Default | Responsive |
|---|---|---|---|
| `size` | `'1' \| '2'` | `'2'` | yes |
| `wrap` | `'nowrap' \| 'wrap' \| 'wrap-reverse'` | — (CSS default nowrap) | yes (`rt-r-fw`) |
| `justify` | `'start' \| 'center' \| 'end'` | — (flex-start) | yes (`rt-r-jc`) |
| `color` | accent | theme accent | no (`data-accent-color` on List) |
| `highContrast` | boolean | — | no |

Trigger: `value: string` (required), `disabled?: boolean` (default false). No Themes props.
Content: `value: string`, `forceMount?: true`, `asChild`, margin props.

## 3. Visual values (`_internal/base-tab-list.css`)

List: `display:flex; justify-content:flex-start; overflow-x:auto; white-space:nowrap; scrollbar hidden`, `font-family: --default-font-family`, bottom rule `box-shadow: inset 0 -1px 0 0 --gray-a5`.

| size | font-size / line-height / letter-spacing | `--tab-height` | `--tab-padding-x` | `--tab-inner-padding-x` | `--tab-inner-padding-y` | `--tab-inner-border-radius` |
|---|---|---|---|---|---|---|
| 1 | `--font-size-1` / `--line-height-1` / `--letter-spacing-1` | `--space-6` (32) | `--space-1` | `--space-1` | `--space-1 × 0.5` (2) | `--radius-1` |
| 2 | `--font-size-2` / `--line-height-2` / `--letter-spacing-2` | `--space-7` (40) | `--space-2` | `--space-2` | `--space-1` (4) | `--radius-2` |

Trigger: flex centered, `flex-shrink:0`, `height: --tab-height`, `padding-x: --tab-padding-x`, `color: --gray-a11`. Inner/Hidden: `padding: inner-y inner-x`, `border-radius: inner radius`.
- inactive Inner: regular weight (inherited), `letter-spacing: --tab-inactive-letter-spacing` (0em).
- active (`[data-state=active]`): `color: --gray-12`; Inner `--font-weight-medium`, `--tab-active-letter-spacing` (−0.01em); indicator `::before`: `height:2px; position:absolute; bottom:0; left:0; right:0; background: --accent-indicator` (high contrast: `--accent-12`). It spans the **whole trigger** (incl. padding-x), not just the inner.
- focus-visible: Inner `outline: 2px solid --focus-8; outline-offset:-2px` (hover+focus: Inner bg `--accent-a3`).
- hover (irrelevant): `--gray-12` text, Inner bg `--gray-a3`.
- disabled: **no styles at all** in Themes CSS (only the primitive's `disabled` attr).
- **No indicator animation** — the 2px bar is a per-trigger pseudo-element that appears/disappears instantly. No transitions anywhere.

Content: `position:relative; outline:0`; focus-visible `outline: 2px solid --focus-8`. No padding.

## 4. Behaviour (primitive)

- `useControllableState` (string, default `''` → no tab selected).
- Trigger activates on **mousedown** (left button, no ctrl), plus Space/Enter; `activationMode="automatic"` also activates on **focus** (arrow-key roving). `manual`: arrows only move focus.
- List: RovingFocusGroup, `loop` true, orientation from Root; disabled triggers are skipped (`focusable={!disabled}`).
- Content: `Presence present={forceMount || isSelected}`; **inactive content is unmounted** (children not rendered, `hidden`) unless `forceMount`. Animation suppressed on first mount.
- a11y: List `role="tablist"` + `aria-orientation`; Trigger `role="tab"`, `aria-selected`, `aria-controls`, `data-state active|inactive`, `data-disabled`; Content `role="tabpanel"`, `aria-labelledby`, `tabIndex 0`.

## 5. RN notes

- `Object.assign(Root, { Root, List, Trigger, Content })`; Root holds value via context (`useControllableState`).
- List = horizontal ScrollView (`showsHorizontalScrollIndicator={false}`) when `wrap` is nowrap; `wrap`/`justify` map to `flexWrap`/`justifyContent` on a plain row (wrap inside a ScrollView is meaningless → use a View when wrap is set).
- Bottom rule: absolute 1px View `--gray-a5` (inset shadow impossible).
- Trigger label: same double-text trick (hidden medium-weight Text sizes, absolute Text shows) — or accept width jump.
- Indicator: per-trigger 2px absolute View, instant — that is Radix parity. A sliding animated indicator would be an **addition** not in Radix; if added it must respect Reduce Motion and be recorded in differences.md.
- `activationMode`: on touch there is no focus-before-press; automatic vs manual only differs for hardware keyboard/screen-reader focus → keep prop, effectively no-op on touch.
- Content unmounting → render only the selected Content unless `forceMount`.
- a11y: `accessibilityRole="tablist"` / `"tab"` with `accessibilityState.selected/disabled`; content none (RN has no tabpanel role).
- Variant family: none (no variants; accent indicator + gray text). Shared "tab list" style module with TabNav.
