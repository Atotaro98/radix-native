---
'radix-native': patch
---

Android fixes. Button, IconButton, a pressable Card and card items now pass the name their content gives them (AccessibleIcon labels, VisuallyHidden text, a loading label) as `accessibilityLabel`, so TalkBack reads it. Dialog and AlertDialog cover the status and navigation bars with their overlay and move above the keyboard on Android too.
