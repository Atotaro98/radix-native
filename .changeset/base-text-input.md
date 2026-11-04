---
"radix-native": patch
---

TextField and TextArea now share one `BaseTextInput` body; they differ only in line count, height and radius.

- Disabling a focused field drops its focus ring (it used to stay visible).
- `readOnly` and `editable={false}` look like Radix's `:read-only`: the disabled colors and a gray-8 focus ring, without reporting the field as disabled to screen readers.
- TextField no longer accepts `multiline` (a Radix TextField is one line); use TextArea.
