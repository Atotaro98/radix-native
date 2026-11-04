---
"radix-native": minor
---

Add `useMetrics` and match Radix radius at every scaling.

- **New `useMetrics({ radius? })`**: the pixel values a component derives from the Theme, the way Radix derives them. `px(n)` is `calc(Npx * var(--scaling))`, `space(token)` is `var(--space-N)` (negative tokens allowed), and `radius(level, 'box' | 'pill' | 'thumb')` is `var(--radius-N)`, `max(var(--radius-N), var(--radius-full))` or `max(var(--radius-N), var(--radius-thumb))`. `scaling`, `radiusFactor` and `radiusThumb` expose the raw Radix variables for your own `calc()` formulas. Every component now reads its sizes and radius from it.
- **Radius scales with `scaling`**, as Radix `--radius-N` does, and keeps fractional values (e.g. 2.25px for `radius-1` at `small`). At `90%`–`110%`, every rounded corner changes slightly; at `100%` only `small` radii change, by under half a pixel.
- **Kbd** radius is `radius-factor × 0.35em`, as in Radix (it was about 3.5× too small) and square for `radius="none"`.
- **Code** radius is `(0.5px + 0.2em) × radius-factor`, so it grows with the text size.
- **Skeleton** and **Spinner** leaves follow `radius-1` and the Theme radius instead of fixed values.
- **Progress** indicator has no radius of its own; the track clips it, as in Radix.
- **RadioCards** use radius levels 3 / 3 / 4 like Radix (were 2 / 3 / 3).
- `getRadius`, `getFullRadius`, `getRadiusThumb`, `scalingMap`, `applyScaling`, `resolveSpace` and `useResolveSpace` are deprecated and will be removed in the next major release.

**Migration.** No props were removed or renamed. Act only if one of these applies:

| If you… | Do this |
|---|---|
| call `getRadius(token, level)` / `getFullRadius` / `getRadiusThumb` | `useMetrics({ radius: token }).radius(level, 'box' \| 'pill' \| 'thumb')`. `getRadius` ignores scaling; the new value doesn't |
| call `applyScaling(n, scaling)` or read `scalingMap` | `useMetrics().px(n)`, or `useMetrics().scaling` for the raw factor |
| call `resolveSpace(token, scaling)` or `useResolveSpace()` | `useMetrics().space(token)` |
| snapshot-test component styles | update snapshots: radius values changed as listed above |
