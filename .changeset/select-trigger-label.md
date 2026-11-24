---
'radix-native': patch
---

Select: the trigger shows the selected item's text when it is written in several pieces (`Option {name}`). It rendered loose strings before, which React Native rejects ("Text strings must be rendered within a <Text>"), and left the trigger empty.
