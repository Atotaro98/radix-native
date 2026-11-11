# No extra peer dependencies for overlays, sliders and selects

The remaining Radix Themes components (Dialog, AlertDialog, Popover, Tooltip, HoverCard, DropdownMenu, ContextMenu, Select, Slider) need a portal, anchor-relative positioning and dragging. We build all three on what the library already requires — `react`, `react-native` and `react-native-reanimated` — instead of adding `react-native-gesture-handler` or `@floating-ui/react-native` as peers: our own portal host mounted by `ThemeRoot`, positioning from `measureInWindow`, and dragging through the React Native Responder system driving reanimated shared values. Adding a peer later breaks every consumer's install, while the README promises minimal peer dependencies.

## Considered Options

- `react-native-gesture-handler` as a peer: nearly universal in apps that use reanimated, but still a native module every consumer would have to install and configure. Revisit only if Slider dragging is not good enough on the Responder system.
- `@floating-ui/react-native` for positioning: solves collision and flipping for us, but adds a dependency for logic that is small for the placements Radix uses (side, align, offsets, collision padding).

## Consequences

- Modal overlays render inside React Native's `Modal` (covers native navigation screens, handles Android back). A `Modal` is its own native window, so `ThemeRoot` and every Modal overlay each mount a portal host, and an Anchored overlay renders into the nearest one — otherwise a Popover or Select opened inside a Dialog would draw underneath it.
- Portalled content is re-wrapped in the Theme nearest to where its `Content` part sits in the tree, as Radix Themes does.
- Non-modal Anchored overlays (Popover, HoverCard) have no backdrop: a capture-phase handler on the portal host closes them on an outside touch and lets the touch through, as Radix does. Menus, Select and `Popover modal` use a blocking backdrop. Because any outside touch closes them, positions are measured on open and on layout or rotation change only.
- `ThemeRoot` takes a `safeAreaInsets` prop (default 0), added to Radix's `collisionPadding`, instead of depending on `react-native-safe-area-context`.
