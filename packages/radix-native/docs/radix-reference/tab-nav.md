# TabNav — Radix reference

Sources (`THEMES` = `radix-ui/themes/packages/radix-ui-themes/src`, `PRIM` = `radix-ui/primitives/packages/react`):
`THEMES/components/tab-nav.{tsx,props.tsx,css}`, `THEMES/components/_internal/base-tab-list.{css,props.ts}`,
`PRIM/navigation-menu/src/navigation-menu.tsx`. Docs: radix-ui.com/themes/docs/components/tab-nav.

## 1. Parts

| Part | Element / classes | Primitive |
|---|---|---|
| `TabNav.Root` | `nav.rt-TabNavRoot[aria-label="Main"]` › `ul.rt-reset.rt-BaseTabList.rt-TabNavList` (className goes on the **list**) | `NavigationMenu.Root` + `NavigationMenu.List` |
| `TabNav.Link` | `li.rt-TabNavItem` (`display:flex`) › `a.rt-reset.rt-BaseTabListTrigger.rt-TabNavLink` › Inner + InnerHidden spans | `NavigationMenu.Item` + `NavigationMenu.Link` |

## 2. Props

Root: same `baseTabListPropDefs` as Tabs.List — `size` `'1'|'2'` (default `'2'`, responsive), `wrap`, `justify` (responsive), `color`, `highContrast` — plus margin props. `defaultValue`, `dir`, `color` (HTML) omitted.

Link (`tabNavLinkPropDefs`): `active: boolean` (default `false`), `asChild` (for router links), plus anchor props (`href`…). `onSelect` is forced `undefined`.

## 3. Visual values

Identical to Tabs (`_internal/base-tab-list.css`, see `tabs.md` §3): selectors match `.rt-TabNavLink[data-active]` / `:not([data-active])` the same way as `[data-state=active|inactive]`. Active → `--gray-12`, medium weight, −0.01em letter-spacing, 2px `--accent-indicator` (hc `--accent-12`) bar at the bottom across the full link width; inactive `--gray-a11`. No animation, no disabled styles. List bottom rule `inset 0 -1px 0 0 --gray-a5`, horizontally scrollable with hidden scrollbar.

## 4. Behaviour

- **No state.** `active` is purely consumer-driven; the Link is a plain anchor (`href`) or a router link via `asChild`. Docs pattern: `active={pathname === '/x'}`.
- NavigationMenu.Link: `data-active` and `aria-current="page"` when active; click dispatches a cancelable select event (onSelect removed by Themes). NavigationMenu.Root renders `<nav aria-label="Main">`; List keyboard navigation via NavigationMenu's focus group (arrow keys between links).

## 5. RN notes

- `Object.assign(Root, { Root, Link })`. Root = same tab-list row/ScrollView as Tabs.List; Link = Pressable with `active` + `onPress`, no own state, no router (matches Radix exactly: Radix also has no state; `href`/`asChild` → `onPress`).
- a11y: Root `accessibilityRole` none (or `"tablist"`), Link `accessibilityRole="link"` (or `"tab"`) with `accessibilityState.selected = active`; Radix's `aria-current="page"` has no RN equivalent — selected is the closest.
- `aria-label="Main"` hard-coded on the nav: expose `accessibilityLabel` instead of hard-coding.
- Shares the tab-list style module with Tabs; no Variant family.
