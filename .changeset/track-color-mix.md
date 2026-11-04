---
'radix-native': patch
---

`accent-track` and `accent-indicator` now follow Radix Themes for amber, lime, mint, sky and yellow: in dark mode the checked Switch track and the surface / classic Progress indicator mix steps 8 and 9 in OKLab (65%, amber 75%) instead of using the paler step 9, and in light mode yellow uses step 10 for both. Overrides of steps 8, 9 and 10 carry over.
