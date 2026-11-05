---
'radix-native': minor
---

Checkbox, Radio and Switch now share one internal Toggle module, and their classic look follows Radix:

- Checked classic Checkbox and Radio keep the bevel but lose the drop shadow (Radix's bevel there is inset only).
- The Switch thumb gets Radix's soft drop shadow in every variant; the checked classic track no longer casts one.
- A labelled CheckboxGroup / RadioGroup item and a CheckboxCards item now contain only the visual indicator, not a second hidden interactive control.

No props change. A `style` passed to Checkbox, Radio or Switch now applies to the pressable wrapper around the indicator, so a `backgroundColor` or `borderColor` override no longer recolors the box or track.
