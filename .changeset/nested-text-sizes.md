---
'radix-native': patch
---

Text nested in other text now matches Radix in three cases where it was too small:

- Text inside `Em`, `Strong` or `Quote` is now sized relative to them. For example, `<Em><Code/></Em>` at size 3 is about 18px instead of 15px.
- A `Code` inside a `Code` keeps the outer size instead of shrinking twice. The same applies to `Em`, `Quote` and `Strong` nested in themselves.
- `Kbd` with an explicit `size` uses Radix's `font-size × 0.8` instead of `0.75`. For example, size 9 is now 48px instead of 45px.
